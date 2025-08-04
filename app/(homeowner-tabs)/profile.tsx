import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useGetProfile } from '@/services/apiClient';

import {
  User,
  Settings,
  Bell,
  CreditCard,
  Shield,
  ChevronRight,
  Building2,
  CheckCircle2,
  FileText,
  BarChart3,
  HelpCircle,
  AArrowDown,
  LogOut,
  Camera,
  Edit,
  Upload,
  Eye,
} from 'lucide-react-native';
export default function HomeownerProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { data: profileData, isLoading, error } = useGetProfile('homeowner');

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleProfilePictureUpload = () => {
    // TODO: Implement profile picture upload
    console.log('Profile picture upload');
  };
  const profileMenuItems = [
    {
      icon: User,
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      onPress: () => router.push('/edit-profile'),
    },
    {
      icon: Building2,
      title: 'Property Settings',
      subtitle: 'Manage property preferences',
      onPress: () => console.log('Property settings'),
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      subtitle: 'View detailed performance metrics',
      onPress: () => console.log('Analytics'),
    },
    {
      icon: CreditCard,
      title: 'Payment & Payouts',
      subtitle: 'Manage payment methods and payouts',
      onPress: () => console.log('Payment settings'),
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => router.push('/notifications'),
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      subtitle: 'Password and security settings',
      onPress: () => console.log('Security settings'),
    },
    {
      icon: FileText,
      title: 'Legal & Compliance',
      subtitle: 'Terms, policies, and tax documents',
      onPress: () => console.log('Legal documents'),
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: '24/7 support for property owners',
      onPress: () => console.log('Help center'),
    },
  ];
  const quickStats = [
    { label: 'Properties Listed', value: '12' },
    { label: 'Total Bookings', value: '156' },
    { label: 'Average Rating', value: '4.8' },
    { label: 'Response Rate', value: '98%' },
  ];
  return (
    <View style={styles.container}>
      <Header title="Profile" showBackButton={false} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => router.push('/edit-profile')}>
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <TouchableOpacity onPress={handleProfilePictureUpload}>
                  <Image
                    source={{
                      uri:
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40'
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.cameraOverlay}>
                    <Camera size={16} color={colors.neutral.white} />
                  </View>
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                  <Typography variant="h4">{profileData?.data?.name || 'Loading...'}</Typography>
                  <Typography variant="body" color="secondary">
                    {profileData?.data?.email || 'Loading...'}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {profileData?.data?.phone?.countryCode} {profileData?.data?.phone?.mobile}
                  </Typography>
                  <View style={styles.roleContainer}>
                    <View style={styles.roleBadge}>
                      <Typography variant="label" color="inverse">
                        PROPERTY OWNER
                      </Typography>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: colors.status.success }]}>
                      <Typography variant="label" color="inverse">
                        VERIFIED
                      </Typography>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/edit-profile')}>
                  <Edit size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        </View>


        {/* Quick Stats */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Quick Stats
          </Typography>
          <View style={styles.statsContainer}>
            {quickStats.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <Typography variant="h4" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="secondary" align="center">
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </View>
        </View>
        {/* Menu Items */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Account Settings
          </Typography>
          <Card style={styles.menuCard}>
            {profileMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={[
                  styles.menuItem,
                  index < profileMenuItems.length - 1 && styles.menuItemBorder,
                ]}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemIcon}>
                    <item.icon size={24} color={colors.text.primary} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Typography variant="body">{item.title}</Typography>
                    <Typography variant="caption" color="secondary">
                      {item.subtitle}
                    </Typography>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
        {/* Support Section */}
        <View style={styles.section}>
          <Card style={styles.supportCard}>
            <Typography variant="h5" color="primary" align="center">
              Need Help?
            </Typography>
            <Typography variant="body" color="secondary" align="center">
              Our dedicated property owner support team is available 24/7 to help you maximize your
              earnings.
            </Typography>
            <View style={styles.supportButtons}>
              <Button
                title="Contact Support"
                onPress={() => console.log('Contact support')}
                variant="outline"
                style={styles.supportButton}
              />
              <Button
                title="Owner Resources"
                onPress={() => console.log('Owner resources')}
                variant="ghost"
                style={styles.supportButton}
              />
            </View>
          </Card>
        </View>
        {/* App Info */}
        <View style={styles.section}>
          <Typography variant="caption" color="secondary" align="center">
            RentziLux Property Owner v1.0.0
          </Typography>
          <Typography variant="caption" color="secondary" align="center">
            Premium Luxury Real Estate Platform
          </Typography>
        </View>
        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.status.error }]}
            onPress={handleLogout}
          >
            <View style={styles.logoutButtonContent}>
              <LogOut size={20} color={colors.status.error} />
              <Typography variant="body" color="error">
                Sign Out
              </Typography>
            </View>
          </TouchableOpacity>
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
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary.gold,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.gold,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primary.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  menuCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    marginRight: spacing.md,
  },
  menuItemText: {
    flex: 1,
    gap: spacing.xs,
  },

  supportCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: spacing.xl,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  supportButton: {
    flex: 1,
  },
  logoutButton: {
    borderColor: colors.status.error,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});