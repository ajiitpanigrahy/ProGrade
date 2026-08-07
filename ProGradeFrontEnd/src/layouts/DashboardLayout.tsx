import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X, Sun, Moon, 
    Bell, CheckSquare, Search, BookOpen, BarChart3, ShieldCheck
} from 'lucide-react';
import logo from '../assets/logo.svg';
import ProfileDrawer from '../components/ProfileDrawer';

// Defining the roles
export type UserRole = 'STUDENT' | 'EDUCATOR' | 'ADMIN';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: UserRole;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // State for toggles
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
    
    // Initialize dark mode state from localStorage, defaulting to true (dark mode)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true; 
    });

    // 1. Force/Toggle Dark Mode Persistently
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // 2. Handle Secure Logout
    // 2. Handle Secure Logout without flashing errors
const handleLogout = async () => {
    // 1. Navigate immediately so the protected dashboard unmounts safely
    navigate('/login', { replace: true });
    
    // 2. Clear the state and call the backend slightly after
    setTimeout(async () => {
        try {
            await logout(); 
        } catch (e) {
            console.error("Logout failed on backend", e);
        }
    }, 100);
};

    // 3. Dynamic User Initials logic (Supports 1 or 2 word names safely)
    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Use current user's full name, fallback to 'User'
    const userName = user?.fullName || 'User';

    // Dynamic Navigation based on Role
    const getNavLinks = () => {
        switch (role) {
            case 'ADMIN':
                return [
                    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
                    { name: 'Educator Approvals', path: '/admin/approvals', icon: ShieldCheck },
                    { name: 'User Management', path: '/admin/users', icon: Users },
                    { name: 'System Logs', path: '/admin/logs', icon: FileText },
                    { name: 'Settings', path: '/admin/settings', icon: Settings },
                ];
            case 'EDUCATOR':
                return [
                    { name: 'Overview', path: '/educator/dashboard', icon: LayoutDashboard },
                    { name: 'My Exams', path: '/educator/exams', icon: FileText },
                    { name: 'Question Bank', path: '/educator/questions', icon: BookOpen },
                    { name: 'Results & Analytics', path: '/educator/results', icon: BarChart3 },
                    { name: 'Settings', path: '/educator/settings', icon: Settings },
                ];
            case 'STUDENT':
            default:
                return [
                    { name: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
                    { name: 'Join Exam', path: '/student/join', icon: Search },
                    { name: 'My Results', path: '/student/results', icon: CheckSquare },
                    { name: 'Settings', path: '/student/settings', icon: Settings },
                ];
        }
    };

    const navLinks = getNavLinks();

    return (
        <div>
            <div className="min-h-screen bg-gray-50 dark:bg-[#05020a] text-gray-900 dark:text-gray-100 flex transition-colors duration-300">
                
                {/* ---------------- SIDEBAR (Desktop & Mobile) ---------------- */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0f0a1c] border-r border-gray-200 dark:border-purple-900/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    
                    {/* Brand */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-purple-900/50 shrink-0">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={logo} alt="Pro Grade" className="w-8 h-8" />
                            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500">
                                Pro Grade
                            </span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {role} PANEL
                        </div>
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path; 
                            return (
                                <Link 
                                    key={link.name} 
                                    to={link.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                                        isActive 
                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold' 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-900/20 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Logout Button */}
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

                {/* ---------------- MAIN CONTENT AREA ---------------- */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    
                    {/* TOP HEADER */}
                    <header className="h-20 bg-white/80 dark:bg-[#0f0a1c]/80 backdrop-blur-md border-b border-gray-200 dark:border-purple-900/50 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 shrink-0">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(true)} 
                                className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-purple-600 focus:outline-none cursor-pointer"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
                                Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-5">
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme} 
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-full transition-colors cursor-pointer"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Notifications */}
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-full transition-colors relative cursor-pointer">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0f0a1c]"></span>
                            </button>

                            <div className="w-px h-6 bg-gray-200 dark:bg-purple-900/50 hidden sm:block"></div>

                            {/* User Profile Info - Click to Open Drawer */}
                            <div 
                                onClick={() => setIsProfileDrawerOpen(true)}
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-purple-900/20 p-1.5 rounded-full sm:rounded-xl transition-colors"
                            >
                                <div className="hidden sm:block text-right pr-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{userName}</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1 uppercase">{role}</p>
                                </div>
                                
                                {/* Dynamic User Avatar */}
                                {user?.profilePictureUrl ? (
                                    <img 
                                        src={user.profilePictureUrl} 
                                        alt={userName} 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-sm" 
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-md tracking-wider">
                                        {getInitials(userName)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* PAGE CONTENT */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
                        <div className="hidden dark:block absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
                        
                        <div className="max-w-7xl mx-auto h-full">
                            {children}
                        </div>
                    </main>

                </div>
            </div>

            {/* ---------------- PROFILE DRAWER ---------------- */}
            <ProfileDrawer 
                isOpen={isProfileDrawerOpen} 
                onClose={() => setIsProfileDrawerOpen(false)} 
            />
        </div>
    );
}