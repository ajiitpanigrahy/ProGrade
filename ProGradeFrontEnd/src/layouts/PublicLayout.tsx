import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, LogIn, UserPlus, Sparkles } from 'lucide-react';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#05020a] text-gray-900 dark:text-white flex flex-col transition-colors relative overflow-hidden">
            
            {/* Top Navigation Header */}
            <header className="w-full border-b border-gray-200 dark:border-purple-900/30 bg-white/80 dark:bg-[#0f0a1c]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Logo / Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                            Pro<span className="text-purple-600 dark:text-purple-400">Grade</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden sm:flex items-center gap-4">
                        <Link 
                            to="/login" 
                            className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/register" 
                            className="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98]"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile 3-Dot Menu Button (Visible only on small screens like iPhone SE) */}
                    <div className="sm:hidden relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#1a0d36] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-purple-900/50 hover:bg-gray-200 dark:hover:bg-purple-900/40 transition-all cursor-pointer"
                            aria-label="Toggle Menu"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                    <LogIn className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Sign In
                                </Link>
                                <div className="h-px bg-gray-100 dark:bg-purple-900/30 my-1"></div>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            {/* Main Page Content */}
            <main className="flex-grow flex flex-col justify-center">
                {children}
            </main>

            {/* Footer */}
            <footer className="w-full py-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-purple-900/20">
                &copy; {new Date().getFullYear()} ProGrade Systems. All rights reserved.
            </footer>

        </div>
    );
}