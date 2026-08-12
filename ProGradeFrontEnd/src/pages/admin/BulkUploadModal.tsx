import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../features/admin/adminService';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Trigger a data refresh in the parent component
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    
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
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        setResult(null);
        if (!selectedFile.name.endsWith('.xlsx')) {
            setResult({ type: 'error', message: 'Invalid file format. Please upload a standard Microsoft Excel (.xlsx) file.' });
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
            setResult({ type: 'error', message: 'File payload exceeds the strict 5MB barrier limit.' });
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
            setFile(null); // Clear file on success
            setTimeout(() => {
                onSuccess(); // Refresh parent data
            }, 1500);
        } catch (err: any) {
            setResult({ 
                type: 'error', 
                message: err.response?.data?.error || err.message || 'Fatal error during parsing matrix transaction.' 
            });
        } finally {
            setIsUploading(false);
        }
    };

    const closeModal = () => {
        if (isUploading) return;
        setFile(null);
        setResult(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a0d36] rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/50 w-full max-w-lg overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-purple-900/30">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Question Import</h2>
                        <p className="text-xs text-gray-500 mt-1">Upload standard .xlsx templates</p>
                    </div>
                    <button onClick={closeModal} disabled={isUploading} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Result Banner */}
                    {result && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                            result.type === 'success' 
                            ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400' 
                            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                        }`}>
                            {result.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                            <span className="text-sm font-semibold">{result.message}</span>
                        </div>
                    )}

                    {/* File Drop Target Zone */}
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`relative group border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                            isUploading ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800' 
                            : isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0f0a1c] hover:bg-slate-100 dark:hover:bg-purple-900/10 cursor-pointer'
                        }`}
                    >
                        <input 
                            type="file" 
                            accept=".xlsx" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            disabled={isUploading}
                        />

                        {file ? (
                            <>
                                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                                    <FileSpreadsheet className="w-8 h-8" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs">{file.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                {!isUploading && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                                        className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Remove File
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white dark:bg-[#1a0d36] rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Click or drag spreadsheet here</h3>
                                <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
                                    Must strictly match the parsing matrix layout. Maximum payload size 5MB (.xlsx).
                                </p>
                            </>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            onClick={closeModal} 
                            disabled={isUploading}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading Data...</>
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