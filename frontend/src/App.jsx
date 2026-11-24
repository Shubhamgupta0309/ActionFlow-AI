import { CheckCircle2, Inbox } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-3 mb-6">
          <Inbox className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-800">ActionFlow AI</h1>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <CheckCircle2 className="w-5 h-5" />
            <span>Frontend & Tailwind CSS v4 are working perfectly!</span>
          </div>
          <p className="mt-2 text-slate-600">
            Next, we will connect this dashboard to the FastAPI backend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;