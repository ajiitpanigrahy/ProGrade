import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Wrench, AlertCircle, Clock, GraduationCap, User } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../features/auth/authService';

export default function Login() {
    const location = useLocation();
    const isAdminBypass = new URLSearchParams(location.search).get('bypass') === 'true';
    const isPendingApproval = new URLSearchParams(location.search).get('bypass') === 'pending';

    const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceMsg, setMaintenanceMsg] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 🌟 Added OAuth Role State
    const [oauthRole, setOauthRole] = useState<'STUDENT' | 'EDUCATOR'>('STUDENT');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(isPendingApproval);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyStatus = async () => {
            try {
                const response = await authService.checkSystemStatus();
                if (response?.maintenanceMode && !isAdminBypass) {
                    setIsMaintenance(true);
                    setMaintenanceMsg(response.message);
                }
            } catch (error: any) {
                if (error.response && error.response.status === 503 && !isAdminBypass) {
                    setIsMaintenance(true);
                    setMaintenanceMsg(error.response.data?.message || "Platform upgrades are currently in progress.");
                }
            }
        };
        verifyStatus();
    }, [isAdminBypass]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.login({ email, password });
            const token = response.token;

            const userData = {
                fullName: response.fullName,
                email: response.email,
                role: response.role,
                isApproved: response.isApproved,
                profilePictureUrl: response.profilePictureUrl,
                phoneNumber: response.phoneNumber,
                gender: response.gender,
                highestQualification: response.highestQualification
            };

            if (!token || !userData.email) throw new Error("Invalid response from server.");

            if (userData.role === 'EDUCATOR' && userData.isApproved === false) {
                setIsVerificationModalOpen(true);
                setIsLoading(false);
                return; 
            }

            login(token, userData, rememberMe);

            if (userData.role === 'ADMIN') navigate('/admin/dashboard');
            else if (userData.role === 'EDUCATOR') navigate('/educator/dashboard');
            else navigate('/student/dashboard');

        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.response?.data || err?.message || 'Invalid credentials.';
            const upperStr = typeof errorMessage === 'string' ? errorMessage.toUpperCase() : '';

            if (isMaintenance && !isAdminBypass) setError(`Access Restricted: System is in Maintenance Mode. Administrators only.`);
            else if (upperStr.includes("PENDING VERIFICATION")) setIsVerificationModalOpen(true);
            else if (upperStr.includes("DISABLED") || upperStr.includes("LOCKED")) setError("Your account is currently disabled or restricted.");
            else setError(typeof errorMessage === 'string' ? errorMessage : "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSSORedirect = (provider: 'google' | 'github') => {
        document.cookie = `OAUTH_ROLE=${oauthRole}; path=/; max-age=300; SameSite=Lax`; 
        
        // Dynamically route to localhost OR Render based on the environment.
        const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:2406').replace('/api/v1', '');
        window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
    };

    return (
        <AuthLayout title="Welcome back to Pro Grade." subtitle="Sign in to access your dashboard, review assessments, and manage your technical evaluations.">
            <div className="text-center lg:text-left mb-8 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                    Welcome back.
                </h2>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                        Register here
                    </Link>
                </p>
            </div>

            {isMaintenance && (
                <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-amber-500/10 dark:from-amber-950/40 dark:via-[#1a0d36] dark:to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-sm transition-all animate-in zoom-in-95">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5 border border-amber-500/30">
                            <Wrench className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">System Maintenance Active</h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                                    Login Paused
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                {maintenanceMsg || "Platform upgrades are currently in progress. Standard user logins are temporarily paused; administrative access remains active."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white/50 dark:bg-[#1a0d36]/50 backdrop-blur-xl p-8 shadow-2xl rounded-3xl border border-gray-100 dark:border-purple-900/50 animate-in fade-in zoom-in-95">
                <form className="space-y-5" onSubmit={handleLogin}>

                    {error && (
                        <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                            Email address
                        </label>
                        <div className="relative rounded-2xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email" name="email" type="email" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-2xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-4 focus:ring-purple-600/10 focus:border-purple-500 sm:text-sm text-gray-900 dark:text-white transition-all outline-none font-medium"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                            Password
                        </label>
                        <div className="relative rounded-2xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password" name="password" type={showPassword ? 'text' : 'password'} required
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-2xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-4 focus:ring-purple-600/10 focus:border-purple-500 sm:text-sm text-gray-900 dark:text-white transition-all outline-none font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center">
                            <input
                                id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-2 border-gray-300 dark:border-purple-900/50 rounded cursor-pointer dark:bg-[#0f0a1c]"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-gray-600 dark:text-gray-400 cursor-pointer">
                                Remember me
                            </label>
                        </div>
                        <Link to="/forgot-password" className="text-xs font-bold text-purple-600 hover:text-purple-500 dark:text-purple-400 transition-colors cursor-pointer">
                            Forgot password?
                        </Link>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit" disabled={isLoading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-purple-600/20 text-sm font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer tracking-wider"
                        >
                            {isLoading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
                        </button>
                    </div>
                </form>

                {/* 🌟 GOOGLE & GITHUB SSO INTEGRATION WITH ROLE SELECTOR */}
                <div className="mt-8">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-100 dark:border-purple-900/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-[#1a0d36] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[10px]">Or continue with</span>
                        </div>
                    </div>

                    {/* 🌟 Role Toggle Switch */}
                    <div className="bg-gray-100 dark:bg-[#0f0a1c] p-1.5 rounded-xl flex items-center justify-between mb-4 border border-gray-200 dark:border-purple-900/50">
                        <button
                            type="button"
                            onClick={() => setOauthRole('STUDENT')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                oauthRole === 'STUDENT' 
                                    ? 'bg-white dark:bg-[#1a0d36] text-purple-600 shadow-sm border border-gray-200 dark:border-purple-900/50' 
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <User className="w-3.5 h-3.5" /> Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setOauthRole('EDUCATOR')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                oauthRole === 'EDUCATOR' 
                                    ? 'bg-white dark:bg-[#1a0d36] text-purple-600 shadow-sm border border-gray-200 dark:border-purple-900/50' 
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <GraduationCap className="w-3.5 h-3.5" /> Educator
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleSSORedirect('google')}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 border-2 border-gray-200 dark:border-purple-900/50 rounded-2xl shadow-sm text-xs font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0f0a1c] hover:bg-gray-50 dark:hover:bg-purple-900/30 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            GOOGLE
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSSORedirect('github')}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 border-2 border-gray-200 dark:border-purple-900/50 rounded-2xl shadow-sm text-xs font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0f0a1c] hover:bg-gray-50 dark:hover:bg-purple-900/30 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GITHUB
                        </button>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {isVerificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 px-4">
                    <div className="bg-white dark:bg-[#1a0d36] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/50 max-w-md w-full text-center relative overflow-hidden">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-800/30">
                            <Clock className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Account Under Review</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Your educator profile is currently being reviewed by our administration team. You will receive an email notification once your account has been verified.
                        </p>
                        <button onClick={() => { setIsVerificationModalOpen(false); navigate('/login'); }} className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer">
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}