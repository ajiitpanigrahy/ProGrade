import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../features/admin/adminService';
import type { DashboardMetrics, DashboardCharts, PendingEducator } from '../../types/admin';
import { 
    Users, Activity, DollarSign, ShieldCheck, 
    CheckCircle2, XCircle, Clock, Server
} from 'lucide-react';
import { 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

import DashboardLayout from '../../layouts/DashboardLayout';

export default function AdminDashboard() {
    const { user } = useAuth();
    
    // State
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [charts, setCharts] = useState<DashboardCharts | null>(null);
    const [pendingEducators, setPendingEducators] = useState<PendingEducator[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Data on Load
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [metricsData, chartsData, educatorsData] = await Promise.all([
                    adminService.getMetrics(),
                    adminService.getCharts(),
                    adminService.getPendingEducators()
                ]);
                
                setMetrics(metricsData);
                setCharts(chartsData);
                setPendingEducators(educatorsData);
            } catch (error) {
                console.error("Failed to load admin dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Action Handlers
    const handleApprove = async (id: string) => {
        try {
            await adminService.approveEducator(id);
            setPendingEducators(prev => prev.filter(edu => edu.id !== id));
            // Optional: Re-fetch metrics to update the top cards
            const updatedMetrics = await adminService.getMetrics();
            setMetrics(updatedMetrics);
        } catch (error) {
            console.error("Failed to approve educator:", error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await adminService.rejectEducator(id);
            setPendingEducators(prev => prev.filter(edu => edu.id !== id));
            const updatedMetrics = await adminService.getMetrics();
            setMetrics(updatedMetrics);
        } catch (error) {
            console.error("Failed to reject educator:", error);
        }
    };

    if (isLoading || !metrics || !charts) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-[#0f0a1c] dark:text-white">Loading dashboard...</div>;
    }

    return (
        <DashboardLayout role="ADMIN">
    {
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1c] p-6 lg:p-8 transition-colors">
            {/* --- Header --- */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Overview</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.fullName}. Here is what's happening today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-[#1a0d36] px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <Server className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">System Status: All Operational</span>
                </div>
            </div>

            {/* --- KPI Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics.totalUsers}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics.pendingApprovals}</h3>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Exams</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metrics.activeExams}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${metrics.monthlyRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* --- Main Charts Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* User Growth Line Chart */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">User Registration Growth</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.userGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '8px' }} />
                                <Legend />
                                <Line type="monotone" dataKey="students" name="Students" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="educators" name="Educators" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Role Distribution Pie Chart */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Role Distribution</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={charts.roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {charts.roleDistribution.map((entry, index) => {
                                        // Assign colors based on role name
                                        const color = entry.name === 'STUDENT' ? '#8b5cf6' : entry.name === 'INSTRUCTOR' ? '#10b981' : '#f59e0b';
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '8px' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- Educator Approval Queue Table --- */}
            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-purple-900/30 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Educator Approval Queue</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and approve new educator registrations.</p>
                    </div>
                    <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 py-1 px-3 rounded-full text-xs font-bold">
                        {pendingEducators.length} Pending
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#150a29] text-gray-500 dark:text-gray-400 text-sm">
                                <th className="py-4 px-6 font-semibold">Name</th>
                                <th className="py-4 px-6 font-semibold">Email</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {pendingEducators.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        No pending educators to review.
                                    </td>
                                </tr>
                            ) : (
                                pendingEducators.map((edu) => (
                                    <tr key={edu.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900 dark:text-white">{edu.name}</div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{edu.email}</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReject(edu.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(edu.id)}
                                                    className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Approve"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    }
</DashboardLayout>
    );
}



 