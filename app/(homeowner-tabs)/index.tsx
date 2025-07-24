import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Modal } from '@/components/ui/Modal';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useCommercialPropertyStore } from '@/stores/commercialPropertyStore';
import {
  Bell,
  Plus,
  Building2,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertCircle,
  AArrowDown,
  AArrowUp,
  TrendingUp,
  Users,
  Home,
  Building,
  X,
} from 'lucide-react-native';
// Mock data for homeowner dashboard
const mockHomeownerData = {
  totalProperties: 12,
  pendingApprovals: 3,
  totalEarnings: 125000,
  activeBookings: 8,
  properties: [
    {
      id: '1',
      title: 'Luxury Oceanfront Villa',
      location: 'Malibu, USA',
      status: 'approved',
      image:
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40',
      monthlyEarnings: 15000,
      occupancyRate: 85,
      bookings: 5,
    },
    {
      id: '2',
      title: 'Manhattan Penthouse Suite',
      location: 'New York, USA',
      status: 'pending',
      image:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
      monthlyEarnings: 0,
      occupancyRate: 0,
      bookings: 0,
    },
    {
      id: '3',
      title: 'Swiss Alpine Chalet',
      location: 'Zermatt, Switzerland',
      status: 'approved',
      image:
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&quality=40',
      monthlyEarnings: 22000,
      occupancyRate: 92,
      bookings: 3,
    },
    {
      id: '4',
      title: 'Santorini Cliffside Villa',
      location: 'Santorini, Greece',
      status: 'rejected',
      image:
        'https://images.unsplash.com/photo-1533116927835-e3bfa3b8a1bd?w=400&h=300&fit=crop&quality=40',
      monthlyEarnings: 0,
      occupancyRate: 0,
      bookings: 0,
    },
  ],
};
export default function HomeownerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { resetStore } = useCommercialPropertyStore();
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleAddProperty = () => {
    setShowPropertyModal(true);
  };

  const handleCloseModal = () => {
    setShowPropertyModal(false);
  };

  const handleAddResidentialProperty = () => {
    setShowPropertyModal(false);
    // Navigate to add residential property screen
    router.push('/add-residential-property');
  };

  const handleAddCommercialProperty = () => {
    setShowPropertyModal(false);
    // Reset the commercial property store to start fresh
    resetStore();
    // Navigate to add commercial property screen
    router.push('/add-commercial-property');
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.status.success;
      case 'pending':
        return colors.primary.gold;
      case 'rejected':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
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
  const renderPropertyCard = ({ item: property }: { item: any }) => {
    const StatusIcon = getStatusIcon(property.status);
    return (
      <TouchableOpacity
        onPress={() => handlePropertyPress(property.id)}
        style={styles.propertyItem}
      >
        <Card style={styles.propertyCard}>
          <Image source={{ uri: property.image }} style={styles.propertyImage} />
          <View style={styles.propertyContent}>
            <View style={styles.propertyHeader}>
              <Typography variant="h5" numberOfLines={1} style={styles.propertyTitle}>
                {property.title}
              </Typography>
              <View
                style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) }]}
              >
                <StatusIcon size={12} color={colors.neutral.white} />
                <Typography variant="label" color="inverse" style={styles.statusText}>
                  {property.status.toUpperCase()}
                </Typography>
              </View>
            </View>
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {property.location}
            </Typography>
            {property.status === 'approved' && (
              <View style={styles.propertyStats}>
                <View style={styles.statItem}>
                  <DollarSign size={14} color={colors.primary.gold} />
                  <Typography variant="caption" color="secondary">
                    ${property.monthlyEarnings.toLocaleString()}/mo
                  </Typography>
                </View>
                <View style={styles.statItem}>
                  <TrendingUp size={14} color={colors.status.success} />
                  <Typography variant="caption" color="secondary">
                    {property.occupancyRate}% occupied
                  </Typography>
                </View>
                <View style={styles.statItem}>
                  <Users size={14} color={colors.primary.navy} />
                  <Typography variant="caption" color="secondary">
                    {property.bookings} bookings
                  </Typography>
                </View>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  const PropertyTypeModal = () => (
    <Modal visible={showPropertyModal} onClose={handleCloseModal}>
      <View style={styles.modalHeader}>
        <Typography variant="h4" style={styles.modalTitle}>
          Add New Property
        </Typography>
        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
          <X size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <Typography variant="body" color="secondary" style={styles.modalSubtitle}>
        Choose the type of property you want to add to your portfolio
      </Typography>

      <View style={styles.propertyTypeContainer}>
        <TouchableOpacity
          style={styles.propertyTypeCard}
          onPress={handleAddResidentialProperty}
        >
          <View style={styles.propertyTypeIcon}>
            <Home size={32} color={colors.primary.gold} />
          </View>
          <View style={styles.propertyTypeContent}>
            <Typography variant="h5" style={styles.propertyTypeTitle}>
              Residential Property
            </Typography>
            <Typography variant="caption" color="secondary" style={styles.propertyTypeDescription}>
              Houses, apartments, villas, and other residential units for personal or rental use
            </Typography>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.propertyTypeCard}
          onPress={handleAddCommercialProperty}
        >
          <View style={styles.propertyTypeIcon}>
            <Building size={32} color={colors.primary.blue} />
          </View>
          <View style={styles.propertyTypeContent}>
            <Typography variant="h5" style={styles.propertyTypeTitle}>
              Commercial Property
            </Typography>
            <Typography variant="caption" color="secondary" style={styles.propertyTypeDescription}>
              Office buildings, retail spaces, warehouses, and other commercial real estate
            </Typography>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
  return (
    <View style={styles.container}>
      <Header
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Owner'}`}
        subtitle="Manage your luxury properties"
        showBackButton={false}
        rightComponent={headerRightComponent}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Dashboard Metrics */}
        <View style={styles.section}>
          <View style={styles.metricsContainer}>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Building2 size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {mockHomeownerData.totalProperties}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Properties
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Clock size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {mockHomeownerData.pendingApprovals}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Pending Approvals
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <DollarSign size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    ${mockHomeownerData.totalEarnings.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Earnings
                  </Typography>
                </View>
              </View>
            </Card>
            <Card style={styles.metricCard}>
              <View style={styles.metricContent}>
                <Calendar size={24} color={colors.primary.gold} />
                <View style={styles.metricText}>
                  <Typography variant="h3" color="primary">
                    {mockHomeownerData.activeBookings}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Active Bookings
                  </Typography>
                </View>
              </View>
            </Card>
          </View>
        </View>
        {/* Add Property Button */}
        <View style={styles.section}>
          <Button
            title="Add New Property"
            onPress={handleAddProperty}
            style={styles.addPropertyButton}
            leftIcon={<Plus size={20} color={colors.neutral.white} />}
          />
        </View>
        {/* Listed Properties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Your Properties
            </Typography>
            <TouchableOpacity onPress={() => router.push('/(homeowner-tabs)/property-management')}>
              <Typography variant="body" color="gold">
                View All
              </Typography>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockHomeownerData.properties}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
      
      <PropertyTypeModal />
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metricText: {
    flex: 1,
  },
  addPropertyButton: {
    marginHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  propertyItem: {
    marginBottom: spacing.md,
  },
  propertyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 120,
  },
  propertyContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.status.error,
    borderRadius: radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  modalSubtitle: {
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  propertyTypeContainer: {
    gap: spacing.md,
  },
  propertyTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  propertyTypeContent: {
    flex: 1,
  },
  propertyTypeTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  propertyTypeDescription: {
    lineHeight: 16,
  },
});