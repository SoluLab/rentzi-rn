import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  MessageCircle,
  Star,
  FileText,
  Home,
  AlertTriangle,
} from "lucide-react-native";

// Mock booking detail data
const mockBooking = {
  id: "BKG-20240301-001",
  status: "pending", // confirmed, pending, completed, cancelled
  checkIn: "2024-03-15",
  checkOut: "2024-03-20",
  guests: { adults: 2, children: 2 },
  bookingDate: "2024-02-28",
  guest: {
    name: "Alexander Sterling",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    notes: "Please arrange for a baby crib in the master bedroom.",
  },
  property: {
    name: "Luxury Oceanfront Villa",
    address: "123 Ocean Drive, Malibu, CA",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40",
  },
  payment: {
    amount: 12500,
    status: "Paid", // Paid, Pending, Failed
    method: "Card", // UPI, Card, etc.
  },
  cancellationReason: "Guest requested cancellation due to change in travel plans",
  guestFeedback: {
    rating: 4.5,
    comment: "Excellent property and great communication with the host!",
    date: "2024-03-21",
  },
};

const statusColors: Record<string, string> = {
  confirmed: colors.status.success,
  pending: colors.primary.gold,
  completed: colors.primary.navy,
  cancelled: colors.status.error,
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusIcons: Record<string, any> = {
  confirmed: CheckCircle,
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function BookingHomeownerDetailScreen() {
  const router = useRouter();
  const [booking, setBooking] = useState(mockBooking);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const StatusIcon = statusIcons[booking.status] || Clock;

  const handleApprove = () => {
    Alert.alert(
      "Approve Booking",
      "Are you sure you want to approve this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: () => {
            setBooking({ ...booking, status: "confirmed" });
            Alert.alert("Success", "Booking has been approved!");
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (!cancellationReason.trim()) {
      Alert.alert("Error", "Please provide a reason for cancellation.");
      return;
    }
    
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "No, Keep Booking", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            setBooking({ 
              ...booking, 
              status: "cancelled",
              cancellationReason: cancellationReason.trim()
            });
            setCancellationReason("");
            Alert.alert("Cancelled", "Booking has been cancelled.");
          },
        },
      ]
    );
  };

  const handleContactGuest = () => {
    setShowContactModal(true);
  };

  const handleViewProperty = () => {
    router.push(`/property/${booking.id}`);
  };

  const handleLeaveFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleReschedule = () => {
    Alert.alert("Reschedule", "Reschedule functionality coming soon!");
  };

  const handleCallGuest = () => {
    Alert.alert("Call Guest", `Calling ${booking.guest.name}...`);
    setShowContactModal(false);
  };

  const handleMessageGuest = () => {
    Alert.alert("Message Guest", `Opening chat with ${booking.guest.name}...`);
    setShowContactModal(false);
  };

  // Calculate duration in nights
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const duration = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  

  return (
    <View style={styles.container}>
      <Header
        title="Booking Details"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest Info */}
        <Card style={styles.section}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Guest Info
          </Typography>
          <View style={styles.guestRow}>
            <Image
              source={{ uri: booking.guest.profileImage }}
              style={styles.profileImage}
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Typography variant="h5">{booking.guest.name}</Typography>
              <View style={styles.contactRow}>
                <Phone size={14} color={colors.text.secondary} />
                <Typography
                  variant="body"
                  color="secondary"
                  style={styles.contactText}
                >
                  {booking.guest.phone}
                </Typography>
              </View>
              <View style={styles.contactRow}>
                <Mail size={14} color={colors.text.secondary} />
                <Typography
                  variant="body"
                  color="secondary"
                  style={styles.contactText}
                >
                  {booking.guest.email}
                </Typography>
              </View>
            </View>
          </View>
        </Card>

        {/* Booking Info */}
        <Card style={styles.section}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Booking Info
          </Typography>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Booking ID:
            </Typography>
            <Typography variant="body">{booking.id}</Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Status:
            </Typography>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[booking.status] },
              ]}
            >
              <StatusIcon size={14} color={colors.neutral.white} />
              <Typography
                variant="label"
                color="inverse"
                style={styles.statusText}
              >
                {statusLabels[booking.status]}
              </Typography>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Dates:
            </Typography>
            <Typography variant="body">
              {new Date(booking.checkIn).toLocaleDateString()} -{" "}
              {new Date(booking.checkOut).toLocaleDateString()}
            </Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Duration:
            </Typography>
            <Typography variant="body">{duration} nights</Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Guests:
            </Typography>
            <Typography variant="body">
              {booking.guests.adults} Adults, {booking.guests.children} Children
            </Typography>
          </View>
        </Card>

        {/* Property Info */}
        <Card style={styles.section}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Property Info
          </Typography>
          <Image
            source={{ uri: booking.property.image }}
            style={styles.propertyImage}
          />
          <Typography variant="h5" style={{ marginTop: spacing.sm }}>
            {booking.property.name}
          </Typography>
          <View style={styles.addressRow}>
            <MapPin size={14} color={colors.text.secondary} />
            <Typography
              variant="body"
              color="secondary"
              style={styles.addressText}
            >
              {booking.property.address}
            </Typography>
          </View>
        </Card>

        {/* Payment Info */}
        <Card style={styles.section}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Payment Info
          </Typography>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Amount Paid:
            </Typography>
            <Typography variant="h5" color="gold">
              ${booking.payment.amount.toLocaleString()}
            </Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Payment Status:
            </Typography>
            <Typography variant="body">{booking.payment.status}</Typography>
          </View>
          <View style={styles.infoRow}>
            <Typography variant="body" color="secondary">
              Payment Method:
            </Typography>
            <View style={styles.paymentMethod}>
              <CreditCard size={14} color={colors.text.secondary} />
              <Typography variant="body" style={{ marginLeft: spacing.xs }}>
                {booking.payment.method}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Guest Feedback for Completed Bookings */}
        {booking.status === "completed" && booking.guestFeedback && (
          <Card style={styles.section}>
            <Typography variant="h6" style={styles.sectionTitle}>
              Guest Feedback
            </Typography>
            <View style={styles.feedbackRow}>
              <View style={styles.ratingRow}>
                <Star size={16} color={colors.primary.gold} fill={colors.primary.gold} />
                <Typography variant="body" style={{ marginLeft: spacing.xs }}>
                  {booking.guestFeedback.rating}/5
                </Typography>
              </View>
              <Typography variant="body" color="secondary" style={styles.feedbackDate}>
                {new Date(booking.guestFeedback.date).toLocaleDateString()}
              </Typography>
            </View>
            <Typography variant="body" style={styles.feedbackComment}>
              "{booking.guestFeedback.comment}"
            </Typography>
          </Card>
        )}

        {/* Notes */}
        {booking.guest.notes ? (
          <Card style={styles.section}>
            <Typography variant="h6" style={styles.sectionTitle}>
              Notes
            </Typography>
            <Typography variant="body">{booking.guest.notes}</Typography>
          </Card>
        ) : null}

        {/* Action Buttons */}
        <Card style={styles.section}>
          <Typography variant="h6" style={styles.sectionTitle}>
            Actions
          </Typography>
          
          {/* Cancellation Reason Input */}
          <View style={styles.inputContainer}>
            <Typography variant="body" style={styles.inputLabel}>
              Cancellation Reason
            </Typography>
            <Input
              placeholder="Enter reason for cancellation..."
              value={cancellationReason}
              onChangeText={setCancellationReason}
              multiline
              numberOfLines={3}
              style={styles.reasonInput}
            />
          </View>
          
          <Button
              variant="primary"
              size="medium"
              style={styles.primaryActionButton}
              onPress={handleCancel}
              title="Cancel"
            />
        </Card>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="h6" style={styles.modalTitle}>
              Contact Guest
            </Typography>
            <Typography variant="body" color="secondary" style={styles.modalSubtitle}>
              Choose how you'd like to contact {booking.guest.name}
            </Typography>
            
            <Button
              variant="primary"
              size="large"
              onPress={handleCallGuest}
              style={styles.modalButton}
              title="Call Guest"
            />
            
            <Button
              variant="outline"
              size="large"
              onPress={handleMessageGuest}
              style={styles.modalButton}
              title="Send Message"
            />
            
            <Button
              variant="outline"
              size="medium"
              onPress={() => setShowContactModal(false)}
              style={styles.modalButton}
              title="Cancel"
            />
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="h6" style={styles.modalTitle}>
              Leave Feedback
            </Typography>
            <Typography variant="body" color="secondary" style={styles.modalSubtitle}>
              Share your experience with {booking.guest.name}
            </Typography>
            
            <Button
              variant="primary"
              size="large"
              onPress={() => {
                Alert.alert("Feedback", "Feedback submitted successfully!");
                setShowFeedbackModal(false);
              }}
              style={styles.modalButton}
              title="Submit Feedback"
            />
            
            <Button
              variant="outline"
              size="medium"
              onPress={() => setShowFeedbackModal(false)}
              style={styles.modalButton}
              title="Cancel"
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
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: spacing.layout.screenPadding,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral.white,
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  guestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.card,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: spacing.xs,
  },
  contactText: {
    marginLeft: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  propertyImage: {
    width: "100%",
    height: 160,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  addressText: {
    marginLeft: spacing.xs,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonsContainer: {
    gap: spacing.md,
  },
  primaryActionButton: {
    marginBottom: spacing.sm,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
  },
  feedbackRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackDate: {
    fontSize: 12,
  },
  feedbackComment: {
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 400,
    gap: spacing.md,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    textAlign: "center",
    marginBottom: spacing.md,
  },
  modalButton: {
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    marginBottom: spacing.xs,
    fontWeight: "500",
  },
  reasonInput: {
    minHeight: 80,
  },
});
