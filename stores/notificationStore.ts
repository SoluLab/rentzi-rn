import { create } from "zustand";
import { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    type: "booking",
    title: "Booking Confirmed",
    message: "Your booking for Luxury Oceanfront Villa has been confirmed for March 15-20, 2024.",
    readStatus: false,
    timestamp: "2025-07-18T10:30:00Z",
  },
  {
    id: "2",
    userId: "1",
    type: "investment",
    title: "Investment Update",
    message: "Your investment in Manhattan Penthouse Suite has increased by 15.2% this quarter.",
    readStatus: false,
    timestamp: "2025-07-15T14:15:00Z",
  },
  {
    id: "3",
    userId: "1",
    type: "system",
    title: "New Property Available",
    message: "A new luxury property matching your preferences is now available for investment.",
    readStatus: true,
    timestamp: "2025-06-08T09:00:00Z",
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.readStatus).length,

  markAsRead: (notificationId: string) => {
    set(state => ({
      notifications: state.notifications.map(notification =>
        notification.id === notificationId 
          ? { ...notification, readStatus: true }
          : notification
      ),
      unreadCount: state.notifications.filter(n => 
        n.id !== notificationId && !n.readStatus
      ).length,
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        readStatus: true,
      })),
      unreadCount: 0,
    }));
  },

  addNotification: (notificationData: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));