import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { adminService } from '../../../../features/admin/adminService';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Terminal, AlertTriangle, X } from 'lucide-react';
import CodeSnippetBox from '../../../../components/CodeSnippetBox';

// (Legacy text rendering kept exactly the same...)
const renderQuestionContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
            return (
                <div key={index} className="my-3 bg-[#0d0714] border border-purple-900/50 rounded-xl overflow-hidden shadow-inner">
                    <div className="bg-[#150a29] px-3 py-1.5 flex items-center gap-2 border-b border-purple-900/50">
                        <Terminal className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Legacy Code</span>
                    </div>
                    <pre className="p-4 text-[13px] text-green-400 font-mono overflow-x-auto leading-relaxed custom-scrollbar"><code>{code}</code></pre>
                </div>
            );
        }
        return <span key={index} className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{part}</span>;
    });
};

interface QuestionGridProps {
    technology: string;
    techData: any;
    refreshTrigger: number;
    onEdit: (question: any) => void; // 🌟 NEW: Accept Edit Handler
}

export default function QuestionGrid({ technology, techData, refreshTrigger, onEdit }: QuestionGridProps) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    
    // 🌟 CUSTOM DELETE MODAL STATES
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

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

    useEffect(() => {
        const timer = setTimeout(() => fetchQuestions(0, search), 400);
        return () => clearTimeout(timer);
    }, [technology, search, refreshTrigger]);

    // 🌟 CUSTOM DELETE HANDLERS
    const triggerDelete = (id: number) => {
        setQuestionToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!questionToDelete) return;
        try {
            await adminService.deleteQuestion(questionToDelete);
            setDeleteModalOpen(false);
            setQuestionToDelete(null);
            fetchQuestions(page, search); // Refresh
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 w-full pb-10">
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
            <div className="bg-white dark:bg-[#1a0d36] border border-gray-100 dark:border-purple-900/40 rounded-2xl shadow-sm overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left text-sm table-fixed min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-purple-900/30">
                            <tr>
                                <th className="py-4 px-6 w-20">ID</th>
                                <th className="py-4 px-6 w-40">Topic Tag</th>
                                <th className="py-4 px-6 w-24">Level</th>
                                <th className="py-4 px-6 w-full">Asset Body</th>
                                <th className="py-4 px-6 w-28 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/20">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-bold animate-pulse">Loading records...</td></tr>
                            ) : questions.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500 font-bold">No matching questions found in database.</td></tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                        <td className="py-4 px-6 font-mono text-gray-400 font-bold">#{q.id}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-block bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-200 dark:border-purple-800/50 truncate max-w-[120px]">
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
                                        <td className="py-4 px-6 max-w-[300px] lg:max-w-[500px]">
                                            <div className="font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
                                                {q.questionText}
                                            </div>
                                            {q.codeSnippet ? (
                                                <div className="mb-4">
                                                    <CodeSnippetBox code={q.codeSnippet} language={q.codeLanguage || q.technology} />
                                                </div>
                                            ) : (
                                                <div className="mb-4">{renderQuestionContent(q.questionText)}</div>
                                            )}

                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 opacity-70 hover:opacity-100 transition-opacity">
                                                <div className={`truncate ${q.correctOption === 'A' ? 'text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded' : 'px-2 py-1'}`}>A: {q.optionA}</div>
                                                <div className={`truncate ${q.correctOption === 'B' ? 'text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded' : 'px-2 py-1'}`}>B: {q.optionB}</div>
                                                <div className={`truncate ${q.correctOption === 'C' ? 'text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded' : 'px-2 py-1'}`}>C: {q.optionC}</div>
                                                <div className={`truncate ${q.correctOption === 'D' ? 'text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded' : 'px-2 py-1'}`}>D: {q.optionD}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right align-top">
                                            <div className="flex justify-end gap-2">
                                                {/* 🌟 WIRE UP EDIT AND DELETE */}
                                                <button title="Edit" onClick={() => onEdit(q)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"><Edit className="w-4 h-4" /></button>
                                                <button title="Delete" onClick={() => triggerDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-purple-900/30 bg-gray-50 dark:bg-[#150a29]">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Page <span className="font-bold text-gray-900 dark:text-white">{page + 1}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => fetchQuestions(page - 1, search)} disabled={page === 0} className="p-1.5 rounded-lg border border-gray-200 dark:border-purple-900/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a0d36] disabled:opacity-50 transition-all cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => fetchQuestions(page + 1, search)} disabled={page === totalPages - 1} className="p-1.5 rounded-lg border border-gray-200 dark:border-purple-900/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1a0d36] disabled:opacity-50 transition-all cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* 🌟 CUSTOM DELETE CONFIRMATION MODAL (PORTAL) */}
            {deleteModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-[#150a29] rounded-3xl shadow-2xl border border-gray-200 dark:border-purple-900/50 w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-8 relative">
                        <button onClick={() => setDeleteModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-full transition-colors cursor-pointer"><X className="w-4 h-4"/></button>
                        
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 shadow-inner border-2 border-red-200 dark:border-red-800/50">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Question?</h3>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            You are about to permanently delete <span className="text-purple-600 dark:text-purple-400 font-mono">Asset #{questionToDelete}</span> from the Question Bank. This action cannot be undone.
                        </p>
                        
                        <div className="flex w-full gap-3">
                            <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-colors cursor-pointer active:scale-95">
                                Delete Asset
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}