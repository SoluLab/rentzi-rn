import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal } from './Modal';
import { Button } from './Button';
import { Typography } from './Typography';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date | null;
  minimumDate?: Date;
  maximumDate?: Date;
  availableDates?: string[];
  bookedDates?: string[];
  pricePerDate?: { [key: string]: number };
  mode?: 'single' | 'range';
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeSelect?: (startDate: Date, endDate: Date) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isVisible,
  onClose,
  onDateSelect,
  selectedDate,
  minimumDate,
  maximumDate,
  availableDates,
  bookedDates = [],
  pricePerDate = {},
  mode = 'single',
  startDate,
  endDate,
  onRangeSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate || null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate || null);

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Convert to Monday = 0, Sunday = 6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateAvailable = (date: Date) => {
    if (!date) return false;
    
    const dateString = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (date < today) return false;
    
    // Check if date is booked
    if (bookedDates.includes(dateString)) return false;
    
    // Check minimum and maximum dates
    if (minimumDate && date < minimumDate) return false;
    if (maximumDate && date > maximumDate) return false;
    
    // Check if date is in available dates (if availableDates array exists)
    if (availableDates) {
      return availableDates.includes(dateString);
    }
    
    return true;
  };

  const isDateSelected = (date: Date) => {
    if (!date) return false;
    
    if (mode === 'single') {
      return selectedDate && date.toDateString() === selectedDate.toDateString();
    } else {
      if (tempStartDate && date.toDateString() === tempStartDate.toDateString()) return true;
      if (tempEndDate && date.toDateString() === tempEndDate.toDateString()) return true;
      if (tempStartDate && tempEndDate && date >= tempStartDate && date <= tempEndDate) return true;
      return false;
    }
  };

  const isDateInRange = (date: Date) => {
    if (!date || mode !== 'range') return false;
    if (!tempStartDate || !tempEndDate) return false;
    return date > tempStartDate && date < tempEndDate;
  };

  const handleDatePress = (date: Date) => {
    if (!isDateAvailable(date)) return;
    
    if (mode === 'single') {
      onDateSelect(date);
      onClose();
    } else {
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        // Start new selection
        setTempStartDate(date);
        setTempEndDate(null);
      } else if (tempStartDate && !tempEndDate) {
        // Complete selection
        if (date > tempStartDate) {
          setTempEndDate(date);
        } else {
          setTempStartDate(date);
          setTempEndDate(null);
        }
      }
    }
  };

  const handleConfirm = () => {
    if (mode === 'range' && tempStartDate && tempEndDate && onRangeSelect) {
      onRangeSelect(tempStartDate, tempEndDate);
    }
    onClose();
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
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

  const getDatePrice = (date: Date) => {
    if (!date) return null;
    const dateString = date.toISOString().split('T')[0];
    return pricePerDate[dateString];
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Typography variant="h4" style={styles.monthTitle}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>
          
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
            <ChevronRight size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Day names header */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((dayName) => (
              <View key={dayName} style={styles.dayNameCell}>
                <Typography variant="caption" color="secondary" style={styles.dayNameText}>
                  {dayName}
                </Typography>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                  const isAvailable = date ? isDateAvailable(date) : false;
                  const isSelected = date ? isDateSelected(date) : false;
                  const isInRange = date ? isDateInRange(date) : false;
                  const price = date ? getDatePrice(date) : null;

                  return (
                    <View key={dayIndex} style={styles.dayCell}>
                      {date ? (
                        <TouchableOpacity
                          onPress={() => handleDatePress(date)}
                          disabled={!isAvailable}
                          style={[
                            styles.dateButton,
                            isSelected && styles.selectedDateButton,
                            isInRange && styles.rangeeDateButton,
                            !isAvailable && styles.unavailableDateButton,
                          ]}
                        >
                          <Typography
                            variant="body"
                            style={[
                              styles.dateText,
                              isSelected && styles.selectedDateText,
                              isInRange && styles.rangeDateText,
                              !isAvailable && styles.unavailableDateText,
                            ]}
                          >
                            {date.getDate()}
                          </Typography>
                          {price && isAvailable && (
                            <Typography
                              variant="caption"
                              style={[
                                styles.priceText,
                                isSelected && styles.selectedPriceText,
                                isInRange && styles.rangePriceText,
                              ]}
                            >
                              {formatPrice(price)}
                            </Typography>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.emptyCell} />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actionBar}>
          <Button
            title="Clear"
            onPress={handleClear}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Today"
            onPress={() => setCurrentMonth(new Date())}
            variant="outline"
            style={styles.actionButton}
          />
          {mode === 'range' && (
            <Button
              title="Confirm"
              onPress={handleConfirm}
              disabled={!tempStartDate || !tempEndDate}
              style={styles.confirmButton}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    maxHeight: '90%',
    width: width * 0.9,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  navButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    paddingBottom: spacing.lg,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  dateButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: spacing.xs,
  },
  selectedDateButton: {
    backgroundColor: colors.primary.gold,
  },
  rangeeDateButton: {
    backgroundColor: colors.primary.lightGold,
  },
  unavailableDateButton: {
    opacity: 0.3,
  },
  emptyCell: {
    flex: 1,
  },
  dateText: {
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedDateText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  rangeDateText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  unavailableDateText: {
    color: colors.text.secondary,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  selectedPriceText: {
    color: colors.text.inverse,
  },
  rangePriceText: {
    color: colors.text.primary,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});