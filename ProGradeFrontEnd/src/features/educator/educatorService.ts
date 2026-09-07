import { axiosClient } from '../../api/axiosClient';

export const educatorService = {
    getOverviewKPIs: async () => {
        const response = await axiosClient.get('/educator/overview/kpis');
        return response.data;
    },
    getDashboardCharts: async () => {
        const response = await axiosClient.get('/educator/overview/charts');
        return response.data;
    },
    getPendingReviews: async () => {
        const response = await axiosClient.get('/educator/grading/pending');
        return response.data;
    },
    getTopicMastery: async () => {
        const response = await axiosClient.get('/educator/analytics/mastery');
        return response.data;
    },
    getAssessmentReports: async (assessmentId: string) => {
        const response = await axiosClient.get(`/educator/assessments/${assessmentId}/reports`);
        return response.data;
    },
    etLeaderboard: async (timeFilter: string = 'ALL_TIME') => {
        const response = await axiosClient.get(`/educator/leaderboard?time=${timeFilter}`);
        return response.data;
    },
};