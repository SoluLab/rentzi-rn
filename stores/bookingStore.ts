import { create } from 'zustand';
import { Booking } from '@/types';
interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  createBooking: (bookingData: Omit<Booking, 'id'>) => Promise<void>;
  getUserBookings: (userId: string) => Booking[];
  updateBookingStatus: (bookingId: string, status: Booking['bookingStatus']) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  canEditBooking: (booking: Booking) => boolean;
}
const mockBookings: Booking[] = [
  {
    id: '1',
    propertyId: '1',
    userId: '1',
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    guestsCount: 4,
    paymentStatus: 'confirmed',
    bookingStatus: 'upcoming',
    totalAmount: 12500,
    currency: 'USD',
    paymentMethod: 'Platinum Card',
  },
  {
    id: '2',
    propertyId: '2',
    userId: '1',
    startDate: '2024-02-01',
    endDate: '2024-02-05',
    guestsCount: 2,
    paymentStatus: 'confirmed',
    bookingStatus: 'completed',
    totalAmount: 14000,
    currency: 'USD',
    paymentMethod: 'Bitcoin Wallet',
  },
];
export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: mockBookings,
  isLoading: false,
  createBooking: async (bookingData: Omit<Booking, 'id'>) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
    };
    set((state) => ({
      bookings: [...state.bookings, newBooking],
      isLoading: false,
    }));
  },
  getUserBookings: (userId: string) => {
    const { bookings } = get();
    return bookings.filter((booking) => booking.userId === userId);
  },
  updateBookingStatus: (bookingId: string, status: Booking['bookingStatus']) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, bookingStatus: status } : booking
      ),
    }));
  },
  updateBooking: async (bookingId: string, updates: Partial<Booking>) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ),
      isLoading: false,
    }));
  },
  canEditBooking: (booking: Booking) => {
    return booking.bookingStatus === 'upcoming';
  },
}));