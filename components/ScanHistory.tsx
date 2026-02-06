import React, { useEffect, useState } from 'react';
import { ScanResult } from '../types';
import { getHistory, clearHistory } from '../services/historyService';
import { History, Trash2, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  onSelectScan: (scan: ScanResult) => void;
}

const ScanHistory: React.FC<Props> = ({ onSelectScan }) => {
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    // Load history on mount
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    // Confirm before nuking everything - users click fast
    if (confirm('Are you sure you want to clear your scan history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  // Color code scores so they're easy to read at a glance
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-cyber-accent';
    if (score >= 70) return 'text-cyber-warn';
    return 'text-cyber-danger';
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <History className="w-8 h-8 text-cyber-400" />
          Scan History
        </h2>
        {history.length > 0 && (
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-cyber-800/50 rounded-xl border border-cyber-700 border-dashed">
          <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-slate-400 font-medium">No Scan History</h3>
          <p className="text-slate-500 mt-2">Your previous audits will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((scan, index) => (
            <div 
              key={scan.id || index}
              onClick={() => onSelectScan(scan)}
              className="bg-cyber-800 border border-cyber-700 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-cyber-500 cursor-pointer transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <h3 className="text-lg font-bold text-white group-hover:text-cyber-400 transition-colors">{scan.fileName}</h3>
                   <span className="text-xs text-slate-500">{new Date(scan.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-1">{scan.summary}</p>
                <div className="flex gap-4 mt-3">
                    <span className="text-xs px-2 py-1 bg-cyber-900 rounded border border-cyber-700 text-slate-400">
                        {scan.vulnerabilities.length} Issues
                    </span>
                    {scan.vulnerabilities.some(v => v.severity === 'Critical') && (
                        <span className="text-xs px-2 py-1 bg-red-500/10 rounded border border-red-500/20 text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Critical Found
                        </span>
                    )}
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-6 pl-0 md:pl-6 border-l-0 md:border-l border-cyber-700">
                 <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase">Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(scan.score)}`}>{scan.score}</div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScanHistory;