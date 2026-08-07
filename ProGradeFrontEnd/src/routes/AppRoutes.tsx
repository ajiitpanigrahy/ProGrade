import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/auth/LoginPage'; // Adjust path if needed
import Register from '../pages/auth/RegisterPage'; // Adjust path if needed
import ProtectedRoute from './ProtectedRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import EducatorDashboard from '../pages/educator/EducatorDashboard'; // Adjust path if needed
// import NotFoundPage from '../pages/NotFoundPage'; // Adjust path if needed
// import UnauthorizedPage from '../pages/UnauthorizedPage'; // Adjust path if needed
import LandingPage from '../pages/LandingPage'; // Adjust path if needed

import PrivacyPolicy from '../pages/legal/PrivacyPolicy';
import TermsOfUse from '../pages/legal/TermsOfUse';
import CookiesPolicy from '../pages/legal/CookiesPolicy';
import NotFound from '../pages/NotFoundPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/student/dashboard',
        element: (
            <ProtectedRoute>
                <StudentDashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: '/admin/dashboard',
        element: (
            <ProtectedRoute>
                <AdminDashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: '/educator/dashboard',
        element: (
            <ProtectedRoute>
                <EducatorDashboard />
            </ProtectedRoute>
        ),
    },
    // {
    //     path: '*',
    //     element: <NotFoundPage />,
    // }
    {
        path: '/privacy',
        element: <PrivacyPolicy /> // <-- Missing JSX brackets! React sees this as a raw object.
    },
    { path: '/terms', element: <TermsOfUse /> },
    { path: '/cookies', element: <CookiesPolicy /> },
    {
        path: '*',
        element: <NotFound />,
    }
]);