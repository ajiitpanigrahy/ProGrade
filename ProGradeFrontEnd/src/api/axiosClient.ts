import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:2406/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Automatically inject JWT token into requests
axiosClient.interceptors.request.use(
    (config) => {
        // Check local storage first, fallback to session storage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// SINGLE Response Interceptor
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Catch 401 (Unauthorized) and 403 (Forbidden)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === '/login' || currentPath === '/register';

            // ONLY clear session and redirect if they are NOT on the login/register page
            if (!isAuthPage) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
            }
            // If they ARE on the login page, do nothing here. Let Login.tsx catch it and show the modal!
        }
        
        return Promise.reject(error);
    }
);