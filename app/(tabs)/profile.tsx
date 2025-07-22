import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useInvestmentStore } from '@/stores/investmentStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePropertyStore } from '@/stores/propertyStore';
import { Header } from '@/components/ui/Header';
import { toast } from '@/components/ui/Toast';
import {
  User,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Settings,
  Bell,
  CreditCard,
  Shield,
  ChevronRight,
  Home,
  Globe,
  Moon,
  Smartphone,
  Mail,
  DollarSign,
  Heart,
  Trash2,
} from 'lucide-react-native';
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { getUserBookings } = useBookingStore();
  const { getUserInvestments, getTotalPortfolioValue } = useInvestmentStore();
  const { unreadCount } = useNotificationStore();
  const [notifications, setNotifications] = useState(
    user?.notificationPreferences || {
      bookings: true,
      investments: true,
      listings: true,
      marketing: false,
    }
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const userBookings = user ? getUserBookings(user.id) : [];
  const userInvestments = user ? getUserInvestments(user.id) : [];
  const portfolioValue = user ? getTotalPortfolioValue(user.id) : 0;
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast.success('Notification preferences updated');
  };
  const profileStats = [
    {
      icon: Calendar,
      title: 'Bookings',
      value: userBookings.length.toString(),
      subtitle: 'Total reservations',
    },
    {
      icon: TrendingUp,
      title: 'Investments',
      value: userInvestments.length.toString(),
      subtitle: `$${portfolioValue.toLocaleString()} value`,
    },
    {
      icon: Home,
      title: 'Properties',
      value: '0',
      subtitle: 'Listed properties',
    },
  ];
  const accountMenuItems = [
    {
      icon: User,
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      onPress: () => router.push('/edit-profile'),
    },
    {
      icon: Heart,
      title: 'Wishlist',
      subtitle: 'View your saved properties',
      onPress: () => router.push('/wishlist'),
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      subtitle: 'Password and two-factor authentication',
      onPress: () => toast.info('Opening security settings...'),
    },
  ];
  const notificationItems = [
    {
      icon: Bell,
      title: 'Booking Updates',
      subtitle: 'Confirmations and status changes',
      toggle: true,
      value: notifications.bookings,
      onToggle: (value: boolean) => handleNotificationChange('bookings', value),
    },
    {
      icon: DollarSign,
      title: 'Investment Updates',
      subtitle: 'Portfolio changes and opportunities',
      toggle: true,
      value: notifications.investments,
      onToggle: (value: boolean) => handleNotificationChange('investments', value),
    },
    {
      icon: Smartphone,
      title: 'Property Listings',
      subtitle: 'New properties and updates',
      toggle: true,
      value: notifications.listings,
      onToggle: (value: boolean) => handleNotificationChange('listings', value),
    },
    {
      icon: Mail,
      title: 'Marketing Communications',
      subtitle: 'Promotional emails and offers',
      toggle: true,
      value: notifications.marketing,
      onToggle: (value: boolean) => handleNotificationChange('marketing', value),
    },
  ];
  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };
  const confirmDeleteAccount = () => {
    if (deleteConfirmed) {
      // Here you would typically call an API to delete the account
      toast.success('Account deletion initiated');
      setShowDeleteModal(false);
      setDeleteConfirmed(false);
      logout();
      router.replace('/(auth)/login');
    }
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmed(false);
  };
  const handleNotifications = () => {
    router.push('/notifications');
  };
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'investor':
        return colors.primary.gold;
      case 'homeowner':
        return colors.status.info;
      default:
        return colors.text.secondary;
    }
  };
  const headerRightComponent = (
    <TouchableOpacity onPress={handleNotifications} style={styles.notificationButton}>
      <Bell size={24} color={colors.neutral.white} />
      {unreadCount > 0 && (
        <View style={styles.notificationBadge}>
          <Typography variant="label" color="inverse">
            {unreadCount}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <Header title="Profile" showBackButton={false} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => router.push('/edit-profile')}>
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Image
                  source={{
                    uri:
                      user?.profileDetails.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                  <Typography variant="h4">{user?.name}</Typography>
                  <Typography variant="body" color="secondary">
                    {user?.email}
                  </Typography>
                  <View style={styles.roleContainer}>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: getRoleBadgeColor(user?.role || '') },
                      ]}
                    >
                      <Typography variant="label" color="inverse">
                        {user?.role?.toUpperCase()}
                      </Typography>
                    </View>
                    {user?.investmentStatus && (
                      <View style={[styles.roleBadge, { backgroundColor: colors.primary.gold }]}>
                        <Typography variant="label" color="inverse">
                          INVESTOR
                        </Typography>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {user?.profileDetails.bio && (
                <Typography variant="body" color="secondary" style={styles.bio}>
                  {user.profileDetails.bio}
                </Typography>
              )}
            </Card>
          </TouchableOpacity>
        </View>
        {/* Stats */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Your Activity
          </Typography>
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <View style={styles.statContent}>
                  <stat.icon size={24} color={colors.primary.gold} />
                  <View style={styles.statText}>
                    <Typography variant="h4">{stat.value}</Typography>
                    <Typography variant="caption" color="secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="label" color="secondary">
                      {stat.subtitle}
                    </Typography>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
        {/* Account Settings */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Account Settings
          </Typography>
          <Card style={styles.menuCard}>
            {accountMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={[
                  styles.menuItem,
                  index < accountMenuItems.length - 1 && styles.menuItemBorder,
                ]}
              >
                <View style={styles.menuItemContent}>
                  <item.icon size={24} color={colors.text.primary} />
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
        {/* Notification Settings */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Notifications
          </Typography>
          <Card style={styles.menuCard}>
            {notificationItems.map((item, index) => (
              <View key={index}>
                <TouchableOpacity disabled={item.toggle} style={styles.menuItem}>
                  <View style={styles.menuItemContent}>
                    <item.icon size={24} color={colors.text.primary} />
                    <View style={styles.menuItemText}>
                      <Typography variant="body">{item.title}</Typography>
                      <Typography variant="caption" color="secondary">
                        {item.subtitle}
                      </Typography>
                    </View>
                  </View>
                  {item.toggle && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{
                        false: colors.border.medium,
                        true: colors.primary.lightGold,
                      }}
                      thumbColor={item.value ? colors.primary.gold : colors.neutral.white}
                    />
                  )}
                </TouchableOpacity>
                {index < notificationItems.length - 1 && <View style={styles.menuItemBorder} />}
              </View>
            ))}
          </Card>
        </View>
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
                onPress={() => toast.info('Opening support chat...')}
                variant="outline"
                style={styles.supportButton}
              />
              <Button
                title="Help Center"
                onPress={() => toast.info('Opening help center...')}
                variant="ghost"
                style={styles.supportButton}
              />
            </View>
          </Card>
        </View>
        {/* App Info */}
        <View style={styles.section}>
          <Typography variant="caption" color="secondary" align="center">
          Rentzy v1.0.0
          </Typography>
          <Typography variant="caption" color="secondary" align="center">
            Premium Luxury Real Estate Platform
          </Typography>
        </View>
        {/* Logout */}
        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
        {/* Delete Account */}
        <View style={styles.section}>
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="outline"
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} onClose={closeDeleteModal}>
        <View style={styles.deleteModalContent}>
          <View style={styles.deleteModalHeader}>
            <Trash2 size={32} color={colors.status.error} />
            <Typography variant="h3" style={styles.deleteModalTitle}>
              Delete Account
            </Typography>
          </View>
          <Typography variant="body" color="secondary" style={styles.deleteModalMessage}>
            By deleting your account, all your data will be permanently removed. This action cannot
            be undone, and no backup will be available.
          </Typography>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setDeleteConfirmed(!deleteConfirmed)}
          >
            <View style={[styles.checkbox, deleteConfirmed && styles.checkboxChecked]}>
              {deleteConfirmed && <CheckCircle2 size={16} color={colors.neutral.white} />}
            </View>
            <Typography variant="body" style={styles.checkboxText}>
              I understand and confirm that I want to delete my account
            </Typography>
          </TouchableOpacity>
          <View style={styles.deleteModalActions}>
            <Button
              title="Cancel"
              onPress={closeDeleteModal}
              variant="outline"
              style={styles.deleteModalButton}
            />
            <Button
              title="Delete Account"
              onPress={confirmDeleteAccount}
              variant="primary"
              disabled={!deleteConfirmed}
              style={[
                styles.deleteModalButton,
                styles.deleteConfirmButton,
                !deleteConfirmed && styles.deleteButtonDisabled,
              ]}
            />
          </View>
        </View>
      </Modal>
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
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  profileCard: {
    gap: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary.gold,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  bio: {
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  statText: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
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
    gap: spacing.md,
    flex: 1,
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
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  supportButton: {
    flex: 1,
  },
  logoutButton: {},
  deleteButton: {
    borderColor: colors.status.error,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalContent: {
    gap: spacing.lg,
  },
  deleteModalHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  deleteModalTitle: {
    textAlign: 'center',
  },
  deleteModalMessage: {
    textAlign: 'center',
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  checkboxText: {
    flex: 1,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  deleteModalButton: {
    flex: 1,
  },
  deleteConfirmButton: {
    backgroundColor: colors.status.error,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.border.medium,
    opacity: 0.5,
  },
});