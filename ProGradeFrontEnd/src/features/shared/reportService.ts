import { axiosClient } from '../../api/axiosClient';

export const reportService = {
    submitReport: async (payload: any) => {
        const response = await axiosClient.post('/reports', payload);
        return response.data;
    },
    getAdminReports: async () => {
        const response = await axiosClient.get('/admin/reports');
        return response.data;
    },
    getMyReports: async () => {
        const response = await axiosClient.get('/reports/my');
        return response.data;
    },
    updateReportStatus: async (id: number, status: string, notes?: string) => {
        const response = await axiosClient.put(`/admin/reports/${id}/status`, { status, notes });
        return response.data;
    },
    // 🌟 ADD THIS
    reopenReport: async (id: number) => {
        const response = await axiosClient.put(`/reports/my/${id}/reopen`);
        return response.data;
    }
};