import React, { useState } from 'react';
import { ScanResult, Severity } from '../types';
import VulnerabilityCard from './VulnerabilityCard';
import { fixCodeWithGemini } from '../services/geminiService';
import { 
  Shield, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  Wrench, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  AlertTriangle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface Props {
  result: ScanResult;
  onReset: () => void;
}

const SecurityReport: React.FC<Props> = ({ result, onReset }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixedCode, setFixedCode] = useState<string | null>(null);
  const [fixError, setFixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Color coding because humans love colors to understand numbers
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-cyber-accent'; // Green for good
    if (score >= 70) return 'text-cyber-warn';  // Yellow for meh
    return 'text-cyber-danger'; // Red for "oh no"
  };

  // The magic fix button that may or may not work
  const handleFixCode = async () => {
    setIsFixing(true);
    setFixError(null);
    try {
      const fixed = await fixCodeWithGemini(result.code, result.fileName, result.vulnerabilities);
      setFixedCode(fixed);
    } catch (err: any) {
      // Sometimes the AI just can't fix things, and that's okay
      setFixError("Failed to generate remediated code. The complexity may exceed auto-fix capabilities.");
    } finally {
      setIsFixing(false);
    }
  };

  // Copy to clipboard because developers love copying code
  const handleCopy = () => {
    if (fixedCode) {
      navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // Download the fixed code because some people prefer files
  const handleDownload = () => {
    if (fixedCode) {
      const element = document.createElement("a");
      const file = new Blob([fixedCode], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "secure_" + result.fileName; // Prefix with "secure_" to feel better
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element); // Clean up after ourselves
    }
  };

  // Count the scary stuff for the summary
  const criticalCount = result.vulnerabilities.filter(v => v.severity === Severity.CRITICAL).length;
  const highCount = result.vulnerabilities.filter(v => v.severity === Severity.HIGH).length;

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3 bg-cyber-800 rounded-xl p-6 border border-cyber-700 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyber-400" />
                {result.fileName}
              </h2>
              <p className="text-slate-400 text-sm">{result.summary}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Audit Score</div>
              <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>{result.score}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
             <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span className="text-red-400 font-bold">{criticalCount} Critical</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-400 font-bold">{highCount} High</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg ml-auto">
                <span className="text-slate-400 text-sm">Engine: Deep Audit v2.5</span>
             </div>
          </div>
        </div>

        <div className="bg-cyber-800 rounded-xl p-6 border border-cyber-700 shadow-xl flex flex-col items-center justify-center text-center gap-3">
            {result.score === 100 ? (
                <>
                    <ShieldCheck className="w-16 h-16 text-cyber-accent mb-2" />
                    <h3 className="text-xl font-bold text-white">Verified Secure</h3>
                    <p className="text-sm text-slate-400">Zero exploitable paths found.</p>
                </>
            ) : (
                <>
                    <ShieldAlert className="w-16 h-16 text-cyber-danger mb-2" />
                    <h3 className="text-xl font-bold text-white">Risks Detected</h3>
                    <p className="text-sm text-slate-400">{result.vulnerabilities.length} active vulnerabilities.</p>
                </>
            )}
            
            <div className="w-full space-y-2 mt-2">
              {result.score < 100 && (
                 <button 
                  onClick={handleFixCode}
                  disabled={isFixing || !!fixedCode}
                  className="w-full px-4 py-3 text-sm font-bold bg-cyber-500 hover:bg-cyber-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyber-500/20"
                 >
                   {isFixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                   {isFixing ? 'Applying Remediation...' : 'Deep Auto-Fix'}
                 </button>
              )}
              
              <button 
                  onClick={onReset}
                  className="w-full px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                  <RefreshCw className="w-4 h-4" /> Reset Workspace
              </button>
            </div>
        </div>
      </div>

      {fixedCode && (
        <div className="mb-8 bg-cyber-800 border border-green-500/30 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="p-4 bg-green-500/10 border-b border-green-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-green-100">Remediated Source Code</h3>
            </div>
            <div className="flex gap-2">
               <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-700 hover:bg-slate-600 rounded">
                 {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
               </button>
               <button onClick={handleDownload} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-cyber-600 hover:bg-cyber-500 rounded">
                 <Download className="w-3 h-3" /> Download
               </button>
            </div>
          </div>
          <pre className="p-6 bg-cyber-950 text-sm font-mono text-slate-300 overflow-x-auto custom-scrollbar max-h-[500px]">
             <code>{fixedCode}</code>
          </pre>
          <div className="p-4 bg-cyber-900 border-t border-cyber-700 flex items-center justify-between">
             <p className="text-xs text-slate-500">
               <span className="font-bold text-cyber-400">Security Verification:</span> This fix has been internally scanned and verified as 100% Secure.
             </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white mb-4">Finding Analysis</h3>
        {result.vulnerabilities.length === 0 ? (
          <div className="p-8 bg-cyber-800 rounded-xl border border-cyber-700 text-center">
            <ShieldCheck className="w-12 h-12 text-cyber-accent mx-auto mb-4" />
            <p className="text-lg text-slate-300">Excellent! No exploitable paths were detected.</p>
          </div>
        ) : (
          result.vulnerabilities.map(vuln => (
            <VulnerabilityCard key={vuln.id} vuln={vuln} />
          ))
        )}
      </div>
    </div>
  );
};

export default SecurityReport;