import React, { useState } from 'react';
import { X, Check, Copy, Terminal, Database, Server, Play, ExternalLink } from 'lucide-react';

interface BackendGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl: string;
}

export const BackendGuideModal: React.FC<BackendGuideModalProps> = ({
  isOpen,
  onClose,
  apiBaseUrl,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      id: 'step-db',
      title: '1. Create PostgreSQL Database',
      icon: Database,
      desc: 'Ensure PostgreSQL is running locally and create the database named todo_db:',
      command: `createdb todo_db`,
      subCommands: [
        '# Or via psql CLI:',
        "psql -U postgres -c 'CREATE DATABASE todo_db;'",
      ],
    },
    {
      id: 'step-venv',
      title: '2. Install Backend Dependencies',
      icon: Terminal,
      desc: 'Set up a virtual environment and install requirements in the backend folder:',
      command: `cd backend\npython3 -m venv venv\nsource venv/bin/activate  # On Windows: venv\\Scripts\\activate\npip install -r requirements.txt`,
    },
    {
      id: 'step-env',
      title: '3. Configure Environment (.env)',
      icon: Terminal,
      desc: 'Create your .env file with your local PostgreSQL credentials:',
      command: `cp .env.example .env`,
      subCommands: [
        '# Default connection string in .env:',
        'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_db',
      ],
    },
    {
      id: 'step-seed',
      title: '4. Seed the Database (12 Dummy Todos)',
      icon: Play,
      desc: 'Run the seed script to verify table creation and insert sample data:',
      command: `python3 seed.py`,
    },
    {
      id: 'step-start',
      title: '5. Launch FastAPI Backend',
      icon: Server,
      desc: 'Start the Uvicorn development server on port 8000:',
      command: `uvicorn app.main:app --reload --port 8000`,
    },
    {
      id: 'step-test',
      title: '6. Test Endpoints & Swagger Docs',
      icon: ExternalLink,
      desc: 'Interactive Swagger UI is available at http://localhost:8000/docs or via curl:',
      command: `curl -X GET ${apiBaseUrl}/todos`,
    },
  ];

  return (
    <div
      id="backend-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="backend-guide-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Local 3-Tier Setup Guide</h2>
              <p className="text-xs text-slate-400">PostgreSQL + FastAPI + React step-by-step</p>
            </div>
          </div>
          <button
            id="close-guide-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
            <p className="font-semibold text-indigo-950 mb-1">Architecture Overview:</p>
            <p>
              This project is built directly for local execution without Docker. The React frontend communicates via REST JSON with the Python FastAPI backend at <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-indigo-800">{apiBaseUrl}</code>, which accesses PostgreSQL using SQLAlchemy.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.id}
                  id={step.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-2.5">{step.desc}</p>
                  
                  {/* Command box */}
                  <div className="relative group bg-slate-900 text-slate-200 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                    <pre className="pr-12 whitespace-pre-wrap">{step.command}</pre>
                    <button
                      id={`copy-cmd-${idx}`}
                      onClick={() => copyToClipboard(step.command, idx)}
                      className="absolute right-2 top-2 p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-1 text-[10px]"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {step.subCommands && (
                    <div className="mt-2 text-[11px] text-slate-500 font-mono space-y-0.5 pl-1">
                      {step.subCommands.map((sc, scIdx) => (
                        <div key={scIdx}>{sc}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick API Reference */}
          <div className="p-4 border border-slate-200 rounded-xl bg-white">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              REST Endpoints Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">GET</span>
                <span className="text-slate-700">/todos</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">POST</span>
                <span className="text-slate-700">/todos</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">PUT</span>
                <span className="text-slate-700">/todos/{'{id}'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">DELETE</span>
                <span className="text-slate-700">/todos/{'{id}'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            See <span className="font-mono text-slate-700">README.md</span> for full details
          </span>
          <button
            id="guide-got-it-btn"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
};
