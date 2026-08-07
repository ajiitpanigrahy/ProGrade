import { axiosClient } from '../../api/axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest} from '../../types/auth';

export const authService = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): AuthResponse | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};