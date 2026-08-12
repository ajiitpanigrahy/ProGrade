import React from 'react';
import { Settings, Wrench, Mail } from 'lucide-react';

interface MaintenanceOverlayProps {
    message: string;
}

export default function MaintenanceOverlay({ message }: MaintenanceOverlayProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-in fade-in zoom-in duration-500">
            
            {/* The Warning Card */}
            <div className="bg-[#F3F4F6] dark:bg-gray-900 border-2 border-[#F59E0B] rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl shadow-amber-500/10 relative overflow-hidden">
                
                {/* Decorative Amber Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                {/* Animated Assets */}
                <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <Settings className="absolute w-20 h-20 text-amber-500 animate-[spin_4s_linear_infinite] opacity-30" />
                    <Wrench className="absolute w-10 h-10 text-amber-600 drop-shadow-md z-10" />
                </div>

                {/* Typography */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                    System Under Maintenance
                </h2>
                
                {/* Dynamic Custom Text from Database */}
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                    {message || "We are upgrading core infrastructure to improve your experience. We will be back online shortly."}
                </p>

                {/* Progress Indication */}
                <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mt-8 overflow-hidden">
                    <div className="h-full bg-amber-500 w-full animate-pulse rounded-full"></div>
                </div>
            </div>

            {/* Persistent Support Anchor */}
            <div className="mt-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <Mail className="w-4 h-4" />
                <span>For urgent concerns, contact <a href="mailto:support@prograde.com" className="text-amber-600 hover:text-amber-500 transition-colors underline underline-offset-4">support@prograde.com</a></span>
            </div>

        </div>
    );
}