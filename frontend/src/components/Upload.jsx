import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, FileAudio, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import auth, { getLocalUser } from '../firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [meetingId, setMeetingId] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const user = getLocalUser();
  const redirectTimeoutRef = useRef(null);

  React.useEffect(() => {
  if (!user) {
    navigate('/login');
  }

  return () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
  };
}, [user]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/x-m4a'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file format. Please upload MP3, WAV, or M4A files.');
        setFile(null);
        return;
      }

      // Validate file size (25 MB)
      const maxSize = 25_000_000;
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 25 MB limit.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setUploadStatus(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setUploadStatus('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch(`${API_BASE}/api/audio/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await auth.currentUser?.getIdToken()}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Upload failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Save meeting to local storage
      const newMeeting = {
        meetingId: data.data.meetingId,
        fileName: data.data.originalFileName,
        fileSize: data.data.fileSize,
        uploadedAt: data.data.uploadedAt,
        status: 'uploaded',
        transcript: null,
        notes: null,
      };

      const existingMeetings = JSON.parse(localStorage.getItem(`userMeetings:${user.uid}`) || '[]');
      existingMeetings.unshift(newMeeting);
      localStorage.setItem(`userMeetings:${user.uid}`, JSON.stringify(existingMeetings));

      setMeetingId(data.data.meetingId);
      setUploadStatus('success');
      setUploadProgress(100);

      // Redirect after success with cleanup
      console.log('Redirecting to meeting details in 2 seconds...');
      window.location.href = `/meeting/${data.data.meetingId}`;
    //   redirectTimeoutRef.current = setTimeout(() => {
    //     // navigate(`/meeting/${data.data.meetingId}`);
    //     console.log('Redirecting now...');
    //   }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragAndDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Trigger file select logic
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: dataTransfer.files } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload Meeting Audio</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Upload your meeting recording and we'll transcribe and generate notes automatically.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleUpload} className="space-y-8">
            {/* Upload Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragAndDrop}
              className="relative bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center hover:border-blue-500 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={loading}
              />

              {file ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileAudio className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      fileInputRef.current.value = '';
                    }}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Choose Different File
                  </button>
                </div>
              ) : (
                <div
                  className="cursor-pointer space-y-4"
                  onClick={() => !loading && fileInputRef.current?.click()}
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Supported formats: MP3, WAV, M4A (Max 25 MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-400">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Upload Progress */}
            {uploadStatus === 'uploading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                  <p className="font-medium text-slate-900 dark:text-white">Uploading...</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {uploadStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-6 text-center"
              >
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <p className="font-semibold text-green-900 dark:text-green-400 mb-2">Upload Successful!</p>
                <p className="text-sm text-green-800 dark:text-green-500 mb-4">
                  Your meeting audio has been uploaded. Processing your notes...
                </p>
                <p className="text-xs text-green-700 dark:text-green-600">
                  Redirecting to your meeting details...
                </p>
              </motion.div>
            )}

            {/* Upload Button */}
            {uploadStatus !== 'success' && (
              <button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload and Process
                  </>
                )}
              </button>
            )}

            {/* File Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-3">Requirements:</h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-500">
                <li>✓ Audio formats: MP3, WAV, M4A</li>
                <li>✓ File size: Up to 25 MB</li>
                <li>✓ Clear audio for best transcription accuracy</li>
                <li>✓ Meeting duration: Recommended up to 2 hours</li>
              </ul>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadPage;