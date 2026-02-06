import React, { useState } from 'react';
import { secureExamples } from '../data/secureExamples';
import { Book, Code, Shield } from 'lucide-react';

const SecureExamplesLibrary: React.FC = () => {
  const [activeLang, setActiveLang] = useState<string>('All');
  
  // Extract unique languages dynamically so I don't have to update this when adding examples
  const languages = ['All', ...Array.from(new Set(secureExamples.map(e => e.language)))];
  
  // Filter by language or show everything
  const filteredExamples = activeLang === 'All' 
    ? secureExamples 
    : secureExamples.filter(e => e.language === activeLang);

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3 justify-center md:justify-start">
          <Book className="w-8 h-8 text-cyber-accent" />
          Secure Code Library
        </h2>
        <p className="text-slate-400 mt-2">
          A collection of secure coding patterns and anti-patterns for common vulnerabilities.
        </p>
      </div>

      {/* Language Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {languages.map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeLang === lang 
                ? 'bg-cyber-500 text-white shadow-lg shadow-cyber-500/25' 
                : 'bg-cyber-800 text-slate-400 hover:bg-cyber-700 hover:text-white'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExamples.map(example => (
          <div key={example.id} className="bg-cyber-800 border border-cyber-700 rounded-xl overflow-hidden shadow-xl hover:border-cyber-500/50 transition-colors">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <span className="text-xs font-bold text-cyber-500 uppercase tracking-wider">{example.language} • {example.category}</span>
                   <h3 className="text-xl font-bold text-white mt-1">{example.title}</h3>
                </div>
                <Shield className="w-5 h-5 text-cyber-accent" />
              </div>
              
              <p className="text-sm text-slate-400 mb-6">{example.description}</p>
              
              <div className="relative">
                <div className="absolute top-0 right-0 px-2 py-1 bg-cyber-900/80 rounded-bl text-xs text-slate-500 font-mono">
                  Example
                </div>
                <pre className="p-4 bg-cyber-950 rounded-lg overflow-x-auto border border-cyber-700/50 text-sm font-mono custom-scrollbar">
                  <code className="text-slate-300">{example.code}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecureExamplesLibrary;