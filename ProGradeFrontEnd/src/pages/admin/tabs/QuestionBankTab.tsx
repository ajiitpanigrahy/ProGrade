import React, { useState } from 'react';
import { Database, UploadCloud } from 'lucide-react';
import BulkUploadModal from '../BulkUploadModal';
import QuestionOverview from './subtabs/QuestionOverview';
import QuestionGrid from './subtabs/QuestionGrid';

// Inside QuestionBankTab.tsx
export const TECH_STACK = [
    { id: 'OVERVIEW', name: 'Global Overview' },
    { id: 'JAVA', name: 'Core Java' },
    { id: 'PYTHON', name: 'Python' },
    { id: 'DSA', name: 'DSA' },
    { id: 'MYSQL', name: 'MySQL' },
    { id: 'SPRING_CORE', name: 'Spring Core' },
    { id: 'SPRING_JDBC', name: 'Spring JDBC' },
    { id: 'SPRING_ORM', name: 'Spring ORM' },
    { id: 'SPRING_MVC', name: 'Spring MVC' },
    { id: 'SPRING_BOOT', name: 'Spring Boot' },
    { id: 'SPRING_DATA_JPA', name: 'Spring Data JPA' },
    { id: 'REST_API', name: 'REST API' },
    { id: 'LOGGING', name: 'Logging' },
    { id: 'MAVEN', name: 'Maven' },
    { id: 'JUNIT', name: 'JUnit' },
    { id: 'HIBERNATE', name: 'Hibernate' },
];

export default function QuestionBankTab() {
    const [activeTechId, setActiveTechId] = useState('OVERVIEW');
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Forces refetch after upload

    return (
        <div className="space-y-6 animate-in fade-in flex flex-col h-full">
            {/* Header & Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        Global Question Bank
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage platform MCQs, categories, and bulk initialization.</p>
                </div>
                
                <button 
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98]"
                >
                    <UploadCloud className="w-4 h-4" /> Bulk Import MCQs
                </button>
            </div>

            {/* Horizontal Ribbon Control Panel */}
            <div className="w-full border-b border-gray-200 dark:border-purple-900/30 overflow-x-auto custom-scrollbar pb-1">
                <div className="flex items-center gap-2 min-w-max">
                    {TECH_STACK.map((tech) => (
                        <button
                            key={tech.id}
                            onClick={() => setActiveTechId(tech.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all ${
                                activeTechId === tech.id 
                                ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10' 
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                            } rounded-t-xl`}
                        >
                            <span className="text-lg">{tech.icon}</span>
                            {tech.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area Rendering */}
            <div className="flex-1">
                {activeTechId === 'OVERVIEW' ? (
                    <QuestionOverview refreshTrigger={refreshTrigger} />
                ) : (
                    <QuestionGrid 
                        technology={activeTechId} 
                        techData={TECH_STACK.find(t => t.id === activeTechId)!} 
                        refreshTrigger={refreshTrigger}
                    />
                )}
            </div>

            <BulkUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setUploadModalOpen(false)} 
                onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
            />
        </div>
    );
}