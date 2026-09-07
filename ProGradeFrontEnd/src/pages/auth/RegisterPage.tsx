import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Clock, User, AlertCircle, CheckCircle2, GraduationCap, Briefcase, Info, CheckCircle, Wrench, RefreshCcw } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { authService } from '../../features/auth/authService';

export default function Register() {
    // --- System Maintenance State ---
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceMsg, setMaintenanceMsg] = useState('');

    // Role State (Student or Educator)
    const [role, setRole] = useState<'STUDENT' | 'EDUCATOR'>('STUDENT');

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI & API State
    const [visibleField, setVisibleField] = useState<'none' | 'password' | 'confirm'>('none');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const navigate = useNavigate();

    // Fetch system status silently on mount
    useEffect(() => {
        const verifyStatus = async () => {
            try {
                const response = await authService.checkSystemStatus();
                if (response?.maintenanceMode) {
                    setIsMaintenance(true);
                    setMaintenanceMsg(response.message);
                }
            } catch (error: any) {
                if (error.response && error.response.status === 503) {
                    setIsMaintenance(true);
                    setMaintenanceMsg(error.response.data?.message || "Platform upgrades are currently in progress.");
                } else {
                    console.error("Could not verify system status:", error);
                }
            }
        };
        verifyStatus();
    }, []);

    // --- Validation Logic ---
    const validateFullName = (value: string) => {
        if (!value) return 'Full Name is required.';
        if (value.length < 3) return 'Name must be at least 3 characters long.';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Name can only contain letters and spaces.';
        return '';
    };

    const validateEmail = (value: string) => {
        if (!value) return 'Email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address.';
        return '';
    };

    const validatePassword = (value: string) => {
        if (!value) return 'Password is required.';
        if (value.length < 8 || value.length > 16) return 'Between 8 and 16 characters.';
        if (!/[a-zA-Z]/.test(value)) return 'Must contain at least one letter.';
        if (!/\d/.test(value)) return 'Must contain at least one number.';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Must contain at least one symbol.';
        return '';
    };

    const validateConfirmPassword = (confirmVal: string, passVal: string) => {
        if (!confirmVal) return 'Please confirm your password.';
        if (confirmVal !== passVal) return 'Passwords do not match.';
        return '';
    };

    // Validation Errors State
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // --- Input Handlers ---
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setFullName(val);
        setErrors(prev => ({ ...prev, fullName: validateFullName(val) }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase();
        setEmail(val);
        setErrors(prev => ({ ...prev, email: validateEmail(val) }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPassword(val);
        setErrors(prev => ({
            ...prev,
            password: validatePassword(val),
            confirmPassword: confirmPassword ? validateConfirmPassword(confirmPassword, val) : ''
        }));
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setConfirmPassword(val);
        setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(val, password) }));
    };

    // 🌟 Form Reset Logic
    const handleReset = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({ fullName: '', email: '', password: '', confirmPassword: '' });
        setError('');
        setVisibleField('none');
    };

    // --- Password Strength Meter Logic ---
    const getPasswordStrength = () => {
        if (!password) return { label: '', color: 'bg-gray-200 dark:bg-gray-700', width: 'w-0', textColor: 'text-gray-500' };

        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8 && password.length <= 16;

        if (!isLongEnough) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
        if (hasLetters && hasNumbers && hasSymbols) return { label: 'Excellent', color: 'bg-emerald-500', width: 'w-full', textColor: 'text-emerald-500' };
        if (hasLetters && hasNumbers) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/4', textColor: 'text-amber-500' };
        if (hasLetters || hasNumbers) return { label: 'Easy', color: 'bg-orange-500', width: 'w-1/3', textColor: 'text-orange-500' };

        return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
    };

    const strength = getPasswordStrength();

    // --- Form Submission ---
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const payload = { fullName, email, password, role };
            await authService.register(payload);
            setIsSuccessModalOpen(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.response?.data || err?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Join Pro Grade today."
            subtitle="Create an account to start experiencing secure, AI-driven technical assessments."
        >
            <div className="text-center lg:text-left mb-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                    Create your account
                </h2>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>

            {/* NATIVE SYSTEM MAINTENANCE NOTICE BOX */}
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
                                    Signup Paused
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                {maintenanceMsg || "Platform upgrades are currently in progress. New user registrations are temporarily paused."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white/50 dark:bg-[#1a0d36]/50 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-3xl border border-gray-100 dark:border-purple-900/50 transition-colors duration-300 animate-in fade-in zoom-in-95">

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 font-medium">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{error}</span>
                    </div>
                )}

                {/* ROLE SELECTION TOGGLE */}
                <div className="mb-8">
                    <div className="flex p-1.5 bg-gray-100 dark:bg-[#0f0a1c] rounded-2xl border border-gray-200 dark:border-purple-900/50">
                        {/* 🌟 Cursor-pointer added */}
                        <button
                            type="button"
                            onClick={() => setRole('STUDENT')}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${role === 'STUDENT'
                                    ? 'bg-white dark:bg-[#1a0d36] text-purple-600 dark:text-purple-400 shadow-sm border border-gray-200 dark:border-purple-900/50'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Student
                        </button>
                        {/* 🌟 Cursor-pointer added */}
                        <button
                            type="button"
                            onClick={() => setRole('EDUCATOR')}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${role === 'EDUCATOR'
                                    ? 'bg-white dark:bg-[#1a0d36] text-purple-600 dark:text-purple-400 shadow-sm border border-gray-200 dark:border-purple-900/50'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            Educator
                        </button>
                    </div>

                    {role === 'EDUCATOR' && (
                        <div className="mt-4 flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-purple-800 dark:text-purple-300 leading-relaxed">
                                Educator accounts require manual verification by the administration team before you can create and publish assessments.
                            </p>
                        </div>
                    )}
                </div>

                <form className="space-y-5" onSubmit={handleRegister}>
                    {/* Full Name Field */}
                    <div>
                        <label htmlFor="fullName" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-2xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={handleNameChange}
                                className={`block w-full pl-11 pr-10 py-3.5 bg-gray-50 dark:bg-[#0f0a1c] border-2 ${errors.fullName && fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600/10 focus:border-purple-500'} rounded-2xl focus:bg-white dark:focus:bg-[#150a29] sm:text-sm text-gray-900 dark:text-white transition-all outline-none font-medium`}
                                placeholder="JOHN DOE"
                            />
                            {fullName && !errors.fullName && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                </div>
                            )}
                        </div>
                        {errors.fullName && fullName && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.fullName}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors">
                            Email address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-2xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                className={`block w-full pl-11 pr-10 py-3.5 bg-gray-50 dark:bg-[#0f0a1c] border-2 ${errors.email && email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600/10 focus:border-purple-500'} rounded-2xl focus:bg-white dark:focus:bg-[#150a29] sm:text-sm text-gray-900 dark:text-white transition-all outline-none font-medium`}
                                placeholder="you@example.com"
                            />
                            {email && !errors.email && (
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                </div>
                            )}
                        </div>
                        {errors.email && email && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-2xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="password"
                                type={visibleField === 'password' ? 'text' : 'password'}
                                required
                                maxLength={16}
                                value={password}
                                onChange={handlePasswordChange}
                                className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#0f0a1c] border-2 ${errors.password && password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600/10 focus:border-purple-500'} rounded-2xl focus:bg-white dark:focus:bg-[#150a29] sm:text-sm text-gray-900 dark:text-white transition-all outline-none font-medium`}
                                placeholder="8-16 chars, alpha-numeric & symbol"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                                onClick={() => setVisibleField(visibleField === 'password' ? 'none' : 'password')}
                            >
                                {visibleField === 'password' ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && password && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</p>}

                        {/* Password Strength Meter */}
                        {password && (
                            <div className="mt-3">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Password Strength</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${strength.textColor}`}>{strength.label}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-[#0f0a1c] rounded-full h-1.5 transition-all overflow-hidden border border-gray-100 dark:border-purple-900/30">
                                    <div className={`${strength.color} h-full rounded-full transition-all duration-300 ${strength.width}`}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 transition-colors">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-2xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="confirmPassword"
                                type={visibleField === 'confirm' ? 'text' : 'password'}
                                required
                                maxLength={16}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#0f0a1c] border-2 ${errors.confirmPassword && confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600/10 focus:border-purple-500'} rounded-2xl focus:bg-white dark:focus:bg-[#150a29] sm:text-sm text-gray-900 dark:text-white transition-all outline-none font-medium`}
                                placeholder="Repeat your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                                onClick={() => setVisibleField(visibleField === 'confirm' ? 'none' : 'confirm')}
                            >
                                {visibleField === 'confirm' ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && confirmPassword && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{errors.confirmPassword}</p>}
                        {!errors.confirmPassword && confirmPassword && (
                            <p className="mt-2 text-xs font-bold text-emerald-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Passwords match</p>
                        )}
                    </div>

                    {/* 🌟 ACTION BUTTONS: Reset & Submit */}
                    <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full sm:w-1/3 flex justify-center items-center gap-2 py-3.5 px-4 border-2 border-gray-200 dark:border-purple-900/50 rounded-2xl text-xs font-black tracking-widest uppercase text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-purple-900/30 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <RefreshCcw className="w-4 h-4" /> Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isMaintenance || !!(errors.fullName || errors.email || errors.password || errors.confirmPassword) || !fullName || !email || !password || !confirmPassword}
                            className="w-full sm:w-2/3 flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-purple-600/20 text-xs font-black uppercase text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-800 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-600/20 transition-all active:scale-[0.98] cursor-pointer tracking-widest"
                        >
                            {isMaintenance
                                ? 'REGISTRATIONS PAUSED'
                                : isLoading
                                    ? 'CREATING ACCOUNT...'
                                    : `CREATE ${role} ACCOUNT`}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- DYNAMIC SUCCESS POPUP MODAL --- */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300 px-4">
                    <div className="bg-white dark:bg-[#1a0d36] p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-purple-900/50 max-w-md w-full text-center relative overflow-hidden transform transition-all scale-100">
                        
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                        {/* Dynamic Icon */}
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/20 ${
                            role === 'EDUCATOR' 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30' 
                            : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
                        }`}>
                            {role === 'EDUCATOR' ? <Clock className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
                        </div>
                        
                        {/* Dynamic Title */}
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                            {role === 'EDUCATOR' ? 'Application Submitted!' : 'Registration Complete! 🎉'}
                        </h3>
                        
                        {/* Dynamic Body Text */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                            {role === 'EDUCATOR' ? (
                                <>Thank you for joining Pro Grade, <strong className="text-gray-900 dark:text-white">{fullName.split(' ')[0]}</strong>! Your educator account is currently <strong>under review</strong> by our administration team. You will receive an email once your account is verified and ready for access.</>
                            ) : (
                                <>Welcome to Pro Grade, <strong className="text-gray-900 dark:text-white">{fullName.split(' ')[0]}</strong>! Your student account has been created successfully. You can now sign in to access your technical assessments.</>
                            )}
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 px-4 rounded-xl text-xs font-black tracking-widest uppercase text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            Proceed to Login
                        </button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}