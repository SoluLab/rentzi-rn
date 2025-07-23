import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import {
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  CheckCircle,
  Clock,
  XCircle,
  AArrowDown,
} from 'lucide-react-native';
// Mock data for bookings
const mockBookings = [
  {
    id: '1',
    propertyTitle: 'Luxury Oceanfront Villa',
    propertyImage:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40',
    guestName: 'Alexander Sterling',
    guestEmail: 'alex@example.com',
    guestPhone: '+1 (555) 123-4567',
    checkIn: '2024-03-15',
    checkOut: '2024-03-20',
    guests: 4,
    totalAmount: 12500,
    status: 'confirmed',
    bookingDate: '2024-02-28',
  },
  {
    id: '2',
    propertyTitle: 'Swiss Alpine Chalet',
    propertyImage:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&quality=40',
    guestName: 'Victoria Blackwood',
    guestEmail: 'victoria@example.com',
    guestPhone: '+1 (555) 987-6543',
    checkIn: '2024-03-25',
    checkOut: '2024-03-30',
    guests: 6,
    totalAmount: 20000,
    status: 'pending',
    bookingDate: '2024-03-01',
  },
  {
    id: '3',
    propertyTitle: 'Luxury Oceanfront Villa',
    propertyImage:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40',
    guestName: 'Marcus Rothschild',
    guestEmail: 'marcus@example.com',
    guestPhone: '+1 (555) 456-7890',
    checkIn: '2024-02-10',
    checkOut: '2024-02-15',
    guests: 2,
    totalAmount: 12500,
    status: 'completed',
    bookingDate: '2024-01-25',
  },
  {
    id: '4',
    propertyTitle: 'Manhattan Penthouse Suite',
    propertyImage:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    guestName: 'Isabella Chen',
    guestEmail: 'isabella@example.com',
    guestPhone: '+1 (555) 321-0987',
    checkIn: '2024-04-01',
    checkOut: '2024-04-05',
    guests: 3,
    totalAmount: 14000,
    status: 'cancelled',
    bookingDate: '2024-03-05',
  },
];
export default function BookingsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'
  >('all');
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.status.success;
      case 'pending':
        return colors.primary.gold;
      case 'completed':
        return colors.primary.navy;
      case 'cancelled':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };
  const filteredBookings =
    selectedFilter === 'all'
      ? mockBookings
      : mockBookings.filter((booking) => booking.status === selectedFilter);
  const getFilterCount = (filter: string) => {
    if (filter === 'all') return mockBookings.length;
    return mockBookings.filter((booking) => booking.status === filter).length;
  };
  const handleBookingPress = (bookingId: string) => {
    router.push(`/booking/detail/${bookingId}`);
  };
  const renderBookingCard = ({ item: booking }: { item: any }) => {
    const StatusIcon = getStatusIcon(booking.status);
    return (
      <TouchableOpacity onPress={() => handleBookingPress(booking.id)}>
        <Card style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Image source={{ uri: booking.propertyImage }} style={styles.propertyImage} />
            <View style={styles.bookingInfo}>
              <View style={styles.titleRow}>
                <Typography variant="h5" numberOfLines={1} style={styles.propertyTitle}>
                  {booking.propertyTitle}
                </Typography>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}
                >
                  <StatusIcon size={12} color={colors.neutral.white} />
                  <Typography variant="label" color="inverse" style={styles.statusText}>
                    {booking.status.toUpperCase()}
                  </Typography>
                </View>
              </View>
              <View style={styles.guestInfo}>
                <User size={14} color={colors.text.secondary} />
                <Typography variant="body" color="primary">
                  {booking.guestName}
                </Typography>
              </View>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Mail size={12} color={colors.text.secondary} />
                  <Typography variant="caption" color="secondary" numberOfLines={1}>
                    {booking.guestEmail}
                  </Typography>
                </View>
                <View style={styles.contactItem}>
                  <Phone size={12} color={colors.text.secondary} />
                  <Typography variant="caption" color="secondary">
                    {booking.guestPhone}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.bookingDetails}>
            <View style={styles.dateInfo}>
              <Calendar size={16} color={colors.primary.gold} />
              <Typography variant="body" color="primary">
                {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                {new Date(booking.checkOut).toLocaleDateString()}
              </Typography>
            </View>
            <View style={styles.bookingMeta}>
              <Typography variant="caption" color="secondary">
                {booking.guests} guests • Booked on{' '}
                {new Date(booking.bookingDate).toLocaleDateString()}
              </Typography>
              <Typography variant="h5" color="gold">
                ${booking.totalAmount.toLocaleString()}
              </Typography>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <Header title="Bookings" subtitle="Manage your property bookings" showBackButton={false} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'pending', label: 'Pending' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key as any)}
                  style={[
                    styles.filterTab,
                    selectedFilter === filter.key && styles.activeFilterTab,
                  ]}
                >
                  <Typography
                    variant="body"
                    color={selectedFilter === filter.key ? 'white' : 'secondary'}
                    style={styles.filterText}
                  >
                    {filter.label} ({getFilterCount(filter.key)})
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        {/* Bookings List */}
        <View style={styles.section}>
          {filteredBookings.length > 0 ? (
            <FlatList
              data={filteredBookings}
              renderItem={renderBookingCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <Card style={styles.emptyState}>
              <Calendar size={48} color={colors.text.secondary} />
              <Typography variant="h4" color="secondary" align="center">
                No bookings found
              </Typography>
              <Typography variant="body" color="secondary" align="center">
                {selectedFilter === 'all'
                  ? 'Your bookings will appear here once guests start booking your properties'
                  : `No ${selectedFilter} bookings at the moment`}
              </Typography>
            </Card>
          )}
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
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activeFilterTab: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  filterText: {
    fontWeight: '500',
  },
  bookingCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  bookingInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  titleRow: {
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
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactInfo: {
    gap: spacing.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bookingDetails: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
});