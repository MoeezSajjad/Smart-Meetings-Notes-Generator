import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Clock, Calendar, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { getLocalUser } from '../firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MeetingDetails = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const user = getLocalUser();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  const pollIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const hasSetupPollingRef = useRef(false);

  // Load meeting from localStorage
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    console.log('[MeetingDetails] Loading meeting:', meetingId);

    try {
      const meetings = JSON.parse(localStorage.getItem('userMeetings') || '[]');
      const found = meetings.find(m => m.meetingId === meetingId);
      
      if (found) {
        console.log('[MeetingDetails] Meeting found:', found);
        setMeeting(found);
      } else {
        console.log('[MeetingDetails] Meeting not found');
        setMeeting(null);
      }
    } catch (error) {
      console.error('[MeetingDetails] Failed to load meeting:', error);
      setMeeting(null);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  // Poll status from backend - ONLY RUNS ONCE
  useEffect(() => {
    // Prevent duplicate polling setup
    if (hasSetupPollingRef.current) {
      console.log('[MeetingDetails] Polling already set up, skipping...');
      return;
    }

    if (!meetingId || !meeting) {
      console.log('[MeetingDetails] Skipping poll - no meetingId or meeting not loaded yet');
      return;
    }

    // Check if status is already final
    if (meeting.status === 'ready' || meeting.status === 'error') {
      console.log('[MeetingDetails] Status is already final:', meeting.status, '- no polling needed');
      return;
    }

    console.log('[MeetingDetails] Setting up status polling for:', meetingId);
    hasSetupPollingRef.current = true;

    const checkStatus = async () => {
      if (!mountedRef.current) {
        console.log('[MeetingDetails] Component unmounted, stopping poll');
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        return;
      }

      try {
        console.log('[MeetingDetails] Fetching status...');
        const response = await fetch(`${API_BASE}/api/audio/status/${meetingId}`);
        
        if (!response.ok) {
          console.error('[MeetingDetails] Status check failed:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('[MeetingDetails] Status received:', data);

        if (!mountedRef.current) return;

        // Update meeting state with new status AND data
        setMeeting(prev => {
          if (!prev) return null;
          return { 
            ...prev, 
            status: data.status,
            transcript: data.data?.transcript || prev.transcript,
            notes: data.data?.notes || prev.notes,
            error: data.data?.error || prev.error,
          };
        });

        // Update localStorage
        try {
          const meetings = JSON.parse(localStorage.getItem('userMeetings') || '[]');
          const meetingIndex = meetings.findIndex(m => m.meetingId === meetingId);
          if (meetingIndex !== -1) {
            meetings[meetingIndex] = { 
              ...meetings[meetingIndex], 
              status: data.status,
              transcript: data.data?.transcript || meetings[meetingIndex].transcript,
              notes: data.data?.notes || meetings[meetingIndex].notes,
              error: data.data?.error || meetings[meetingIndex].error,
            };
            localStorage.setItem('userMeetings', JSON.stringify(meetings));
            console.log('[MeetingDetails] LocalStorage updated');
          }
        } catch (err) {
          console.error('[MeetingDetails] Failed to update localStorage:', err);
        }

        // CRITICAL: Stop polling if status is final
        if (data.status === 'ready' || data.status === 'error') {
          console.log('[MeetingDetails] ⛔ FINAL STATUS REACHED:', data.status, '- STOPPING POLL');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            console.log('[MeetingDetails] ✅ Poll interval cleared');
          }
        }
      } catch (error) {
        console.error('[MeetingDetails] Failed to check status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Set up interval for subsequent checks
    pollIntervalRef.current = setInterval(checkStatus, 3000);
    console.log('[MeetingDetails] Poll interval started (every 3s)');

    // Cleanup
    return () => {
      console.log('[MeetingDetails] Cleaning up poll interval');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      hasSetupPollingRef.current = false;
    };
  }, [meetingId, meeting?.meetingId]); // Only depend on meetingId, not meeting.status

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      console.log('[MeetingDetails] Component unmounting');
      mountedRef.current = false;
    };
  }, []);

  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!meeting) return;

    const content = `
# Meeting Notes - ${meeting.fileName || meeting.originalFileName || 'Untitled Meeting'}

**Date:** ${new Date(meeting.uploadedAt).toLocaleString()}
**Meeting ID:** ${meeting.meetingId}
**Status:** ${meeting.status}

## Summary
${meeting.notes?.summary || 'Waiting for processing...'}

## Transcript
${meeting.transcript || 'Waiting for transcription...'}

## Key Points
${meeting.notes?.keyPoints?.map((point, i) => `${i + 1}. ${point}`).join('\n') || 'Waiting for analysis...'}

## Action Items
${meeting.notes?.actionItems?.map((item, i) => `${i + 1}. [${item.priority}] ${item.task}${item.owner ? ` (Owner: ${item.owner})` : ''}`).join('\n') || 'No action items yet'}

---
Generated by Smart Meeting Notes Generator
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.fileName || meeting.originalFileName || 'meeting'}_notes.md`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Meeting not found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The meeting you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const isProcessing = meeting.status === 'processing' || meeting.status === 'uploaded';
  const isReady = meeting.status === 'ready';
  const hasError = meeting.status === 'error';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white break-words">
                {meeting.fileName || meeting.originalFileName || 'Untitled Meeting'}
              </h1>
              <div className="flex flex-col sm:flex-row gap-3 mt-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(meeting.uploadedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(meeting.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleDownload}
                disabled={!isReady}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={isReady ? 'Download meeting notes' : 'Waiting for processing to complete'}
              >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Status</h3>
              <div className="space-y-3">
                {isProcessing && (
                  <>
                    <div className="flex items-center gap-3">
                      <Loader className="h-5 w-5 text-yellow-600 animate-spin" />
                      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-400">
                        {meeting.status === 'processing' ? 'Processing...' : 'Queued for processing'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Your meeting is being transcribed and analyzed. This may take a few minutes.
                    </p>
                  </>
                )}
                {isReady && (
                  <>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900 dark:text-green-400">Ready</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Your notes are ready to view and download.
                    </p>
                  </>
                )}
                {hasError && (
                  <>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-900 dark:text-red-400">Error</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {meeting.error || 'An error occurred processing your meeting.'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Meeting ID Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Meeting ID</h3>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <code className="text-xs text-slate-700 dark:text-slate-300 break-all flex-1">{meetingId}</code>
                <button
                  onClick={handleCopyMeetingId}
                  className="flex-shrink-0 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">Copied to clipboard!</p>
              )}
            </div>

            {/* File Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">File Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Size</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">
                    {(meeting.fileSize / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>
              </dl>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {isProcessing && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Processing Your Meeting
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  We're transcribing your audio and generating notes. This usually takes 1-5 minutes depending on meeting length.
                </p>
                <div className="inline-block h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              </div>
            )}

            {hasError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-900 dark:text-red-400 mb-2">
                  Processing Failed
                </h2>
                <p className="text-red-800 dark:text-red-500 mb-4">
                  {meeting.error || 'An error occurred while processing your meeting.'}
                </p>
                <p className="text-sm text-red-700 dark:text-red-600 mb-6">
                  Please try uploading the file again or try a different audio file.
                </p>
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Upload Another Meeting
                </button>
              </div>
            )}

            {isReady && (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                  {['summary', 'transcript', 'keyPoints', 'actionItems'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                      }`}
                    >
                      {tab === 'summary' && 'Summary'}
                      {tab === 'transcript' && 'Transcript'}
                      {tab === 'keyPoints' && 'Key Points'}
                      {tab === 'actionItems' && 'Action Items'}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  {activeTab === 'summary' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Summary</h2>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {meeting.notes?.summary || 'No summary available yet.'}
                      </p>
                    </div>
                  )}

                  {activeTab === 'transcript' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Transcript</h2>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {meeting.transcript || 'Transcript not available yet.'}
                      </p>
                    </div>
                  )}

                  {activeTab === 'keyPoints' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Key Points</h2>
                      {meeting.notes?.keyPoints && meeting.notes.keyPoints.length > 0 ? (
                        <ul className="space-y-3">
                          {meeting.notes.keyPoints.map((point, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                                {i + 1}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 pt-0.5">{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400">No key points extracted yet.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'actionItems' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Action Items</h2>
                      {meeting.notes?.actionItems && meeting.notes.actionItems.length > 0 ? (
                        <div className="space-y-3">
                          {meeting.notes.actionItems.map((item, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div className="flex-shrink-0 pt-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  item.priority === 'high' ? 'bg-red-600' :
                                  item.priority === 'medium' ? 'bg-yellow-600' :
                                  'bg-green-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-slate-900 dark:text-white font-medium">{item.task}</p>
                                {item.owner && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Owner: {item.owner}</p>
                                )}
                              </div>
                              <span className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
                                item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400">No action items identified.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MeetingDetails;