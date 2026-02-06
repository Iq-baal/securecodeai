import React, { useState } from 'react';
import { scanCodeWithGemini } from './services/geminiService';
import { saveScan } from './services/historyService';
import { CodeInputMode, ScanResult } from './types';
import ScanLoader from './components/ScanLoader';
import SecurityReport from './components/SecurityReport';
import SecureExamplesLibrary from './components/SecureExamplesLibrary';
import ScanHistory from './components/ScanHistory';
import SystemStatus from './components/SystemStatus';
import { 
  Shield, 
  Code2, 
  FileCode, 
  Github, 
  Upload, 
  Zap, 
  Lock, 
  AlertTriangle,
  History,
  Book,
  Search
} from 'lucide-react';

type ViewMode = 'scanner' | 'history' | 'library';

function App() {
  const [view, setView] = useState<ViewMode>('scanner');
  const [mode, setMode] = useState<CodeInputMode>('paste');
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('snippet.js');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File Upload Handler - because users love uploading random stuff
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target?.result as string);
        setFileName(file.name);
      };
      reader.readAsText(file); // Pray it's actually text and not a binary file
    }
  };

  // Scan Trigger - the main event where magic happens (or everything breaks)
  const handleScan = async () => {
    if (!code.trim()) {
      setError("Please provide code to scan.");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // Using enhanced gemini service with all the production bells and whistles
      const result = await scanCodeWithGemini(code, fileName, {
        clientId: 'web-user', // TODO: implement actual user identification when we get fancy
        skipCache: false
      });
      
      // Add a unique ID because everything needs an ID these days
      const resultWithId = {
        ...result,
        id: `scan-${Date.now()}`
      };
      
      saveScan(resultWithId);
      setScanResult(resultWithId);
    } catch (err: any) {
      console.error("Scan error:", err);
      
      // Handle all the different ways this can fail (there are many)
      if (err.name === 'SecurityAuditError') {
        switch (err.code) {
          case 'MISSING_API_KEY':
            setError("API key not configured. Please set GEMINI_API_KEY in your .env.local file.");
            break;
          case 'EMPTY_CODE':
            setError("Please provide code to scan.");
            break;
          case 'CODE_TOO_LARGE':
            setError(`Code is too large (${err.details?.size} chars). Maximum allowed: ${err.details?.limit} characters.`);
            break;
          case 'RATE_LIMIT_EXCEEDED':
            setError(`Rate limit exceeded. Please wait before making another request. (Limit: ${err.details?.limit} requests per ${err.details?.window})`);
            break;
          case 'TIMEOUT':
            setError("Analysis timed out. Please try with a smaller code file or try again later.");
            break;
          case 'API_RATE_LIMIT':
            setError("Gemini API rate limit exceeded. Please try again in a few minutes.");
            break;
          case 'INVALID_API_KEY':
            setError("Invalid API key. Please check your GEMINI_API_KEY configuration.");
            break;
          default:
            setError(err.message || "An unexpected error occurred during the scan.");
        }
      } else {
        // Fallback for when weird stuff happens
        setError(err.message || "An unexpected error occurred during the scan.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleHistorySelect = (scan: ScanResult) => {
    setScanResult(scan);
    setView('scanner'); // Jump back to scanner view because that's where the action is
  };

  const resetScanner = () => {
    setScanResult(null);
    setCode('');
    setView('scanner'); // Back to the beginning, like nothing happened
  };

  // Render Input Section - the main UI where users paste their questionable code
  const renderScanner = () => {
    if (isScanning) return <ScanLoader />; // Show fancy loading animation
    
    // If we have results, show them instead of the input form
    if (scanResult) return <SecurityReport result={scanResult} onReset={resetScanner} />;

    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Mode Toggles */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setMode('paste')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border transition-all ${mode === 'paste' ? 'bg-cyber-500/20 border-cyber-500 text-white' : 'bg-cyber-800 border-cyber-700 text-slate-400 hover:bg-cyber-700'}`}
          >
            <Code2 className="w-5 h-5" /> Paste Code
          </button>
          <button 
            onClick={() => setMode('file')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border transition-all ${mode === 'file' ? 'bg-cyber-500/20 border-cyber-500 text-white' : 'bg-cyber-800 border-cyber-700 text-slate-400 hover:bg-cyber-700'}`}
          >
            <FileCode className="w-5 h-5" /> Upload File
          </button>
          <button 
            onClick={() => setMode('repo')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border transition-all ${mode === 'repo' ? 'bg-cyber-500/20 border-cyber-500 text-white' : 'bg-cyber-800 border-cyber-700 text-slate-400 hover:bg-cyber-700'}`}
          >
            <Github className="w-5 h-5" /> Scan Repo
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-cyber-800 rounded-xl border border-cyber-700 p-1 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-500 via-purple-500 to-cyber-500 opacity-50"></div>
          
          {mode === 'paste' && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here (JS, TS, Py, Java, C++, Go, Ruby, Sol)..."
              className="w-full h-96 bg-cyber-900/50 text-slate-300 p-6 font-mono text-sm focus:outline-none resize-none placeholder-slate-600 custom-scrollbar"
              spellCheck={false}
            />
          )}

          {mode === 'file' && (
            <div className="h-96 flex flex-col items-center justify-center bg-cyber-900/50 border-2 border-dashed border-cyber-700/50 m-4 rounded-lg">
               <Upload className="w-16 h-16 text-cyber-700 mb-4 group-hover:text-cyber-500 transition-colors" />
               <p className="text-slate-400 mb-4">Drag and drop or select a file</p>
               <p className="text-slate-500 text-xs mb-4">Supports: .js, .ts, .py, .java, .cpp, .sol, .go, .rb</p>
               <input 
                 type="file" 
                 onChange={handleFileUpload}
                 className="hidden" 
                 id="file-upload"
                 accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.sol,.go,.rb" 
               />
               <label 
                 htmlFor="file-upload" 
                 className="px-6 py-2 bg-cyber-700 hover:bg-cyber-600 text-white rounded-lg cursor-pointer transition-colors"
               >
                 Select File
               </label>
               {code && (
                 <div className="mt-4 p-3 bg-cyber-800 rounded flex items-center gap-2">
                   <FileCode className="w-4 h-4 text-cyber-400" />
                   <span className="text-sm text-white">{fileName}</span>
                   <span className="text-xs text-slate-500">({code.length} bytes)</span>
                 </div>
               )}
            </div>
          )}

          {mode === 'repo' && (
             <div className="h-96 flex flex-col items-center justify-center bg-cyber-900/50 p-8 text-center">
                <Github className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl text-white font-bold mb-2">GitHub Repository Scanner</h3>
                <p className="text-slate-400 max-w-md mb-6">
                  Paste a public GitHub repository URL or a direct raw file URL to scan.
                </p>
                <div className="w-full max-w-md flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://github.com/user/repo/blob/main/file.go"
                    className="flex-1 bg-cyber-950 border border-cyber-700 rounded-lg px-4 py-2 text-white focus:border-cyber-500 focus:outline-none"
                    value={fileName.startsWith('http') ? fileName : ''}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>
                <p className="mt-4 text-xs text-amber-500/80">
                  Note: For this demo, please paste raw code content in "Paste Code" mode for best results if CORS blocks the request.
                </p>
             </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Secure & Private • No code is stored</span>
          </div>
          <button 
            onClick={handleScan}
            disabled={!code || isScanning}
            className="px-8 py-3 bg-gradient-to-r from-cyber-500 to-blue-600 hover:from-cyber-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyber-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {isScanning ? 'Scanning...' : (
              <>
                <Zap className="w-5 h-5 fill-current" /> Initialize Scan
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 flex-shrink-0" />
             {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cyber-900 text-slate-200 font-sans selection:bg-cyber-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-cyber-700 bg-cyber-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 text-white font-bold text-xl tracking-tight cursor-pointer"
            onClick={() => setView('scanner')}
          >
            <Shield className="w-8 h-8 text-cyber-500 fill-cyber-500/20" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SecureCode AI</span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-4">
            <button 
              onClick={() => setView('scanner')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'scanner' ? 'text-white bg-cyber-800' : 'text-slate-400 hover:text-white'}`}
            >
              <Search className="w-4 h-4" /> Scanner
            </button>
             <button 
              onClick={() => setView('library')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'library' ? 'text-white bg-cyber-800' : 'text-slate-400 hover:text-white'}`}
            >
              <Book className="w-4 h-4" /> Library
            </button>
            <button 
              onClick={() => setView('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'history' ? 'text-white bg-cyber-800' : 'text-slate-400 hover:text-white'}`}
            >
              <History className="w-4 h-4" /> History
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Only show when in Scanner mode and no result */}
      {view === 'scanner' && !scanResult && !isScanning && (
        <div className="relative pt-16 pb-12 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-cyber-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <h1 className="relative text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Audit Code. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-400 to-purple-400">Fix Vulnerabilities.</span>
          </h1>
          <p className="relative text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Instantly detect OWASP Top 10 flaws, exposed secrets, and insecure patterns.
            <br/><span className="text-cyber-500 text-sm font-bold mt-2 inline-block">Supports JS, TS, Python, Java, C++, Go, Ruby, Solidity</span>
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20 pt-8">
        {view === 'scanner' && renderScanner()}
        {view === 'library' && <SecureExamplesLibrary />}
        {view === 'history' && <ScanHistory onSelectScan={handleHistorySelect} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-800 bg-cyber-950 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; 2024 SecureCode AI. Open Source Security.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <span>Powered by Gemini 3 Pro</span>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </footer>

      {/* System Status Component */}
      <SystemStatus />
    </div>
  );
}

export default App;