import React, { createContext, useContext, useState, ReactNode } from 'react';
import Loader3D from '../components/Loader3D';

interface GlobalLoaderContextType {
    // A wrapper function that forces the loader to show for a minimum duration
    withLoader: (asyncAction: () => Promise<any>, text?: string) => Promise<void>;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | null>(null);

export const GlobalLoaderProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Processing...");

    const withLoader = async (asyncAction: () => Promise<any>, text = "Processing...") => {
        setIsLoading(true);
        setLoadingText(text);
        
        const startTime = Date.now();
        
        try {
            await asyncAction(); // Execute the actual backend API call
        } finally {
            // Calculate how fast the backend was
            const elapsedTime = Date.now() - startTime;
            // Force the loader to stay on screen for at least 1500ms (1.5s)
            const remainingTime = Math.max(0, 1500 - elapsedTime);
            
            setTimeout(() => {
                setIsLoading(false);
            }, remainingTime);
        }
    };

    return (
        <GlobalLoaderContext.Provider value={{ withLoader }}>
            {children}
            
            {/* The Full-Screen Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-[9999] bg-gray-50/90 dark:bg-[#0f0a1c]/90 backdrop-blur-md flex items-center justify-center">
                    <Loader3D text={loadingText} />
                </div>
            )}
        </GlobalLoaderContext.Provider>
    );
};

export const useGlobalLoader = () => {
    const context = useContext(GlobalLoaderContext);
    if (!context) throw new Error("useGlobalLoader must be used within a GlobalLoaderProvider");
    return context;
};