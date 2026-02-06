import React, { useState, useEffect } from 'react';
import { getAuditStats } from '../services/geminiService';
import { Activity, Database, Clock, Settings } from 'lucide-react';

const SystemStatus: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Refresh stats every few seconds so the numbers stay current
    const updateStats = () => {
      try {
        const auditStats = getAuditStats();
        setStats(auditStats);
      } catch (error) {
        // Stats failing isn't critical, just log and move on
        console.error('Failed to get audit stats:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // 5 second refresh

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Hidden by default - most users don't care about internal metrics
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-cyber-800 border border-cyber-700 rounded-lg text-slate-400 hover:text-white hover:border-cyber-500 transition-colors z-50"
        title="Show system status"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-cyber-800 border border-cyber-700 rounded-xl p-4 shadow-2xl z-50 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyber-500" />
          System Status
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      {stats && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Cache Entries
            </span>
            <span className="text-cyber-400 font-mono">{stats.cacheSize}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Rate Limit Tracking
            </span>
            <span className="text-cyber-400 font-mono">{stats.rateLimitEntries}</span>
          </div>

          <div className="border-t border-cyber-700 pt-2">
            <div className="flex items-center gap-1 text-slate-500 mb-1">
              <Settings className="w-3 h-3" />
              Configuration
            </div>
            <div className="space-y-1 text-slate-400 ml-4">
              <div className="flex justify-between">
                <span>Max Code Size:</span>
                <span className="font-mono">{(stats.config.MAX_CODE_SIZE / 1000).toFixed(0)}KB</span>
              </div>
              <div className="flex justify-between">
                <span>Rate Limit:</span>
                <span className="font-mono">{stats.config.RATE_LIMIT_PER_MINUTE}/min</span>
              </div>
              <div className="flex justify-between">
                <span>Cache TTL:</span>
                <span className="font-mono">{(stats.config.CACHE_TTL_MS / 60000).toFixed(0)}min</span>
              </div>
              <div className="flex justify-between">
                <span>Timeout:</span>
                <span className="font-mono">{(stats.config.TIMEOUT_MS / 1000).toFixed(0)}s</span>
              </div>
            </div>
          </div>

          <div className="border-t border-cyber-700 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">Service Online</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;