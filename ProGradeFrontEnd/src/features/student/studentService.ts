import { axiosClient } from '../../api/axiosClient';

export const studentService = {
    // 1. Fetch all Public Admin Assessments for the Default Grid
    getPublicAssessments: async () => {
        const response = await axiosClient.get('/student/assessments/public');
        return response.data;
    },

    // 2. Search for Private Educator Exams via Exam ID
    searchPrivateAssessment: async (examId: string) => {
        const response = await axiosClient.get(`/student/assessments/search?examId=${examId}`);
        return response.data;
    },

    // 3. Secure Passkey Validation Loop
    verifyExamPassword: async (examId: string, password: string) => {
        // If the password is wrong, the backend sends a 401, 
        // which triggers the shaking animation in the UI's catch block!
        const response = await axiosClient.post(`/student/assessments/${examId}/verify`, { password });
        return response.data;
    },
    getPublicAssessments: async () => {
        const response = await axiosClient.get('/student/assessments/public');
        return response.data;
    },
    searchPrivateAssessment: async (examId: string) => {
        const response = await axiosClient.get(`/student/assessments/search?examId=${examId}`);
        return response.data;
    },
    verifyExamPassword: async (examId: string, password: string) => {
        const response = await axiosClient.post(`/student/assessments/${examId}/verify`, { password });
        return response.data;
    },

    // 🌟 NEW LIVE EXAM METHODS
    getSecureExamPayload: async (assessmentId: string) => {
        const response = await axiosClient.get(`/student/live-exam/${assessmentId}`);
        return response.data;
    },
    submitExam: async (assessmentId: string, payload: any) => {
        const response = await axiosClient.post(`/student/live-exam/${assessmentId}/submit`, payload);
        return response.data;
    },
    reportMalpractice: async (assessmentId: string, infractionType: string, details: string) => {
        const response = await axiosClient.post(`/student/live-exam/${assessmentId}/fraud-log`, { 
            infraction: infractionType, 
            details: details 
        });
        return response.data;
    },
    getMyTranscripts: async () => {
        const response = await axiosClient.get('/student/live-exam/submissions');
        return response.data;
    },

    // Add this right below your getTestAnalysis function:
    getTestAnalysis: async (submissionId: string) => {
        const response = await axiosClient.get(`/student/live-exam/analysis/${submissionId}`);
        return response.data;
    },
    
    // 🌟 ADD THIS MISSING FUNCTION
    getAiInsights: async (submissionId: string) => {
        const response = await axiosClient.get(`/student/live-exam/analysis/${submissionId}/ai-insights`);
        return response.data;
    },

    // Inside studentService.ts
    getSecureExamPayload: async (examId: string) => {
        const response = await axiosClient.get(`/student/assessments/${examId}/secure-payload`);
        return response.data; // 🌟 Returns the raw JSON exactly as Java sends it
    },
};