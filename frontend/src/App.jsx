import React, { useState, useEffect } from 'react';
import { Sparkles, Upload, Inbox, CheckSquare, RefreshCw } from 'lucide-react';
import {
  getDashboardStats,
  getTasks,
  getMessages,
  updateTask,
  analyzeSingleMessage,
  analyzeAllMessages,
} from './services/api';

import StatsCards from './components/StatsCards';
import TaskSection from './components/TaskSection';
import MessageSection from './components/MessageSection';
import UploadModal from './components/UploadModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'messages'
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);

  // Load stats and messages
  const loadInitialData = async () => {
    try {
      const [statsData, msgData] = await Promise.all([
        getDashboardStats(),
        getMessages(),
      ]);
      setStats(statsData);
      setMessages(msgData.messages || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  // Load tasks with filters
  const loadTasks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const data = await getTasks(params);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [search, statusFilter, priorityFilter]);

  // Handle task status toggle
  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
      await updateTask(taskId, { status: nextStatus });
      const updatedStats = await getDashboardStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to update task status:', err);
      loadTasks();
    }
  };

  // Handle single message AI analysis
  const handleAnalyzeMessage = async (messageId) => {
    setLoadingMessageId(messageId);
    try {
      await analyzeSingleMessage(messageId);
      await loadInitialData();
      await loadTasks();
    } catch (err) {
      console.error('Error analyzing message:', err);
    } finally {
      setLoadingMessageId(null);
    }
  };

  // Handle batch AI analysis
  const handleBatchAnalyze = async () => {
    setBatchAnalyzing(true);
    try {
      await analyzeAllMessages();
      await loadInitialData();
      await loadTasks();
    } catch (err) {
      console.error('Batch analysis error:', err);
    } finally {
      setBatchAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight">ActionFlow AI</h1>
              <p className="text-xs text-slate-400">Intelligent Inbox & Task Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Import JSON</span>
            </button>

            <button
              onClick={handleBatchAnalyze}
              disabled={batchAnalyzing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${batchAnalyzing ? 'animate-spin' : ''}`} />
              <span>{batchAnalyzing ? 'Analyzing Messages...' : 'Analyze All with AI'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metric Cards */}
        <StatsCards stats={stats} />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tasks Management ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'messages'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox & AI Insights ({messages.length})</span>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'tasks' ? (
          <TaskSection
            tasks={tasks}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <MessageSection
            messages={messages}
            onAnalyzeMessage={handleAnalyzeMessage}
            loadingMessageId={loadingMessageId}
          />
        )}
      </main>

      {/* JSON File Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          loadInitialData();
          loadTasks();
        }}
      />
    </div>
  );
}