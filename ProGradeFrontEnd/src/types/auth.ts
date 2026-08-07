export interface AuthResponse {
    token: string;
    fullName: string;
    email: string;
    role: string;
    isApproved: boolean; // Matches your DTO field
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    role: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}