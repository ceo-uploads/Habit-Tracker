/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sqlite, SQLResult } from '../lib/sqliteEngine';
import { sounds } from '../lib/soundEffects';
import { Database, Play, AlertCircle, RefreshCw, Terminal, CheckCircle } from 'lucide-react';

interface SQLiteInspectorProps {
  language: 'en' | 'bn';
  onDatabaseUpdate: () => void;
}

const PRESET_QUERIES = [
  { label: 'Show Selected Habits', sql: 'SELECT id, enabled, target, current_streak FROM habits WHERE enabled = 1' },
  { label: 'View All Check-ins', sql: 'SELECT * FROM checkins ORDER BY checkin_date DESC' },
  { label: 'Show User Profiles', sql: 'SELECT * FROM users' },
  { label: 'Active Notifications', sql: 'SELECT * FROM notifications WHERE read = 0' }
];

export const SQLiteInspector: React.FC<SQLiteInspectorProps> = ({
  language,
  onDatabaseUpdate,
}) => {
  const [query, setQuery] = useState('SELECT id, enabled, target, current_streak FROM habits WHERE enabled = 1');
  const [result, setResult] = useState<SQLResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const runQuery = (sqlText: string) => {
    sounds.playClick();
    setSuccessMessage(null);
    const res = sqlite.executeSQL(sqlText);
    setResult(res);

    if (!res.error) {
      if (sqlText.toUpperCase().trim().startsWith('UPDATE') || sqlText.toUpperCase().trim().startsWith('INSERT') || sqlText.toUpperCase().trim().startsWith('DELETE')) {
        setSuccessMessage(`Query executed successfully! Affected rows: ${res.affectedRows}`);
        // Notify parent to refresh app states
        onDatabaseUpdate();
      }
    }
  };

  const handlePresetClick = (sql: string) => {
    setQuery(sql);
    runQuery(sql);
  };

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl text-left">
      {/* Title */}
      <div className="flex items-center space-x-3 mb-4">
        <Database className="w-6 h-6 text-cyan-400" />
        <div>
          <h3 className="text-lg font-bold text-white">
            {language === 'en' ? 'Local SQLite Database' : 'লোকাল SQLite ডাটাবেস'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'en' 
              ? 'Real-time simulated SQLite transactional database console. 100% client-side privacy.' 
              : 'রিয়েল-টাইম লোকাল SQLite ডাটাবেস কনসোল। শতভাগ ক্লায়েন্ট-সাইড গোপনীয়তা।'}
          </p>
        </div>
      </div>

      {/* SQL Info Panel */}
      <div className="bg-slate-900/50 rounded-xl p-4 mb-4 text-xs text-slate-300 border border-slate-800/60 leading-relaxed">
        <span className="font-semibold text-cyan-400 uppercase tracking-widest block mb-1">
          {language === 'en' ? 'Database Schemas:' : 'ডাটাবেস টেবিলসমূহ:'}
        </span>
        <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-400">
          <li><strong className="text-slate-300">users</strong> (id, name, avatar, joined_date, language, theme)</li>
          <li><strong className="text-slate-300">habits</strong> (id, enabled, target, start_date, current_streak, highest_streak, last_checkin, completed_target)</li>
          <li><strong className="text-slate-300">checkins</strong> (id, habit_id, checkin_date)</li>
          <li><strong className="text-slate-300">notifications</strong> (id, title, message, timestamp, read)</li>
        </ul>
      </div>

      {/* Presets Grid */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 font-medium block mb-2">
          {language === 'en' ? 'Quick SQL Templates:' : 'সহজ SQL কোয়েরি সমূহ:'}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset.sql)}
              className="text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-all font-mono"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input query field */}
      <div className="relative mb-4">
        <div className="absolute top-3 left-3 flex items-center pointer-events-none text-slate-500 text-xs">
          <Terminal className="w-4 h-4 mr-1 text-cyan-500" />
          <span>sqlite&gt;</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-900 text-slate-100 font-mono text-xs pl-[72px] pr-12 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30"
          placeholder="SELECT * FROM habits;"
        />
        <button
          onClick={() => runQuery(query)}
          className="absolute right-2 top-2 bg-cyan-600 hover:bg-cyan-500 text-white p-1.5 rounded-lg transition-all"
        >
          <Play className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Alert */}
      {result?.error && (
        <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-300 mb-4 font-mono">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>SQL Error: {result.error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-3 flex items-start space-x-2 text-xs text-emerald-300 mb-4 font-mono">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Results View */}
      {result && !result.error && (
        <div className="overflow-x-auto border border-slate-800/80 rounded-xl max-h-[220px]">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-left">
                {result.columns.map((col, i) => (
                  <th key={i} className="px-3 py-2 border-r border-slate-800">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.length === 0 ? (
                <tr>
                  <td colSpan={result.columns.length || 1} className="px-3 py-4 text-center text-slate-500 italic">
                    {language === 'en' ? '0 rows returned' : 'কোন রেকর্ড পাওয়া যায়নি'}
                  </td>
                </tr>
              ) : (
                result.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-900 hover:bg-slate-900/30 text-slate-300">
                    {result.columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 border-r border-slate-900 truncate max-w-[200px]">
                        {row[col] === null ? <span className="text-slate-600">NULL</span> : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SQLiteInspector;
