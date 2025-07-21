import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { usePropertyStore } from "@/stores/propertyStore";
import { useBookingStore } from "@/stores/bookingStore";
import { useAuthStore } from "@/stores/authStore";
import {
  ArrowLeft,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  Edit3,
} from "lucide-react-native";
export default function BookingScreen() {
  const router = useRouter();
  const { id, checkIn, checkOut } = useLocalSearchParams();
  const { getPropertyById } = usePropertyStore();
  const { createBooking, isLoading } = useBookingStore();
  const { user } = useAuthStore();
  const property = getPropertyById(id as string);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guestsCount, setGuestsCount] = useState("2");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [specialRequests, setSpecialRequests] = useState("");
  const [datesFromCalendar, setDatesFromCalendar] = useState(false);
  // Set dates from calendar if provided
  useEffect(() => {
    if (checkIn && checkOut) {
      setStartDate(new Date(checkIn as string));
      setEndDate(new Date(checkOut as string));
      setDatesFromCalendar(true);
    }
  }, [checkIn, checkOut]);
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (property?.price.rent || 0);
  };
  const handleEditDates = () => {
    router.push({
      pathname: "/calendar/check-in-out",
      params: {
        propertyId: property?.id,
        returnTo: "booking",
        checkIn: startDate ? startDate.toISOString() : undefined,
        checkOut: endDate ? endDate.toISOString() : undefined,
      },
    });
  };
  const handleBooking = async () => {
    if (!property || !user || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }
    // Navigate to payment screen with booking data
    const bookingData = {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      guestsCount: parseInt(guestsCount),
      specialRequests,
    };
    router.push({
      pathname: `/payment/${property.id}`,
      params: {
        bookingData: JSON.stringify(bookingData),
      },
    });
  };
  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Typography variant="h4" color="secondary" align="center">
            Property not found
          </Typography>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }
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
        <Typography variant="h5" style={styles.headerTitle}>
          Book Your Stay
        </Typography>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Summary */}
          <Card style={styles.propertyCard}>
            <Typography variant="h5">{property.title}</Typography>
            <Typography variant="body" color="secondary">
              {property.location.city}, {property.location.country}
            </Typography>
            {/*  <View style={styles.statusItem}>
                            <CheckCircle size={12} color={colors.text.tertiary} />
                            <Typography variant="caption" color="tertiary">
                                Early Check-In upto 2 hours (subject to availability)
                            </Typography>
                        </View>
                        <View style={styles.statusItem}>
                            <CheckCircle size={12} color={colors.text.tertiary} />
                            <Typography variant="caption" color="tertiary">
                                Free Cancellation till 24 hrs before check in
                            </Typography>
                        </View>
                        */}
            <View style={styles.statusItem}>
              <Typography variant="body" color="gold">
                ${property.price.rent}/night
              </Typography>
              <Typography variant="body" color="gold">
                60 Tokens/night
              </Typography>
            </View>
          </Card>
          {/* Booking Details */}
          <Card style={styles.bookingCard}>
            <Typography variant="h5" style={styles.sectionTitle}>
              Booking Details
            </Typography>
            <View style={styles.dateSection}>
              <View style={styles.dateRow}>
                <Calendar size={20} color={colors.primary.gold} />
                <Typography variant="body">Check-in & Check-out</Typography>

                {datesFromCalendar && (
                  <TouchableOpacity
                    onPress={handleEditDates}
                    style={styles.editDatesButton}
                  >
                    <Edit3 size={16} color={colors.primary.gold} />
                    <Typography variant="caption" color="gold">
                      Edit Dates
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
              {datesFromCalendar ? (
                <View style={styles.selectedDatesContainer}>
                  <View style={styles.selectedDateCard}>
                    <Typography variant="caption" color="secondary">
                      Check-in
                    </Typography>
                    <Typography variant="body" style={styles.selectedDateText}>
                      {startDate?.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </View>
                  <View style={styles.selectedDateCard}>
                    <Typography variant="caption" color="secondary">
                      Check-out
                    </Typography>
                    <Typography variant="body" style={styles.selectedDateText}>
                      {endDate?.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </View>
                </View>
              ) : (
                <View style={styles.dateInputs}>
                  <DatePicker
                    label="Check-in Date"
                    date={startDate}
                    onDateChange={setStartDate}
                    placeholder="Select check-in date"
                    minimumDate={new Date()}
                    containerStyle={styles.dateInput}
                  />
                  <DatePicker
                    label="Check-out Date"
                    date={endDate}
                    onDateChange={setEndDate}
                    placeholder="Select check-out date"
                    minimumDate={startDate || new Date()}
                    containerStyle={styles.dateInput}
                  />
                </View>
              )}
            </View>
            <View style={styles.guestsSection}>
              <View style={styles.guestsRow}>
                <Users size={20} color={colors.primary.gold} />
                <Typography variant="body">Number of Guests</Typography>
              </View>
              <Input
                value={guestsCount}
                onChangeText={setGuestsCount}
                placeholder="Number of guests"
                keyboardType="numeric"
                containerStyle={styles.guestsInput}
              />
            </View>
          </Card>
          {/* Special Requests */}
          <Card style={styles.requestsCard}>
            <Typography variant="h5" style={styles.sectionTitle}>
              Special Requests
            </Typography>
            <Input
              value={specialRequests}
              onChangeText={setSpecialRequests}
              placeholder="Any special requests or preferences..."
              multiline
              numberOfLines={4}
              style={styles.requestsInput}
            />
          </Card>
          {/* Booking Summary */}
          <Card style={styles.summaryCard}>
            <Typography variant="h5" style={styles.sectionTitle}>
              Booking Summary
            </Typography>
            <View style={styles.summaryRow}>
              <Typography variant="body">
                ${property.price.rent}/night × {calculateNights()} nights
              </Typography>
              <Typography variant="body">
                ${(property.price.rent * calculateNights()).toLocaleString()}
              </Typography>
            </View>
            <View style={styles.summaryRow}>
              <Typography variant="body">
                60 tokens/night × {calculateNights()} nights
              </Typography>
              <Typography variant="body">
                {(60 * calculateNights()).toLocaleString()} tokens
              </Typography>
            </View>
            <View style={styles.summaryRow}>
              <Typography variant="body">Platform Fee</Typography>
              <Typography variant="body">$150</Typography>
            </View>
            <View style={styles.summaryRow}>
              <Typography variant="body">Taxes</Typography>
              <Typography variant="body">$75</Typography>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Typography variant="h5">Total</Typography>
              <Typography variant="h5" color="gold">
                ${(calculateTotal() + 225).toLocaleString()}
              </Typography>
            </View>
          </Card>
          <Card style={styles.noticeCard}>
            <Typography variant="h5" style={styles.sectionTitle}>
             Cancellation Policies
            </Typography>
            <View style={styles.noticeContent}>
              <Typography variant="body" style={styles.noticeText}>
                • You are booking for {calculateNights()}{" "}
                {calculateNights() === 1 ? "night" : "nights"}
              </Typography>
              <Typography variant="body" style={styles.noticeText}>
                • Full refund if cancelled 7+ days before check-in
              </Typography>
              <Typography variant="body" style={styles.noticeText}>
                • 50% refund if cancelled 3-6 days before check-in
              </Typography>
              <Typography variant="body" style={styles.noticeText}>
                • No refund if cancelled less than 3 days before check-in
              </Typography>
            </View>
          </Card>
        </ScrollView>
        {/* Notice Box */}
        {/* Action Button */}
        <View style={styles.actionBar}>
          <Button
            title={isLoading ? "Processing..." : "Confirm Booking"}
            onPress={handleBooking}
            loading={isLoading}
            disabled={!startDate || !endDate || calculateNights() === 0}
            style={styles.confirmButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.card,
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
  statusItem: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  backButton: {
    padding: 0,
    minHeight: 32,
  },
  placeholder: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: spacing.layout.screenPadding,
  },
  propertyCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  bookingCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  dateSection: {
    gap: spacing.md,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateInputs: {
    gap: spacing.md,
  },
  dateInput: {
    marginBottom: 0,
  },
  guestsSection: {
    gap: spacing.md,
  },
  guestsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  guestsInput: {
    marginBottom: 0,
  },
  paymentCard: {
    marginBottom: spacing.lg,
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
  paymentOptions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  paymentOption: {
    flex: 1,
  },
  requestsCard: {
    marginBottom: spacing.lg,
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
  requestsInput: {
    textAlignVertical: "top",
  },
  summaryCard: {
    marginBottom: spacing.xl,
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  actionBar: {
    padding: spacing.layout.screenPadding,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  confirmButton: {
    width: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.layout.screenPadding,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1, // This makes the title take up remaining space
    color: colors.text.primary, // or your preferred text color
    // Add any additional typography styles you need
  },
  noticeCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  noticeTitle: {
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  noticeContent: {
    gap: spacing.xs,
  },
  noticeText: {
    color: colors.text.secondary,
    lineHeight: 20,
  },
  editDatesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginLeft: "auto",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  selectedDatesContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  selectedDateCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: "center",
  },
  selectedDateText: {
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  tokenNote: {
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  noteText: {
    fontStyle: "italic",
    lineHeight: 16,
  },
});
