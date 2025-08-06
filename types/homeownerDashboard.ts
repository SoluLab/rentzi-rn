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
  pendingApprovals: number;
  totalEarnings: {
    amount: number;
    currency: string;
  };
  activeBookings: number;
}