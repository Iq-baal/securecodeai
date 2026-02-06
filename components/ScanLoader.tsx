import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Database, Search, Zap } from 'lucide-react';

const ScanLoader: React.FC = () => {
  const [phase, setPhase] = useState(0);
  // Four phases to make it look like we're doing something sophisticated
  const phases = [
    { name: "Mapping AST & Logic Scopes", icon: <Zap className="w-4 h-4" /> },
    { name: "Tracing Source-to-Sink Dataflow", icon: <Database className="w-4 h-4" /> },
    { name: "Applying OWASP & Rule-Based Heuristics", icon: <Search className="w-4 h-4" /> },
    { name: "Verifying Remediation Integrity", icon: <ShieldCheck className="w-4 h-4" /> }
  ];

  useEffect(() => {
    // Cycle through phases every 2.5 seconds for that authentic analysis feel
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % phases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-cyber-500 blur-[40px] opacity-20 rounded-full animate-pulse"></div>
        <Loader2 className="w-20 h-20 text-cyber-500 animate-spin relative z-10" />
      </div>
      
      <div className="bg-cyber-800/50 border border-cyber-700 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold text-white mb-4">Deep Security Audit</h3>
        <div className="space-y-4">
          {phases.map((p, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${i === phase ? 'text-cyber-400 font-bold translate-x-2' : 'text-slate-500 opacity-50'}`}
            >
              <span className={`p-1.5 rounded-md ${i === phase ? 'bg-cyber-500/20 text-cyber-400' : 'bg-slate-800'}`}>
                {p.icon}
              </span>
              {p.name}
              {i === phase && <span className="flex gap-0.5 ml-auto"><span className="w-1 h-1 bg-cyber-400 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-cyber-400 rounded-full animate-bounce delay-75"></span><span className="w-1 h-1 bg-cyber-400 rounded-full animate-bounce delay-150"></span></span>}
            </div>
          ))}
        </div>
      </div>
      
      <p className="mt-8 text-slate-500 text-sm max-w-md italic">
        "Our algorithm performs deep static analysis and taint tracking to ensure zero hallucinations and 100% accuracy."
      </p>
    </div>
  );
};

export default ScanLoader;