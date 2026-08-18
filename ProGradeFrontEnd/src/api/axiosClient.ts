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
        // 🌟 Logger Addition: Log raw status and data body directly to console for quick developer tracing
        console.error("API Error:", error.response?.status, error.response?.data);

        // Catch 401 (Unauthorized) and 403 (Forbidden) conditions safely
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath === '/register';

            // ONLY clear session data and redirect if they are NOT currently on an auth route
            if (!isAuthPage) {
                // Clear specific authentication tokens safely without breaking unrelated browser configurations
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                
                // Force route correction back to root login engine page
                window.location.href = '/login';
            }
            // If they ARE on the login/register page, do nothing here. Let your local views throw the shaking/error modal layout!
        }
        
        return Promise.reject(error);
    }
);
