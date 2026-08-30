import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, Loader2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

export default function ForgotPassword() {
    const navigate = useNavigate();
    
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    
    // Password States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // 🌟 EXCLUSIVE VISIBILITY STATE
    const [visiblePassword, setVisiblePassword] = useState<'new' | 'confirm' | null>(null);
    
    const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
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
            setError(err.response?.data || 'Failed to send OTP. Please check your email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        setError('');
        if (value.length > 1) {
            const chars = value.split('').slice(0, 6);
            const newOtp = Array(6).fill('');
            chars.forEach((char, i) => newOtp[i] = char);
            setOtpArray(newOtp);
            inputRefs.current[Math.min(chars.length, 5)]?.focus();
            return;
        }
        const newOtp = [...otpArray];
        newOtp[index] = value;
        setOtpArray(newOtp);
        if (value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otpArray[index] === '' && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const finalOtp = otpArray.join('');
        if (finalOtp.length !== 6) return setError("Please enter the complete 6-digit OTP.");
        if (newPassword !== confirmPassword) return setError("Passwords do not match.");
        if (calculateStrength(newPassword) < 5) return setError("Password does not meet the minimum security requirements.");

        setIsLoading(true);
        try {
            await axiosClient.post('/auth/reset-password', { email, otp: finalOtp, newPassword });
            setStep(3);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestart = () => {
        setStep(1);
        setOtpArray(Array(6).fill(''));
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setVisiblePassword(null);
    };

    const toggleVisibility = (field: 'new' | 'confirm') => {
        setVisiblePassword(prev => prev === field ? null : field);
    };

    // 🌟 REAL-TIME PASSWORD STRENGTH ALGORITHM
    const calculateStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strengthScore = calculateStrength(newPassword);
    
    const strengthConfig = [
        { label: 'Unsecured', color: 'bg-gray-600', text: 'text-gray-500' },
        { label: 'Very Weak', color: 'bg-red-500', text: 'text-red-500' },
        { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-500' },
        { label: 'Fair', color: 'bg-amber-400', text: 'text-amber-400' },
        { label: 'Good', color: 'bg-blue-400', text: 'text-blue-400' },
        { label: 'Strong', color: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]', text: 'text-emerald-500' }
    ];
    
    const currentStrength = strengthConfig[strengthScore];
    const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;

    return (
        <div className="min-h-screen bg-[#05020a] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none" style={{ animationDelay: '2s' }}></div>
            
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 animate-in zoom-in-95 duration-500">
                
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 transform rotate-12 mb-6 transition-all duration-500">
                        {step === 1 && <KeyRound className="w-8 h-8 text-white drop-shadow-md" />}
                        {step === 2 && <ShieldCheck className="w-8 h-8 text-white drop-shadow-md" />}
                        {step === 3 && <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />}
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-300 tracking-tight text-center">
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Secure Reset"}
                        {step === 3 && "Access Restored!"}
                    </h2>
                    <p className="text-sm font-semibold text-gray-400 text-center mt-3 px-2 leading-relaxed">
                        {step === 1 && "Enter your registered email to receive a secure authorization code."}
                        {step === 2 && `Enter the 6-digit code securely transmitted to ${email}`}
                        {step === 3 && "Your password has been successfully updated in our system."}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 shadow-inner">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="relative overflow-hidden">
                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400/70" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@prograde.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all font-bold placeholder:text-gray-600 shadow-inner"
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs cursor-pointer border-b-4 border-purple-800 active:border-b-0 active:translate-y-1">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Send Secure OTP</>}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-fuchsia-400/80 uppercase tracking-widest text-center block mb-2">Authorization Code</label>
                                <div className="flex justify-center gap-2 sm:gap-3 mb-4">
                                    {otpArray.map((digit, index) => (
                                        <input 
                                            key={index} ref={(el) => (inputRefs.current[index] = el)} 
                                            type="text" maxLength={1} value={digit} 
                                            onChange={(e) => handleOtpChange(index, e.target.value)} 
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)} 
                                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 transition-all shadow-inner placeholder:text-gray-700" 
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-5 pt-4 border-t border-white/10">
                                
                                {/* 🌟 NEW PASSWORD & STRENGTH CHECKER */}
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${newPassword ? currentStrength.text : 'text-fuchsia-400/70'}`} />
                                        <input
                                            type={visiblePassword === 'new' ? 'text' : 'password'} 
                                            required placeholder="New Password"
                                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 transition-all font-bold placeholder:text-gray-600 shadow-inner"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => toggleVisibility('new')} 
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-fuchsia-400 transition-colors cursor-pointer"
                                        >
                                            {visiblePassword === 'new' ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                        </button>
                                    </div>

                                    {newPassword && (
                                        <div className="px-2 animate-in fade-in duration-300">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${currentStrength.text}`}>{currentStrength.label}</span>
                                                <span className="text-[9px] font-bold text-gray-500">Includes Aa, 123, !@#</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${i < strengthScore ? currentStrength.color : 'bg-gray-800'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 🌟 CONFIRM PASSWORD & MATCH VALIDATOR */}
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isMatching ? 'text-emerald-500' : 'text-fuchsia-400/70'}`} />
                                        <input
                                            type={visiblePassword === 'confirm' ? 'text' : 'password'} 
                                            required placeholder="Confirm New Password"
                                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 transition-all font-bold placeholder:text-gray-600 shadow-inner"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => toggleVisibility('confirm')} 
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-fuchsia-400 transition-colors cursor-pointer"
                                        >
                                            {visiblePassword === 'confirm' ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                    
                                    {confirmPassword && (
                                        <div className="px-2 flex items-center gap-1.5 animate-in fade-in duration-300">
                                            {isMatching ? (
                                                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Passwords match perfectly</span></>
                                            ) : (
                                                <><AlertCircle className="w-3.5 h-3.5 text-red-500"/><span className="text-[10px] font-black uppercase tracking-widest text-red-500">Passwords do not match</span></>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                {/* 🌟 PURPLE THEME PATTERN RESTORED FOR SUBMIT */}
                                <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs cursor-pointer border-b-4 border-purple-800 active:border-b-0 active:translate-y-1">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Initialize Reset</>}
                                </button>

                                <button type="button" onClick={handleRestart} disabled={isLoading} className="w-full py-4 mt-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] cursor-pointer border border-transparent hover:border-white/10">
                                    <RotateCcw className="w-4 h-4" /> Start Over
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6 animate-in zoom-in-95 duration-500">
                            <p className="text-purple-400 font-bold tracking-wide">Redirecting you to the login portal...</p>
                            <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500 mx-auto mt-6" />
                        </div>
                    )}
                </div>

                {step !== 3 && (
                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors group cursor-pointer">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}