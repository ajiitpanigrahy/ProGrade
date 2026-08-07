import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'http://localhost:2406/api/v1', // Updated to match your Spring Boot port
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Automatically inject JWT token into requests
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);