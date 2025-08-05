import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface Notification {
  type: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

// Update dummy data for rental app
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    type: "Rent Alert",
    title: "Rent Due Reminder",
    message: "Your July rent of ₹12,000 is due tomorrow.",
    time: "2 hours ago",
    unread: true
  },
  {
    type: "Property Update",
    title: "New Property Available in Delhi",
    message: "A 2BHK apartment is now available near Connaught Place.",
    time: "Today",
    unread: true
  },
  {
    type: "Reminder",
    title: "Site Visit Scheduled",
    message: "Your site visit to Green Villas is confirmed for 5 PM today.",
    time: "Today",
    unread: false
  },
  {
    type: "Document",
    title: "Rental Agreement Uploaded",
    message: "Your rental agreement for Flat #A-302 has been uploaded.",
    time: "Yesterday",
    unread: false
  },
  {
    type: "Rent Alert",
    title: "Payment Received",
    message: "We have received your rent payment of ₹12,000 for June.",
    time: "Last Week",
    unread: false
  }
];

// Update filter tabs for rental app
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Rent Alerts", value: "Rent Alert" },
  { label: "Property Updates", value: "Property Update" },
  { label: "Reminders", value: "Reminder" },
  { label: "Documents", value: "Document" },
];

// Update icon mapping for rental app
const TYPE_ICONS: { [key: string]: string } = {
  "Rent Alert": "💰",
  "Property Update": "🏠",
  "Reminder": "🔔",
  "Document": "📃",
};

interface GroupedNotifications {
  label: string;
  data: Notification[];
}

function groupNotificationsByDate(notifications: Notification[]): GroupedNotifications[] {
  const groups: { [key: string]: Notification[] } = {};
  notifications.forEach((n: Notification) => {
    let group = n.time;
    if (group === "2 hours ago") group = "Today";
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  });
  // Sort: Today, Yesterday, Last Week, then others
  const order = ["Today", "Yesterday", "Last Week"];
  const sorted = Object.keys(groups)
    .sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    })
    .map((k) => ({ label: k, data: groups[k] }));
  return sorted;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Notification | null>(null);

  // Filter and search notifications
  const filteredNotifications: Notification[] = useMemo(() => {
    return DUMMY_NOTIFICATIONS.filter((n: Notification) => {
      const matchesFilter = filter === "all" || n.type === filter;
      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [search, filter]);

  const grouped: GroupedNotifications[] = useMemo(
    () => groupNotificationsByDate(filteredNotifications),
    [filteredNotifications]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ flex: 1, textAlign: "center" }}>
          Notifications
        </Typography>
        <View style={{ width: 24 }} />
      </View>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Input
          placeholder="Search notifications..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
          variant="outlined"
        />
      </View>
      {/* Filter Tabs */}
      <ScrollView
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab as ViewStyle,
              filter === tab.value && (styles.tabActive as ViewStyle),
            ]}
            onPress={() => setFilter(tab.value)}
            activeOpacity={0.8}
          >
            <Typography
              variant="body2"
              color={filter === tab.value ? "inverse" : "secondary"}
              weight={filter === tab.value ? "bold" : "normal"}
            >
              {tab.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Notification List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {grouped.length === 0 ? (
          <View style={styles.emptyContainer}>
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
        ) : (
          grouped.map((group: GroupedNotifications) => (
            <View key={group.label} style={styles.groupSection}>
              <Typography variant="h5" color="muted" style={styles.groupLabel}>
                {group.label}
              </Typography>
              {group.data.map((notification: Notification, idx: number) => (
                <TouchableOpacity
                  key={notification.title + idx}
                  onPress={() => setSelected(notification)}
                  activeOpacity={0.85}
                >
                  <Card
                    style={([
                      styles.notificationCard as ViewStyle,
                      notification.unread ? (styles.unreadCard as ViewStyle) : null,
                    ].filter(Boolean) as ViewStyle[]) as any}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationIcon}>
                        <Typography style={{ fontSize: 24 }}>
                          {TYPE_ICONS[notification.type] || "🔔"}
                        </Typography>
                      </View>
                      <View style={styles.notificationText}>
                        <View style={styles.notificationHeader}>
                          <Typography
                            variant="body"
                            weight={notification.unread ? "bold" : "semibold"}
                            style={notification.unread ? styles.unreadTitle : undefined}
                          >
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {notification.time}
                          </Typography>
                        </View>
                        <Typography
                          variant="body2"
                          color="secondary"
                          numberOfLines={2}
                        >
                          {notification.message}
                        </Typography>
                        <View style={styles.notificationFooter}>
                          <View
                            style={[
                              styles.typeBadge as ViewStyle,
                              notification.type === "Rent Alert"
                                ? { backgroundColor: colors.primary.gold }
                                : notification.type === "Property Update"
                                ? { backgroundColor: colors.primary.blue }
                                : notification.type === "Reminder"
                                ? { backgroundColor: colors.status.info }
                                : { backgroundColor: colors.status.warning },
                            ]}
                          >
                            <Typography variant="label" color="inverse">
                              {notification.type.toUpperCase()}
                            </Typography>
                          </View>
                          {notification.unread && <View style={styles.unreadDot} />}
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      {/* Detail Modal */}
      <Modal visible={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <Card style={styles.detailCard as ViewStyle}>
            <View style={styles.detailIconRow}>
              <Typography style={{ fontSize: 32 }}>
                {TYPE_ICONS[selected.type] || "🔔"}
              </Typography>
              <View style={styles.detailTypeBadge}>
                <Typography variant="label" color="inverse">
                  {selected.type.toUpperCase()}
                </Typography>
              </View>
            </View>
            <Typography variant="h4" weight="bold" style={{ marginBottom: spacing.md }}>
              {selected.title}
            </Typography>
            <Typography variant="body" style={{ marginBottom: spacing.md }}>
              {selected.message}
            </Typography>
            <Typography variant="caption" color="secondary">
              {selected.time}
            </Typography>
            <Button
              title="Close"
              onPress={() => setSelected(null)}
              variant="outline"
              style={{ marginTop: spacing.lg }}
            />
          </Card>
        )}
      </Modal>
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
    backgroundColor: colors.background.card,
  },
  backButton: {
    padding: spacing.sm,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background.primary,
  },
  searchBar: {
    borderRadius: radius.input,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.layout.screenPadding,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.lightGray,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary.gold,
    shadowColor: colors.primary.gold,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  groupSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.layout.screenPadding,
  },
  groupLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    fontSize: 15,
  },
  notificationCard: {
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  unreadCard: {
    borderLeftColor: colors.primary.gold,
    backgroundColor: colors.background.card,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  notificationText: {
    flex: 1,
    gap: spacing.xs,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  unreadTitle: {
    fontWeight: "bold",
    color: colors.text.primary,
    fontSize: 15,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
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
    marginLeft: spacing.md,
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
  detailCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: colors.background.card,
    minWidth: 280,
    maxWidth: 360,
    alignSelf: "center",
  },
  detailIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailTypeBadge: {
    backgroundColor: colors.primary.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginLeft: spacing.md,
  },
  tabsScrollView: {
    maxHeight: 44,
    marginBottom: 0,
    backgroundColor: colors.background.primary,
  },
});
