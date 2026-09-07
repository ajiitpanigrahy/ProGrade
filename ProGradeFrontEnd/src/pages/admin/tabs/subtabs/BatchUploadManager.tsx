import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X, File } from 'lucide-react';
import { adminService } from '../../../../features/admin/adminService';

interface Props {
    onSuccess?: () => void;
}

export default function BatchUploadManager({ onSuccess }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Track the upload status of each individual file
    const [results, setResults] = useState<{ name: string, type: 'success' | 'error', text: string }[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Append new files to the existing selection
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            setResults([]); // Clear previous results when adding new files
        }
        // Reset input so the same file can be selected again if needed
        e.target.value = '';
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setResults([]);

        let anySuccess = false;
        const uploadLogs: { name: string, type: 'success' | 'error', text: string }[] = [];

        // 🌟 PROCESS SEQUENTIALLY: Prevents backend Out-Of-Memory (OOM) crashes on free tiers
        for (const file of files) {
            try {
                // NOTE: If adapting this for questions, change this to adminService.uploadQuestions(file)
                const res = await adminService.uploadBatchRoster(file);
                uploadLogs.push({ name: file.name, type: 'success', text: res.message || "Uploaded successfully!" });
                anySuccess = true;
            } catch (err: any) {
                uploadLogs.push({ name: file.name, type: 'error', text: err.response?.data?.error || "Failed to process Excel file." });
            }
        }

        setResults(uploadLogs);
        
        // Clear the queue only if ALL files succeeded
        if (uploadLogs.every(log => log.type === 'success')) {
            setFiles([]);
        }

        setLoading(false);
        
        // Reload the table data if at least one file made it into the database
        if (anySuccess && onSuccess) {
            onSuccess();
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a0d36] rounded-2xl border border-gray-200 dark:border-purple-900/30 p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Operational Batch Roster Upload
            </h3>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Upload multiple Excel files (.xlsx) with 4 columns: <strong>ID | Name | Email | Batch Name</strong>. The system will queue them and automatically create missing student accounts (Default Password: <strong>Student@123</strong>).
            </p>

            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-purple-900/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer relative">
                {/* 🌟 ADDED 'multiple' ATTRIBUTE */}
                <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <UploadCloud className="w-10 h-10 text-purple-500 mb-3" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Click or Drag Excel Files Here
                </span>
                <span className="text-xs text-gray-500 mt-1">.xlsx format only • Multiple files supported</span>
            </div>

            {/* Selected Files Queue */}
            {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {files.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                            <File className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{f.name}</span>
                            <button 
                                onClick={() => removeFile(idx)}
                                disabled={loading}
                                className="ml-1 text-purple-400 hover:text-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Results Log */}
            {results.length > 0 && (
                <div className="mt-6 flex flex-col gap-2 bg-gray-50 dark:bg-[#0f0a1c] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">Execution Log</h4>
                    {results.map((res, idx) => (
                        <div key={idx} className={`flex items-start gap-2 text-xs font-bold p-2 rounded-lg ${res.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400'}`}>
                            {res.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5"/> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>}
                            <div>
                                <span className="underline decoration-dotted opacity-80 mr-2">{res.name}</span>
                                <span>{res.text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleUpload} 
                    disabled={files.length === 0 || loading}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing Queue...</> : `Sync ${files.length > 0 ? files.length : ''} Files to Database`}
                </button>
            </div>
        </div>
    );
}