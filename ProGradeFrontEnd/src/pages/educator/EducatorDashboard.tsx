import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader3D from '../../components/Loader3D';

// Import New Educator Tabs
import EducatorOverviewTab from './tabs/EducatorOverviewTab';
import GradingDeskTab from './tabs/GradingDeskTab';
import StudentAnalyticsTab from './tabs/StudentAnalyticsTab';

// Reuse the highly scalable Admin components
import QuestionBankTab from '../admin/tabs/QuestionBankTab'; 
import AssessmentHubTab from '../admin/tabs/AssessmentHubTab';

export default function EducatorDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    
    // 🌟 URL-based Routing for Sidebar Navigation
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeView = searchParams.get('view') || 'overview';

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Sleep function to force the 3D animation for 1.5 seconds
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await sleep(1500);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // 🌟 Dynamic Content Switcher
    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* 🌟 Your original Welcome Card integrated here */}
                        <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome back, {user?.fullName?.split(' ')[0] || 'Educator'}! 👋
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">Here is your executive summary and active workloads.</p>
                        </div>
                        <EducatorOverviewTab />
                    </div>
                );
            case 'questions':
                return <QuestionBankTab />;
            case 'assessments':
                // Reusing the Admin tab, but limiting it to 'MANAGEMENT' view
                return <AssessmentHubTab activeSubTab="MANAGEMENT" />;
            case 'grading':
                return <GradingDeskTab />;
            case 'analytics':
                return <StudentAnalyticsTab />;
            default:
                return <EducatorOverviewTab />;
        }
    };

    // Show the 3D loader inside the Dashboard Layout
    if (isLoading) {
        return (
            <DashboardLayout role="EDUCATOR">
                <div className="h-[70vh] flex items-center justify-center">
                    <Loader3D text="INITIALIZING EDUCATOR WORKSPACE..." />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="EDUCATOR">
            {/* 🌟 Render the dynamically selected tab */}
            {renderContent()}
        </DashboardLayout>
    );
}