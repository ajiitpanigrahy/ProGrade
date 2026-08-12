import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, Shield, Mail, Save, MonitorStop, Bell } from 'lucide-react';
import { adminService } from '../../../features/admin/adminService';
import Loader3D from '../../../components/Loader3D';

export default function GovernanceTab() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State mapped exactly to backend Entity
    const [config, setConfig] = useState({
        maintenanceMode: false,
        adminBypass: true,
        maintenanceMessage: '',
        jwtExpiryMinutes: 1440,
        maxConcurrentLogins: 1,
        idleTimeoutMinutes: 30,
        globalProctoringAggression: true,
        maxTabSwitchesAllowed: 3,
        disableCopyPaste: true,
        senderEmail: '',
        alertAdminOnViolation: true
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminService.getSettings();
                setConfig(data);
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (field: string, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await adminService.updateSettings(config);
            // Show success toast here if you have one
        } catch (err) {
            console.error("Failed to save settings", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="h-64 flex justify-center items-center"><Loader3D text="LOADING CONFIGURATION..." /></div>;
    }

    // Helper Component for iOS-style Toggles
    const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
        <button 
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl pb-24">
            
            <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Governance</h2>
                    <p className="text-sm text-gray-500">Global configurations, anti-cheat guards, and system kill-switches.</p>
                </div>
            </div>

            {/* 2-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLUMN 1: Platform Operations */}
                <div className="space-y-6">
                    
                    {/* Card A: System Availability */}
                    <div className={`p-6 rounded-2xl border-2 transition-colors ${config.maintenanceMode ? 'bg-red-50 dark:bg-red-950/20 border-red-500' : 'bg-white dark:bg-[#1a0d36] border-gray-100 dark:border-purple-900/30'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className={`w-6 h-6 ${config.maintenanceMode ? 'text-red-600' : 'text-orange-500'}`} />
                            <h3 className={`text-lg font-bold ${config.maintenanceMode ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>System Availability Module</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0f0a1c] rounded-xl border border-gray-100 dark:border-purple-900/30">
                                <div>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Maintenance Mode</span>
                                    <p className="text-xs text-gray-500 mt-0.5">Locks out non-admin traffic instantly.</p>
                                </div>
                                <button onClick={() => handleChange('maintenanceMode', !config.maintenanceMode)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${config.maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${config.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer p-1">
                                <input type="checkbox" checked={config.adminBypass} onChange={(e) => handleChange('adminBypass', e.target.checked)} className="w-4 h-4 text-purple-600 rounded border-gray-300" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Allow Admin Bypass (Test patches while locked)</span>
                            </label>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Custom Maintenance Banner Message</label>
                                <textarea 
                                    rows={2} 
                                    value={config.maintenanceMessage} 
                                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                    disabled={!config.maintenanceMode}
                                    className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 dark:text-white disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card D: System Email Setup */}
                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">System Email Setup</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Sender Identification Email</label>
                                <input type="email" value={config.senderEmail} onChange={(e) => handleChange('senderEmail', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 dark:text-white" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0f0a1c] rounded-xl border border-gray-100 dark:border-purple-900/30">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Alert Admin on Fraud Flags</span>
                                <ToggleSwitch checked={config.alertAdminOnViolation} onChange={() => handleChange('alertAdminOnViolation', !config.alertAdminOnViolation)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Security & Governance */}
                <div className="space-y-6">
                    
                    {/* Card B: Security & Session Controls */}
                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security & Session Controls</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">JWT Expiry (Minutes)</span>
                                <input type="number" value={config.jwtExpiryMinutes} onChange={(e) => handleChange('jwtExpiryMinutes', parseInt(e.target.value))}
                                    className="w-32 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-3 py-1 text-sm text-right focus:outline-none focus:border-purple-500 dark:text-white" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Max Devices per User</span>
                                <select value={config.maxConcurrentLogins} onChange={(e) => handleChange('maxConcurrentLogins', parseInt(e.target.value))}
                                    className="w-32 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500 dark:text-white">
                                    <option value={1}>1 Session</option>
                                    <option value={2}>2 Sessions</option>
                                    <option value={0}>Unlimited</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <span>Idle Timeout Cleanup</span>
                                    <span className="text-purple-600 dark:text-purple-400">{config.idleTimeoutMinutes} Mins</span>
                                </div>
                                <input type="range" min="5" max="120" step="5" value={config.idleTimeoutMinutes} onChange={(e) => handleChange('idleTimeoutMinutes', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-900/30 accent-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Card C: Assessment Default Rules */}
                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <MonitorStop className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assessment Default Rules</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0f0a1c] rounded-xl border border-gray-100 dark:border-purple-900/30">
                                <div>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Anti-Cheat Guards</span>
                                    <p className="text-[10px] text-gray-500">Master switch for frontend proctoring.</p>
                                </div>
                                <ToggleSwitch checked={config.globalProctoringAggression} onChange={() => handleChange('globalProctoringAggression', !config.globalProctoringAggression)} />
                            </div>
                            
                            <div className="flex justify-between items-center opacity-90">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Max Tab Switches Allowed</span>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="0" max="10" value={config.maxTabSwitchesAllowed} onChange={(e) => handleChange('maxTabSwitchesAllowed', parseInt(e.target.value))}
                                        className="w-16 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-purple-500 dark:text-white" />
                                    <span className="text-xs text-gray-500">Warnings</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between opacity-90">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Block Clipboard (Copy/Paste)</span>
                                <ToggleSwitch checked={config.disableCopyPaste} onChange={() => handleChange('disableCopyPaste', !config.disableCopyPaste)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 dark:bg-[#0f0a1c]/80 backdrop-blur-md border-t border-gray-200 dark:border-purple-900/50 p-4 px-8 z-40 flex justify-end gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <button className="px-6 py-2 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-900/20 transition-colors">
                    Cancel Changes
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-purple-500/20"
                >
                    {isSaving ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Settings</>}
                </button>
            </div>
        </div>
    );
}