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
    }
};