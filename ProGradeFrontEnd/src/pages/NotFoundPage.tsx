import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';

export default function NotFound() {
    return (
        <PublicLayout>
            <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 relative z-10">
                
                {/* Background glowing orb for extra depth */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                {/* 3D Extruded Text Effect */}
                <div className="relative group cursor-default hover:scale-105 transition-transform duration-500 ease-out mb-6">
                    {/* Top Layer (Gradient & Glow) */}
                    <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-fuchsia-500 absolute -top-2 -left-2 md:-top-4 md:-left-4 z-10 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] group-hover:-top-3 md:group-hover:-top-6 group-hover:-left-3 md:group-hover:-left-6 transition-all duration-500 select-none">
                        404
                    </h1>
                    
                    {/* Bottom Layer (3D Depth/Shadow) */}
                    <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-purple-900/40 dark:text-purple-950/80 select-none">
                        404
                    </h1>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                    Lost in Cyberspace?
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-10">
                    The page you are looking for has been removed, had its name changed, or is temporarily out of bounds.
                </p>
                
                {/* 3D Style Button */}
                <Link 
                    to="/" 
                    className="px-8 py-4 bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white font-bold rounded-xl shadow-[0_6px_0_rgb(88,28,135)] hover:shadow-[0_4px_0_rgb(88,28,135)] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all"
                >
                    Return to Mission Control
                </Link>
            </div>
        </PublicLayout>
    );
}