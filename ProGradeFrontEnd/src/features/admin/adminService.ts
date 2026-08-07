import { axiosClient } from '../../api/axiosClient';
import type { DashboardMetrics, DashboardCharts, PendingEducator } from '../../types/admin';

export const adminService = {
    
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response = await axiosClient.get<DashboardMetrics>('/admin/metrics');
        return response.data;
    },

    getCharts: async (): Promise<DashboardCharts> => {
        const response = await axiosClient.get<DashboardCharts>('/admin/charts');
        return response.data;
    },

    getPendingEducators: async (): Promise<PendingEducator[]> => {
        const response = await axiosClient.get<PendingEducator[]>('/admin/educators/pending');
        return response.data;
    },

    approveEducator: async (id: string): Promise<string> => {
        const response = await axiosClient.put<string>(`/admin/educators/${id}/approve`);
        return response.data;
    },

    rejectEducator: async (id: string): Promise<string> => {
        const response = await axiosClient.delete<string>(`/admin/educators/${id}/reject`);
        return response.data;
    }
};