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
    // getQuestionsByTech: async (technology: string, page: number, search: string, size: number = 10) => {
    //     const response = await axiosClient.get(`/admin/questions?technology=${technology}&page=${page}&size=${size}&search=${search}`);
    //     return response.data;
    // },
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
    // Add these alongside your other functions in adminService.ts
    getAllBatches: async () => {
        const res = await axiosClient.get('/batches');
        return res.data;
    },
    uploadBatchRoster: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axiosClient.post('/batches/upload', formData, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
        });
        return res.data;
    },
    // Add inside your adminService object:
    getStudents: async () => {
        const res = await axiosClient.get('/admin/students');
        return res.data;
    },
    toggleStudentStatus: async (id: string) => {
        const res = await axiosClient.patch(`/admin/students/${id}/toggle-status`);
        return res.data;
    },
    deleteStudent: async (id: string) => {
        const res = await axiosClient.delete(`/admin/students/${id}`);
        return res.data;
    },
    getBatchInfo: async () => (await axiosClient.get('/admin/batches/info')).data,
    deleteBatch: async (id: string) => (await axiosClient.delete(`/admin/batches/${id}`)).data,
    
    getOverallAnalytics: async () => (await axiosClient.get('/admin/analytics/overall')).data,
    getStudentAnalytics: async (id: string) => (await axiosClient.get(`/admin/analytics/student/${id}`)).data,
    getExamAnalytics: async (id: string) => (await axiosClient.get(`/admin/analytics/exam/${id}`)).data,
    // Inside src/features/admin/adminService.ts
    removeStudentFromBatch: async (studentId: string) => {
        const res = await axiosClient.delete(`/admin/batches/student/${studentId}`);
        return res.data;
    },

    getGlobalFraudLogs: async () => {
        const response = await axiosClient.get('/admin/fraud-logs');
        return response.data;
    },
    getQuestionAvailability: async (technology: string) => {
        const res = await axiosClient.get(`/admin/questions/availability?technology=${technology}`);
        return res.data;
    },
    getAdvancedAssessmentReport: async (assessmentId: number | string) => {
        const response = await axiosClient.get(`/admin/assessments/${assessmentId}/advanced-report`);
        return response.data;
    },

    getAllEducators: async () => {
        const response = await axiosClient.get('/admin/educators');
        return response.data;
    },

    toggleEducatorStatus: async (id: string) => {
        const response = await axiosClient.patch(`/admin/educators/${id}/toggle-status`);
        return response.data;
    },

    createQuestion: async (questionData: any) => {
        const response = await axiosClient.post('/admin/questions/create', questionData);
        return response.data;
    },

    updateQuestion: async (id: number, questionData: any) => {
        const response = await axiosClient.put(`/admin/questions/${id}`, questionData);
        return response.data;
    },

    // 🌟 1. NEW: Fetches exact inventory of Theory vs Coding questions
    getInventory: async (technology: string) => {
        const res = await axiosClient.get(`/admin/questions/inventory/${technology}`);
        return res.data;
    },

    // 🌟 2. UPDATED: Now accepts typeFilter for the Manual grid
    getQuestionsByTech: async (technology: string, page: number, search: string, size: number = 10, typeFilter: string = 'ALL') => {
        const response = await axiosClient.get(`/admin/questions?technology=${technology}&page=${page}&size=${size}&search=${search}&typeFilter=${typeFilter}`);
        return response.data;
    },

    // 🌟 FETCH BLUEPRINT QUESTIONS
    getAssessmentQuestions: async (id: number) => {
        const response = await axiosClient.get(`/assessments/${id}/questions`);
        return response.data;
    },
    // Add this new function to your adminService
    getQuestionContributionHistory: async () => {
        const response = await axiosClient.get('/admin/questions/history');
        return response.data;
    },
};