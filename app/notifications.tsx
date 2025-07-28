import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  ArrowLeft,
  Bell,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AArrowDown,
  Home,
} from "lucide-react-native";
export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return Calendar;
      case "investment":
        return TrendingUp;
      case "listing":
        return Home;
      default:
        return Bell;
    }
  };
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking":
        return colors.status.info;
      case "investment":
        return colors.primary.gold;
      case "listing":
        return colors.status.success;
      default:
        return colors.text.secondary;
    }
  };
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    // Check if the date is today
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return "Today";
    } else {
      // Format as DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };
  const handleNotificationPress = (notification: any) => {
    if (!notification.readStatus) {
      markAsRead(notification.id);
    }
    // Navigate based on notification type
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Typography variant="h3">Notifications</Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" color="secondary">
              {unreadCount} unread
            </Typography>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.markAllButton}
          >
            <AArrowDown size={24} color={colors.primary.gold} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <Card
                    style={[
                      styles.notificationCard,
                      !notification.readStatus && styles.unreadCard,
                    ]}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationIcon}>
                        <IconComponent size={24} color={iconColor} />
                      </View>
                      <View style={styles.notificationText}>
                        <View style={styles.notificationHeader}>
                          <Typography variant="body" weight="semibold">
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </View>
                        <Typography
                          variant="body"
                          color="secondary"
                          numberOfLines={2}
                        >
                          {notification.message}
                        </Typography>
                        <View style={styles.notificationFooter}>
                          <View
                            style={[
                              styles.typeBadge,
                              { backgroundColor: iconColor },
                            ]}
                          >
                            <Typography variant="label" color="inverse">
                              {notification.type.toUpperCase()}
                            </Typography>
                          </View>
                          {!notification.readStatus && (
                            <View style={styles.unreadDot} />
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Bell size={64} color={colors.text.secondary} />
            <Typography variant="h3" color="secondary" align="center">
              No Notifications
            </Typography>
            <Typography variant="body" color="secondary" align="center">
              You're all caught up! We'll notify you when there's something new.
            </Typography>
            <Button
              title="Back to Dashboard"
              onPress={() => router.replace("/(tabs)")}
              variant="outline"
              style={styles.backToDashboard}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  markAllButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    padding: spacing.layout.screenPadding,
    gap: spacing.md,
  },
  notificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  unreadCard: {
    borderLeftColor: colors.primary.gold,

    backgroundColor: colors.background.card,

    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  notificationContent: {
    flexDirection: "row",
    gap: spacing.md,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    flex: 1,
    gap: spacing.sm,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.gold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xxxl,
    gap: spacing.lg,
  },
  backToDashboard: {
    marginTop: spacing.lg,
  },
});
