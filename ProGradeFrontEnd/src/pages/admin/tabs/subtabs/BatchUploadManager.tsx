import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { adminService } from '../../../../features/admin/adminService';

// 🌟 Added onSuccess prop to trigger the parent to refresh
interface Props {
    onSuccess?: () => void;
}

export default function BatchUploadManager({ onSuccess }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await adminService.uploadBatchRoster(file);
            setMessage({ text: res.message || "Roster uploaded successfully!", type: 'success' });
            setFile(null);
            
            // 🌟 Tells StudentHubTab to immediately reload the table data!
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setMessage({ text: err.response?.data?.error || "Failed to process Excel file.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a0d36] rounded-2xl border border-gray-200 dark:border-purple-900/30 p-6 shadow-sm mb-6 animate-in fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Operational Batch Roster Upload
            </h3>
            {/* 🌟 Updated instructions to reflect the 4 columns and auto-creation */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Upload an Excel file (.xlsx) with 4 columns: <strong>ID | Name | Email | Batch Name</strong>. The system will automatically create missing student accounts (Default Password: <strong>Student@123</strong>) and assign them to their batch.
            </p>

            <div className="border-2 border-dashed border-gray-300 dark:border-purple-900/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer relative">
                <input 
                    type="file" accept=".xlsx, .xls" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-purple-500 mb-3" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {file ? file.name : "Click or Drag Excel File Here"}
                </span>
                <span className="text-xs text-gray-500 mt-1">.xlsx format only</span>
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                    {message.text}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleUpload} disabled={!file || loading}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : "Sync Roster Database"}
                </button>
            </div>
        </div>
    );
}