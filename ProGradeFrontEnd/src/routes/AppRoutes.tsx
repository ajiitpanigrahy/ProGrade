import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GlobalLoaderProvider } from '../context/GlobalLoaderContext';
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

// 🌟 1. CREATE A ROOT LAYOUT TO HOLD CONTEXTS INSIDE THE ROUTER
const RootLayout = () => {
    return (
        <AuthProvider>
            <GlobalLoaderProvider>
                <Outlet /> {/* This renders whatever route is currently active */}
            </GlobalLoaderProvider>
        </AuthProvider>
    );
};

// 🌟 2. WRAP ALL ROUTES INSIDE THE ROOT LAYOUT
export const router = createBrowserRouter([
    {
        element: <RootLayout />, // The Contexts are now safely inside the router!
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

            // 404 Catch-All
            { path: '*', element: <NotFoundPage /> }
        ]
    }
]);