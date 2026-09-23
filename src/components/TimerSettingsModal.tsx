import React, { useState } from 'react';
import { Clock, Zap, Gauge, Check, RefreshCw } from 'lucide-react';
import { CustomTimerConfig } from '../utils/storage';

interface TimerSettingsModalProps {
  config: CustomTimerConfig;
  onSave: (newConfig: CustomTimerConfig) => void;
  onClose: () => void;
}

export const TimerSettingsModal: React.FC<TimerSettingsModalProps> = ({
  config,
  onSave,
  onClose,
}) => {
  const [quickBuzzTime, setQuickBuzzTime] = useState(config.quickBuzzTime);
  const [brainMathTime, setBrainMathTime] = useState(config.brainMathTime);
  const [customTime, setCustomTime] = useState(config.customTime);

  const presetTimes = [5, 8, 10, 12, 15, 20, 30];

  const handleSave = () => {
    onSave({
      quickBuzzTime,
      brainMathTime,
      customTime,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    setQuickBuzzTime(15);
    setBrainMathTime(8);
    setCustomTime(10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-['Syne'] text-lg font-bold text-white">
                Tournament Timers
              </h3>
              <p className="text-xs text-slate-400">
                Calibrate decision velocity and mental math pressure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Quick Buzz Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">
                  Quick Buzz Mode
                </span>
                <span className="text-[11px] text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  Official standard: 15s
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-amber-400">
                {quickBuzzTime}s
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Fast-paced round testing verbal reasoning, pattern detection, and African general knowledge.
            </p>
            <div className="flex flex-wrap gap-2">
              {[10, 12, 15, 20].map(secs => (
                <button
                  key={secs}
                  type="button"
                  onClick={() => setQuickBuzzTime(secs)}
                  className={`flex-1 min-w-[60px] rounded-lg py-1.5 text-xs font-semibold transition ${
                    quickBuzzTime === secs
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
          </div>

          {/* Brain Math Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">
                  Brain Math Mode
                </span>
                <span className="text-[11px] text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Official standard: 8s
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {brainMathTime}s
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              High-velocity mental maths, rapid probability, stoichiometry, and immediate calculation sprints.
            </p>
            <div className="flex flex-wrap gap-2">
              {[5, 8, 10, 12].map(secs => (
                <button
                  key={secs}
                  type="button"
                  onClick={() => setBrainMathTime(secs)}
                  className={`flex-1 min-w-[60px] rounded-lg py-1.5 text-xs font-semibold transition ${
                    brainMathTime === secs
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
          </div>

          {/* Custom Practice / Drill Timer */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                Custom Practice Mode Timer
              </span>
              <span className="font-mono text-sm font-bold text-cyan-400">
                {customTime}s
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Applies to unranked custom drills and syllabus exploration.
            </p>
            <div className="flex flex-wrap gap-2">
              {presetTimes.map(secs => (
                <button
                  key={secs}
                  type="button"
                  onClick={() => setCustomTime(secs)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    customTime === secs
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <RefreshCw className="h-3 w-3" /> Reset to Tournament Defaults (15s & 8s)
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 active:scale-95"
            >
              <Check className="h-4 w-4" /> Apply Timers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
