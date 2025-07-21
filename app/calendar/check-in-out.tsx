import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { usePropertyStore } from '@/stores/propertyStore';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
interface CalendarDay {
  date: Date;
  day: number;
  isAvailable: boolean;
  isBooked: boolean;
  isPast: boolean;
  price: number;
  isSelected: boolean;
  isInRange: boolean;
  isCheckIn: boolean;
  isCheckOut: boolean;
}
interface MonthData {
  monthName: string;
  year: number;
  month: number;
  days: CalendarDay[];
}
export default function CheckInOutScreen() {
  const router = useRouter();
  const { propertyId, returnTo, checkIn, checkOut } = useLocalSearchParams();
  const { getPropertyById } = usePropertyStore();
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<MonthData[]>([]);
  const property = getPropertyById(propertyId as string);

  // Generate calendar data when property or currentMonth changes
  useEffect(() => {
    generateCalendarData();
  }, [property, currentMonth]);

  // When calendarData is generated and checkIn/checkOut params exist, set selected dates and update selection
  useEffect(() => {
    if (checkIn && typeof checkIn === 'string') {
      const checkInDate = new Date(checkIn);
      if (!isNaN(checkInDate.getTime())) {
        setSelectedCheckIn(checkInDate);
        setCurrentMonth(new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1));
      }
    }
    if (checkOut && typeof checkOut === 'string') {
      const checkOutDate = new Date(checkOut);
      if (!isNaN(checkOutDate.getTime())) {
        setSelectedCheckOut(checkOutDate);
      }
    }
  }, [calendarData, checkIn, checkOut]);

  // Update calendar selection when selectedCheckIn or selectedCheckOut changes
  useEffect(() => {
    updateCalendarSelection(selectedCheckIn, selectedCheckOut);
  }, [selectedCheckIn, selectedCheckOut]);
  const generateCalendarData = () => {
    if (!property) return;
    const months: MonthData[] = [];
    const startDate = new Date(currentMonth);
    // Generate 6 months starting from current month
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay();
      const days: CalendarDay[] = [];
      // Add empty cells for days before month starts
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({
          date: new Date(),
          day: 0,
          isAvailable: false,
          isBooked: false,
          isPast: false,
          price: 0,
          isSelected: false,
          isInRange: false,
          isCheckIn: false,
          isCheckOut: false,
        });
      }
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isBooked = property.availabilityCalendar.bookedDates.includes(dateString);
        const isPast = date < today;
        const isAvailable = !isBooked && !isPast;
        // Use dummy price data - $640 as shown in screenshots
        const price = 640;
        days.push({
          date,
          day,
          isAvailable,
          isBooked,
          isPast,
          price,
          isSelected: false,
          isInRange: false,
          isCheckIn: false,
          isCheckOut: false,
        });
      }
      months.push({
        monthName,
        year,
        month,
        days,
      });
    }
    setCalendarData(months);
  };
  const handleDateSelect = (selectedDate: Date, dayData: CalendarDay) => {
    if (!dayData.isAvailable || dayData.day === 0) return;
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // First selection or reset
      setSelectedCheckIn(selectedDate);
      setSelectedCheckOut(null);
      updateCalendarSelection(selectedDate, null);
    } else if (selectedCheckIn && !selectedCheckOut) {
      // Second selection
      if (selectedDate <= selectedCheckIn) {
        // Selected date is before or same as check-in, reset
        setSelectedCheckIn(selectedDate);
        setSelectedCheckOut(null);
        updateCalendarSelection(selectedDate, null);
      } else {
        // Valid range selection
        setSelectedCheckOut(selectedDate);
        updateCalendarSelection(selectedCheckIn, selectedDate);
      }
    }
  };
  const updateCalendarSelection = (checkIn: Date | null, checkOut: Date | null) => {
    setCalendarData((prevData) =>
      prevData.map((month) => ({
        ...month,
        days: month.days.map((day) => {
          if (day.day === 0) return day; // Skip empty cells
          const isCheckIn = checkIn && day.date.toDateString() === checkIn.toDateString();
          const isCheckOut = checkOut && day.date.toDateString() === checkOut.toDateString();
          const isInRange = checkIn && checkOut && day.date > checkIn && day.date < checkOut;
          const isSelected = isCheckIn || isCheckOut;
          return {
            ...day,
            isSelected,
            isInRange,
            isCheckIn: !!isCheckIn,
            isCheckOut: !!isCheckOut,
          };
        }),
      }))
    );
  };
  const handleReserve = () => {
    if (selectedCheckIn && selectedCheckOut) {
      // Navigate to booking screen with selected dates
      router.push({
        pathname: `/booking/${propertyId}`,
        params: {
          checkIn: selectedCheckIn.toISOString(),
          checkOut: selectedCheckOut.toISOString(),
        },
      });
    }
  };
  const handleClearDates = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
    updateCalendarSelection(null, null);
  };
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };
  const calculateNights = () => {
    if (selectedCheckIn && selectedCheckOut) {
      const diffTime = selectedCheckOut.getTime() - selectedCheckIn.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };
  const getTotalPrice = () => {
    const nights = calculateNights();
    return nights * 640; // Using dummy price $640 per night
  };
  const dayHeaders = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Typography variant="h3" color="secondary" align="center">
            Property not found
          </Typography>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.neutral.black} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          {selectedCheckIn && selectedCheckOut ? (
            <Typography variant="h4" color="primary">
              {selectedCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
              {selectedCheckOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
          ) : (
            <Typography variant="h4" color="primary">
              Select dates
            </Typography>
          )}
        </View>
        <TouchableOpacity onPress={handleClearDates} style={styles.clearButton}>
          <Typography variant="body" color="primary">
            Clear dates
          </Typography>
        </TouchableOpacity>
      </View>
      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <ChevronLeft size={24} color={colors.neutral.black} />
        </TouchableOpacity>
        <View style={styles.monthSelector}>
          <Typography variant="h4" color="primary">
            {currentMonth.toLocaleDateString('en-US', { month: 'long' })}
          </Typography>
          <Typography variant="h4" color="primary" style={styles.yearText}>
            {currentMonth.getFullYear()}
          </Typography>
        </View>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <ChevronRight size={24} color={colors.neutral.black} />
        </TouchableOpacity>
      </View>
      {/* Calendar */}
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        {calendarData.map((month, monthIndex) => (
          <View key={monthIndex} style={styles.monthContainer}>
            <View style={styles.monthHeader}>
              <Typography variant="caption" color="secondary" style={styles.monthLabel}>
                {month.monthName.toUpperCase()} {month.year}
              </Typography>
            </View>
            {/* Day Headers */}
            <View style={styles.dayHeadersContainer}>
              {dayHeaders.map((day, index) => (
                <View key={index} style={styles.dayHeaderCell}>
                  <Typography variant="caption" color="secondary" style={styles.dayHeaderText}>
                    {day}
                  </Typography>
                </View>
              ))}
            </View>
            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {month.days.map((dayData, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    dayData.day === 0 && styles.emptyCell,
                    !dayData.isAvailable && dayData.day !== 0 && styles.unavailableDay,
                    dayData.isCheckIn && styles.checkInDay,
                    dayData.isCheckOut && styles.checkOutDay,
                    dayData.isInRange && styles.rangeDay,
                  ]}
                  onPress={() => handleDateSelect(dayData.date, dayData)}
                  disabled={!dayData.isAvailable || dayData.day === 0}
                >
                  {dayData.day !== 0 && (
                    <View style={styles.dayCellContent}>
                      <Typography
                        variant="body"
                        color={
                          dayData.isCheckIn || dayData.isCheckOut
                            ? 'inverse'
                            : dayData.isAvailable
                              ? 'primary'
                              : 'secondary'
                        }
                        style={styles.dayNumber}
                      >
                        {dayData.day}
                      </Typography>
                      {dayData.isAvailable && (
                        <Typography
                          variant="caption"
                          color={dayData.isCheckIn || dayData.isCheckOut ? 'inverse' : 'secondary'}
                          style={styles.dayPrice}
                        >
                          ${dayData.price}
                        </Typography>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {selectedCheckIn && selectedCheckOut ? (
          <>
            <Button title="Reserve" onPress={handleReserve} style={styles.reserveButton} />
            <View style={styles.priceInfo}>
              <Typography variant="body" color="primary" align="center">
                ${getTotalPrice()}/night pre-tax • {calculateNights()} nights
              </Typography>
            </View>
          </>
        ) : (
          <View style={styles.selectDatesContainer}>
            <Typography variant="body" color="primary" align="center">
              Select dates to see pricing
            </Typography>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  clearButton: {
    padding: spacing.xs,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral.lightGray,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  yearText: {
    marginLeft: spacing.sm,
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: spacing.layout.screenPadding,
  },
  monthContainer: {
    marginBottom: spacing.xl,
  },
  monthHeader: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
    marginBottom: spacing.md,
  },
  monthLabel: {
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1,
  },
  dayHeadersContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayHeaderText: {
    fontWeight: '600',
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayCellContent: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unavailableDay: {
    opacity: 0.3,
  },
  checkInDay: {
    backgroundColor: colors.primary.navy,
    borderRadius: radius.sm,
  },
  checkOutDay: {
    backgroundColor: colors.primary.navy,
    borderRadius: radius.sm,
  },
  rangeDay: {
    backgroundColor: colors.neutral.ivory,
    borderRadius: 0,
  },
  dayNumber: {
    fontWeight: '600',
    fontSize: 16,
  },
  dayPrice: {
    fontSize: 10,
    marginTop: 2,
  },
  bottomContainer: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  reserveButton: {
    backgroundColor: colors.primary.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  priceInfo: {
    paddingTop: spacing.sm,
  },
  selectDatesContainer: {
    backgroundColor: colors.neutral.lightGray,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.layout.screenPadding,
  },
});