import React, { useState } from 'react';
import { ShieldAlert, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { reportService } from '../../features/shared/reportService'; 

export default function ReportSubmissionForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // 🌟 ANIMATED 3D INPUT CLASS 
    const input3DClass = "w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-transparent focus:border-purple-500 focus:ring-4 ring-purple-500/10 rounded-xl px-4 py-3 sm:py-3.5 outline-none dark:text-white text-sm font-semibold shadow-inner transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-800";

    const initialFormState = {
        category: 'System Bug or Glitch',
        severity: 'Low - Minor inconvenience',
        featureName: '',
        pageUrl: window.location.pathname,
        title: '',
        description: '',
        suggestions: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleReset = () => {
        setFormData(initialFormState);
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsSubmitting(true);

        try {
            // 🌟 THE FIX: Data Transformer
            // Map the UI-friendly dropdown strings to your strict Backend Enums
            let backendType = 'OTHER';
            if (formData.category === 'System Bug or Glitch') backendType = 'BUG_REPORT';
            if (formData.category === 'Feature Request') backendType = 'FEATURE_REQUEST';
            if (formData.category === 'Account / Access Issue') backendType = 'USER_BEHAVIOR';
            if (formData.category === 'Assessment Dispute') backendType = 'OTHER';

            let backendSeverity = 'LOW';
            if (formData.severity.includes('Medium')) backendSeverity = 'MEDIUM';
            if (formData.severity.includes('High')) backendSeverity = 'HIGH';
            if (formData.severity.includes('Critical')) backendSeverity = 'IMMEDIATE';

            // 🌟 Build the EXACT payload your ReportRequestDTO expects!
            const payload = {
                type: backendType,
                severity: backendSeverity,
                cause: formData.title, // Backend expects 'cause', UI uses 'title'
                description: formData.description,
                featureName: formData.featureName,
                pageUrl: formData.pageUrl,
                suggestions: formData.suggestions,
                targetUserEmail: "" // Empty for bug reports
            };

            // Submit the strictly formatted payload
            await reportService.submitReport(payload);
            
            setSuccess(true);
            setFormData(initialFormState);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-purple-900/30 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-emerald-200 dark:border-emerald-800">
                    <ShieldAlert className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Report Submitted Successfully</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">Thank you for your report. Our engineering team has been notified and will review this shortly.</p>
                <button onClick={() => setSuccess(false)} className="px-8 py-4 bg-gray-100 dark:bg-[#0f0a1c] hover:bg-gray-200 dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-sm">
                    File Another Report
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-purple-900/30 overflow-hidden relative transition-all duration-500">
            
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-purple-900/30 bg-gray-50/50 dark:bg-[#0f0a1c]/50">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Submit Official Report</h3>
                </div>
                <p className="text-xs font-bold text-gray-500 mt-1 sm:ml-9">Help us maintain a secure, high-performance environment.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                
                {error && (
                    <div className="p-4 bg-red-50 text-red-500 dark:bg-red-900/10 rounded-xl font-bold flex items-center gap-3 text-sm border border-red-200 dark:border-red-900/50 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 group transition-all duration-300 focus-within:-translate-y-1">
                        <label htmlFor="category" className="cursor-pointer text-[10px] sm:text-xs font-black text-gray-500 group-focus-within:text-purple-500 transition-colors uppercase tracking-widest inline-block">
                            Category
                        </label>
                        <select id="category" value={formData.category} onChange={e => updateField('category', e.target.value)} className={`${input3DClass} cursor-pointer appearance-none`}>
                            <option value="System Bug or Glitch">System Bug or Glitch</option>
                            <option value="Feature Request">Feature Request</option>
                            <option value="Account / Access Issue">Account / Access Issue</option>
                            <option value="Assessment Dispute">Assessment Dispute</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2 group transition-all duration-300 focus-within:-translate-y-1">
                        <label htmlFor="severity" className="cursor-pointer text-[10px] sm:text-xs font-black text-gray-500 group-focus-within:text-purple-500 transition-colors uppercase tracking-widest inline-block">
                            Severity Level
                        </label>
                        <select id="severity" value={formData.severity} onChange={e => updateField('severity', e.target.value)} className={`${input3DClass} cursor-pointer appearance-none`}>
                            <option value="Low - Minor inconvenience">Low - Minor inconvenience</option>
                            <option value="Medium - Hinders normal workflow">Medium - Hinders normal workflow</option>
                            <option value="High - Blocks core functionality">High - Blocks core functionality</option>
                            <option value="Critical - System down / Data loss">Critical - System down / Data loss</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 group transition-all duration-300 focus-within:-translate-y-1">
                        <label htmlFor="featureName" className="cursor-pointer text-[10px] sm:text-xs font-black text-gray-500 group-focus-within:text-purple-500 transition-colors uppercase tracking-widest inline-block">Feature Name</label>
                        <input id="featureName" required type="text" value={formData.featureName} onChange={e => updateField('featureName', e.target.value)} placeholder="e.g., Live Exam Portal" className={`${input3DClass} cursor-text`} />
                    </div>
                    <div className="space-y-2 group transition-all duration-300 focus-within:-translate-y-1">
                        <label htmlFor="pageUrl" className="cursor-pointer text-[10px] sm:text-xs font-black text-gray-500 group-focus-within:text-purple-500 transition-colors uppercase tracking-widest inline-block">Page URL Location</label>
                        <input id="pageUrl" required type="text" value={formData.pageUrl} onChange={e => updateField('pageUrl', e.target.value)} placeholder="e.g., /student/dashboard" className={`${input3DClass} cursor-text`} />
                    </div>
                </div>

                <div className="space-y-2 group transition-all duration-300 focus-within:-translate-y-1">
                    <label htmlFor="title" className="cursor-pointer text-[10px] sm:text-xs font-black text-gray-500 group-focus-within:text-purple-500 transition-colors uppercase tracking-widest inline-block">Root Cause / Title</label>
                    <input id="title" required type="text" value={formData.title} onChange={e => updateField('title', e.target.value)} placeholder="Brief summary of the issue" className={`${input3DClass} cursor-text`} />
                </div>

                <div className="space-y-2 group transition-all duration-300 focus-within:-translate-y-1">
                    <label htmlFor="description" className="cursor-pointer text-[10px] sm:text-xs font-black text-gray-500 group-focus-within:text-purple-500 transition-colors uppercase tracking-widest inline-block">Detailed Description</label>
                    <textarea id="description" required rows={4} value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Please provide as much context as possible..." className={`${input3DClass} cursor-text resize-none custom-scrollbar`} />
                </div>

                <div className="space-y-2 group transition-all duration-300 focus-within:-translate-y-1">
                    <label htmlFor="suggestions" className="cursor-pointer text-[10px] sm:text-xs font-black text-gray-500 group-focus-within:text-purple-500 transition-colors uppercase tracking-widest flex items-center gap-2 w-max">
                        Suggestions for Fix <span className="text-[9px] bg-gray-200 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">OPTIONAL</span>
                    </label>
                    <textarea id="suggestions" rows={2} value={formData.suggestions} onChange={e => updateField('suggestions', e.target.value)} placeholder="How can we make this better?" className={`${input3DClass} cursor-text resize-none custom-scrollbar`} />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-purple-900/30">
                    <button 
                        type="button" 
                        onClick={handleReset} 
                        className="w-full sm:w-1/3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <RefreshCcw className="w-4 h-4" /> Reset Form
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !formData.title || !formData.description || !formData.featureName} 
                        className="w-full sm:w-2/3 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-[0.98] shadow-lg shadow-purple-500/20 disabled:opacity-50 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 flex justify-center items-center cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SUBMIT OFFICIAL REPORT'}
                    </button>
                </div>
            </form>
        </div>
    );
}