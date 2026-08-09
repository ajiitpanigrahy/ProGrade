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

// Optional but highly recommended: Kick user to login if the backend says their token expired
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear storage and redirect on 401 Unauthorized
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);