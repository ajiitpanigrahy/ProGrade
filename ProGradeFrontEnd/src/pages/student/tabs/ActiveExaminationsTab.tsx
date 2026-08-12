import React, { useState, useEffect } from 'react';
import { Search, Filter, Rocket, Lock, XCircle, KeyRound, X, Loader2, ArrowLeft, Clock } from 'lucide-react';
import { studentService } from '../../../features/student/studentService';

export default function ActiveExaminationsTab() {
    const [publicExams, setPublicExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedExam, setSearchedExam] = useState<any | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [techFilter, setTechFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Security Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [passkey, setPasskey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(false); // Controls the shake animation

    useEffect(() => {
        studentService.getPublicAssessments()
            .then(setPublicExams)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // 🌟 State Calculation Engine (Live / Scheduled / Expired)
    const getExamState = (exam: any) => {
        if (exam.status === 'PAUSED') return { state: 'EXPIRED', color: 'gray', label: 'Expired', text: 'This exam is paused or no longer accepting submissions.' };
        if (!exam.startTime) return { state: 'LIVE', color: 'emerald', label: 'Live Now', text: 'Instantly available.' };

        const now = new Date();
        const start = new Date(exam.startTime);
        // Assuming a standard 24-hour window if no strict end time is provided by backend
        const endWindow = new Date(start.getTime() + 24 * 60 * 60 * 1000); 

        if (now < start) return { state: 'SCHEDULED', color: 'amber', label: 'Scheduled', text: `Unlocks at ${start.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` };
        if (now >= start && now <= endWindow) return { state: 'LIVE', color: 'emerald', label: 'Live Now', text: `Closes at ${endWindow.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` };
        
        return { state: 'EXPIRED', color: 'gray', label: 'Expired', text: 'The operational window for this exam has passed.' };
    };

    // 🌟 Handle Private Exam Search
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchedExam(null);
        try {
            const result = await studentService.searchPrivateAssessment(searchQuery);
            setSearchedExam(result);
        } catch (err) {
            alert("No educator exam found with that ID.");
        } finally {
            setIsSearching(false);
        }
    };

    // 🌟 Handle Secure Ingress Verification
    const handleVerifyPasskey = async () => {
        setIsVerifying(true);
        setVerifyError(false);
        try {
            const response = await studentService.verifyExamPassword(selectedExamId, passkey);
            if (response.verified) {
                alert(`Authentication Successful! Access Token Generated: ${response.accessToken}. Navigating to live test viewport...`);
                setIsModalOpen(false);
                // Future Implementation: window.location.href = `/exam/live/${response.assessmentId}?token=${response.accessToken}`
            }
        } catch (err) {
            // Trigger Shake Animation
            setVerifyError(true);
            setTimeout(() => setVerifyError(false), 500); // Remove class after animation
        } finally {
            setIsVerifying(false);
        }
    };

    const renderExamCard = (exam: any, isPrivate: boolean = false) => {
        const { state, color, label, text } = getExamState(exam);

        return (
            <div key={exam.id} className={`bg-white dark:bg-[#1a0d36] rounded-2xl p-6 shadow-sm border-2 transition-all relative overflow-hidden group ${
                state === 'LIVE' ? 'border-emerald-500/30 hover:border-emerald-500 dark:border-emerald-500/20 dark:hover:border-emerald-500/50' : 
                state === 'SCHEDULED' ? 'border-amber-500/30 dark:border-amber-500/20' : 
                'border-gray-200 dark:border-purple-900/30 opacity-75'
            }`}>
                {/* Status Badge */}
                <div className="absolute top-5 right-5">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                        {state === 'LIVE' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                        {state === 'SCHEDULED' && <Clock className="w-3.5 h-3.5" />}
                        {state === 'EXPIRED' && <XCircle className="w-3.5 h-3.5" />}
                        {label}
                    </span>
                </div>

                <div className="pr-24">
                    {isPrivate && <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded w-max mb-3 uppercase"><KeyRound className="w-3 h-3"/> Private Educator Exam</div>}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">{exam.title}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-4">By: {exam.creatorEmail}</p>
                    
                    <div className="flex items-center gap-4 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-6">
                        <span className="bg-gray-50 dark:bg-[#0f0a1c] px-3 py-1.5 rounded-lg border border-gray-100 dark:border-purple-900/30">{exam.totalQuestions} Questions</span>
                        <span className="bg-gray-50 dark:bg-[#0f0a1c] px-3 py-1.5 rounded-lg border border-gray-100 dark:border-purple-900/30">{exam.durationMinutes} Minutes Limit</span>
                    </div>

                    <p className="text-xs text-gray-500 mb-4 h-4">{text}</p>

                    {/* Action Button Rules */}
                    {state === 'LIVE' && (
                        <button 
                            onClick={() => { setSelectedExamId(exam.examId); setPasskey(''); setIsModalOpen(true); }}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                        >
                            <Rocket className="w-5 h-5" /> START EXAMINATION
                        </button>
                    )}
                    {state === 'SCHEDULED' && (
                        <button disabled className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/10 text-amber-500 font-bold py-3 rounded-xl border border-amber-200 dark:border-amber-900/50 cursor-not-allowed">
                            <Lock className="w-5 h-5" /> Locked Until Launch
                        </button>
                    )}
                    {state === 'EXPIRED' && (
                        <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#0f0a1c] text-gray-400 font-bold py-3 rounded-xl border border-gray-200 dark:border-gray-800 cursor-not-allowed">
                            <XCircle className="w-5 h-5" /> Closed
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            
            {/* A. Global Control & Search Bar */}
            <div className="bg-white dark:bg-[#1a0d36] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search Engine */}
                <div className="relative w-full md:w-1/2 flex items-center">
                    <div className="absolute left-4 bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                        <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="🔍 Enter Educator Exam Code (e.g. EXM-A1B2)..." 
                        className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl pl-14 pr-24 py-3.5 focus:ring-2 ring-purple-600 outline-none text-gray-900 dark:text-white transition-all text-sm font-medium uppercase"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={!searchQuery || isSearching}
                        className="absolute right-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                    </button>
                </div>

                {/* Filter Grid for Public Exams */}
                {!searchedExam && (
                    <div className="flex w-full md:w-auto items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select value={techFilter} onChange={e => setTechFilter(e.target.value)} className="bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer">
                                <option value="ALL">All Technologies</option>
                                <option value="JAVA">Core Java</option>
                                <option value="SPRING_BOOT">Spring Boot</option>
                            </select>
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer">
                            <option value="ALL">All Status</option>
                            <option value="LIVE">Live Now</option>
                            <option value="SCHEDULED">Scheduled</option>
                        </select>
                    </div>
                )}
            </div>

            {/* B. The Display Grid */}
            {loading ? (
                <div className="py-24 flex justify-center text-purple-600"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : searchedExam ? (
                /* Private Searched Exam View */
                <div className="animate-in slide-in-from-bottom-4">
                    <button onClick={() => { setSearchedExam(null); setSearchQuery(''); }} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Public Schedule
                    </button>
                    <div className="max-w-2xl">
                        {renderExamCard(searchedExam, true)}
                    </div>
                </div>
            ) : (
                /* Public Admin Exams Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in">
                    {publicExams.length === 0 ? (
                        <div className="col-span-full py-24 text-center text-gray-500 font-bold">No public examinations currently scheduled.</div>
                    ) : (
                        publicExams.map(exam => renderExamCard(exam))
                    )}
                </div>
            )}

            {/* 🛡️ Secure Passkey Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1a0d36] w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/30 overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-purple-900/30 flex justify-between items-center bg-gray-50 dark:bg-[#150a29]">
                            <h3 className="font-bold text-xl flex items-center gap-2 dark:text-white"><KeyRound className="text-amber-500"/> Security Gateway</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                                This examination is protected. Please enter the secure passkey generated by your educator to launch the testing environment.
                            </p>
                            
                            <div className="relative">
                                {/* 🌟 SHAKE ANIMATION CLASS INJECTED ON ERROR */}
                                <input 
                                    type="text" 
                                    value={passkey} 
                                    onChange={e => setPasskey(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPasskey()}
                                    placeholder="Enter Exam Password..." 
                                    className={`w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 rounded-xl px-4 py-4 text-center text-lg tracking-widest font-mono font-bold focus:outline-none transition-all ${
                                        verifyError ? 'border-red-500 text-red-500 animate-[shake_0.4s_ease-in-out]' : 'border-gray-200 dark:border-purple-900/50 focus:border-purple-600 dark:text-white'
                                    }`}
                                />
                                {verifyError && <p className="text-xs text-red-500 text-center font-bold mt-2 absolute w-full">Invalid passkey token. Access Denied.</p>}
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <button 
                                onClick={handleVerifyPasskey} 
                                disabled={isVerifying || !passkey}
                                className="w-full py-4 rounded-xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-5 h-5"/> Verify and Launch</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Custom Shake Keyframe injected into Tailwind */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-5px); }
                    40%, 80% { transform: translateX(5px); }
                }
            `}} />
        </div>
    );
}