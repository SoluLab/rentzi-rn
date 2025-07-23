import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { usePropertyStore } from '@/stores/propertyStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, CreditCard, Coins, CheckCircle2 } from 'lucide-react-native';
export default function PaymentScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { getPropertyById } = usePropertyStore();
    const { createBooking, isLoading } = useBookingStore();
    const { user } = useAuthStore();
    // Get booking data from params
    const bookingData = JSON.parse((useLocalSearchParams().bookingData as string) || '{}');
    const property = getPropertyById(id as string);
    const [paymentType, setPaymentType] = useState<'full' | 'split'>('full');
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'coinflow'>('stripe');
    if (!property || !bookingData.startDate || !bookingData.endDate) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Typography variant="h4" color="secondary" align="center">
                        Invalid booking data
                    </Typography>
                    <Button title="Go Back" onPress={() => router.back()} variant="outline" />
                </View>
            </SafeAreaView>
        );
    }
    const calculateNights = () => {
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    const nights = calculateNights();
    const subtotal = nights * property.price.rent;
    const serviceFee = 150;
    const taxes = 75;
    const totalAmount = subtotal + serviceFee + taxes;
    const payNowAmount = paymentType === 'full' ? totalAmount : Math.round(totalAmount * 0.5);
    const remainingAmount = paymentType === 'full' ? 0 : totalAmount - payNowAmount;
    const handlePayment = async () => {
        if (!user) {
            toast.error('Please login to continue');
            return;
        }
        try {
            const paymentStatus = paymentType === 'full' ? 'confirmed' : 'partial';
            const bookingStatus = paymentType === 'full' ? 'upcoming' : 'upcoming';
            await createBooking({
                propertyId: property.id,
                userId: user.id,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                guestsCount: bookingData.guestsCount,
                paymentStatus: paymentStatus as any,
                bookingStatus: bookingStatus,
                totalAmount: totalAmount,
                currency: 'USD',
                paymentMethod: paymentMethod === 'stripe' ? 'Stripe Card' : 'Coinflow Crypto',
            });
            toast.success(
                paymentType === 'full'
                    ? 'Payment successful! Booking confirmed.'
                    : 'Partial payment successful! Remaining amount due 7 days before check-in.'
            );
            router.replace('/(tabs)/search');
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Typography variant="h5" style={styles.headerTitle}>
                    Payment
                </Typography>
            </View>
            <Typography variant="body" color="gold">
              ${totalAmount.toLocaleString()}
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentType === "split" && styles.selectedOption,
            ]}
            onPress={() => setPaymentType("split")}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radio,
                  paymentType === "split" && styles.radioSelected,
                ]}
              >
                {paymentType === "split" && <View style={styles.radioInner} />}
              </View>
              <Typography variant="body">Pay 50% Now, 50% Later</Typography>
            </View>
            <View style={styles.splitAmounts}>
              <Typography variant="caption" color="gold">
                Now: ${payNowAmount.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="secondary">
                Later: ${remainingAmount.toLocaleString()}
              </Typography>
            </View>
          </TouchableOpacity>
        </Card>
        {/* Price Breakdown */}
        <Card style={styles.breakdownCard}>
          <Typography variant="h5" style={styles.sectionTitle}>
            Price Breakdown
          </Typography>
          <View style={styles.breakdownRow}>
            <Typography variant="body">
              ${property.price.rent}/night × {nights} nights
            </Typography>
            <Typography variant="body">${subtotal.toLocaleString()}</Typography>
          </View>
          <View style={styles.breakdownRow}>
            <Typography variant="body">Platform Fee</Typography>
            <Typography variant="body">${serviceFee}</Typography>
          </View>
          <View style={styles.breakdownRow}>
            <Typography variant="body">Taxes</Typography>
            <Typography variant="body">${taxes}</Typography>
          </View>
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Typography variant="h5">Total Price</Typography>
            <Typography variant="h5" color="gold">
              ${totalAmount.toLocaleString()}
            </Typography>
          </View>
          <View style={[styles.breakdownRow, styles.payNowRow]}>
            <Typography variant="h5">Pay Now</Typography>
            <Typography variant="h5" color="gold">
              ${payNowAmount.toLocaleString()}
            </Typography>
          </View>
          {paymentType === "split" && (
            <>
              <View style={styles.breakdownRow}>
                <Typography variant="body">Remaining</Typography>
                <Typography variant="body" color="secondary">
                  ${remainingAmount.toLocaleString()}
                </Typography>
              </View>
              <Typography
                variant="caption"
                color="secondary"
                style={styles.dueNote}
              >
                Due 7 days before check-in
              </Typography>
            </>
          )}
        </Card>

        {/* Notice Box */}
        {paymentType === "split" && (
          <>
            <Card style={styles.noticeCard}>
              <Typography variant="h6" style={styles.noticeTitle}>
                Important Notice
              </Typography>
              <View style={styles.noticeContent}>
                <Typography
                  variant="body"
                  style={[styles.noticeText, styles.warningText]}
                >
                  • Booking Status: Partially Paid
                </Typography>
                <Typography
                  variant="body"
                  style={[styles.noticeText, styles.warningText]}
                >
                  • Second payment of ${remainingAmount.toLocaleString()} must
                  be completed 7 days before check-in
                </Typography>
                <Typography
                  variant="body"
                  style={[styles.noticeText, styles.warningText]}
                >
                  • Booking will be automatically cancelled if second payment is
                  not received
                </Typography>
              </View>
            </Card>
          </>
        )}

        {/* Notice Box */}
        <Card style={styles.noticeCard}>
          <Typography variant="h6" style={styles.noticeTitle}>
          Refund & Cancellation Policy Policies
          </Typography>
          <View style={styles.noticeContent}>
            <Typography variant="body" style={styles.noticeText}>
              • You are booking for {nights} {nights === 1 ? "night" : "nights"}
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

        {/* Payment Methods  
        <Card style={styles.paymentMethodCard}>
          <Typography variant="h5" style={styles.sectionTitle}>
            Payment Method
          </Typography>
          <TouchableOpacity 
            style={[styles.methodOption, paymentMethod === 'stripe' && styles.selectedMethod]}
            onPress={() => setPaymentMethod('stripe')}
          >
            <View style={styles.methodContent}>
              <CreditCard size={24} color={colors.primary.gold} />
              <View style={styles.methodText}>
                <Typography variant="body">Stripe</Typography>
                <Typography variant="caption" color="secondary">
                  Credit/Debit Card
                </Typography>
              </View>
            </View>
            {paymentMethod === 'stripe' && (
              <CheckCircle2 size={20} color={colors.primary.gold} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.methodOption, paymentMethod === 'coinflow' && styles.selectedMethod]}
            onPress={() => setPaymentMethod('coinflow')}
          >
            <View style={styles.methodContent}>
              <Coins size={24} color={colors.primary.gold} />
              <View style={styles.methodText}>
                <Typography variant="body">Coinflow</Typography>
                <Typography variant="caption" color="secondary">
                  Cryptocurrency
                </Typography>
              </View>
            </View>
            {paymentMethod === 'coinflow' && (
              <CheckCircle2 size={20} color={colors.primary.gold} />
            )}
          </TouchableOpacity>
        </Card>
        {paymentType === 'split' && (
          <Card style={styles.statusCard}>
            <Typography variant="h5" style={styles.sectionTitle}>
              Payment Status
            </Typography>
            <View style={styles.statusRow}>
              <Typography variant="body">Status:</Typography>
              <Typography variant="body" color="warning">
                Partially Paid
              </Typography>
            </View>
          </Card>
        )}
        */}
            </ScrollView>

            {/* Action Button */}
            <View style={styles.actionBar}>
                <Button
                    title={isLoading ? 'Processing...' : `Proceed to Pay $${payNowAmount.toLocaleString()}`}
                    onPress={handlePayment}
                    loading={isLoading}
                    style={styles.payButton}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.card,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.layout.screenPadding,
        paddingVertical: spacing.md,
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
    paymentTypeCard: {
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
        marginBottom: spacing.md,
    },
    paymentOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.light,
        marginBottom: spacing.md,
    },
    selectedOption: {
        borderColor: colors.primary.gold,
        backgroundColor: colors.primary.lightGold + '20',
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border.light,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.primary.gold,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary.gold,
    },
    splitAmounts: {
        alignItems: 'flex-end',
        gap: spacing.xs,
    },
    breakdownCard: {
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
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        paddingTop: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    payNowRow: {
        backgroundColor: colors.primary.lightGold + '30',
        padding: spacing.md,
        borderRadius: 8,
        marginBottom: spacing.sm,
    },
    dueNote: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    paymentMethodCard: {
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
    methodOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.light,
        marginBottom: spacing.md,
    },
    selectedMethod: {
        borderColor: colors.primary.gold,
        backgroundColor: colors.primary.lightGold + '20',
    },
    methodContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    methodText: {
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
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionBar: {
        padding: spacing.layout.screenPadding,
        backgroundColor: colors.background.card,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    payButton: {
        width: '100%',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
        paddingHorizontal: spacing.layout.screenPadding,
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
        borderLeftWidth: 4,
        borderLeftColor: colors.primary.gold,
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
    warningText: {
        color: colors.status.warning,
        fontWeight: '500',
    },
});