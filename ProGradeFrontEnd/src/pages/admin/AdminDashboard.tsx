import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader3D from '../../components/Loader3D';
import { adminService } from '../../features/admin/adminService';

// Module Imports
import OverviewTab from './tabs/OverviewTab';
import EducatorHubTab from './tabs/EducatorHubTab';
import StudentHubTab from './tabs/StudentHubTab';
import QuestionBankTab from './tabs/QuestionBankTab';
import AssessmentHubTab from './tabs/AssessmentHubTab';
import SystemLogsTab from './tabs/SystemLogsTab';
import GovernanceTab from './tabs/GovernanceTab';
import SystemHealthTab from './tabs/SystemHealthTab';
// 🌟 Import the Leaderboard Tab
import GlobalLeaderboardTab from '../student/tabs/GlobalLeaderboardTab'; 

export default function AdminDashboard() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeView = searchParams.get('view') || 'overview';

    const [metrics, setMetrics] = useState<any>(null);
    const [charts, setCharts] = useState<any>(null);
    const [pendingEducators, setPendingEducators] = useState<any[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
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

    useEffect(() => {
        if (!isInitialLoad) {
            setIsSwitching(true);
            const timer = setTimeout(() => setIsSwitching(false), 500);
            return () => clearTimeout(timer);
        }
    }, [activeView, isInitialLoad]);

    const handleApproveEducator = async (id: string) => {
        try {
            await adminService.approveEducator(id);
            setPendingEducators(prev => prev.filter(e => e.id !== id));
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

    if (isInitialLoad || isSwitching) {
        return (
            <div className="fixed inset-0 z-[9999] bg-gray-50/95 dark:bg-[#0f0a1c]/95 backdrop-blur-md flex items-center justify-center">
                <Loader3D text={isInitialLoad ? "INITIALIZING COMMAND CENTER..." : "ROUTING..."} />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeView) {
            // 1. Executive
            case 'overview':
                return <OverviewTab metrics={metrics} charts={charts} pendingEducators={pendingEducators} onApprove={handleApproveEducator} onReject={handleRejectEducator} />;
            
            // 2. Personnel Management & Rankings
            case 'student-management':
            case 'student-analytics':
                return <StudentHubTab />; 
            case 'educator-management':
                return <EducatorHubTab activeSubTab="MANAGEMENT" pendingEducators={pendingEducators} />;
            case 'educator-analytics':
                return <EducatorHubTab activeSubTab="ANALYTICS" pendingEducators={pendingEducators} />;
            case 'leaderboard':
                return <GlobalLeaderboardTab />; // 🌟 Added Leaderboard Routing

            // 3. Content & Exams
            case 'question-bank':
                return <QuestionBankTab />;
            case 'assessment-management':
                return <AssessmentHubTab activeSubTab="MANAGEMENT" />;
            case 'practice-monitor':
                return <AssessmentHubTab activeSubTab="PRACTICE" />; 
            case 'assessment-fraud':
                return <AssessmentHubTab activeSubTab="FRAUD" />;

            // 4. System Governance
            case 'logs':
                return <SystemLogsTab />;
            case 'health': 
                return <SystemHealthTab />;
            case 'settings':
                return <GovernanceTab />;
            default:
                return <OverviewTab metrics={metrics} charts={charts} pendingEducators={pendingEducators} onApprove={handleApproveEducator} onReject={handleRejectEducator} />;
        }
    };

    return (
        <DashboardLayout role="ADMIN">
            {renderContent()}
        </DashboardLayout>
    );
}