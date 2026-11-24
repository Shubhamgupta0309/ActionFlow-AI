import React, { useState } from 'react';
import { Sparkles, Copy, Check, MessageSquare, ChevronRight, User } from 'lucide-react';

export default function MessageSection({ messages, onAnalyzeMessage, loadingMessageId }) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Message List */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => setSelectedMessage(msg)}
            className={`p-4 cursor-pointer transition hover:bg-slate-50 ${
              selectedMessage?.id === msg.id ? 'bg-indigo-50/60 border-l-4 border-indigo-600' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-900 text-sm truncate max-w-[200px]">
                {msg.sender_name}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(msg.date).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-800 truncate mb-1">
              {msg.subject || '(No Subject)'}
            </div>
            <div className="text-xs text-slate-500 line-clamp-2 mb-2">
              {msg.content}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">{msg.id}</span>
              {msg.is_analyzed ? (
                <span className="inline-flex items-center gap-1 text-indigo-600 font-medium">
                  <Sparkles className="w-3 h-3" />
                  {msg.category || 'Analyzed'}
                </span>
              ) : (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                  Not Analyzed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Detail & AI Insights Panel */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        {selectedMessage ? (
          <div>
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedMessage.subject || 'Message Detail'}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  <span>{selectedMessage.sender_name} &lt;{selectedMessage.sender_email}&gt;</span>
                </div>
              </div>
              {!selectedMessage.is_analyzed && (
                <button
                  onClick={() => onAnalyzeMessage(selectedMessage.id)}
                  disabled={loadingMessageId === selectedMessage.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loadingMessageId === selectedMessage.id ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              )}
            </div>

            {/* Email Body */}
            <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap font-sans">
              {selectedMessage.content}
            </div>

            {/* AI Insights Section */}
            {selectedMessage.is_analyzed ? (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Summary & Intent</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {selectedMessage.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-white px-2.5 py-1 rounded-md border border-indigo-200 text-indigo-700 font-medium">
                      Category: {selectedMessage.category}
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-md border border-indigo-200 text-indigo-700 font-medium">
                      Priority: {selectedMessage.priority}
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-md border border-indigo-200 text-indigo-700 font-medium">
                      Response Required: {selectedMessage.response_required ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {/* Suggested Reply Box */}
                {selectedMessage.suggested_reply && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Suggested Reply
                      </span>
                      <button
                        onClick={() => handleCopy(selectedMessage.suggested_reply)}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy Reply'}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200">
                      "{selectedMessage.suggested_reply}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Click "Analyze with AI" to summarize this message and generate suggested replies.
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            Select a message from the list to view its contents and AI insights.
          </div>
        )}
      </div>
    </div>
  );
}