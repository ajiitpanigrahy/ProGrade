export interface DashboardMetrics {
    totalUsers: number;
    pendingApprovals: number;
    activeExams: number;
    monthlyRevenue: number;
}

export interface PendingEducator {
    id: string;
    name: string;
    email: string;
    dateApplied: string;
}

export interface ChartDataMap {
    name: string;
    value?: number;
    students?: number;
    educators?: number;
    revenue?: number;
    color?: string;
}

export interface DashboardCharts {
    roleDistribution: ChartDataMap[];
    userGrowth: ChartDataMap[];
    revenueGrowth: ChartDataMap[];
    passFailRatio: ChartDataMap[];
}