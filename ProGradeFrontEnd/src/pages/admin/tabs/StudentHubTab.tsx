import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, LockOpen, Users, BarChart2, Trash2, X, UserCircle2, Settings, Target, ArrowUpRight, Award, FileText, CheckCircle2, UserMinus, Clock } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { adminService } from '../../../features/admin/adminService';
import BatchUploadManager from './subtabs/BatchUploadManager';

type SubTab = 'DIRECTORY' | 'ANALYTICS';
type AnalyticsLevel = 'OVERALL' | 'STUDENT' | 'EXAM';

export default function StudentHubTab() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('DIRECTORY');
    const [analyticsLevel, setAnalyticsLevel] = useState<AnalyticsLevel>('OVERALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [batchFilter, setBatchFilter] = useState('ALL');

    const [students, setStudents] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [overallData, setOverallData] = useState<any>(null);
    const [studentData, setStudentData] = useState<any>(null);
    const [examData, setExamData] = useState<any>(null);

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'BLOCK' | 'DELETE' | 'DELETE_BATCH' | 'REMOVE_FROM_BATCH' | null, id: string, name: string }>({ isOpen: false, type: null, id: '', name: '' });
    const [viewModal, setViewModal] = useState<{ isOpen: boolean, student: any | null }>({ isOpen: false, student: null });
    const [batchModal, setBatchModal] = useState<{ isOpen: boolean, batch: any | null }>({ isOpen: false, batch: null });

    const loadDirectoryData = () => {
        setLoading(true);
        Promise.all([
            adminService.getStudents(),
            adminService.getBatchInfo(),
            adminService.getAllAssessments()
        ]).then(([studentsData, batchesData, examsData]) => {
            setStudents(studentsData);
            setBatches(batchesData);
            setExams(examsData);
            if (studentsData.length > 0 && !selectedStudentId) setSelectedStudentId(studentsData[0].id);
            if (examsData.length > 0 && !selectedExamId) setSelectedExamId(examsData[0].id);
            
            if (batchModal.isOpen && batchModal.batch) {
                const updatedBatch = batchesData.find((b: any) => b.id === batchModal.batch.id);
                setBatchModal({ isOpen: true, batch: updatedBatch });
            }
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadDirectoryData();
        adminService.getOverallAnalytics().then(setOverallData).catch(console.error);
    }, []);

    useEffect(() => {
        if (analyticsLevel === 'STUDENT' && selectedStudentId) {
            adminService.getStudentAnalytics(selectedStudentId).then(setStudentData).catch(console.error);
        } else if (analyticsLevel === 'EXAM' && selectedExamId) {
            adminService.getExamAnalytics(selectedExamId).then(setExamData).catch(console.error);
        }
    }, [analyticsLevel, selectedStudentId, selectedExamId]);

    const handleActionConfirm = async () => {
        try {
            if (confirmModal.type === 'BLOCK') await adminService.toggleStudentStatus(confirmModal.id);
            else if (confirmModal.type === 'DELETE') await adminService.deleteStudent(confirmModal.id);
            else if (confirmModal.type === 'DELETE_BATCH') await adminService.deleteBatch(confirmModal.id);
            else if (confirmModal.type === 'REMOVE_FROM_BATCH') await adminService.removeStudentFromBatch(confirmModal.id);
            
            setConfirmModal({ isOpen: false, type: null, id: '', name: '' });
            if (confirmModal.type === 'DELETE_BATCH') setBatchModal({ isOpen: false, batch: null });
            loadDirectoryData();
        } catch (err) { alert(`Action failed.`); }
    };

    const filteredStudents = students.filter(s => 
        (batchFilter === 'ALL' || s.batchName === batchFilter) &&
        (s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeStudentData = students.find(s => s.id === selectedStudentId);

    const ConfirmDialog = () => (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
            <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type?.includes('DELETE') || confirmModal.type === 'REMOVE_FROM_BATCH' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-amber-50 text-amber-500 dark:bg-amber-900/20'}`}>
                    {confirmModal.type?.includes('DELETE') ? <Trash2 className="w-8 h-8" /> : confirmModal.type === 'REMOVE_FROM_BATCH' ? <UserMinus className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Are you sure?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Action targets: <strong>{confirmModal.name}</strong>.</p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
                    <button onClick={handleActionConfirm} className={`flex-1 font-bold py-3 rounded-xl text-white shadow-md cursor-pointer transition-colors ${confirmModal.type?.includes('DELETE') || confirmModal.type === 'REMOVE_FROM_BATCH' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>Confirm</button>
                </div>
            </div>
        </div>
    );

    const ViewStudentDialog = () => {
        if (!viewModal.student) return null;
        const s = viewModal.student;
        const safeStatus = (s.status || 'ACTIVE').toUpperCase(); // 🌟 SAFE FALLBACK

        return (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setViewModal({ isOpen: false, student: null })}>
                <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-purple-900/50" onClick={e => e.stopPropagation()}>
                    <div className="bg-gray-50 dark:bg-[#0f0a1c] p-6 text-center border-b border-gray-200 dark:border-purple-900/50 relative">
                        <button onClick={() => setViewModal({ isOpen: false, student: null })} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-purple-900/30 rounded-full cursor-pointer"><X className="w-5 h-5"/></button>
                        <UserCircle2 className="w-20 h-20 mx-auto text-purple-300 dark:text-purple-900/50 mb-3" />
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">{s.fullName}</h2>
                        <p className="text-purple-600 font-bold text-sm mt-1">{s.email}</p>
                        <p className="text-gray-500 text-xs font-mono mt-1">ID: {s.rollNumber || 'N/A'}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between border-b border-gray-100 dark:border-purple-900/30 pb-3"><span className="text-gray-500 text-sm font-bold">Associated Batches</span><span className="font-black text-gray-900 dark:text-white text-right max-w-[200px] truncate">{s.batchName}</span></div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-purple-900/30 pb-3"><span className="text-gray-500 text-sm font-bold">Platform Status</span><span className={`font-black text-sm ${safeStatus === 'ACTIVE' ? 'text-green-500' : safeStatus === 'DELETED' ? 'text-gray-500' : 'text-red-500'}`}>{safeStatus}</span></div>
                    </div>
                </div>
            </div>
        );
    };

    const ManageBatchDialog = () => {
        if (!batchModal.batch) return null;
        const b = batchModal.batch;
        
        const [localSearch, setLocalSearch] = useState('');
        const [registrationFilter, setRegistrationFilter] = useState<'ALL' | 'REGISTERED' | 'PENDING'>('ALL');
        const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'fullName', direction: 'asc' });

        const handleSort = (key: string) => {
            setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });
        };

        const batchStudents = b.students || [];
        
        const filteredBatchStudents = batchStudents.filter((s: any) => {
            const matchesSearch = s.fullName.toLowerCase().includes(localSearch.toLowerCase()) || 
                                  s.email.toLowerCase().includes(localSearch.toLowerCase()) || 
                                  (s.rollNumber && s.rollNumber.toLowerCase().includes(localSearch.toLowerCase()));
            
            const matchesReg = registrationFilter === 'ALL' ? true : 
                               registrationFilter === 'REGISTERED' ? s.registered : 
                               !s.registered;

            return matchesSearch && matchesReg;
        }).sort((a: any, b: any) => {
            let valA = a[sortConfig.key] ?? '';
            let valB = b[sortConfig.key] ?? '';

            if (sortConfig.key === 'registered') {
                valA = a.registered ? 1 : 0;
                valB = b.registered ? 1 : 0;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setBatchModal({ isOpen: false, batch: null })}>
                <div className="bg-white dark:bg-[#150a29] max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-purple-900/50 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    
                    <div className="p-6 border-b border-gray-200 dark:border-purple-900/50 relative shrink-0 flex justify-between items-center bg-gray-50 dark:bg-[#0f0a1c]">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Settings className="w-5 h-5 text-purple-600"/> Batch Management</h2>
                            <p className="text-xs text-purple-600 font-bold mt-1">{b.name} • {b.studentCount} Students in Roster</p>
                        </div>
                        <button onClick={() => setBatchModal({ isOpen: false, batch: null })} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-purple-900/30 rounded-full cursor-pointer transition-colors"><X className="w-5 h-5"/></button>
                    </div>

                    <div className="p-6 flex flex-col flex-1 overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 shrink-0">
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Search batch by name, email, ID..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:text-white" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
                                    <select value={registrationFilter} onChange={(e) => setRegistrationFilter(e.target.value as any)} className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none cursor-pointer w-full sm:w-auto">
                                        <option value="ALL">All Statuses</option>
                                        <option value="REGISTERED">Registered Users</option>
                                        <option value="PENDING">Pending Signup</option>
                                    </select>
                                </div>
                            </div>

                            <button onClick={() => setConfirmModal({ isOpen: true, type: 'DELETE_BATCH', id: b.id, name: b.name })} className="flex justify-center items-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold px-4 py-2 rounded-lg transition-colors border border-red-200 dark:border-red-900/50 cursor-pointer text-sm shrink-0">
                                <Trash2 className="w-4 h-4"/> Delete Entire Batch
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-purple-900/30">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-[#150a29] sticky top-0 z-10 shadow-sm">
                                    <tr className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                                        <th className="py-3 px-4 cursor-pointer hover:text-purple-600" onClick={() => handleSort('rollNumber')}>ID No.</th>
                                        <th className="py-3 px-4 cursor-pointer hover:text-purple-600" onClick={() => handleSort('fullName')}>Name</th>
                                        <th className="py-3 px-4 cursor-pointer hover:text-purple-600" onClick={() => handleSort('email')}>Email Address</th>
                                        <th className="py-3 px-4 cursor-pointer hover:text-purple-600" onClick={() => handleSort('registered')}>Registration Status</th>
                                        <th className="py-3 px-4 text-right">Remove</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30 bg-white dark:bg-[#1a0d36]">
                                    {filteredBatchStudents.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-8 text-gray-500 text-sm">No students found matching your search and filter.</td></tr>
                                    ) : (
                                        filteredBatchStudents.map((s: any) => (
                                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-[#0f0a1c]/50 transition-colors">
                                                <td className="py-3 px-4 text-xs font-mono text-gray-500">{s.rollNumber || '--'}</td>
                                                <td className="py-3 px-4 text-sm font-bold text-gray-900 dark:text-white">{s.fullName}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{s.email}</td>
                                                <td className="py-3 px-4">
                                                    {s.registered ? (
                                                        <div className="flex items-center gap-1.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded w-max text-[10px] font-black uppercase border border-green-200 dark:border-green-800">
                                                            <CheckCircle2 className="w-3 h-3" /> Registered User
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded w-max text-[10px] font-black uppercase border border-gray-200 dark:border-gray-700">
                                                            <Clock className="w-3 h-3" /> Pending Signup
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button 
                                                        onClick={() => setConfirmModal({ isOpen: true, type: 'REMOVE_FROM_BATCH', id: s.id, name: s.fullName })} 
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Unbind from Batch"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {confirmModal.isOpen && <ConfirmDialog />}
            {viewModal.isOpen && <ViewStudentDialog />}
            {batchModal.isOpen && <ManageBatchDialog />}

            <div className="flex bg-white dark:bg-[#1a0d36] p-1.5 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm w-fit">
                <button onClick={() => setActiveSubTab('DIRECTORY')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeSubTab === 'DIRECTORY' ? 'bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                    <Users className="w-4 h-4" /> Management
                </button>
                <button onClick={() => setActiveSubTab('ANALYTICS')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeSubTab === 'ANALYTICS' ? 'bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                    <BarChart2 className="w-4 h-4" /> Analytics Engine
                </button>
            </div>

            {activeSubTab === 'DIRECTORY' && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <BatchUploadManager onSuccess={loadDirectoryData} />
                        </div>
                        <div className="bg-white dark:bg-[#1a0d36] rounded-2xl border border-gray-200 dark:border-purple-900/30 p-6 shadow-sm flex flex-col h-full mb-6 relative overflow-hidden">
                            <Target className="absolute -bottom-4 -right-4 w-32 h-32 text-purple-500/5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 relative z-10">
                                <Target className="w-5 h-5 text-purple-500" /> Active Platform Batches
                            </h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2 relative z-10">
                                {batches.length === 0 ? (
                                    <p className="text-xs text-gray-500">No batches uploaded yet.</p>
                                ) : (
                                    batches.map((b: any) => (
                                        <div key={b.id} onClick={() => setBatchModal({ isOpen: true, batch: b })} className="group relative flex justify-between items-center bg-gray-50 dark:bg-[#0f0a1c] p-3 rounded-lg border border-gray-100 dark:border-purple-900/50 hover:border-purple-400 cursor-pointer transition-colors">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">{b.name}</span>
                                            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded font-black uppercase">Manage List</span>
                                            <div className="absolute right-0 top-12 w-max bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                                Manage {b.studentCount} Students
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-[#1a0d36] p-4 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search Database..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:text-white" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
                                <option value="ALL">All Batches</option>
                                {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase tracking-wider text-gray-500">
                                        <th className="py-4 px-6 font-semibold">Registered Student Profile</th>
                                        <th className="py-4 px-6 font-semibold">Associated Batches</th>
                                        <th className="py-4 px-6 font-semibold">Status</th>
                                        <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                    {loading ? (
                                        <tr><td colSpan={4} className="text-center py-10 font-bold text-purple-500">Loading directory...</td></tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-10 text-gray-500">No active students found.</td></tr>
                                    ) : (
                                        filteredStudents.map((student) => {
                                            const safeStatus = (student.status || 'ACTIVE').toUpperCase(); // 🌟 SAFE FALLBACK GUARD
                                            return (
                                                <tr key={student.id} className={`transition-colors ${safeStatus === 'DELETED' ? 'bg-gray-50 dark:bg-[#150a29]/50 opacity-60' : 'hover:bg-gray-50 dark:hover:bg-[#150a29]/50'}`}>
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-gray-900 dark:text-white">{student.fullName}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{student.rollNumber || 'No ID'} | {student.email}</div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-bold text-purple-600 dark:text-purple-400 max-w-[200px] truncate">{student.batchName}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md border ${safeStatus === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' : safeStatus === 'DELETED' ? 'bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800 dark:border-gray-700' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>{safeStatus}</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex justify-end gap-2 text-gray-400">
                                                            <button onClick={() => setViewModal({ isOpen: true, student })} className="p-1.5 hover:text-blue-500 bg-gray-100 dark:bg-[#0f0a1c] rounded-lg cursor-pointer transition-colors"><UserCircle2 className="w-4 h-4" /></button>
                                                            {safeStatus !== 'DELETED' && (
                                                                <>
                                                                    <button onClick={() => setConfirmModal({ isOpen: true, type: 'BLOCK', id: student.id, name: student.fullName })} className="p-1.5 hover:text-amber-500 bg-gray-100 dark:bg-[#0f0a1c] rounded-lg cursor-pointer transition-colors">{safeStatus === 'ACTIVE' ? <ShieldAlert className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}</button>
                                                                    <button onClick={() => setConfirmModal({ isOpen: true, type: 'DELETE', id: student.id, name: student.fullName })} className="p-1.5 hover:text-red-500 bg-gray-100 dark:bg-[#0f0a1c] rounded-lg cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'ANALYTICS' && (
                <div className="space-y-6 animate-in fade-in">
                    
                    <div className="flex bg-gray-100 dark:bg-[#0f0a1c] p-1.5 rounded-xl w-fit border border-gray-200 dark:border-purple-900/50">
                        <button onClick={() => setAnalyticsLevel('OVERALL')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${analyticsLevel === 'OVERALL' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Overall Platform</button>
                        <button onClick={() => setAnalyticsLevel('STUDENT')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${analyticsLevel === 'STUDENT' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Student-Wise</button>
                        <button onClick={() => setAnalyticsLevel('EXAM')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${analyticsLevel === 'EXAM' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Exam-Wise</button>
                    </div>

                    {analyticsLevel === 'OVERALL' && overallData && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                            <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 lg:col-span-2 relative overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 relative z-10">Global Score Distribution</h3>
                                <div className="h-72 w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={overallData.scoreDistribution}>
                                            <defs><linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} stroke="#6b7280" />
                                            <XAxis dataKey="scoreRange" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#6d28d9', color: '#fff', borderRadius: '12px' }} />
                                            <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorCurve)" activeDot={{ r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 3 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex flex-col relative overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 relative z-10">Global Pass vs Fail Ratio</h3>
                                <div className="flex-1 min-h-[250px] relative z-10 mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={overallData.passFailRatio} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                                                {overallData.passFailRatio.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '8px' }} />
                                            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {analyticsLevel === 'STUDENT' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1a0d36] p-4 rounded-2xl border border-gray-200 dark:border-purple-900/30 shadow-sm">
                                <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer w-full sm:w-80 shadow-sm">
                                    {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
                                </select>
                                
                                {activeStudentData && activeStudentData.status !== 'DELETED' && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setConfirmModal({ isOpen: true, type: 'BLOCK', id: activeStudentData.id, name: activeStudentData.fullName })} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl text-sm font-bold transition-colors cursor-pointer">
                                            {activeStudentData.status === 'ACTIVE' ? <><ShieldAlert className="w-4 h-4" /> Suspend</> : <><LockOpen className="w-4 h-4" /> Unsuspend</>}
                                        </button>
                                        <button onClick={() => setConfirmModal({ isOpen: true, type: 'DELETE', id: activeStudentData.id, name: activeStudentData.fullName })} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-sm font-bold transition-colors cursor-pointer">
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {studentData && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
                                        <FileText className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-purple-100 relative z-10">Exams Attempted</p>
                                        <p className="text-5xl font-black mt-3 relative z-10">{studentData.examsAttempted}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
                                        <ArrowUpRight className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-100 relative z-10">Average Score</p>
                                        <p className="text-5xl font-black mt-3 relative z-10">{studentData.averageScore}%</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
                                        <Award className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-100 relative z-10">Highest Score</p>
                                        <p className="text-5xl font-black mt-3 relative z-10">{studentData.highestScore}%</p>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-purple-900/30 md:col-span-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Assessment Performance</h3>
                                        <div className="h-72 w-full">
                                            {studentData.recentScores?.length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">No exam data available for this student.</div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={studentData.recentScores} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6b7280" opacity={0.15} />
                                                        <XAxis dataKey="examName" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '12px' }} />
                                                        <Bar dataKey="score" fill="#8b5cf6" radius={[6,6,0,0]} barSize={40} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {analyticsLevel === 'EXAM' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="bg-white dark:bg-[#1a0d36] p-4 rounded-2xl border border-gray-200 dark:border-purple-900/30 shadow-sm w-fit">
                                <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer w-full sm:w-80 shadow-sm">
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                </select>
                            </div>

                            {examData && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl border border-gray-200 dark:border-purple-900/30 shadow-sm"><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Participants</p><p className="text-4xl font-black text-purple-600 dark:text-purple-400 mt-2">{examData.participants}</p></div>
                                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl border border-gray-200 dark:border-purple-900/30 shadow-sm"><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Average Score</p><p className="text-4xl font-black text-emerald-500 mt-2">{examData.averageScore}%</p></div>
                                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl border border-gray-200 dark:border-purple-900/30 shadow-sm"><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Highest Score</p><p className="text-4xl font-black text-blue-500 mt-2">{examData.highestScore}%</p></div>

                                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-purple-900/30 md:col-span-3">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Score Distribution for {examData.examTitle}</h3>
                                        <div className="h-72 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={examData.scoreDistribution} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6b7280" opacity={0.15} />
                                                    <XAxis dataKey="scoreRange" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '12px' }} />
                                                    <Bar dataKey="count" fill="#3b82f6" radius={[6,6,0,0]} barSize={50} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}