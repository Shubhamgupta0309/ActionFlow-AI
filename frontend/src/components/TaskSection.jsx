import React from 'react';
import { Search, Filter, Calendar, Tag, CheckCircle2, Circle, Clock } from 'lucide-react';

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, description, or subject..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No tasks found matching your filter criteria.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-50/70 transition flex items-start gap-4">
              {/* Status Toggle Button */}
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
                title="Click to change status"
                className="mt-1 text-slate-400 hover:text-indigo-600 transition"
              >
                {task.status === 'Completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : task.status === 'In Progress' ? (
                  <Clock className="w-5 h-5 text-amber-500" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-semibold text-slate-900 ${
                      task.status === 'Completed' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-slate-600 mb-2 leading-relaxed">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-amber-600 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.subject && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Message: {task.subject}</span>
                    </div>
                  )}
                  {task.sender_name && (
                    <span>From: {task.sender_name}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}