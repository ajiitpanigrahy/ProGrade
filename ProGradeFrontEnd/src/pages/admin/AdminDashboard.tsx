import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader3D from '../../components/Loader3D';
import { adminService } from '../../features/admin/adminService';
import QuestionBankTab from './tabs/QuestionBankTab';

// Import all Hubs
import OverviewTab from './tabs/OverviewTab';
import EducatorHubTab from './tabs/EducatorHubTab';
import StudentHubTab from './tabs/StudentHubTab';
import AssessmentHubTab from './tabs/AssessmentHubTab';
import SystemLogsTab from './tabs/SystemLogsTab';
import GovernanceTab from './tabs/GovernanceTab';
import SystemHealthTab from './tabs/SystemHealthTab';

export default function AdminDashboard() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeView = searchParams.get('view') || 'overview';

    // Global Data States
    const [metrics, setMetrics] = useState<any>(null);
    const [charts, setCharts] = useState<any>(null);
    const [pendingEducators, setPendingEducators] = useState<any[]>([]);

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);

    // 1. Initial Data Fetch
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

                // Fetch from backend (with safe fallback to mock data if backend isn't ready)
                const [metricsData, chartsData, educatorsData] = await Promise.all([
                    adminService.getMetrics().catch(() => null),
                    adminService.getCharts().catch(() => null),
                    adminService.getPendingEducators().catch(() => []),
                    sleep(1500)
                ]);

                // Set Data (Using Mock Data if Backend fails during development)
                setMetrics(metricsData || { totalUsers: 1250, pendingApprovals: 5, activeExams: 42, monthlyRevenue: 15400 });
                setCharts(chartsData || {
                    userGrowth: [{ name: 'Mon', students: 400, educators: 10 }, { name: 'Tue', students: 600, educators: 15 }],
                    roleDistribution: [{ name: 'STUDENT', value: 850 }, { name: 'INSTRUCTOR', value: 120 }, { name: 'ADMIN', value: 5 }]
                });
                setPendingEducators(educatorsData || []);

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsInitialLoad(false);
            }
        };

        loadDashboardData();
    }, []);

    // 2. Small loader when clicking different sidebar links
    useEffect(() => {
        if (!isInitialLoad) {
            setIsSwitching(true);
            const timer = setTimeout(() => setIsSwitching(false), 500);
            return () => clearTimeout(timer);
        }
    }, [activeView, isInitialLoad]);

    // Render Full Screen Loader
    if (isInitialLoad || isSwitching) {
        return (
            <div className="fixed inset-0 z-[9999] bg-gray-50/95 dark:bg-[#0f0a1c]/95 backdrop-blur-md flex items-center justify-center">
                <Loader3D text={isInitialLoad ? "INITIALIZING COMMAND CENTER..." : "ROUTING..."} />
            </div>
        );
    }

    // Dynamic Module Routing
    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <OverviewTab metrics={metrics} charts={charts} />;
            case 'question-bank':
                return <QuestionBankTab />;
            case 'educator-management':
                return <EducatorHubTab activeSubTab="MANAGEMENT" pendingEducators={pendingEducators} />;
            case 'educator-analytics':
                return <EducatorHubTab activeSubTab="ANALYTICS" pendingEducators={pendingEducators} />;

            case 'student-management':
                return <StudentHubTab />; // We handled subtabs internally here earlier
            case 'student-analytics':
                return <StudentHubTab />;

            case 'assessment-management':
                return <AssessmentHubTab activeSubTab="MANAGEMENT" />;
            case 'assessment-fraud':
                return <AssessmentHubTab activeSubTab="FRAUD" />;

            case 'logs':
                return <SystemLogsTab />;

            case 'health':                   // 🌟 NEW ROUTE
                return <SystemHealthTab />;

            case 'settings':
                return <GovernanceTab />;

            default:
                return (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-purple-900/30 rounded-2xl text-gray-500">
                        Module in development...
                    </div>
                );
        }
    };

    return (
        <DashboardLayout role="ADMIN">
            {renderContent()}
        </DashboardLayout>
    );
}