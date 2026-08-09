import React from 'react';

interface Loader3DProps {
    text?: string;
}

export default function Loader3D({ text = "Loading Dashboard..." }: Loader3DProps) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0f0a1c] relative z-50 overflow-hidden px-4">
            
            {/* Ambient background glow - scales dynamically with screen size */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-600/15 dark:bg-purple-600/25 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>

            {/* 3D Gyroscope Container - Scales up from mobile to laptop */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 flex items-center justify-center" style={{ perspective: '800px' }}>
                
                {/* Outer Ring */}
                <div className="absolute w-full h-full" style={{ transform: 'rotateX(60deg) rotateY(-20deg)', transformStyle: 'preserve-3d' }}>
                    <div className="w-full h-full border-[3px] sm:border-[4px] border-transparent border-t-purple-600 border-b-fuchsia-500 rounded-full animate-[spin_2s_linear_infinite] shadow-[0_0_15px_rgba(147,51,234,0.4)]" />
                </div>

                {/* Middle Ring */}
                <div className="absolute w-20 h-20 sm:w-28 sm:h-28 lg:w-34 lg:h-34" style={{ transform: 'rotateX(50deg) rotateY(30deg)', transformStyle: 'preserve-3d' }}>
                    <div className="w-full h-full border-[3px] sm:border-[4px] border-transparent border-r-purple-500 border-l-fuchsia-400 rounded-full animate-[spin_2.5s_linear_infinite_reverse] shadow-[0_0_15px_rgba(217,70,239,0.4)]" />
                </div>

                {/* Inner Ring */}
                <div className="absolute w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" style={{ transform: 'rotateX(20deg) rotateY(70deg)', transformStyle: 'preserve-3d' }}>
                    <div className="w-full h-full border-[2px] sm:border-[3px] border-transparent border-t-fuchsia-500 border-b-purple-400 rounded-full animate-[spin_1.5s_linear_infinite] shadow-[0_0_10px_rgba(147,51,234,0.5)]" />
                </div>

                {/* Core Energy Orb */}
                <div className="absolute w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(217,70,239,1)]" />
            </div>

            {/* Pulsing Loading Text - Responsive text sizing and tracking */}
            <h3 className="mt-8 sm:mt-12 text-[10px] sm:text-xs lg:text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500 tracking-[0.25em] sm:tracking-[0.3em] uppercase animate-pulse drop-shadow-sm select-none text-center max-w-xs sm:max-w-md px-2">
                {text}
            </h3>
        </div>
    );
}