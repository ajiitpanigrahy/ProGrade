import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        const hydrateSession = async () => {
            try {
                // 🌟 THE FIX: Save token to localStorage immediately so the axiosInterceptor finds it!
                localStorage.setItem('token', token);
                
                // Now fetch user data securely
                const response = await axiosClient.get('/auth/me');
                const userData = response.data;

                // Log the user into the global React Context
                login(token, userData, true);

                // Redirect based on role and approval status
                if (userData.role === 'EDUCATOR' && !userData.isApproved) {
                    navigate('/login?bypass=pending'); // Sends them back to login to see the "Under Review" modal
                } else if (userData.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (userData.role === 'EDUCATOR') {
                    navigate('/educator/dashboard');
                } else {
                    navigate('/student/dashboard');
                }

            } catch (error) {
                console.error("OAuth Hydration Failed:", error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        hydrateSession();
    }, [searchParams, navigate, login]);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#05020a] text-white">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <h2 className="text-xl font-black tracking-widest uppercase text-purple-400">Authenticating...</h2>
            <p className="text-sm text-gray-500 mt-2">Securing your session with external provider.</p>
        </div>
    );
}