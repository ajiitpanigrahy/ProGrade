// CodeSnippetBox.tsx
import { useEffect } from 'react';
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

interface CodeSnippetBoxProps {
    code: string;
    language?: string;
}

export default function CodeSnippetBox({ code, language = 'java' }: CodeSnippetBoxProps) {
    const normalizedLang = (language || 'java').toLowerCase()
        .replace('c++', 'cpp')
        .replace('js', 'javascript')
        .replace('ts', 'typescript')
        .replace('py', 'python');

    useEffect(() => {
        Prism.highlightAll();
    }, [code, normalizedLang]);

    const lines = code.trim().split('\n');

    return (
        <div className="relative my-4 rounded-2xl overflow-hidden border border-purple-900/40 dark:border-purple-900/60 bg-[#0c0618] shadow-sm text-left">
            
            {/* 🌟 Top Window Header Bar - Ultra Clean Mac OS Style */}
            <div className="flex items-center px-4 py-2.5 bg-[#160b2e]/90 border-b border-purple-900/40 backdrop-blur-md select-none">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-inner"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-inner"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-inner"></div>
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