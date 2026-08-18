import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GlobalLoaderProvider } from '../context/GlobalLoaderContext';
// 🌟 1. IMPORT THE NOTIFICATION PROVIDER
import { NotificationProvider } from '../context/NotificationContext';
import ProtectedRoute from './ProtectedRoute';

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
import NotificationsPage from '../pages/shared/NotificationsPage'; // 🌟 Import it at the top
import ChatMessenger from '../pages/shared/ChatMessenger';

// 🌟 2. INJECT IT INTO YOUR ROOT LAYOUT
const RootLayout = () => {
    return (
        <AuthProvider>
            <GlobalLoaderProvider>
                <NotificationProvider> {/* 🌟 WRAP THE OUTLET HERE */}
                    <Outlet />
                </NotificationProvider>
            </GlobalLoaderProvider>
        </AuthProvider>
    );
};

// 🌟 3. ROUTER REMAINS EXACTLY THE SAME
export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: '/', element: <LandingPage /> },
            { path: '/login', element: <Login /> },
            { path: '/register', element: <Register /> },
            { path: '/privacy', element: <PrivacyPolicy /> },
            { path: '/terms', element: <TermsOfUse /> },
            { path: '/cookies', element: <CookiesPolicy /> },
            { path: '/forgot-password', element: <ForgotPassword /> },

            // Protected Dashboards
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

            // Live Exam Portal Route (Strictly Student)
            {
                path: "/student/exam/live/:id",
                element: (
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <LiveExamPortal />
                    </ProtectedRoute>
                )
            },

            // Test Analysis Route (Strictly Student)
            {
                path: "/student/analysis/:submissionId",
                element: (
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <TestAnalysisView />
                    </ProtectedRoute>
                )
            },

            // Assessment Reports (Educator)
            {
                path: "/educator/assessments/:id/reports",
                element: (
                    <ProtectedRoute allowedRoles={['EDUCATOR', 'ADMIN']}>
                        <DashboardLayout role="EDUCATOR">
                            <AssessmentReportView />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // Assessment Reports (Admin)
            {
                path: "/admin/assessments/:id/reports",
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <DashboardLayout role="ADMIN">
                            <AssessmentReportView />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // 🌟 STUDENT NOTIFICATIONS
            {
                path: "/student/notifications",
                element: (
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <DashboardLayout role="STUDENT">
                            <NotificationsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // 🌟 EDUCATOR NOTIFICATIONS
            {
                path: "/educator/notifications",
                element: (
                    <ProtectedRoute allowedRoles={['EDUCATOR']}>
                        <DashboardLayout role="EDUCATOR">
                            <NotificationsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // 🌟 ADMIN NOTIFICATIONS
            {
                path: "/admin/notifications",
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <DashboardLayout role="ADMIN">
                            <NotificationsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

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

            // 🌟 STUDENT NOTIFICATIONS
            {
                path: "/student/notifications",
                element: (
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <DashboardLayout role="STUDENT">
                            <NotificationsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // 🌟 EDUCATOR NOTIFICATIONS
            {
                path: "/educator/notifications",
                element: (
                    <ProtectedRoute allowedRoles={['EDUCATOR']}>
                        <DashboardLayout role="EDUCATOR">
                            <NotificationsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // 🌟 ADMIN NOTIFICATIONS
            {
                path: "/admin/notifications",
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <DashboardLayout role="ADMIN">
                            <NotificationsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                )
            },

            // 404 Catch-All
            { path: '*', element: <NotFoundPage /> }
        ]
    }
]);