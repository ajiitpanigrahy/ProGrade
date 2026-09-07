import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, AlertCircle, CheckCircle2, Info, Code2, Loader2, File as FileIcon } from 'lucide-react';
import { adminService } from '../../features/admin/adminService';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data?: any) => void; 
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    
    // Execution log for multiple files
    const [results, setResults] = useState<{ name: string, type: 'success' | 'error', text: string }[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFiles([]);
            setResults([]);
            setIsUploading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- DRAG AND DROP HANDLERS ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFiles(Array.from(e.target.files));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- STRICT VALIDATION ---
    const validateAndSetFiles = (selectedFiles: File[]) => {
        setResults([]); 
        
        const validFiles: File[] = [];
        const errorLogs: { name: string, type: 'error', text: string }[] = [];

        selectedFiles.forEach(file => {
            if (!file.name.endsWith('.xlsx')) {
                errorLogs.push({ name: file.name, type: 'error', text: 'Invalid format. Microsoft Excel (.xlsx) required.' });
            } else if (file.size > 5 * 1024 * 1024) { 
                errorLogs.push({ name: file.name, type: 'error', text: 'File payload exceeds the strict 5MB limit.' });
            } else {
                if (!files.some(f => f.name === file.name && f.size === file.size)) {
                    validFiles.push(file);
                }
            }
        });

        if (errorLogs.length > 0) {
            setResults(prev => [...prev, ...errorLogs]);
        }
        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    // --- SEQUENTIAL UPLOAD PROCESSING ---
    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);
        setResults([]);

        let anySuccess = false;
        let totalProcessed = 0;
        const uploadLogs: { name: string, type: 'success' | 'error', text: string }[] = [];

        for (const file of files) {
            try {
                // 🌟 Using the correct API for Question Banks
                const res = await adminService.uploadBulkQuestions(file);
                uploadLogs.push({ name: file.name, type: 'success', text: `🟢 ${res.message || "Matrix imported successfully!"}` });
                anySuccess = true;
                totalProcessed++;
            } catch (err: any) {
                uploadLogs.push({ name: file.name, type: 'error', text: err.response?.data?.error || err.message || "Fatal error during parsing matrix transaction." });
            }
            setResults([...uploadLogs]);
        }
        
        if (uploadLogs.every(log => log.type === 'success')) {
            setFiles([]);
        }

        setIsUploading(false);
        
        if (anySuccess) {
            // Tells the QuestionBankTab to refresh the UI
            setTimeout(() => onSuccess({ count: totalProcessed, message: `Successfully imported data from ${totalProcessed} file(s).` }), 1500);
        }
    };

    const closeModal = () => {
        if (isUploading) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white/90 dark:bg-[#150a29]/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-2 border-white/20 dark:border-purple-900/50 w-full max-w-2xl overflow-hidden relative">
                
                {/* 3D Glowing Orb */}
                <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-[80px] -top-20 -right-20 pointer-events-none z-0"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 dark:border-purple-900/30 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Bulk Import Bank
                        </h2>
                        <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Supports multiple .xlsx payloads simultaneously</p>
                    </div>
                    <button onClick={closeModal} disabled={isUploading} className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors disabled:opacity-50 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 sm:p-8 relative z-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Instructions Toggle */}
                    <div className="mb-6">
                        <button onClick={() => setShowInstructions(!showInstructions)} className="flex items-center gap-2 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider hover:text-purple-700 cursor-pointer transition-colors">
                            <Info className="w-4 h-4" /> {showInstructions ? 'Hide Format Guide' : 'View Excel Format Guide'}
                        </button>
                        
                        {showInstructions && (
                            <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl animate-in slide-in-from-top-2">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                                    Our AI parser supports both legacy 9-column and new 11-column Developer formats. Use <kbd className="bg-gray-200 dark:bg-black px-1 rounded border border-gray-300 dark:border-gray-700 shadow-sm font-mono text-[10px]">Alt+Enter</kbd> in Excel to write multi-line code.
                                </p>
                                <div className="overflow-x-auto custom-scrollbar pb-2">
                                    <div className="flex gap-1.5 min-w-max text-[10px] font-mono font-bold">
                                        {['Technology', 'Difficulty', 'Question Text', 'Code Snippet (Opt)', 'Language (Opt)', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Option', 'Topic'].map((col, i) => (
                                            <div key={i} className={`px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm ${i === 3 || i === 4 ? 'ring-1 ring-purple-400 dark:ring-purple-600 bg-purple-50 dark:bg-purple-900/10' : ''}`}>{col}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* File Drop Target Zone */}
                    <div 
                        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`relative group border-2 border-dashed rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all ${
                            isUploading ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900' 
                            : isDragging ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-[0_0_30px_rgba(147,51,234,0.2)]' 
                            : 'border-gray-300 dark:border-purple-900/50 bg-gray-50/50 dark:bg-[#0f0a1c]/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 hover:border-purple-400 cursor-pointer shadow-inner'
                        }`}
                    >
                        <input type="file" accept=".xlsx" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} disabled={isUploading} />

                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-[#1a0d36] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl border-4 border-gray-50 dark:border-[#0f0a1c] text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">Click to browse or drag matrices here</h3>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 mt-2 max-w-xs leading-relaxed uppercase tracking-wider">
                            Accepts .xlsx payload • Max 5MB per file • Multiple files supported
                        </p>
                    </div>

                    {/* Selected Files Queue */}
                    {files.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Staged Payloads ({files.length})</h4>
                            <div className="flex flex-wrap gap-3">
                                {files.map((f, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 px-3 py-2 rounded-xl text-xs font-bold shadow-sm animate-in zoom-in">
                                        <FileIcon className="w-4 h-4 shrink-0" />
                                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{f.name}</span>
                                        <span className="opacity-50 mx-1">|</span>
                                        <span className="opacity-70 font-mono text-[10px]">{(f.size / 1024).toFixed(0)}kb</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                            disabled={isUploading}
                                            className="ml-2 p-1 bg-purple-100 dark:bg-purple-900/40 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Results Log */}
                    {results.length > 0 && (
                        <div className="mt-6 flex flex-col gap-2 bg-gray-50 dark:bg-[#0f0a1c] p-4 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-inner">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Execution Log</h4>
                            {results.map((res, idx) => (
                                <div key={idx} className={`flex items-start gap-3 text-xs font-bold p-3 rounded-xl border ${res.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/50'} animate-in slide-in-from-left-2`}>
                                    {res.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <span className="font-mono bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded text-[10px] truncate max-w-[150px] border border-inherit">{res.name}</span>
                                        <span className="leading-relaxed">{res.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-8 flex justify-end gap-3 border-t-2 border-gray-100 dark:border-purple-900/30 pt-6">
                        {files.length > 0 && !isUploading && (
                            <button onClick={() => setFiles([])} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer border border-red-200 dark:border-red-900/50">
                                Clear Queue
                            </button>
                        )}
                        <button 
                            onClick={handleUpload} 
                            disabled={files.length === 0 || isUploading}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_10px_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer active:scale-95 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1"
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin"/> Processing Matrix...</>
                            ) : (
                                `Initialize Import (${files.length})`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}