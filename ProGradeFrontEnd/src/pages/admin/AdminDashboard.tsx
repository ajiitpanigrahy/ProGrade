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

                // Fetch from backend 
                const [metricsData, chartsData, educatorsData] = await Promise.all([
                    adminService.getMetrics().catch(() => null),
                    adminService.getCharts().catch(() => null),
                    adminService.getPendingEducators().catch(() => []),
                    sleep(1500)
                ]);

                setMetrics(metricsData);
                setCharts(chartsData);
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

    // 🌟 3. EDUCATOR APPROVAL HANDLERS
    const handleApproveEducator = async (id: string) => {
        try {
            await adminService.approveEducator(id);
            setPendingEducators(prev => prev.filter(e => e.id !== id));
            // Optional: You could add a Toast notification here
        } catch (err) {
            alert("Failed to approve educator.");
        }
    };

    const handleRejectEducator = async (id: string) => {
        if (!window.confirm("Are you sure you want to reject this educator?")) return;
        try {
            await adminService.rejectEducator(id);
            setPendingEducators(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            alert("Failed to reject educator.");
        }
    };

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
                // 🌟 PASSING PROPS TO OVERVIEW TAB
                return (
                    <OverviewTab 
                        metrics={metrics} 
                        charts={charts} 
                        pendingEducators={pendingEducators}
                        onApprove={handleApproveEducator}
                        onReject={handleRejectEducator}
                    />
                );
            case 'question-bank':
                return <QuestionBankTab />;
            case 'educator-management':
                return <EducatorHubTab activeSubTab="MANAGEMENT" pendingEducators={pendingEducators} />;
            case 'educator-analytics':
                return <EducatorHubTab activeSubTab="ANALYTICS" pendingEducators={pendingEducators} />;

            case 'student-management':
                return <StudentHubTab />; 
            case 'student-analytics':
                return <StudentHubTab />;

            case 'assessment-management':
                return <AssessmentHubTab activeSubTab="MANAGEMENT" />;
            case 'assessment-fraud':
                return <AssessmentHubTab activeSubTab="FRAUD" />;

            case 'logs':
                return <SystemLogsTab />;

            case 'health': 
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