import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileSpreadsheet, AlertCircle, CheckCircle2, Info, Code2, Download, Loader2 } from 'lucide-react';
import { adminService } from '../../features/admin/adminService';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; 
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) validateAndSetFile(e.target.files[0]);
    };

    const validateAndSetFile = (selectedFile: File) => {
        setResult(null);
        if (!selectedFile.name.endsWith('.xlsx')) {
            setResult({ type: 'error', message: 'Invalid format. Please upload a Microsoft Excel (.xlsx) file.' });
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) { 
            setResult({ type: 'error', message: 'File payload exceeds the strict 5MB limit.' });
            return;
        }
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setResult(null);

        try {
            const res = await adminService.uploadBulkQuestions(file);
            setResult({ type: 'success', message: `🟢 ${res.message}` });
            setFile(null); 
            setTimeout(() => onSuccess(), 1500);
        } catch (err: any) {
            setResult({ type: 'error', message: err.response?.data?.error || err.message || 'Fatal error during parsing matrix transaction.' });
        } finally {
            setIsUploading(false);
        }
    };

    const closeModal = () => {
        if (isUploading) return;
        setFile(null); setResult(null); setShowInstructions(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white/90 dark:bg-[#150a29]/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-2 border-white/20 dark:border-purple-900/50 w-full max-w-2xl overflow-hidden relative">
                
                {/* 3D Glowing Orb */}
                <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-[80px] -top-20 -right-20 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 dark:border-purple-900/30 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Bulk Import Bank
                        </h2>
                        <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Supports Standard & Coding MCQs</p>
                    </div>
                    <button onClick={closeModal} disabled={isUploading} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors disabled:opacity-50 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 sm:p-8 relative z-10">
                    
                    {/* Instructions Toggle */}
                    <div className="mb-6">
                        <button onClick={() => setShowInstructions(!showInstructions)} className="flex items-center gap-2 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider hover:text-purple-700 cursor-pointer transition-colors">
                            <Info className="w-4 h-4" /> {showInstructions ? 'Hide Format Guide' : 'View Excel Format Guide'}
                        </button>
                        
                        {showInstructions && (
                            <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl animate-in slide-in-from-top-2">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                                    Our AI parser supports both legacy 9-column and new 11-column Developer formats. Use <kbd className="bg-gray-200 dark:bg-black px-1 rounded">Alt+Enter</kbd> in Excel to write multi-line code.
                                </p>
                                <div className="overflow-x-auto custom-scrollbar pb-2">
                                    <div className="flex gap-1 min-w-max text-[10px] font-mono font-bold">
                                        {['Technology', 'Difficulty', 'Question Text', 'Code Snippet (Opt)', 'Language (Opt)', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct', 'Topic'].map((col, i) => (
                                            <div key={i} className={`px-2 py-1 rounded bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 ${i === 3 || i === 4 ? 'ring-1 ring-purple-400 dark:ring-purple-600' : ''}`}>{col}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Result Banner */}
                    {result && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border-2 shadow-sm ${result.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
                            {result.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                            <span className="text-sm font-bold leading-relaxed">{result.message}</span>
                        </div>
                    )}

                    {/* File Drop Target Zone */}
                    <div 
                        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`relative group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                            isUploading ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900' 
                            : isDragging ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-[0_0_30px_rgba(147,51,234,0.2)]' 
                            : 'border-gray-300 dark:border-purple-900/50 bg-gray-50/50 dark:bg-[#0f0a1c]/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 hover:border-purple-400 cursor-pointer shadow-inner'
                        }`}
                    >
                        <input type="file" accept=".xlsx" className="hidden" ref={fileInputRef} onChange={handleFileSelect} disabled={isUploading} />

                        {file ? (
                            <div className="animate-in zoom-in-95">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-purple-500/30">
                                    <FileSpreadsheet className="w-10 h-10" />
                                </div>
                                <h3 className="text-base font-black text-gray-900 dark:text-white truncate max-w-xs">{file.name}</h3>
                                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                                {!isUploading && (
                                    <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }} className="mt-4 px-4 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs font-black text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                                        Remove Matrix
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white dark:bg-[#1a0d36] rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-gray-50 dark:border-[#0f0a1c] text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">Click to browse or drag file here</h3>
                                <p className="text-xs font-bold text-gray-500 mt-2 max-w-xs leading-relaxed uppercase tracking-wider">
                                    Accepts .xlsx payload • Max 5MB
                                </p>
                            </>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-8 flex justify-end gap-3 border-t-2 border-gray-100 dark:border-purple-900/30 pt-6">
                        <button onClick={closeModal} disabled={isUploading} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={handleUpload} disabled={!file || isUploading} className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_10px_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer active:scale-95">
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing Matrix...</>
                            ) : (
                                'Initialize Import'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}