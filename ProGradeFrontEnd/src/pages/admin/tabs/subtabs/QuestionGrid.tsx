import React, { useEffect, useState } from 'react';
import { adminService } from '../../../../features/admin/adminService';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';

// Custom Markdown Renderer for Syntax Blocks (```java ... ```)
const renderQuestionContent = (text: string) => {
    // Regex splits text by code fences
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
            return (
                <div key={index} className="my-3 bg-[#0d0714] border border-purple-900/50 rounded-xl overflow-hidden shadow-inner">
                    <div className="bg-[#150a29] px-3 py-1.5 flex items-center gap-2 border-b border-purple-900/50">
                        <Terminal className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Code Snippet</span>
                    </div>
                    <pre className="p-4 text-[13px] text-green-400 font-mono overflow-x-auto leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            );
        }
        return <span key={index} className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{part}</span>;
    });
};

export default function QuestionGrid({ technology, techData, refreshTrigger }: { technology: string, techData: any, refreshTrigger: number }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchQuestions = async (pageNumber: number, searchTerm: string) => {
        setLoading(true);
        try {
            const res = await adminService.getQuestionsByTech(technology, pageNumber, searchTerm);
            setQuestions(res.content);
            setTotalPages(res.totalPages);
            setPage(res.number);
        } catch (error) {
            console.error("Failed to load questions", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuestions(0, search);
        }, 400);
        return () => clearTimeout(timer);
    }, [technology, search, refreshTrigger]);

    // Handle Delete
    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to permanently delete this question?")) {
            await adminService.deleteQuestion(id);
            fetchQuestions(page, search);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            {/* Search Control */}
            <div className="flex items-center bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 shadow-sm max-w-md focus-within:ring-2 focus-within:ring-purple-600 transition-all">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={`Search ${techData.name} topics or keywords...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent border-none outline-none pl-3 text-sm text-gray-900 dark:text-white"
                />
            </div>

            {/* Data Grid Table */}
            <div className="bg-white dark:bg-[#1a0d36] border border-gray-100 dark:border-purple-900/40 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-purple-900/30">
                            <tr>
                                <th className="py-4 px-6 w-16">ID</th>
                                <th className="py-4 px-6 w-48">Topic Tag</th>
                                <th className="py-4 px-6 w-24">Level</th>
                                <th className="py-4 px-6">Asset Body</th>
                                <th className="py-4 px-6 w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/20">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Loading records...</td></tr>
                            ) : questions.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No matching questions found in database.</td></tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                        <td className="py-4 px-6 font-mono text-gray-400">#{q.id}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-block bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-200 dark:border-purple-800/50">
                                                {q.topic || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${
                                                q.difficultyLevel === 'EASY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                q.difficultyLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}>
                                                {q.difficultyLevel}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {renderQuestionContent(q.questionText)}
                                            
                                            {/* Minimal Options Drawer */}
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 opacity-60 hover:opacity-100 transition-opacity">
                                                <div className={q.correctOption === 'A' ? 'text-green-500 font-bold' : ''}>A: {q.optionA}</div>
                                                <div className={q.correctOption === 'B' ? 'text-green-500 font-bold' : ''}>B: {q.optionB}</div>
                                                <div className={q.correctOption === 'C' ? 'text-green-500 font-bold' : ''}>C: {q.optionC}</div>
                                                <div className={q.correctOption === 'D' ? 'text-green-500 font-bold' : ''}>D: {q.optionD}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-purple-900/30 bg-gray-50 dark:bg-[#150a29]">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Page <span className="font-bold">{page + 1}</span> of <span className="font-bold">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => fetchQuestions(page - 1, search)}
                                disabled={page === 0}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-purple-900/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a0d36] disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => fetchQuestions(page + 1, search)}
                                disabled={page === totalPages - 1}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-purple-900/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a0d36] disabled:opacity-50 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}