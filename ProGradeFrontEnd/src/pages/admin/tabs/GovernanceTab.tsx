import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Mail, Save, MonitorStop, Activity, Lock, Unlock } from 'lucide-react';
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
            // Optionally add a toast notification here
        } catch (err) {
            console.error("Failed to save settings", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="h-64 flex justify-center items-center"><Loader3D text="LOADING GOVERNANCE ENGINE..." /></div>;
    }

    // 🌟 UPGRADED: 3D Glowing Toggle Switch
    const ToggleSwitch = ({ checked, onChange, disabled = false, isDanger = false }: { checked: boolean, onChange: () => void, disabled?: boolean, isDanger?: boolean }) => (
        <button 
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none shadow-inner disabled:opacity-50 disabled:cursor-not-allowed
                ${checked 
                    ? (isDanger ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.6)]' : 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]') 
                    : 'bg-gray-300 dark:bg-gray-700'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-spring ${checked ? 'translate-x-8' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="relative space-y-6 animate-in fade-in duration-700 max-w-7xl pb-32">
            
            {/* 🌟 AMBIENT 3D BACKGROUND EFFECTS */}
            <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-8 bg-white/50 dark:bg-[#150a29]/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/20 dark:border-purple-900/30 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] shrink-0 transform hover:scale-105 transition-transform duration-300">
                    <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">System Governance</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-purple-200/70 mt-1 max-w-2xl leading-relaxed">Master control panel for global configurations, anti-cheat AI guards, and emergency system kill-switches.</p>
                </div>
            </div>

            {/* 2-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                
                {/* COLUMN 1: Platform Operations */}
                <div className="space-y-6 sm:space-y-8">
                    
                    {/* Card A: System Availability (DANGER ZONE) */}
                    <div className={`relative overflow-hidden p-6 sm:p-8 rounded-[2rem] border-2 transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl backdrop-blur-xl
                        ${config.maintenanceMode 
                            ? 'bg-red-50/90 dark:bg-red-950/40 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.15)]' 
                            : 'bg-white/80 dark:bg-[#150a29]/80 border-gray-100 dark:border-purple-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
                        
                        {config.maintenanceMode && (
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner shrink-0 transition-colors ${config.maintenanceMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-orange-500/10 border border-orange-500/20'}`}>
                                <AlertTriangle className={`w-6 h-6 ${config.maintenanceMode ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-black tracking-tight ${config.maintenanceMode ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>Availability Module</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">{config.maintenanceMode ? 'EMERGENCY LOCKDOWN ACTIVE' : 'SYSTEM ONLINE'}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                <div>
                                    <span className="text-sm font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        {config.maintenanceMode ? <Lock className="w-4 h-4 text-red-500"/> : <Unlock className="w-4 h-4 text-emerald-500"/>} 
                                        Maintenance Mode
                                    </span>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Locks out non-admin traffic instantly.</p>
                                </div>
                                <ToggleSwitch isDanger checked={config.maintenanceMode} onChange={() => handleChange('maintenanceMode', !config.maintenanceMode)} />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/50 dark:bg-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-purple-900/30">
                                <input type="checkbox" checked={config.adminBypass} onChange={(e) => handleChange('adminBypass', e.target.checked)} className="w-5 h-5 text-purple-600 rounded border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:ring-purple-500 focus:ring-offset-0 cursor-pointer transition-all" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Allow Admin Bypass <span className="font-normal opacity-70">(Test patches while locked)</span></span>
                            </label>

                            <div className={`transition-all duration-300 ${config.maintenanceMode ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Custom Maintenance Banner</label>
                                <textarea 
                                    rows={3} 
                                    placeholder="e.g., We are currently upgrading the database. Be back in 15 mins!"
                                    value={config.maintenanceMessage} 
                                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                    disabled={!config.maintenanceMode}
                                    className="w-full bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-red-500 dark:focus:border-red-500 dark:text-white disabled:cursor-not-allowed shadow-inner resize-none font-medium custom-scrollbar transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card D: System Email Setup */}
                    <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-purple-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl transition-all duration-500 group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">System Communication</h3>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Official Sender Email</label>
                                <input type="email" placeholder="noreply@prograde.com" value={config.senderEmail} onChange={(e) => handleChange('senderEmail', e.target.value)}
                                    className="w-full bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 dark:text-white shadow-inner font-medium cursor-text transition-all" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">Alert Admin on Fraud Flags</span>
                                <ToggleSwitch checked={config.alertAdminOnViolation} onChange={() => handleChange('alertAdminOnViolation', !config.alertAdminOnViolation)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Security & Governance */}
                <div className="space-y-6 sm:space-y-8">
                    
                    {/* Card B: Security & Session Controls */}
                    <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-purple-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl transition-all duration-500 group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Security & Sessions</h3>
                        </div>
                        
                        <div className="space-y-5">
                            <div className="flex justify-between items-center p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">JWT Expiry Time</span>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="1" value={config.jwtExpiryMinutes} onChange={(e) => handleChange('jwtExpiryMinutes', parseInt(e.target.value))}
                                        className="w-20 bg-gray-50 dark:bg-[#150a29] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-1.5 text-sm font-black text-center focus:outline-none focus:border-purple-500 dark:text-white shadow-inner cursor-text transition-all" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mins</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">Concurrent Logins</span>
                                <select value={config.maxConcurrentLogins} onChange={(e) => handleChange('maxConcurrentLogins', parseInt(e.target.value))}
                                    className="w-36 bg-gray-50 dark:bg-[#150a29] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-2 text-sm font-black focus:outline-none focus:border-purple-500 dark:text-white shadow-inner cursor-pointer appearance-none text-center transition-all">
                                    <option value={1}>1 Session</option>
                                    <option value={2}>2 Sessions</option>
                                    <option value={3}>3 Sessions</option>
                                    <option value={0}>Unlimited</option>
                                </select>
                            </div>

                            <div className="p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-sm font-black text-gray-800 dark:text-gray-200 block">Idle Timeout Cleanup</span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Auto-logout duration</span>
                                    </div>
                                    <span className="text-base font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-800/50 shadow-sm">{config.idleTimeoutMinutes} M</span>
                                </div>
                                <input type="range" min="5" max="120" step="5" value={config.idleTimeoutMinutes} onChange={(e) => handleChange('idleTimeoutMinutes', parseInt(e.target.value))}
                                    className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer dark:bg-gray-800 accent-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Card C: Assessment Default Rules */}
                    <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-purple-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl transition-all duration-500 group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <MonitorStop className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Assessment Guards</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                                <div>
                                    <span className="text-sm font-black text-gray-800 dark:text-gray-200 block">AI Anti-Cheat Aggression</span>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Master switch for proctoring</p>
                                </div>
                                <ToggleSwitch checked={config.globalProctoringAggression} onChange={() => handleChange('globalProctoringAggression', !config.globalProctoringAggression)} />
                            </div>
                            
                            <div className="flex justify-between items-center p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">Max Tab Switches Allowed</span>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="0" max="10" value={config.maxTabSwitchesAllowed} onChange={(e) => handleChange('maxTabSwitchesAllowed', parseInt(e.target.value))}
                                        className="w-16 bg-gray-50 dark:bg-[#150a29] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-2 py-1.5 text-sm font-black text-center focus:outline-none focus:border-emerald-500 dark:text-white shadow-inner cursor-text transition-all" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0f0a1c] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">Block Clipboard (Copy/Paste)</span>
                                <ToggleSwitch checked={config.disableCopyPaste} onChange={() => handleChange('disableCopyPaste', !config.disableCopyPaste)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🌟 UPGRADED: FLOATING BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/70 dark:bg-[#0a0514]/70 backdrop-blur-2xl border-t border-gray-200 dark:border-purple-900/50 p-4 px-6 sm:px-10 z-40 flex flex-col-reverse sm:flex-row justify-end items-center gap-3 sm:gap-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-900/30 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-purple-800">
                    Discard Changes
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:from-purple-400 disabled:to-fuchsia-400 text-white px-10 py-3.5 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-0.5 active:scale-95 cursor-pointer uppercase tracking-widest text-sm"
                >
                    {isSaving ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> SYNCHRONIZING...</>
                    ) : (
                        <><Save className="w-5 h-5" /> APPLY SYSTEM CONFIGURATION</>
                    )}
                </button>
            </div>
        </div>
    );
}