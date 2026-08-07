import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg'; // Ensure this path is correct

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#05020a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
            {/* --- PUBLIC NAVBAR --- */}
            <nav className="h-20 bg-white/80 dark:bg-[#0f0a1c]/80 backdrop-blur-md border-b border-gray-200 dark:border-purple-900/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logo} alt="Pro Grade" className="w-8 h-8" />
                        <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500">
                            Pro Grade
                        </span>
                    </Link>
                    
                    <div className="flex gap-4">
                        {location.pathname !== '/login' && (
                            <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                Sign In
                            </Link>
                        )}
                        {location.pathname !== '/register' && (
                            <Link to="/register" className="px-5 py-2.5 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all active:scale-[0.98]">
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none -z-10"></div>
                {children}
            </main>

            {/* --- PUBLIC FOOTER --- */}
            <footer className="border-t border-gray-200 dark:border-purple-900/50 bg-white dark:bg-[#0a0514] py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Pro Grade" className="w-6 h-6 grayscale opacity-70" />
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            © {new Date().getFullYear()} Pro Grade. All rights reserved.
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <Link to="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Use</Link>
                        <Link to="/cookies" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Cookies Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}