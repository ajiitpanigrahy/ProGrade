import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:2406/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Retained: Ensures cookie/session handshake consistency
});

// 🚀 Request Interceptor: Automatically inject JWT token into outbound requests
axiosClient.interceptors.request.use(
    (config) => {
        // ALWAYS attach token from local storage so it survives new tabs! 
        // Falls back to session storage gracefully if local is empty.
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 🛡️ Response Interceptor: Safe Error Processing & Conditional Route Redirection
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.status, error.response?.data);

        // 🌟 FIX: Removed the 403 check! Only log out on 401 (Token Expired/Invalid)
        if (error.response && error.response.status === 401) {
            
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath === '/register';

            if (!isAuthPage) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);
