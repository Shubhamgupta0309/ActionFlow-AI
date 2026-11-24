import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
  LayoutGrid,
  List,
  Download,
} from 'lucide-react';

export default function TaskSection({
  tasks,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onStatusChange,
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // CSV Export Function
  const exportToCSV = () => {
    if (tasks.length === 0) return;
    const headers = ['ID', 'Title', 'Description', 'Priority', 'Status', 'Due Date', 'Source Message'];
    const rows = tasks.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.due_date ? new Date(t.due_date).toLocaleDateString() : '',
      `"${(t.subject || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `actionflow_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and drop handlers
  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus) => {
    if (draggedTaskId) {
      onStatusChange(draggedTaskId, targetStatus);
      setDraggedTaskId(null);
    }
  };

  const columns = [
    { key: 'Pending', label: 'Pending', color: 'border-slate-300', dot: 'bg-slate-400' },
    { key: 'In Progress', label: 'In Progress', color: 'border-amber-400', dot: 'bg-amber-500' },
    { key: 'Completed', label: 'Completed', color: 'border-emerald-400', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* View Switcher & CSV Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            title="Export tasks to CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                viewMode === 'kanban' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition ${
                viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.key)}
                className={`bg-slate-100/70 p-4 rounded-xl border-t-4 ${col.color} border-slate-200 min-h-[500px] flex flex-col`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span>{col.label}</span>
                  </div>
                  <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg">
                      Drag tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                            {task.title}
                          </h4>
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                          {task.due_date ? (
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span>{task.sender_name || 'No deadline'}</span>
                          )}

                          <select
                            value={task.status}
                            onChange={(e) => onStatusChange(task.id, e.target.value)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (Original) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50 transition flex items-start gap-4">
              <button
                onClick={() => {
                  const nextStatus =
                    task.status === 'Pending'
                      ? 'In Progress'
                      : task.status === 'In Progress'
                      ? 'Completed'
                      : 'Pending';
                  onStatusChange(task.id, nextStatus);
                }}
                className="mt-1"
              >
                {task.status === 'Completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : task.status === 'In Progress' ? (
                  <Clock className="w-5 h-5 text-amber-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold text-slate-900 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && <p className="text-sm text-slate-600 mb-2">{task.description}</p>}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                  {task.subject && <span>From: {task.subject}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}