import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, GraduationCap, Briefcase, Info, CheckCircle } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { authService } from '../../features/auth/authService'; // <-- ADDED THIS

export default function Register() {
    // Role State (Student or Educator)
    const [role, setRole] = useState<'STUDENT' | 'EDUCATOR'>('STUDENT');

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI & API State (ADDED THESE)
    const [visibleField, setVisibleField] = useState<'none' | 'password' | 'confirm'>('none');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    
    const navigate = useNavigate(); // <-- ADDED THIS

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

    // --- Password Strength Meter Logic ---
    const getPasswordStrength = () => {
        if (!password) return { label: '', color: 'bg-gray-200 dark:bg-gray-700', width: 'w-0', textColor: 'text-gray-500' };
        
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8 && password.length <= 16;

        if (!isLongEnough) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
        if (hasLetters && hasNumbers && hasSymbols) return { label: 'Excellent', color: 'bg-green-500', width: 'w-full', textColor: 'text-green-500' };
        if (hasLetters && hasNumbers) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/4', textColor: 'text-yellow-500' };
        if (hasLetters || hasNumbers) return { label: 'Easy', color: 'bg-orange-500', width: 'w-1/3', textColor: 'text-orange-500' };
        
        return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', textColor: 'text-red-500' };
    };

    const strength = getPasswordStrength();

    // --- FIXED Form Submission ---
   const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        // Send the role exactly as 'EDUCATOR' or 'STUDENT'
        const payload = { fullName, email, password, role };
        
        await authService.register(payload);
        setIsSuccessModalOpen(true);
    } catch (err: any) {
        setError(err?.response?.data || err?.message || 'Registration failed.');
    } finally {
        setIsLoading(false);
    }
};

    return (
        <AuthLayout 
            title="Join Pro Grade today." 
            subtitle="Create an account to start experiencing secure, AI-driven technical assessments."
        >
            <div className="text-center lg:text-left mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
                    Create your account
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="bg-white dark:bg-[#1a0d36] py-8 px-6 shadow-xl sm:rounded-2xl border border-gray-100 dark:border-purple-900/30 transition-colors duration-300">
                
                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* ROLE SELECTION TOGGLE */}
                <div className="mb-6">
                    <div className="flex p-1 bg-gray-100 dark:bg-[#0f0a1c] rounded-xl border border-gray-200 dark:border-purple-900/50">
                        <button
                            type="button"
                            onClick={() => setRole('STUDENT')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                                role === 'STUDENT' 
                                ? 'bg-white dark:bg-[#1a0d36] text-purple-700 dark:text-purple-400 shadow-sm border border-gray-200 dark:border-purple-900/50' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <GraduationCap className="w-5 h-5" />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('EDUCATOR')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                                role === 'EDUCATOR' 
                                ? 'bg-white dark:bg-[#1a0d36] text-purple-700 dark:text-purple-400 shadow-sm border border-gray-200 dark:border-purple-900/50' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <Briefcase className="w-5 h-5" />
                            Educator
                        </button>
                    </div>
                    
                    {role === 'EDUCATOR' && (
                        <div className="mt-3 flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-purple-800 dark:text-purple-300">
                                Educator accounts require manual verification by the administration team before you can create and publish assessments.
                            </p>
                        </div>
                    )}
                </div>

                <form className="space-y-5" onSubmit={handleRegister}>
                    {/* Full Name Field */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={handleNameChange}
                                className={`block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#0f0a1c] border ${errors.fullName && fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600'} rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:border-transparent sm:text-sm text-gray-900 dark:text-white transition-all outline-none`}
                                placeholder="JOHN DOE"
                            />
                            {fullName && !errors.fullName && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                            )}
                        </div>
                        {errors.fullName && fullName && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.fullName}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                            Email address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                className={`block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#0f0a1c] border ${errors.email && email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600'} rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:border-transparent sm:text-sm text-gray-900 dark:text-white transition-all outline-none`}
                                placeholder="you@example.com"
                            />
                            {email && !errors.email && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                            )}
                        </div>
                        {errors.email && email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="password"
                                type={visibleField === 'password' ? 'text' : 'password'}
                                required
                                maxLength={16}
                                value={password}
                                onChange={handlePasswordChange}
                                className={`block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#0f0a1c] border ${errors.password && password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600'} rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:border-transparent sm:text-sm text-gray-900 dark:text-white transition-all outline-none`}
                                placeholder="8-16 chars, alpha-numeric & symbol"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                                onClick={() => setVisibleField(visibleField === 'password' ? 'none' : 'password')}
                            >
                                {visibleField === 'password' ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.password && password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.password}</p>}
                        
                        {/* Password Strength Meter */}
                        {password && (
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Password Strength</span>
                                    <span className={`text-xs font-bold ${strength.textColor}`}>{strength.label}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 transition-all">
                                    <div className={`${strength.color} h-1.5 rounded-full transition-all duration-300 ${strength.width}`}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="confirmPassword"
                                type={visibleField === 'confirm' ? 'text' : 'password'}
                                required
                                maxLength={16}
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                className={`block w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#0f0a1c] border ${errors.confirmPassword && confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-purple-900/50 focus:ring-purple-600'} rounded-xl focus:bg-white dark:focus:bg-[#150a29] focus:ring-2 focus:border-transparent sm:text-sm text-gray-900 dark:text-white transition-all outline-none`}
                                placeholder="Repeat your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                                onClick={() => setVisibleField(visibleField === 'confirm' ? 'none' : 'confirm')}
                            >
                                {visibleField === 'confirm' ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && confirmPassword && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.confirmPassword}</p>}
                        {!errors.confirmPassword && confirmPassword && (
                            <p className="mt-1.5 text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>Passwords match</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading || !!(errors.fullName || errors.email || errors.password || errors.confirmPassword) || !fullName || !email || !password || !confirmPassword}
                            className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 dark:disabled:bg-purple-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? 'Creating account...' : `Create ${role === 'STUDENT' ? 'Student' : 'Educator'} Account`}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- SUCCESS POPUP MODAL --- */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a0d36] p-8 rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 max-w-md w-full mx-4 text-center transform transition-all scale-100">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Registration Successful! 🎉
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
                            Welcome to Pro Grade, {fullName.split(' ')[0]}! Your account has been created successfully. You can now sign in to access your dashboard.
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 px-4 rounded-xl text-white font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}