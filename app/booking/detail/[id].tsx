import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { usePropertyStore } from "@/stores/propertyStore";
import { useBookingStore } from "@/stores/bookingStore";
import { useAuthStore } from "@/stores/authStore";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  AArrowDown,
  CheckCircle2,
  AArrowUp,
  Download,
  XCircle,
  Edit3,
} from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getPropertyById } = usePropertyStore();
  const { bookings, updateBookingStatus, canEditBooking } = useBookingStore();
  const { user } = useAuthStore();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const booking = bookings.find((b) => b.id === id);
  const property = booking ? getPropertyById(booking.propertyId) : null;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return colors.status.info;
      case "active":
        return colors.status.success;
      case "completed":
        return colors.text.secondary;
      case "cancelled":
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return Calendar;
      case "active":
        return CheckCircle2;
      case "completed":
        return CheckCircle2;
      case "cancelled":
        return XCircle;
      default:
        return Calendar;
    }
  };
  const handleCancelBooking = async () => {
    if (!booking) return;
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    updateBookingStatus(booking.id, "cancelled");
    setShowCancelModal(false);
    setIsProcessing(false);
    toast.success("Booking cancelled successfully");
    router.back();
  };
  const handleEditBooking = () => {
    if (!booking) return;
    // Navigate to calendar screen with current booking data
    router.push({
      pathname: "/calendar/check-in-out",
      params: {
        propertyId: booking.propertyId,
        bookingId: booking.id,
        currentStartDate: booking.startDate,
        currentEndDate: booking.endDate,
        isEdit: "true",
      },
    });
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const calculateNights = () => {
    if (!booking) return 0;
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const generatePDF = async () => {
    if (!booking || !property) return;
    const nights = calculateNights();
    const pricePerNight = booking.totalAmount / nights;
    const convenienceFee = 150;
    const taxes = 75;
    const totalPaid = booking.totalAmount + convenienceFee + taxes;
    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <title>Booking Receipt</title>
  <style>
  body {
  font-family: 'Helvetica', sans-serif;
  margin: 40px;
  color: #333;
  line-height: 1.6;
  }
  .header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #D4AF37;
  padding-bottom: 20px;
  }
  .logo {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 10px;
  }
  .receipt-title {
  font-size: 24px;
  color: #D4AF37;
  margin: 0;
  }
  .property-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  }
  .property-name {
  font-size: 20px;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 10px;
  }
  .property-location {
  color: #666;
  margin-bottom: 5px;
  }
  .booking-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  }
  .detail-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  }
  .detail-label {
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 5px;
  }
  .detail-value {
  color: #666;
  }
  .payment-summary {
  border-top: 2px solid #D4AF37;
  padding-top: 20px;
  }
  .summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  }
  .total-row {
  border-top: 1px solid #ccc;
  margin-top: 15px;
  padding-top: 15px;
  font-weight: bold;
  font-size: 18px;
  color: #D4AF37;
  }
  .footer {
  margin-top: 40px;
  text-align: center;
  color: #666;
  font-size: 12px;
  }
  </style>
  </head>
  <body>
  <div class="header">
  <div class="logo">Rentzy</div>
  <h1 class="receipt-title">Booking Receipt</h1>
  </div>
  <div class="property-section">
  <div class="property-name">${property.title}</div>
  <div class="property-location">${property.location.city}, ${
      property.location.country
    }</div>
  <div class="property-location">${property.bedrooms} bed • ${
      property.bathrooms
    } bath</div>
  </div>
  <div class="booking-details">
  <div class="detail-item">
  <div class="detail-label">Check-in Date</div>
  <div class="detail-value">${formatDate(booking.startDate)}</div>
  </div>
  <div class="detail-item">
  <div class="detail-label">Check-out Date</div>
  <div class="detail-value">${formatDate(booking.endDate)}</div>
  </div>
  <div class="detail-item">
  <div class="detail-label">Number of Guests</div>
  <div class="detail-value">${booking.guestsCount} guests</div>
  </div>
  <div class="detail-item">
  <div class="detail-label">Payment Method</div>
  <div class="detail-value">${booking.paymentMethod}</div>
  </div>
  </div>
  <div class="payment-summary">
  <h3 style="color: #1a1a2e; margin-bottom: 20px;">Payment Summary</h3>
  <div class="summary-row">
  <span>$${pricePerNight.toLocaleString()}/night × ${nights} nights</span>
  <span>$${booking.totalAmount.toLocaleString()}</span>
  </div>
  <div class="summary-row">
  <span>Platform Fee</span>
  <span>$${convenienceFee}</span>
  </div>
  <div class="summary-row">
  <span>Taxes</span>
  <span>$${taxes}</span>
  </div>
  <div class="summary-row total-row">
  <span>Total Paid</span>
  <span>$${totalPaid.toLocaleString()} ${booking.currency}</span>
  </div>
  </div>
  <div class="footer">
  <p>Thank you for choosing Rentzy</p>
  <p>Booking ID: ${
    booking.id
  } | Generated on ${new Date().toLocaleDateString()}</p>
  </div>
  </body>
  </html>
  `;
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Download Booking Receipt",
        UTI: "com.adobe.pdf",
      });
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate receipt");
    }
  };
  if (!booking || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Typography variant="h4" color="secondary" align="center">
            Booking not found
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
  const StatusIcon = getStatusIcon(booking.bookingStatus);
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
          Booking Details
        </Typography>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Info */}
        <Card style={styles.propertyCard}>
          <Image
            source={{ uri: property.mediaGallery.images[0] }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyInfo}>
            <Typography variant="h4">{property.title}</Typography>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.text.secondary} />
              <Typography variant="body" color="secondary">
                {property.location.city}, {property.location.country}
              </Typography>
            </View>
            <Typography variant="caption" color="secondary">
              {property.bedrooms} bed • {property.bathrooms} bath
            </Typography>
          </View>
        </Card>
        {/* Booking Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <StatusIcon
                size={24}
                color={getStatusColor(booking.bookingStatus)}
              />
              <Typography variant="h5">
                {booking.bookingStatus.charAt(0).toUpperCase() +
                  booking.bookingStatus.slice(1)}
              </Typography>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.bookingStatus) },
              ]}
            >
              <Typography variant="label" color="inverse">
                {booking.bookingStatus.toUpperCase()}
              </Typography>
            </View>
          </View>
        </Card>
        {/* Booking Details */}
        <Card style={styles.detailsCard}>
          <Typography variant="h5" style={styles.sectionTitle}>
            Booking Information
          </Typography>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color={colors.primary.gold} />
            </View>
            <View style={styles.detailContent}>
              <Typography variant="body">Check-in</Typography>
              <Typography variant="h6">
                {formatDate(booking.startDate)}
              </Typography>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color={colors.primary.gold} />
            </View>
            <View style={styles.detailContent}>
              <Typography variant="body">Check-out</Typography>
              <Typography variant="h6">
                {formatDate(booking.endDate)}
              </Typography>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Users size={20} color={colors.primary.gold} />
            </View>
            <View style={styles.detailContent}>
              <Typography variant="body">Guests</Typography>
              <Typography variant="h6">{booking.guestsCount} guests</Typography>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <CreditCard size={20} color={colors.primary.gold} />
            </View>
            <View style={styles.detailContent}>
              <Typography variant="body">Payment Method</Typography>
              <Typography variant="h6">{booking.paymentMethod}</Typography>
            </View>
          </View>
        </Card>
        {/* Payment Summary */}
        <Card style={styles.summaryCard}>
          <Typography variant="h5" style={styles.sectionTitle}>
            Payment Summary
          </Typography>
          <View style={styles.summaryRow}>
            <Typography variant="body">
              ${(booking.totalAmount / calculateNights()).toLocaleString()}
              /night × {calculateNights()} nights
            </Typography>
            <Typography variant="body">
              ${booking.totalAmount.toLocaleString()}
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
            <Typography variant="h5">Total Paid</Typography>
            <Typography variant="h5" color="gold">
              ${(booking.totalAmount + 225).toLocaleString()} {booking.currency}
            </Typography>
          </View>
        </Card>
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* Download PDF Button - Available for all bookings */}
          <Button
            title="Download Receipt"
            onPress={generatePDF}
            variant="primary"
            style={styles.downloadButton}
            icon={<Download size={20} color={colors.neutral.white} />}
          />
          {/* Edit and Cancel Booking Buttons for upcoming bookings */}
          {booking.bookingStatus === "upcoming" && (
            <View style={styles.upcomingActions}>
              <Button
                title="Edit Booking"
                onPress={handleEditBooking}
                variant="outline"
                style={[styles.actionButton, styles.editButton]}
                icon={<Edit3 size={20} color={colors.primary.gold} />}
              />
              <Button
                title="Cancel Booking"
                onPress={() => setShowCancelModal(true)}
                variant="outline"
                style={[styles.actionButton, styles.cancelButton]}
              />
            </View>
          )}
        </View>
      </ScrollView>
      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
      >
        <View style={styles.modalContent}>
          <View style={styles.warningHeader}>
            <AArrowDown size={48} color={colors.status.warning} />
            <Typography variant="h5" align="center">
              Are you sure you want to cancel this booking?
            </Typography>
          </View>
          <View style={styles.refundPolicy}>
            <Typography variant="h6" style={styles.policyTitle}>
              Refund Policy
            </Typography>
            <Typography variant="body" color="secondary">
              • Free cancellation up to 24 hours before check-in
            </Typography>
            <Typography variant="body" color="secondary">
              • 50% refund for cancellations within 24 hours
            </Typography>
            <Typography variant="body" color="secondary">
              • No refund for same-day cancellations
            </Typography>
          </View>
          <View style={styles.modalActions}>
            <Button
              title="Keep Booking"
              onPress={() => setShowCancelModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={isProcessing ? "Cancelling..." : "Cancel Booking"}
              onPress={handleCancelBooking}
              loading={isProcessing}
              style={styles.modalButton}
            />
          </View>
        </View>
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
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
    padding: spacing.layout.screenPadding,
  },
  propertyCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  propertyImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  propertyInfo: {
    gap: spacing.sm,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  detailsCard: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  detailIcon: {
    width: 40,
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.md,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
    marginTop: spacing.md,
    marginBottom: 0,
  },
  actionSection: {
    marginBottom: spacing.xl,
  },
  upcomingActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  editButton: {
    borderColor: colors.primary.gold,
  },
  cancelButton: {
    borderColor: colors.status.error,
  },
  downloadButton: {
    backgroundColor: colors.primary.gold,
    marginBottom: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.layout.screenPadding,
  },
  modalContent: {
    gap: spacing.lg,
  },
  warningHeader: {
    alignItems: "center",
    gap: spacing.md,
  },
  refundPolicy: {
    gap: spacing.sm,
  },
  policyTitle: {
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
