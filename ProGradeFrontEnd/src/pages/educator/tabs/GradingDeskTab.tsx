import React, { useEffect, useState } from 'react';
import { educatorService } from '../../../features/educator/educatorService';
import { AlertTriangle, CheckCircle, Eye, RefreshCw } from 'lucide-react';

export default function GradingDeskTab() {
    const [pending, setPending] = useState<any[]>([]);

    useEffect(() => {
        educatorService.getPendingReviews().then(setPending).catch(console.error);
    }, []);

    const handleApprove = (id: number) => {
        alert("Score officially released to student dashboard.");
        setPending(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Grading & Evaluation Desk</h2>
                <p className="text-sm text-gray-500">Review flagged exams, process edge cases, and manually release final scores.</p>
            </div>

            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase text-gray-500">
                            <tr>
                                <th className="py-4 px-6">Candidate</th>
                                <th className="py-4 px-6">Exam Blueprint</th>
                                <th className="py-4 px-6">Raw Score</th>
                                <th className="py-4 px-6">System Status</th>
                                <th className="py-4 px-6 text-right">Evaluation Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {pending.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{review.studentName}</td>
                                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{review.examTitle}</td>
                                    <td className="py-4 px-6 font-black text-purple-600 dark:text-purple-400">{review.score}%</td>
                                    <td className="py-4 px-6">
                                        {review.status === 'FLAGGED_REVIEW' ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded w-max border border-amber-200 dark:border-amber-800"><AlertTriangle className="w-3 h-3"/> ANOMALY DETECTED</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded w-max border border-gray-200 dark:border-gray-700"><CheckCircle className="w-3 h-3"/> AUTO-GRADED</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                                        <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                            <Eye className="w-3.5 h-3.5"/> Transcript
                                        </button>
                                        <button onClick={() => handleApprove(review.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                            <CheckCircle className="w-3.5 h-3.5"/> Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}