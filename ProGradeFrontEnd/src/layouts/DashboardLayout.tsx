import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import ProfileDrawer from '../components/ProfileDrawer';
import { useGlobalLoader } from '../context/GlobalLoaderContext';
import NotificationBell from '../components/NotificationBell';

import {
    LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X, Sun, Moon,
    CheckSquare, Search, BookOpen, BarChart3, ShieldCheck,
    GraduationCap, ShieldAlert, Database, ChevronDown, ChevronRight, Activity,
    TerminalSquare, Rocket, Code, Trophy, HelpCircle, MessageSquare, Bell,
    LifeBuoy, RefreshCcw // 🌟 IMPORTED RefreshCcw
} from 'lucide-react';

export type UserRole = 'STUDENT' | 'EDUCATOR' | 'ADMIN';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: UserRole;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const currentPathWithQuery = location.pathname + location.search;
        const navLinksToRender = getNavLinks();
        const newAccordionsState = { ...openAccordions };

        navLinksToRender.forEach((link: any) => {
            if (link.subItems) {
                const isParentActive = link.subItems.some((sub: any) => currentPathWithQuery === sub.path);
                if (isParentActive) newAccordionsState[link.name] = true;
            }
        });

        setOpenAccordions(newAccordionsState);
    }, [location.pathname, location.search]);

    const toggleAccordion = (name: string) => {
        setOpenAccordions(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            root.style.backgroundColor = '#05020a';
            document.body.style.backgroundColor = '#05020a';
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.style.backgroundColor = '#f9fafb';
            document.body.style.backgroundColor = '#f9fafb';
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const { withLoader } = useGlobalLoader();

    const handleLogout = async () => {
        await withLoader(async () => {
            try {
                await logout();
                navigate('/login', { replace: true });
            } catch (e) {
                console.error("Logout failed on backend", e);
            }
        }, "TERMINATING SECURE SESSION...");
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const userName = user?.fullName || 'User';

    const getLogoRedirectPath = () => {
        switch (role) {
            case 'ADMIN': return '/admin/dashboard';
            case 'EDUCATOR': return '/educator/dashboard?view=overview';
            case 'STUDENT': return '/student/dashboard?view=overview';
            default: return '/';
        }
    };

    const getNavLinks = () => {
        switch (role) {
            case 'ADMIN':
                return [
                    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
                    {
                        name: 'Educator Hub', icon: GraduationCap,
                        subItems: [
                            { name: 'Management', path: '/admin/dashboard?view=educator-management' },
                            { name: 'Analytics', path: '/admin/dashboard?view=educator-analytics' },
                        ]
                    },
                    {
                        name: 'Student Hub', icon: Users,
                        subItems: [
                            { name: 'Management', path: '/admin/dashboard?view=student-management' },
                            { name: 'Analytics', path: '/admin/dashboard?view=student-analytics' },
                        ]
                    },
                    {
                        name: 'Assessment Hub', icon: ShieldAlert,
                        subItems: [
                            { name: 'Exam Operations', path: '/admin/dashboard?view=assessment-management' },
                            { name: 'Fraud & Proctoring', path: '/admin/dashboard?view=assessment-fraud' },
                        ]
                    },
                    { name: 'Question Bank', path: '/admin/dashboard?view=question-bank', icon: Database },
                    { name: 'Reports & Tickets', path: '/admin/reports', icon: LifeBuoy },
                    { name: 'System Logs', path: '/admin/dashboard?view=logs', icon: TerminalSquare },
                    { name: 'System Health', path: '/admin/dashboard?view=health', icon: Activity },
                    { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
                    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
                    { name: 'Settings', path: '/admin/dashboard?view=settings', icon: Settings },
                ];
            case 'EDUCATOR':
                return [
                    { name: 'Overview', path: '/educator/dashboard?view=overview', icon: LayoutDashboard },
                    { name: 'My Question Bank', path: '/educator/dashboard?view=questions', icon: BookOpen },
                    { name: 'Assessment Builder', path: '/educator/dashboard?view=assessments', icon: FileText },
                    { name: 'Grading & Evaluation', path: '/educator/dashboard?view=grading', icon: CheckSquare },
                    { name: 'Student Analytics', path: '/educator/dashboard?view=analytics', icon: BarChart3 },
                    { name: 'Messages', path: '/educator/messages', icon: MessageSquare },
                    { name: 'Notifications', path: '/educator/notifications', icon: Bell },
                    { name: 'Support & Reports', path: '/educator/reports', icon: LifeBuoy },
                    { name: 'Settings', path: '/educator/dashboard?view=settings', icon: Settings },
                ];
            case 'STUDENT':
                return [
                    { name: 'Overview', path: '/student/dashboard?view=overview', icon: LayoutDashboard },
                    { name: 'Active Examinations', path: '/student/dashboard?view=active-exams', icon: Rocket },
                    { name: 'Self-Practice Arena', path: '/student/practice', icon: Code }, 
                    { name: 'AI Analysis', path: '/student/dashboard?view=transcripts', icon: FileText },
                    { name: 'Leaderboard & Ranks', path: '/student/dashboard?view=leaderboard', icon: Trophy },
                    { name: 'Messages', path: '/student/messages', icon: MessageSquare },
                    { name: 'Notifications', path: '/student/notifications', icon: Bell },
                    { name: 'Support & Reports', path: '/student/reports', icon: LifeBuoy },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    return (
        <div>
            <div className="min-h-screen bg-gray-50 dark:bg-[#05020a] text-gray-900 dark:text-gray-100 flex transition-colors duration-300">

                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0f0a1c] border-r border-gray-200 dark:border-purple-900/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-purple-900/50 shrink-0">
                        <Link to={getLogoRedirectPath()} className="flex items-center gap-3">
                            <img src={logo} alt="Pro Grade" className="w-8 h-8" />
                            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500">
                                Pro Grade
                            </span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {role} PANEL
                        </div>

                        {navLinks.map((link: any) => {
                            const Icon = link.icon;
                            const currentPathWithQuery = location.pathname + location.search;

                            if (link.subItems) {
                                const isOpen = openAccordions[link.name];
                                const isParentActive = link.subItems.some((sub: any) => currentPathWithQuery === sub.path);

                                return (
                                    <div key={link.name} className="flex flex-col gap-1">
                                        <button
                                            onClick={() => toggleAccordion(link.name)}
                                            className={`flex items-center justify-between w-full px-3 py-3 rounded-xl transition-all cursor-pointer ${isParentActive
                                                ? 'text-purple-600 dark:text-purple-400 font-bold'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-900/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span>{link.name}</span>
                                            </div>
                                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>

                                        {isOpen && (
                                            <div className="pl-11 pr-2 space-y-1 mt-1 animate-in slide-in-from-top-2">
                                                {link.subItems.map((sub: any) => {
                                                    const isSubActive = currentPathWithQuery === sub.path;
                                                    return (
                                                        <Link
                                                            key={sub.name}
                                                            to={sub.path}
                                                            onClick={() => setIsSidebarOpen(false)}
                                                            className={`block px-3 py-2 rounded-lg text-sm transition-all ${isSubActive
                                                                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold'
                                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-purple-900/10'
                                                                }`}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            const isDirectlyActive = currentPathWithQuery === link.path || (link.path === '/admin/dashboard' && currentPathWithQuery === '/admin/dashboard');

                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isDirectlyActive
                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-900/20 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isDirectlyActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-purple-900/50 shrink-0">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium cursor-pointer"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#05020a]">

                    <header className="h-20 bg-white/80 dark:bg-[#0f0a1c]/80 backdrop-blur-md border-b border-gray-200 dark:border-purple-900/50 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-purple-600 focus:outline-none cursor-pointer">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
                                Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* 🌟 NATIVE REFRESH BUTTON */}
                            <button 
                                onClick={() => window.location.reload()} 
                                title="Refresh Dashboard"
                                className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-xl transition-all cursor-pointer border-2 border-transparent hover:border-gray-200 dark:hover:border-purple-900/50 group"
                            >
                                <RefreshCcw className="w-5 h-5 group-hover:animate-[spin_0.5s_linear]" />
                            </button>

                            <button 
                                onClick={toggleTheme} 
                                title="Toggle Theme"
                                className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors cursor-pointer border-2 border-transparent hover:border-gray-200 dark:hover:border-purple-900/50"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <NotificationBell />

                            <div className="w-px h-8 bg-gray-200 dark:bg-purple-900/50 hidden sm:block mx-1"></div>

                            <div onClick={() => setIsProfileDrawerOpen(true)} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-purple-900/20 p-2 sm:pr-4 rounded-full sm:rounded-2xl border-2 border-transparent hover:border-gray-200 dark:hover:border-purple-900/50 transition-all">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-none tracking-wide">{userName}</p>
                                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1 uppercase tracking-widest">{role}</p>
                                </div>

                                {user?.profilePictureUrl ? (
                                    <img
                                        src={user.profilePictureUrl}
                                        alt={userName}
                                        referrerPolicy="no-referrer"
                                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-md"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-black shadow-md tracking-wider border-2 border-purple-400/30">
                                        {getInitials(userName)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto overscroll-none p-4 sm:p-8 relative custom-scrollbar bg-gray-50 dark:bg-[#05020a]">
                        <div className="hidden dark:block absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

                        <div className="max-w-7xl mx-auto min-h-full pb-8">
                            {children}
                        </div>
                    </main>

                </div>
            </div>

            <ProfileDrawer isOpen={isProfileDrawerOpen} onClose={() => setIsProfileDrawerOpen(false)} />
        </div>
    );
}