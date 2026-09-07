import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Load language components for Prism
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

import { Copy, Check, Terminal } from 'lucide-react';

interface CodeSnippetBoxProps {
    code: string;
    language?: string;
    filename?: string;
}

export default function CodeSnippetBox({ code, language = 'java', filename }: CodeSnippetBoxProps) {
    const [copied, setCopied] = useState(false);

    const normalizedLang = (language || 'java').toLowerCase()
        .replace('c++', 'cpp')
        .replace('js', 'javascript')
        .replace('ts', 'typescript')
        .replace('py', 'python');

    useEffect(() => {
        Prism.highlightAll();
    }, [code, normalizedLang]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.trim().split('\n');

    return (
        <div className="relative my-4 rounded-2xl overflow-hidden border-2 border-purple-900/40 dark:border-purple-900/60 bg-[#0c0618] shadow-[0_15px_35px_rgba(0,0,0,0.45)] text-left group">
            
            {/* 🌟 Top Window Header Bar (Mac / IDE Window Style) */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#160b2e]/90 border-b border-purple-900/40 backdrop-blur-md select-none">
                <div className="flex items-center gap-3">
                    {/* Window Controls */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/50 shadow-inner"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50 shadow-inner"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50 shadow-inner"></div>
                    </div>
                    
                    {/* Filename or Language indicator */}
                    <div className="flex items-center gap-1.5 ml-2 text-xs font-mono font-bold text-gray-400">
                        <Terminal className="w-3.5 h-3.5 text-purple-400" />
                        <span>{filename || `Snippet.${normalizedLang === 'cpp' ? 'cpp' : normalizedLang === 'python' ? 'py' : normalizedLang}`}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Badge */}
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50">
                        {normalizedLang}
                    </span>

                    {/* Copy Code Button */}
                    <button 
                        onClick={handleCopy}
                        title="Copy code snippet"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-900/30 hover:bg-purple-800/50 text-gray-300 hover:text-white border border-purple-700/40 transition-all active:scale-95 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400 font-bold">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                                <span className="text-[10px]">Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 🌟 Code Container with Line Numbers */}
            <div className="flex overflow-x-auto custom-scrollbar text-xs sm:text-sm font-mono leading-relaxed p-4 bg-gradient-to-b from-[#0e071e] to-[#080312]">
                
                {/* Line Numbers Gutter */}
                <div className="select-none text-right pr-4 border-r border-purple-950/80 text-gray-600 font-bold shrink-0">
                    {lines.map((_, index) => (
                        <div key={index} className="leading-relaxed">
                            {index + 1}
                        </div>
                    ))}
                </div>

                {/* Highlighted Code Block */}
                <div className="pl-4 flex-1">
                    <pre className="!bg-transparent !p-0 !m-0 !overflow-visible">
                        <code className={`language-${normalizedLang} !text-gray-100 !text-xs sm:!text-sm leading-relaxed whitespace-pre font-mono`}>
                            {code.trim()}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
}