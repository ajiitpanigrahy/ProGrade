import { axiosClient } from "../../api/axiosClient";
import type {
  DashboardMetrics,
  DashboardCharts,
  PendingEducator,
} from "../../types/admin";

export const adminService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await axiosClient.get<DashboardMetrics>("/admin/metrics");
    return response.data;
  },

  checkSystemStatus: async () => {
        const response = await axiosClient.get('/public/system/status');
        return response.data;
    },

  getCharts: async (): Promise<DashboardCharts> => {
    const response = await axiosClient.get<DashboardCharts>("/admin/charts");
    return response.data;
  },

  getPendingEducators: async (): Promise<PendingEducator[]> => {
    const response = await axiosClient.get<PendingEducator[]>(
      "/admin/educators/pending",
    );
    return response.data;
  },

  approveEducator: async (id: string): Promise<string> => {
    const response = await axiosClient.put<string>(
      `/admin/educators/${id}/approve`,
    );
    return response.data;
  },

  rejectEducator: async (id: string): Promise<string> => {
    const response = await axiosClient.delete<string>(
      `/admin/educators/${id}/reject`,
    );
    return response.data;
  },

  getSystemLogs: async (
    level: string,
    dateFilter: string,
    customStart: string,
    customEnd: string,
    page: number,
    size: number,
    sort: string,
  ) => {
    let startTime = null;
    let endTime = null;
    const now = new Date();
    // Calculate Epoch Timestamps based on filter
    if (dateFilter !== "ALL") {
      const startDate = new Date();
      if (dateFilter === "TODAY") startDate.setHours(0, 0, 0, 0);
      else if (dateFilter === "WEEKLY") startDate.setDate(now.getDate() - 7);
      else if (dateFilter === "15D") startDate.setDate(now.getDate() - 15);
      else if (dateFilter === "30D") startDate.setMonth(now.getMonth() - 1);
      else if (dateFilter === "90D") startDate.setMonth(now.getMonth() - 3);
      else if (dateFilter === "CUSTOM" && customStart && customEnd) {
        startTime = new Date(customStart).getTime();
        endTime = new Date(customEnd).setHours(23, 59, 59, 999);
      }

      if (dateFilter !== "CUSTOM") {
        startTime = startDate.getTime();
        endTime = now.getTime();
      }
    }

    const params = new URLSearchParams({
      level,
      page: (page - 1).toString(), // Spring Data JPA is 0-indexed
      size: size.toString(),
      sortDirection: sort,
    });

    if (startTime) params.append("startTime", startTime.toString());
    if (endTime) params.append("endTime", endTime.toString());

    const response = await axiosClient.get(`/admin/logs?${params.toString()}`);
    return response.data; // Returns a Spring Page object
  },


  getSystemHealth: async () => {
        const response = await axiosClient.get('/admin/health');
        return response.data;
    },
    updateLogLevel: async (loggerName: string, level: string) => {
        const response = await axiosClient.post(`/admin/health/loglevel?loggerName=${loggerName}&level=${level}`);
        return response.data;
    },

    getSettings: async () => {
        const response = await axiosClient.get('/admin/settings');
        return response.data;
    },
    updateSettings: async (settingsData: any) => {
        const response = await axiosClient.put('/admin/settings', settingsData);
        return response.data;
    },
    uploadBulkQuestions: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axiosClient.post('/admin/questions/bulk-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getQuestionSummaries: async () => {
        const response = await axiosClient.get('/admin/questions/summary');
        return response.data;
    },
    getQuestionsByTech: async (technology: string, page: number, search: string, size: number = 10) => {
        const response = await axiosClient.get(`/admin/questions?technology=${technology}&page=${page}&size=${size}&search=${search}`);
        return response.data;
    },
    deleteQuestion: async (id: number) => {
        const response = await axiosClient.delete(`/admin/questions/${id}`);
        return response.data;
    },
    createAssessment: async (payload: any) => {
        const response = await axiosClient.post('/assessments/create', payload);
        return response.data;
    },
    getAllAssessments: async () => {
        const response = await axiosClient.get('/assessments');
        return response.data;
    },
   // Add these inside your adminService object
    deleteAssessment: async (id: number) => {
        const response = await axiosClient.delete(`/assessments/${id}`);
        return response.data;
    },
    toggleAssessmentStatus: async (id: number) => {
        const response = await axiosClient.patch(`/assessments/${id}/toggle-status`);
        return response.data;
    },
    postponeAssessment: async (id: number, startTime: string) => {
        const response = await axiosClient.patch(`/assessments/${id}/postpone`, { startTime });
        return response.data;
    },
};