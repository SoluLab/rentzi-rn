export interface DashboardRecentBooking {
  _id: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
}

export interface MonthlyStats {
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  draftProperties: number;
  pendingApproval: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
  occupancyRate: number;
  recentBookings: DashboardRecentBooking[];
  monthlyStats: Record<string, MonthlyStats>;
}