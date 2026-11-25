import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Download, Trash2, Search, Calendar, Clock } from 'lucide-react';
import { getLocalUser, logout } from '../firebase';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const user = getLocalUser();

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      // Fetch meetings from backend - would store meetingIds in localStorage or DB
      const storedMeetings = JSON.parse(localStorage.getItem(`userMeetings:${user.uid}`) || '[]');
      setMeetings(storedMeetings);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        const updated = meetings.filter(m => m.meetingId !== meetingId);
        setMeetings(updated);
        localStorage.setItem(`userMeetings:${user.uid}`, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to delete meeting:', error);
      }
    }
  };

  const handleDownload = (meeting) => {
    const content = JSON.stringify(meeting, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.fileName || 'meeting'}_notes.json`;
    a.click();
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = (meeting.fileName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'uploaded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'transcribed': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Welcome back, {user?.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigateTo('/upload')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                New Meeting
              </button>
              <button
                onClick={() => navigateTo('/profile')}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="uploaded">Uploaded</option>
            <option value="processing">Processing</option>
            <option value="transcribed">Transcribed</option>
            <option value="ready">Ready</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Meetings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your meetings...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No meetings yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Upload your first meeting audio to get started with smart notes generation.</p>
            <button
              onClick={() => navigateTo('/upload')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Upload First Meeting
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.meetingId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => navigateTo(`/meeting/${meeting.meetingId}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                      {meeting.fileName || `Meeting ${index + 1}`}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.uploadedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(meeting.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className={`ml-2 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>

                <div className="mb-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(meeting.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(meeting);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(meeting.meetingId);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;