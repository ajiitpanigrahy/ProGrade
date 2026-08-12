import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Ban, Edit, MoreVertical } from 'lucide-react';

export default function EducatorHubTab({ pendingEducators }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-[#1a0d36] p-4 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Name or Email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending Review</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </div>

            {/* High-Density Data Grid */}
            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                <th className="py-4 px-6 font-semibold cursor-pointer hover:text-purple-500">Educator Name</th>
                                <th className="py-4 px-6 font-semibold">Primary Specialty</th>
                                <th className="py-4 px-6 font-semibold cursor-pointer hover:text-purple-500">Questions Contributed</th>
                                <th className="py-4 px-6 font-semibold">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            
                            {/* Render Pending Educators First */}
                            {pendingEducators.map((edu: any) => (
                                <tr key={edu.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors bg-orange-50/50 dark:bg-orange-900/10">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-gray-900 dark:text-white">{edu.name}</div>
                                        <div className="text-xs text-gray-500">{edu.email}</div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">Awaiting Profile Setup</td>
                                    <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">0</td>
                                    <td className="py-4 px-6">
                                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold rounded-md">PENDING</span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors">Approve</button>
                                            <button className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-bold transition-colors">Deny</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Mock Active Educator (Shows what it looks like after approval) */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="font-bold text-gray-900 dark:text-white">James Gosling</div>
                                    <div className="text-xs text-gray-500">james.g@prograde.edu</div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">Java Full Stack</td>
                                <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">412</td>
                                <td className="py-4 px-6">
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-md">ACTIVE</span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex justify-end gap-2 text-gray-400">
                                        <button className="p-1.5 hover:text-purple-500 transition-colors" title="Edit Permissions"><Edit className="w-4 h-4" /></button>
                                        <button className="p-1.5 hover:text-red-500 transition-colors" title="Suspend Account"><Ban className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}