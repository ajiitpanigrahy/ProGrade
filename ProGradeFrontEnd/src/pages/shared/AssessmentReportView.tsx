import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ShieldAlert, Trophy, Loader2, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

export default function AssessmentReportView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        // We use the assessments endpoint we set up in AssessmentController
        axiosClient.get(`/assessments/${id}/reports`)
            .then(res => {
                if (res.data.error) {
                    setErrorMsg(res.data.error);
                } else {
                    setReportData(res.data);
                }
            })
            .catch(err => {
                console.error(err);
                setErrorMsg("Failed to load reports. Make sure you have permission to view this exam.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="h-full w-full flex items-center justify-center p-20 text-purple-600">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );

    if (errorMsg) return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold mb-4">
                <ArrowLeft className="w-4 h-4"/> Go Back
            </button>
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6" />
                <span className="font-bold">{errorMsg}</span>
            </div>
        </div>
    );

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', { 
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
        });
    };

    // 🌟 SAFE FALLBACKS (Prevents the .length crash forever)
    const submissions = reportData?.submissions || [];
    const fraudLogs = reportData?.fraudLogs || [];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-purple-900/30 pb-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors cursor-pointer">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">{reportData?.examTitle || 'Assessment Report'}</h1>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Analytics & Security Report</p>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#150a29] p-6 rounded-2xl border border-gray-100 dark:border-purple-900/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Users className="w-6 h-6"/></div>
                    <div><p className="text-gray-500 text-sm font-bold uppercase">Total Students</p><p className="text-2xl font-black text-gray-900 dark:text-white">{reportData?.totalStudents || 0}</p></div>
                </div>
                <div className="bg-white dark:bg-[#150a29] p-6 rounded-2xl border border-gray-100 dark:border-purple-900/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Trophy className="w-6 h-6"/></div>
                    <div><p className="text-gray-500 text-sm font-bold uppercase">Average Score</p><p className="text-2xl font-black text-gray-900 dark:text-white">{reportData?.averageScore || 0}</p></div>
                </div>
                <div className="bg-white dark:bg-[#150a29] p-6 rounded-2xl border border-gray-100 dark:border-purple-900/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center"><ShieldAlert className="w-6 h-6"/></div>
                    <div><p className="text-gray-500 text-sm font-bold uppercase">Fraud Alerts</p><p className="text-2xl font-black text-gray-900 dark:text-white">{fraudLogs.length}</p></div>
                </div>
            </div>

            {/* Student Leaderboard Table */}
            <div className="bg-white dark:bg-[#150a29] border border-gray-200 dark:border-purple-900/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-purple-900/50 bg-gray-50 dark:bg-[#0f0a1c]">
                    <h2 className="font-bold text-gray-900 dark:text-white">Student Submissions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-[#1a0d36] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Student Email</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4 text-center">C / W / S</th>
                                <th className="px-6 py-4">Started At</th>
                                <th className="px-6 py-4">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {submissions.map((sub: any, idx: number) => (
                                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="text-xs text-gray-400 dark:text-gray-600 w-4">{idx + 1}.</span> {sub.studentEmail}
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-purple-600 dark:text-purple-400">
                                        {sub.totalScore} <span className="text-gray-400 dark:text-gray-600 text-xs font-normal">/ {sub.maxScore}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-emerald-500 font-bold">{sub.correctCount}</span> / 
                                        <span className="text-red-500 font-bold px-1">{sub.incorrectCount}</span> / 
                                        <span className="text-gray-400 dark:text-gray-600 font-bold">{sub.unattemptedCount}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs"><Clock className="w-3 h-3 inline mr-1 text-gray-400 dark:text-gray-600"/> {formatDate(sub.startedAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs"><CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500"/> {formatDate(sub.submittedAt)}</td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">No submissions yet for this exam.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fraud Logs Table */}
            {fraudLogs.length > 0 && (
                <div className="bg-red-50 dark:bg-[#1a0d36] border border-red-200 dark:border-red-900/50 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-red-200 dark:border-red-900/50 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500"/>
                        <h2 className="font-bold text-red-900 dark:text-red-400">Malpractice & Security Logs</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 min-w-[600px]">
                            <thead className="bg-red-100/50 dark:bg-red-900/20 text-red-800 dark:text-red-300 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Student Email</th>
                                    <th className="px-6 py-4">Violation Type</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                                {fraudLogs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{log.studentEmail}</td>
                                        <td className="px-6 py-4 font-black text-red-600 dark:text-red-500">{log.infractionType}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-red-800/80 dark:text-red-300/80">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}