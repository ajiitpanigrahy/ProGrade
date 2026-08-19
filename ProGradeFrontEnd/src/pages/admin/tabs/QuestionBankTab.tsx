import React, { useState } from 'react';
import { Database, UploadCloud, Code2, PlusCircle } from 'lucide-react';
import BulkUploadModal from '../BulkUploadModal';
import QuestionOverview from './subtabs/QuestionOverview';
import QuestionGrid from './subtabs/QuestionGrid';
import CreateQuestionModal from './subtabs/CreateQuestionModal';

// (TECH_STACK definition remains exactly the same...)
export const TECH_STACK = [
    { id: 'OVERVIEW', name: 'Global Overview' },
    { id: 'JAVA', name: 'Core Java' },
    { id: 'PYTHON', name: 'Python' },
    { id: 'C', name: 'C Programming' },
    { id: 'CPP', name: 'C++' },
    { id: 'JAVASCRIPT', name: 'JavaScript' },
    { id: 'DSA', name: 'DSA' },
    { id: 'MYSQL', name: 'MySQL' },
    { id: 'SQL', name: 'Advanced SQL' },
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
    const [isCreateModalOpen, setCreateModalOpen] = useState(false); 
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const [questionToEdit, setQuestionToEdit] = useState<any | null>(null); // 🌟 NEW STATE

    const openEditModal = (questionData: any) => {
        setQuestionToEdit(questionData);
        setCreateModalOpen(true);
    };

    const handleModalClose = () => {
        setCreateModalOpen(false);
        setQuestionToEdit(null); // Clear data when closing
    };

    return (
        <div className="space-y-6 animate-in fade-in flex flex-col relative z-10 min-h-full pb-10">
            {/* Header & Action Buttons */}
            <div className="shrink-0 bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-6 sm:p-8 rounded-[2rem] flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 flex items-center gap-3 drop-shadow-sm">
                        <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        Global Question Bank
                    </h2>
                    <p className="text-sm text-gray-500 font-bold mt-2 tracking-wide">Manage theoretical MCQs and Developer Coding Assessments.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <button 
                        onClick={() => { setQuestionToEdit(null); setCreateModalOpen(true); }} // 🌟 ADD MODE
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[#1a0d36] text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs uppercase tracking-wider rounded-xl font-black transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4" /> Add Single Question
                    </button>
                    
                    <button 
                        onClick={() => setUploadModalOpen(true)}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs uppercase tracking-wider rounded-xl font-black shadow-[0_10px_20px_rgba(147,51,234,0.3)] transition-all active:scale-95 cursor-pointer"
                    >
                        <UploadCloud className="w-4 h-4" /> Bulk Import Matrix
                    </button>
                </div>
            </div>

            <div className="shrink-0 w-full border-b border-gray-200 dark:border-purple-900/30 overflow-x-auto custom-scrollbar pb-1">
                <div className="flex items-center gap-2 min-w-max">
                    {TECH_STACK.map((tech) => (
                        <button
                            key={tech.id}
                            onClick={() => setActiveTechId(tech.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
                                activeTechId === tech.id 
                                ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10' 
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                            } rounded-t-xl`}
                        >
                            <span className="text-lg">{tech.id === 'OVERVIEW' ? <Database className="w-4 h-4"/> : <Code2 className="w-4 h-4"/>}</span>
                            {tech.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full relative">
                {activeTechId === 'OVERVIEW' ? (
                    <QuestionOverview refreshTrigger={refreshTrigger} />
                ) : (
                    <QuestionGrid 
                        technology={activeTechId} 
                        techData={TECH_STACK.find(t => t.id === activeTechId)!} 
                        refreshTrigger={refreshTrigger}
                        onEdit={openEditModal} // 🌟 PASS EDIT HANDLER TO GRID
                    />
                )}
            </div>

            <BulkUploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onSuccess={() => setRefreshTrigger(prev => prev + 1)} />
            
            {/* 🌟 PASS EDIT DATA INTO MODAL */}
            <CreateQuestionModal
                isOpen={isCreateModalOpen}
                onClose={handleModalClose}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                editData={questionToEdit}
            />
        </div>
    );
}