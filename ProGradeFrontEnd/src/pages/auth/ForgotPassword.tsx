import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';
import logo from '../../assets/logo.svg';

export default function ForgotPassword() {
    const navigate = useNavigate();
    
    // Steps: 1 = Email, 2 = OTP & New Password, 3 = Success
    const [step, setStep] = useState(1);
    
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await axiosClient.post('/auth/forgot-password', { email });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);
        try {
            await axiosClient.post('/auth/reset-password', { email, otp, newPassword });
            setStep(3);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data || 'Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#05020a] flex items-center justify-center p-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="w-full max-w-md bg-white dark:bg-[#0f0a1c] rounded-3xl shadow-xl border border-gray-100 dark:border-purple-900/30 p-8 relative z-10">
                
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Logo" className="w-12 h-12 mb-4" />
                    <h2 className="text-2xl font-bold">Reset Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                        {step === 1 && "Enter your email to receive an OTP."}
                        {step === 2 && `Check backend console for the OTP sent to ${email}`}
                        {step === 3 && "Success!"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                placeholder="Registered Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all active:scale-[0.98]">
                            {isLoading ? 'Checking...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none font-mono tracking-widest"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all active:scale-[0.98]">
                            {isLoading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center py-6">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Password Updated!</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Redirecting to login...</p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}