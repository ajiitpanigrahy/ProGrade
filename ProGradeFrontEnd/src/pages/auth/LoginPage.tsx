import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Wrench, AlertCircle, Clock } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../features/auth/authService';

export default function Login() {
    const location = useLocation();
    const isAdminBypass = new URLSearchParams(location.search).get('bypass') === 'true';

    // --- System Maintenance State ---
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceMsg, setMaintenanceMsg] = useState('');

    // --- Form & UI State ---
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 🌟 New State for Unverified Educator Modal
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Fetch system status silently on mount
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
                } else {
                    console.error("Could not verify system status:", error);
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

            if (!token || !userData.email) {
                throw new Error("Invalid response from server.");
            }

            // TRIGGER VERIFICATION MODAL IF EDUCATOR IS NOT APPROVED
            if (userData.role === 'EDUCATOR' && userData.isApproved === false) {
                setIsVerificationModalOpen(true);
                setIsLoading(false);
                return; // ⛔ Abort login process
            }

            // Proceed with login
            login(token, userData, rememberMe);

            if (userData.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (userData.role === 'EDUCATOR') {
                navigate('/educator/dashboard');
            } else {
                navigate('/student/dashboard');
            }

        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.response?.data || err?.message || 'Invalid credentials.';
            const upperStr = typeof errorMessage === 'string' ? errorMessage.toUpperCase() : '';

            // 🌟 1. ULTIMATE FAILSAFE: If maintenance mode is active on the UI, force the maintenance error.
            if (isMaintenance && !isAdminBypass) {
                setError(`Access Restricted: System is in Maintenance Mode. Administrators only.`);
            }
            // 🌟 2. STRICT EDUCATOR CHECK: Only triggers if the backend explicitly sends "PENDING VERIFICATION"
            else if (upperStr.includes("PENDING VERIFICATION")) {
                setIsVerificationModalOpen(true);
            }
            // 🌟 3. CATCH OTHER ACCOUNT RESTRICTIONS (Banned students, locked accounts, etc.)
            else if (upperStr.includes("DISABLED") || upperStr.includes("LOCKED")) {
                setError("Your account is currently disabled or restricted.");
            }
            // 4. NORMAL ERRORS (Bad password, etc.)
            else {
                setError(typeof errorMessage === 'string' ? errorMessage : "Invalid credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back to Pro Grade."
            subtitle="Sign in to access your dashboard, review assessments, and manage your technical evaluations."
        >
            <div className="text-center lg:text-left mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                        Register here
                    </Link>
                </p>
            </div>

            {/* NATIVE SYSTEM MAINTENANCE NOTICE BOX */}
            {isMaintenance && (
                <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-amber-500/10 dark:from-amber-950/40 dark:via-[#1a0d36] dark:to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-sm transition-all">
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

            <div className="bg-white dark:bg-[#1a0d36] py-8 px-6 shadow-xl sm:rounded-2xl border border-gray-100 dark:border-purple-900/30 transition-colors duration-300">
                <form className="space-y-6" onSubmit={handleLogin}>

                    {/* Styled Error Banner */}
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 transition-colors">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{error}</span>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                            Email address
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:ring-purple-600 focus:border-transparent sm:text-sm text-gray-900 dark:text-white transition-all outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                            Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:ring-purple-600 focus:border-transparent sm:text-sm text-gray-900 dark:text-white transition-all outline-none"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-900/50 rounded cursor-pointer dark:bg-[#0f0a1c]"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors cursor-pointer">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {/* 🌟 Login Button (Unblocked!) */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ACCOUNT UNDER REVIEW MODAL (For Unverified Educators) */}
            {isVerificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 px-4">
                    <div className="bg-white dark:bg-[#1a0d36] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/50 max-w-md w-full text-center relative overflow-hidden transform transition-all scale-100">

                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                        {/* Icon */}
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-800/30">
                            <Clock className="w-10 h-10" />
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                            Account Under Review
                        </h3>

                        {/* Body Text */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Your educator profile is currently being reviewed by our administration team.
                            You will receive an email notification once your account has been verified and granted access.
                        </p>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsVerificationModalOpen(false)}
                            className="w-full py-3.5 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}