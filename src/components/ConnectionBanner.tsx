import React, { useState } from 'react';
import { Server, CheckCircle2, AlertCircle, RefreshCw, Settings, HelpCircle } from 'lucide-react';
import { BackendHealth } from '../types';

interface ConnectionBannerProps {
  health: BackendHealth;
  onRefreshHealth: () => void;
  onOpenGuide: () => void;
  onUpdateBaseUrl: (newUrl: string) => void;
  onResetSeed: () => void;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  health,
  onRefreshHealth,
  onOpenGuide,
  onUpdateBaseUrl,
  onResetSeed,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(health.endpoint);

  const isConnected = health.status === 'healthy';
  const isChecking = health.status === 'checking';

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onUpdateBaseUrl(inputUrl.trim());
      setShowSettings(false);
    }
  };

  return (
    <div id="connection-banner-container" className="w-full mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
        {/* Left: Status indicator */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center">
            {isConnected ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : isChecking ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 animate-pulse"></span>
              </span>
            ) : (
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-800">
              {isConnected ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-600" />
                  Connected to FastAPI ({health.latencyMs}ms)
                </span>
              ) : isChecking ? (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 inline animate-spin text-amber-600" />
                  Testing connection to {health.endpoint}...
                </span>
              ) : (
                <span className="text-slate-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 inline text-amber-500" />
                  Local Preview Mode (FastAPI offline)
                </span>
              )}
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {health.endpoint}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            id="retry-connection-btn"
            onClick={onRefreshHealth}
            disabled={isChecking}
            className="flex items-center space-x-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition disabled:opacity-50"
            title="Check connection to backend"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check</span>
          </button>

          <button
            id="open-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Configure Backend URL"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            id="open-guide-btn"
            onClick={onOpenGuide}
            className="flex items-center space-x-1 px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium border border-indigo-200/60 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Local Setup Guide</span>
          </button>
        </div>
      </div>

      {/* Expandable URL settings */}
      {showSettings && (
        <form
          onSubmit={handleSaveUrl}
          className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs"
        >
          <label className="text-slate-600 font-medium whitespace-nowrap">Backend API URL:</label>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="grow px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
          >
            Save URL
          </button>
          <button
            type="button"
            onClick={() => {
              setInputUrl('http://localhost:8000');
              onUpdateBaseUrl('http://localhost:8000');
              setShowSettings(false);
            }}
            className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200/70 rounded-lg transition"
          >
            Reset Default
          </button>
        </form>
      )}

      {/* Informative notification when running in local preview mode */}
      {!isConnected && !isChecking && (
        <div className="mt-2 px-4 py-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 font-bold mt-0.5">•</span>
            <p>
              FastAPI is not detected at <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-800">{health.endpoint}</code>. You are currently in <strong>interactive preview mode</strong> with sample seed data. Once you run <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-800">uvicorn app.main:app --reload</code> on your local machine, click <strong>Check</strong> to sync live.
            </p>
          </div>
          <button
            onClick={onResetSeed}
            className="shrink-0 text-amber-800 underline hover:text-amber-950 font-medium text-[11px]"
          >
            Reload Sample Seed
          </button>
        </div>
      )}
    </div>
  );
};
