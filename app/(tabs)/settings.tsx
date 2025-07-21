import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/components/ui/Toast";
import { Header } from "@/components/ui/Header"

import {
  Bell,
  CreditCard,
  Globe,
  Moon,
  Shield,
  User,
  ChevronRight,
  Smartphone,
  Mail,
  DollarSign
} from "lucide-react-native";

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState(user?.notificationPreferences || {
    bookings: true,
    investments: true,
    listings: true,
    marketing: false,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success("Notification preferences updated");
  };

  const settingSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          title: "Personal Information",
          subtitle: "Update your profile details",
          onPress: () => { },
          showChevron: true,
        },
        {
          icon: Shield,
          title: "Security",
          subtitle: "Password and two-factor authentication",
          onPress: () => { },
          showChevron: true,
        },
        {
          icon: CreditCard,
          title: "Payment Methods",
          subtitle: "Manage cards and crypto wallets",
          onPress: () => { },
          showChevron: true,
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          title: "Booking Updates",
          subtitle: "Confirmations and status changes",
          toggle: true,
          value: notifications.bookings,
          onToggle: (value: boolean) => handleNotificationChange("bookings", value),
        },
        {
          icon: DollarSign,
          title: "Investment Updates",
          subtitle: "Portfolio changes and opportunities",
          toggle: true,
          value: notifications.investments,
          onToggle: (value: boolean) => handleNotificationChange("investments", value),
        },
        {
          icon: Smartphone,
          title: "Property Listings",
          subtitle: "New properties and updates",
          toggle: true,
          value: notifications.listings,
          onToggle: (value: boolean) => handleNotificationChange("listings", value),
        },
        {
          icon: Mail,
          title: "Marketing Communications",
          subtitle: "Promotional emails and offers",
          toggle: true,
          value: notifications.marketing,
          onToggle: (value: boolean) => handleNotificationChange("marketing", value),
        },
      ],
    }
  ];
  return (
    <View style={styles.container}>
      <Header title="Settings" showBackButton={false} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              {section.title}
            </Typography>

            <Card style={styles.settingsCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <TouchableOpacity
                    onPress={item.onPress}
                    disabled={item.toggle}
                    style={styles.settingItem}
                  >
                    <View style={styles.settingContent}>
                      <item.icon size={24} color={colors.text.primary} />
                      <View style={styles.settingText}>
                        <Typography variant="body">
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {item.subtitle}
                        </Typography>
                      </View>
                    </View>

                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{
                          false: colors.border.medium,
                          true: colors.primary.lightGold,
                        }}
                        thumbColor={item.value ? colors.primary.gold : colors.neutral.white}
                      />
                    ) : item.showChevron ? (
                      <ChevronRight size={20} color={colors.text.secondary} />
                    ) : null}
                  </TouchableOpacity>

                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.settingDivider} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Support Section */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Support
          </Typography>

          <Card style={styles.supportCard}>
            <Typography variant="body" color="secondary" align="center">
              Need help? Our luxury concierge team is available 24/7 to assist you.
            </Typography>

            <View style={styles.supportButtons}>
              <Button
                title="Contact Us"
                onPress={() => toast.info("Opening support chat...")}
                variant="outline"
                style={styles.supportButton}
              />
              <Button
                title="Help Center"
                onPress={() => toast.info("Opening help center...")}
                variant="ghost"
                style={styles.supportButton}
              />
            </View>
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.section}>

          <Typography variant="caption" color="secondary" align="center">
            Renzi v1.0.0
          </Typography>
          <Typography variant="caption" color="secondary" align="center">
            Premium Luxury Real Estate Platform
          </Typography>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  header: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary.header,
  },

  subtitle: {
    marginTop: spacing.sm,
    opacity: 0.8,
  },

  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },

  sectionTitle: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  settingsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },

  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },

  settingText: {
    flex: 1,
    gap: spacing.xs,
  },

  settingDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing.md + 24 + spacing.md, // icon width + gap + padding
  },

  supportCard: {
    alignItems: "center",
    gap: spacing.md,

    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  supportButtons: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },

  supportButton: {
    flex: 1,
  },

  infoCard: {
    alignItems: "center",
    gap: spacing.xs,
  },
});