export interface DashboardStats {
  totalProperties: number;
  pendingApprovals: number;
  totalEarnings: {
    amount: number;
    currency: string;
  };
  activeBookings: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}