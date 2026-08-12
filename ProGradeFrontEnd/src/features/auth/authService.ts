import { axiosClient } from '../../api/axiosClient';
import type { LoginRequest, RegisterRequest } from '../../types/auth'; // Only import requests, NOT AuthResponse

// 1. Define the UserData with all profile fields
export interface UserData {
    fullName: string;
    email: string;
    role: string;
    isApproved: boolean;
    profilePictureUrl?: string;
    phoneNumber?: string;
    gender?: string;
    highestQualification?: string;
}

// 2. Define AuthResponse strictly here
export interface AuthResponse extends UserData {
    token: string;
}

export const authService = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
        // 🚨 Removed localStorage.setItem from here! 
        // AuthContext handles saving to storage based on the "Remember Me" checkbox.
        return response.data;
    },

    checkSystemStatus: async () => {
        const response = await axiosClient.get('/public/system/status');
        return response.data;
    },

    logout: async (): Promise<void> => {
        // Call the backend to blacklist the token, AuthContext handles the frontend storage clearing.
        try {
            await axiosClient.post('/auth/logout');
        } catch (e) {
            console.error("Backend logout failed", e);
        }
    },

    getCurrentUser: (): AuthResponse | null => {
        // Check both storages to support the Remember Me feature
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};