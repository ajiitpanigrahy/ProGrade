import React, { useState } from 'react';
import { ChevronLeft, CalendarClock, Trophy, ShieldAlert, Trash2, PauseCircle, PlayCircle, Settings, Fingerprint, KeyRound, Clock, X, Calendar as CalendarIcon } from 'lucide-react';
import { adminService } from '../../../../features/admin/adminService';
import { useAuth } from '../../../../context/AuthContext';

export default function AssessmentDetailsPanel({ assessment, onBack }: { assessment: any, onBack: () => void }) {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADERBOARD' | 'FRAUD'>('OVERVIEW');
    const [localAssessment, setLocalAssessment] = useState(assessment);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // 🌟 Check Edit Permissions
    const { user } = useAuth();
    const canEdit = user?.role === 'ADMIN' || assessment.creatorEmail === user?.email;

    // 🌟 State for Postpone Modal
    const [isPostponeOpen, setIsPostponeOpen] = useState(false);
    const [newStartTime, setNewStartTime] = useState(assessment.startTime ? assessment.startTime.slice(0, 16) : '');
    const [postponeError, setPostponeError] = useState('');

    // MOCK DATA: Ready to be wired to a real backend endpoint later
    const mockLeaderboard = [
        { id: 1, rank: 1, name: "Alice Johnson", score: 95.5, timeTaken: "42m 15s", submittedAt: "2026-08-10 14:20" },
        { id: 2, rank: 2, name: "Bob Smith", score: 95.5, timeTaken: "45m 30s", submittedAt: "2026-08-10 14:25" },
        { id: 3, rank: 3, name: "Charlie Davis", score: 88.0, timeTaken: "59m 10s", submittedAt: "2026-08-10 15:00" },
    ];

    const mockFraud = [
        { id: 1, student: "David Wilson", infraction: "MULTIPLE_FACES", severity: "CRITICAL", time: "10:42 AM" },
        { id: 2, student: "Eve Brown", infraction: "TAB_SWITCH (x3)", severity: "MEDIUM", time: "11:15 AM" },
    ];

    // --- Action: Delete ---
    const handleDelete = async () => {
        if (window.confirm(`Are you absolutely sure you want to delete "${localAssessment.title}"? This action cannot be undone and will erase all student submissions.`)) {
            setIsActionLoading(true);
            try {
                await adminService.deleteAssessment(localAssessment.id);
                onBack(); // Go back to list
            } catch (err) {
                alert("Failed to delete assessment.");
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    // --- Action: Pause/Resume ---
    const handleToggleStatus = async () => {
        setIsActionLoading(true);
        try {
            const updated = await adminService.toggleAssessmentStatus(localAssessment.id);
            setLocalAssessment(updated); // Instantly update UI
        } catch (err) {
            alert("Failed to update status.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // --- Action: Submit Postpone ---
    const submitPostpone = async () => {
        setPostponeError('');
        if (!newStartTime) return setPostponeError("Please select a valid date and time.");

        const selectedDate = new Date(newStartTime);
        if (selectedDate < new Date()) {
            return setPostponeError("Cannot postpone to a date in the past.");
        }

        try {
            const updated = await adminService.postponeAssessment(localAssessment.id, newStartTime);
            setLocalAssessment(updated);
            setIsPostponeOpen(false);
        } catch (err) {
            setPostponeError("Failed to postpone assessment.");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 relative">
            
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6 bg-white dark:bg-[#1a0d36] p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                <div className="w-full lg:w-auto">
                    <button onClick={onBack} className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-500 hover:text-purple-600 mb-2 sm:mb-3 transition-colors cursor-pointer w-max">
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Back to Assessments
                    </button>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex flex-wrap items-center gap-2 sm:gap-3 leading-tight">
                        {localAssessment.title}
                        <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full border uppercase ${
                            localAssessment.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        }`}>
                            {localAssessment.status}
                        </span>
                    </h2>
                </div>
                
                {/* 🌟 CONDITIONAL RENDER: Only show controls if user can Edit */}
                {canEdit && (
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto shrink-0">
                        <button onClick={() => setIsPostponeOpen(true)} disabled={isActionLoading} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-[#0f0a1c] text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-purple-900/40 transition-colors text-xs sm:text-sm cursor-pointer disabled:opacity-50">
                            <CalendarClock className="w-3 h-3 sm:w-4 sm:h-4" /> Postpone
                        </button>
                        
                        <button onClick={handleToggleStatus} disabled={isActionLoading} className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-colors text-xs sm:text-sm cursor-pointer disabled:opacity-50 ${
                            localAssessment.status === 'PUBLISHED' 
                            ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200' 
                            : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200'
                        }`}>
                            {localAssessment.status === 'PUBLISHED' ? <><PauseCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Pause</> : <><PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Resume</>}
                        </button>

                        <button onClick={handleDelete} disabled={isActionLoading} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors text-xs sm:text-sm cursor-pointer disabled:opacity-50">
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Tab Navigation (Scrollable horizontally on mobile) */}
            <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-purple-900/30 overflow-x-auto no-scrollbar whitespace-nowrap">
                <button onClick={() => setActiveTab('OVERVIEW')} className={`pb-2 sm:pb-3 px-2 sm:px-0 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'OVERVIEW' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}><Settings className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2"/> Overview & Config</button>
                <button onClick={() => setActiveTab('LEADERBOARD')} className={`pb-2 sm:pb-3 px-2 sm:px-0 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'LEADERBOARD' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}><Trophy className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2"/> Submissions & Leaderboard</button>
                <button onClick={() => setActiveTab('FRAUD')} className={`pb-2 sm:pb-3 px-2 sm:px-0 font-bold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'FRAUD' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}><ShieldAlert className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2"/> Malpractice Logs</button>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in slide-in-from-bottom-4">
                    {/* Access Credentials Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 p-5 sm:p-6 rounded-2xl shadow-sm text-white h-max">
                        <h3 className="font-bold text-purple-100 mb-4 sm:mb-6 text-sm sm:text-base">Student Access Credentials</h3>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-[10px] sm:text-xs text-purple-200 font-medium mb-1 uppercase tracking-wider">Assessment ID</p>
                                <div className="flex items-center gap-2 sm:gap-3 bg-black/20 p-2.5 sm:p-3 rounded-xl font-mono font-bold text-base sm:text-lg">
                                    <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" /> {localAssessment.examId}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-purple-200 font-medium mb-1 uppercase tracking-wider">Secure Password</p>
                                <div className="flex items-center gap-2 sm:gap-3 bg-black/20 p-2.5 sm:p-3 rounded-xl font-mono font-bold text-base sm:text-lg">
                                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" /> {localAssessment.password}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Details */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1a0d36] p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-sm sm:text-base">Exam Configuration</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1 uppercase">Total Questions</p>
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">{localAssessment.totalQuestions}</p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1 uppercase">Time Limit</p>
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-1"><Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500"/> {localAssessment.durationMinutes} Min</p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1 uppercase">Max Attempts</p>
                                <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">{localAssessment.maxAttempts || 1}</p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1 uppercase">Creation Mode</p>
                                <p className="text-xs sm:text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded w-max mt-1">{localAssessment.creationMode}</p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1 uppercase">Positive Score</p>
                                <p className="text-base sm:text-lg font-black text-emerald-500">+{localAssessment.positiveMarks}</p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1 uppercase">Negative Penalty</p>
                                <p className="text-base sm:text-lg font-black text-rose-500">-{localAssessment.negativeMarks}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-3 md:col-span-2">
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1 uppercase">Start Time</p>
                                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-1">
                                    {localAssessment.startTime ? new Date(localAssessment.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Always Open (No schedule)'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: LEADERBOARD */}
            {activeTab === 'LEADERBOARD' && (
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-purple-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">Performance Leaderboard</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Ranked by Score (Highest First), then Time Taken.</p>
                        </div>
                        <span className="font-bold text-xs sm:text-sm bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 rounded-lg w-max">3 Submissions</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-gray-50 dark:bg-[#150a29] uppercase text-gray-500 whitespace-nowrap">
                                <tr><th className="py-3 sm:py-4 px-4 sm:px-6 w-12 sm:w-16">Rank</th><th className="py-3 sm:py-4 px-4 sm:px-6">Student Name</th><th className="py-3 sm:py-4 px-4 sm:px-6">Score</th><th className="py-3 sm:py-4 px-4 sm:px-6">Time Taken</th><th className="py-3 sm:py-4 px-4 sm:px-6">Submitted At</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                {mockLeaderboard.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 whitespace-nowrap">
                                        <td className="py-3 sm:py-4 px-4 sm:px-6">
                                            {student.rank === 1 ? <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" /> : 
                                             student.rank === 2 ? <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : 
                                             student.rank === 3 ? <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" /> : 
                                             <span className="font-bold text-gray-400">#{student.rank}</span>}
                                        </td>
                                        <td className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-gray-900 dark:text-white">{student.name}</td>
                                        <td className="py-3 sm:py-4 px-4 sm:px-6 font-black text-emerald-500">{student.score}</td>
                                        <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 dark:text-gray-300 font-mono">{student.timeTaken}</td>
                                        <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-500 text-[10px] sm:text-xs">{student.submittedAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: FRAUD */}
            {activeTab === 'FRAUD' && (
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-purple-900/30">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg text-red-500 flex items-center gap-2"><ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5"/> Malpractice & Infraction Logs</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Summary of AI proctoring events triggered during this specific exam.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-gray-50 dark:bg-[#150a29] uppercase text-gray-500 whitespace-nowrap">
                                <tr><th className="py-3 sm:py-4 px-4 sm:px-6">Student</th><th className="py-3 sm:py-4 px-4 sm:px-6">Infraction Type</th><th className="py-3 sm:py-4 px-4 sm:px-6">Severity</th><th className="py-3 sm:py-4 px-4 sm:px-6">Time</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                {mockFraud.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 whitespace-nowrap">
                                        <td className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-gray-900 dark:text-white">{event.student}</td>
                                        <td className="py-3 sm:py-4 px-4 sm:px-6 font-bold text-red-500">{event.infraction}</td>
                                        <td className="py-3 sm:py-4 px-4 sm:px-6">
                                            <span className={`px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-white ${event.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`}>{event.severity}</span>
                                        </td>
                                        <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-500 text-[10px] sm:text-xs">{event.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 🌟 POSTPONE MODAL OVERLAY */}
            {isPostponeOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1a0d36] w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/30 overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-purple-900/30 flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2 dark:text-white"><CalendarIcon className="text-purple-600" /> Postpone Assessment</h3>
                            <button onClick={() => setIsPostponeOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {postponeError && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200">{postponeError}</div>}
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">New Scheduled Start Time</label>

                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    value={newStartTime}
                                    onChange={e => setNewStartTime(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3.5 focus:ring-2 ring-purple-600 outline-none text-gray-900 dark:text-white transition-all cursor-pointer text-sm [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Students will not be able to access the exam until this specific time.</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#0f0a1c] flex justify-end gap-3 border-t border-gray-100 dark:border-purple-900/30">
                            <button onClick={() => setIsPostponeOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-purple-900/30 transition-colors">Cancel</button>
                            <button onClick={submitPostpone} className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors">Confirm Postpone</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}