import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GlobalLoaderProvider } from '../context/GlobalLoaderContext';
import { NotificationProvider } from '../context/NotificationContext';

import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute'; 

import ReportsDashboardView from '../pages/shared/ReportsDashboardView';
import Login from '../pages/auth/LoginPage';
import Register from '../pages/auth/RegisterPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import EducatorDashboard from '../pages/educator/EducatorDashboard';
import NotFoundPage from '../pages/NotFoundPage';
import LandingPage from '../pages/LandingPage';
import LiveExamPortal from '../pages/student/LiveExamPortal';
import TestAnalysisView from '../pages/student/TestAnalysisView';
import PrivacyPolicy from '../pages/legal/PrivacyPolicy';
import TermsOfUse from '../pages/legal/TermsOfUse';
import CookiesPolicy from '../pages/legal/CookiesPolicy';
import ForgotPassword from '../pages/auth/ForgotPassword';
import AssessmentReportView from '../pages/shared/AssessmentReportView';
import DashboardLayout from '../layouts/DashboardLayout';
import NotificationsPage from '../pages/shared/NotificationsPage';
import ChatMessenger from '../pages/shared/ChatMessenger';
import OAuthCallback from '../pages/auth/OAuthCallback';

// 🌟 IMPORT THE NEW PRACTICE ARENA COMPONENT
import StudentPracticeArena from '../pages/student/tabs/StudentPracticeArena';

const RootLayout = () => {
    return (
        <AuthProvider>
            <GlobalLoaderProvider>
                <NotificationProvider>
                    <Outlet />
                </NotificationProvider>
            </GlobalLoaderProvider>
        </AuthProvider>
    );
};

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            
            // PUBLIC ROUTES
            {
                element: <GuestRoute />,
                children: [
                    { path: '/', element: <LandingPage /> },
                    { path: '/login', element: <Login /> },
                    { path: '/register', element: <Register /> },
                    { path: '/forgot-password', element: <ForgotPassword /> },
                ]
            },

            // LEGAL & SYSTEM ROUTES
            { path: '/privacy', element: <PrivacyPolicy /> },
            { path: '/terms', element: <TermsOfUse /> },
            { path: '/cookies', element: <CookiesPolicy /> },
            { path: '/oauth/callback', element: <OAuthCallback /> },

            // PROTECTED DASHBOARDS
            {
                path: '/student/dashboard',
                element: <ProtectedRoute><StudentDashboard /></ProtectedRoute>,
            },
            {
                path: '/admin/dashboard',
                element: <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
            },
            {
                path: '/educator/dashboard',
                element: <ProtectedRoute><EducatorDashboard /></ProtectedRoute>,
            },

            // 🌟 NEW: SELF-PRACTICE ARENA ROUTE (Strictly Student)
            {
                path: '/student/practice',
                element: (
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <DashboardLayout role="STUDENT">
                            <StudentPracticeArena />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // LIVE EXAM & ANALYSIS
            {
                path: "/student/exam/live/:id",
                element: <ProtectedRoute allowedRoles={['STUDENT']}><LiveExamPortal /></ProtectedRoute>
            },
            {
                path: "/student/analysis/:submissionId",
                element: <ProtectedRoute allowedRoles={['STUDENT']}><TestAnalysisView /></ProtectedRoute>
            },

            // ASSESSMENT REPORTS
            {
                path: "/educator/assessments/:id/reports",
                element: <ProtectedRoute allowedRoles={['EDUCATOR', 'ADMIN']}><DashboardLayout role="EDUCATOR"><AssessmentReportView /></DashboardLayout></ProtectedRoute>
            },
            {
                path: "/admin/assessments/:id/reports",
                element: <ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout role="ADMIN"><AssessmentReportView /></DashboardLayout></ProtectedRoute>
            },

            // NOTIFICATIONS
            {
                path: "/student/notifications",
                element: <ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout role="STUDENT"><NotificationsPage /></DashboardLayout></ProtectedRoute>
            },
            {
                path: "/educator/notifications",
                element: <ProtectedRoute allowedRoles={['EDUCATOR']}><DashboardLayout role="EDUCATOR"><NotificationsPage /></DashboardLayout></ProtectedRoute>
            },
            {
                path: "/admin/notifications",
                element: <ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout role="ADMIN"><NotificationsPage /></DashboardLayout></ProtectedRoute>
            },

            // CHAT MESSENGER
            {
                path: "/student/messages",
                element: <ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout role="STUDENT"><ChatMessenger /></DashboardLayout></ProtectedRoute>
            },
            {
                path: "/admin/messages",
                element: <ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout role="ADMIN"><ChatMessenger /></DashboardLayout></ProtectedRoute>
            },
            {
                path: "/educator/messages",
                element: <ProtectedRoute allowedRoles={['EDUCATOR']}><DashboardLayout role="EDUCATOR"><ChatMessenger /></DashboardLayout></ProtectedRoute>
            },

            // REPORTS & SUPPORT
            { 
                path: "/student/reports", 
                element: <ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout role="STUDENT"><ReportsDashboardView role="STUDENT" /></DashboardLayout></ProtectedRoute> 
            },
            { 
                path: "/educator/reports", 
                element: <ProtectedRoute allowedRoles={['EDUCATOR']}><DashboardLayout role="EDUCATOR"><ReportsDashboardView role="EDUCATOR" /></DashboardLayout></ProtectedRoute> 
            },
            { 
                path: "/admin/reports", 
                element: <ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout role="ADMIN"><ReportsDashboardView role="ADMIN" /></DashboardLayout></ProtectedRoute> 
            },

            // 404 CATCH-ALL
            { path: '*', element: <NotFoundPage /> }
        ]
    }
]);