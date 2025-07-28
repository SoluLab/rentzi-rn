import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { shadow } from '@/constants/shadow';
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
  Search,
  Filter,
  X,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateFilterType, setDateFilterType] = useState<'checkIn' | 'checkOut' | 'bookingDate'>('checkIn');
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
  const filteredBookings = mockBookings.filter((booking) => {
    // Search filter
    const matchesSearch = 
      booking.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedFilter === 'all' || booking.status === selectedFilter;
    
    // Date filter
    let matchesDate = true;
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filterDate.setHours(0, 0, 0, 0);
      
      if (dateFilterType === 'checkIn') {
        const checkInDate = new Date(booking.checkIn);
        checkInDate.setHours(0, 0, 0, 0);
        matchesDate = checkInDate.getTime() === filterDate.getTime();
      } else if (dateFilterType === 'checkOut') {
        const checkOutDate = new Date(booking.checkOut);
        checkOutDate.setHours(0, 0, 0, 0);
        matchesDate = checkOutDate.getTime() === filterDate.getTime();
      } else if (dateFilterType === 'bookingDate') {
        const bookingDate = new Date(booking.bookingDate);
        bookingDate.setHours(0, 0, 0, 0);
        matchesDate = bookingDate.getTime() === filterDate.getTime();
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  const getFilterCount = (filter: string) => {
    if (filter === 'all') return mockBookings.length;
    return mockBookings.filter((booking) => booking.status === filter).length;
  };
  const handleBookingPress = (bookingId: string) => {
    router.push('/booking-homeowner-detail');
  };
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleClearDateFilter = () => {
    setSelectedDate(null);
  };

  const handleDateFilterTypeSelect = (type: 'checkIn' | 'checkOut' | 'bookingDate') => {
    setDateFilterType(type);
    setShowDatePicker(true);
  };

  const getDateFilterLabel = () => {
    if (!selectedDate) return 'Select Date';
    const dateStr = selectedDate.toLocaleDateString();
    const typeLabels = {
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      bookingDate: 'Booking'
    };
    return `${typeLabels[dateFilterType]}: ${dateStr}`;
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
        {/* Search and Filter Section */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={colors.text.secondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search bookings..."
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={colors.primary.navy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Filter */}
        {showFilters && (
          <View style={styles.section}>
            <Card style={styles.filterCard}>
              <Typography variant="h6" style={styles.filterTitle}>
                Date Filter
              </Typography>
              
              <View style={styles.dateFilterContainer}>
                <View style={styles.dateFilterButtons}>
                  <TouchableOpacity
                    style={[
                      styles.dateFilterButton,
                      dateFilterType === 'checkIn' && styles.activeDateFilterButton
                    ]}
                    onPress={() => handleDateFilterTypeSelect('checkIn')}
                  >
                    <Typography 
                      variant="caption" 
                      color={dateFilterType === 'checkIn' ? 'inverse' : 'secondary'}
                    >
                      Check-in
                    </Typography>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.dateFilterButton,
                      dateFilterType === 'checkOut' && styles.activeDateFilterButton
                    ]}
                    onPress={() => handleDateFilterTypeSelect('checkOut')}
                  >
                    <Typography 
                      variant="caption" 
                      color={dateFilterType === 'checkOut' ? 'inverse' : 'secondary'}
                    >
                      Check-out
                    </Typography>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.dateFilterButton,
                      dateFilterType === 'bookingDate' && styles.activeDateFilterButton
                    ]}
                    onPress={() => handleDateFilterTypeSelect('bookingDate')}
                  >
                    <Typography 
                      variant="caption" 
                      color={dateFilterType === 'bookingDate' ? 'inverse' : 'secondary'}
                    >
                      Booking Date
                    </Typography>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={styles.dateSelectButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={16} color={colors.primary.navy} />
                  <Typography variant="body" color="primary">
                    {getDateFilterLabel()}
                  </Typography>
                </TouchableOpacity>
                
                {selectedDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={handleClearDateFilter}
                  >
                    <X size={16} color={colors.status.error} />
                    <Typography variant="caption" color="error">
                      Clear
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </View>
        )}

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
                    color={selectedFilter === filter.key ? 'inverse' : 'secondary'}
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
                {searchQuery || selectedDate
                  ? 'No bookings match your search criteria'
                  : selectedFilter === 'all'
                  ? 'Your bookings will appear here once guests start booking your properties'
                  : `No ${selectedFilter} bookings at the moment`}
              </Typography>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} onClose={() => setShowDatePicker(false)}>
        <View style={styles.modalHeader}>
          <Typography variant="h4" style={styles.modalTitle}>
            Select Date
          </Typography>
          <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.closeButton}>
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <Typography variant="body" color="secondary" style={styles.modalSubtitle}>
          Choose a date to filter your bookings
        </Typography>

        <DatePicker
          date={selectedDate || new Date()}
          onDateChange={handleDateSelect}
          placeholder="Select a date to filter"
        />
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
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'Montserrat-Regular',
  },
  filterButton: {
    padding: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  filterCard: {
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    ...shadow.small,
  },
  filterTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  dateFilterContainer: {
    gap: spacing.md,
  },
  dateFilterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateFilterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  activeDateFilterButton: {
    backgroundColor: colors.primary.gold,
  },
  dateSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  clearDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.sm,
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
    shadowColor: colors.neutral.black,
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