import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Download,
  ChevronDown,
  ChevronUp,
  Filter,
  User,
  Home,
  Calendar as CalendarIcon,
  Clock,
  DollarSign as DollarIcon,
  Receipt,
} from "lucide-react-native";

// Mock data for earnings
const mockEarningsData = {
  totalEarnings: 125000,
  monthlyEarnings: 18500,
  monthlyGrowth: 12.5,
  averageNightlyRate: 2850,
  occupancyRate: 78,
  transactions: [
    {
      id: "1",
      propertyTitle: "Luxury Oceanfront Villa",
      guestName: "Alexander Sterling",
      amount: 12500,
      date: "2024-03-15",
      nights: 5,
      commission: 1250,
      netAmount: 11250,
    },
    {
      id: "2",
      propertyTitle: "Swiss Alpine Chalet",
      guestName: "Victoria Blackwood",
      amount: 20000,
      date: "2024-03-10",
      nights: 5,
      commission: 2000,
      netAmount: 18000,
    },
    {
      id: "3",
      propertyTitle: "Luxury Oceanfront Villa",
      guestName: "Marcus Rothschild",
      amount: 15000,
      date: "2024-03-05",
      nights: 6,
      commission: 1500,
      netAmount: 13500,
    },
    {
      id: "4",
      propertyTitle: "Manhattan Penthouse Suite",
      guestName: "Isabella Chen",
      amount: 14000,
      date: "2024-02-28",
      nights: 4,
      commission: 1400,
      netAmount: 12600,
    },
  ],
  monthlyBreakdown: [
    { month: "Jan 2024", earnings: 22000, bookings: 8 },
    { month: "Feb 2024", earnings: 19500, bookings: 7 },
    { month: "Mar 2024", earnings: 18500, bookings: 6 },
  ],
};

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "month" | "quarter" | "year"
  >("month");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<any>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isMonthDetailsVisible, setIsMonthDetailsVisible] = useState(false);

  const periodOptions = [
    { key: "month", label: "Month" },
    { key: "quarter", label: "Quarter" },
    { key: "year", label: "Year" },
  ];

  const selectedPeriodLabel = periodOptions.find(
    (option) => option.key === selectedPeriod
  )?.label;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlePeriodSelect = (period: "month" | "quarter" | "year") => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  };

  const handleTransactionPress = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsBottomSheetVisible(true);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetVisible(false);
    setSelectedTransaction(null);
  };

  const handleMonthPress = (month: any) => {
    setSelectedMonth(month);
    setIsMonthDetailsVisible(true);
  };

  const closeMonthDetails = () => {
    setIsMonthDetailsVisible(false);
    setSelectedMonth(null);
  };

  const renderTransactionCard = ({ item: transaction }: { item: any }) => (
    <TouchableOpacity onPress={() => handleTransactionPress(transaction)}>
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Typography variant="h5" numberOfLines={1}>
            {transaction.propertyTitle}
          </Typography>
          <Typography variant="caption" color="secondary">
            Guest: {transaction.guestName}
          </Typography>
          <Typography variant="caption" color="secondary">
              {transaction.nights} nights •{" "}
              {new Date(transaction.date).toLocaleDateString()}
          </Typography>
        </View>
        <View style={styles.transactionAmount}>
          <Typography variant="h4" color="gold">
            ${transaction.amount.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="secondary" align="right">
            Commission: ${transaction.commission.toLocaleString()}
          </Typography>
          <Typography variant="body" color="primary" align="right">
            Net: ${transaction.netAmount.toLocaleString()}
          </Typography>
        </View>
      </View>
    </Card>
    </TouchableOpacity>
  );

  const renderMonthlyCard = ({ item: month }: { item: any }) => (
    <TouchableOpacity onPress={() => handleMonthPress(month)}>
    <Card style={styles.monthlyCard}>
      <Typography variant="h5" color="primary">
        {month.month}
      </Typography>
      <Typography variant="h3" color="gold">
        ${month.earnings.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="secondary">
        {month.bookings} bookings
      </Typography>
    </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Earnings"
        subtitle="Track your property income"
        showBackButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings Overview */}
        <View style={styles.section}>
          <View style={styles.overviewContainer}>
            <Card style={styles.mainEarningsCard}>
              <View style={styles.mainEarningsContent}>
                <DollarSign size={32} color={colors.primary.gold} />
                <View style={styles.mainEarningsText}>
                  <Typography variant="caption" color="secondary">
                    Total Earnings
                  </Typography>
                  <Typography variant="h1" color="primary">
                    ${mockEarningsData.totalEarnings.toLocaleString()}
                  </Typography>
                </View>
              </View>
            </Card>

            <View style={styles.metricsRow}>
              <Card style={styles.metricCard}>
                <View style={styles.metricContent}>
                  <Calendar size={20} color={colors.primary.gold} />
                  <Typography variant="caption" color="secondary">
                    This Month
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${mockEarningsData.monthlyEarnings.toLocaleString()}
                  </Typography>
                  <View style={styles.growthIndicator}>
                    <TrendingUp size={12} color={colors.status.success} />
                    <Typography variant="label" color="success">
                      +{mockEarningsData.monthlyGrowth}%
                    </Typography>
                  </View>
                </View>
              </Card>

              <Card style={styles.metricCard}>
                <View style={styles.metricContent}>
                  <Building2 size={20} color={colors.primary.gold} />
                  <Typography variant="caption" color="secondary">
                    Avg. Nightly Rate
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${mockEarningsData.averageNightlyRate.toLocaleString()}
                  </Typography>
                  <Typography variant="label" color="secondary">
                    {mockEarningsData.occupancyRate}% occupied
                  </Typography>
                </View>
              </Card>
            </View>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.section}>
          <View style={styles.periodContainer}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Earnings Breakdown
            </Typography>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={toggleDropdown}
              >
                <Filter size={16} color={colors.text.primary} />
                <Typography variant="caption" color="primary">
                  {selectedPeriodLabel}
                </Typography>
                {isDropdownOpen ? (
                  <ChevronUp size={16} color={colors.text.primary} />
                ) : (
                  <ChevronDown size={16} color={colors.text.primary} />
                )}
              </TouchableOpacity>
              
              {isDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {periodOptions.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                        styles.dropdownItem,
                        selectedPeriod === period.key && styles.selectedDropdownItem,
                  ]}
                      onPress={() => handlePeriodSelect(period.key as any)}
                >
                  <Typography
                    variant="caption"
                        color={selectedPeriod === period.key ? "inverse" : "primary"}
                  >
                    {period.label}
                  </Typography>
                </TouchableOpacity>
              ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Monthly Breakdown */}
        <View style={styles.section}>
          <FlatList
            data={mockEarningsData.monthlyBreakdown}
            renderItem={renderMonthlyCard}
            keyExtractor={(item) => item.month}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthlyList}
            ItemSeparatorComponent={() => (
              <View style={styles.monthlyCardSeparator} />
            )}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.transactionsHeader}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Recent Transactions
            </Typography>
            <TouchableOpacity style={styles.downloadButton}>
              <Download size={16} color={colors.primary.gold} />
              <Typography variant="caption" color="gold">
                Export
              </Typography>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mockEarningsData.transactions}
            renderItem={renderTransactionCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>

      {/* Transaction Details Bottom Sheet */}
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={closeBottomSheet}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <View style={styles.bottomSheetContent}>
            {/* Property Information */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Home size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Property
                </Typography>
              </View>
              <Typography variant="body" color="primary">
                {selectedTransaction.propertyTitle}
              </Typography>
            </View>

            {/* Guest Information */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <User size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Guest
                </Typography>
              </View>
              <Typography variant="body" color="primary">
                {selectedTransaction.guestName}
              </Typography>
            </View>

            {/* Booking Details */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <CalendarIcon size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Booking Details
                </Typography>
              </View>
              <View style={styles.bookingDetails}>
                <View style={styles.bookingRow}>
                  <Clock size={16} color={colors.text.secondary} />
                  <Typography variant="caption" color="secondary">
                    Check-in: {new Date(selectedTransaction.date).toLocaleDateString()}
                  </Typography>
                </View>
                <View style={styles.bookingRow}>
                  <CalendarIcon size={16} color={colors.text.secondary} />
                  <Typography variant="caption" color="secondary">
                    Duration: {selectedTransaction.nights} nights
                  </Typography>
                </View>
              </View>
            </View>

            {/* Financial Breakdown */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Receipt size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Financial Breakdown
                </Typography>
              </View>
              <View style={styles.financialBreakdown}>
                <View style={styles.financialRow}>
                  <Typography variant="body" color="secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h4" color="gold">
                    ${selectedTransaction.amount.toLocaleString()}
                  </Typography>
                </View>
                <View style={styles.financialRow}>
                  <Typography variant="body" color="secondary">
                    Platform Commission
                  </Typography>
                  <Typography variant="body" color="error">
                    -${selectedTransaction.commission.toLocaleString()}
                  </Typography>
                </View>
                <View style={styles.financialDivider} />
                <View style={styles.financialRow}>
                  <Typography variant="h5" color="primary">
                    Net Earnings
                  </Typography>
                  <Typography variant="h3" color="gold">
                    ${selectedTransaction.netAmount.toLocaleString()}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Transaction ID */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <DollarIcon size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Transaction ID
                </Typography>
              </View>
              <Typography variant="caption" color="secondary">
                #{selectedTransaction.id}
              </Typography>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Monthly Details Bottom Sheet */}
      <BottomSheet
        visible={isMonthDetailsVisible}
        onClose={closeMonthDetails}
        title="Monthly Breakdown"
      >
        {selectedMonth && (
          <View style={styles.bottomSheetContent}>
            {/* Month Overview */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <CalendarIcon size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  {selectedMonth.month}
                </Typography>
              </View>
              <Typography variant="h2" color="gold">
                ${selectedMonth.earnings.toLocaleString()}
              </Typography>
              <Typography variant="body" color="secondary">
                Total Earnings
              </Typography>
            </View>

            {/* Booking Statistics */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Building2 size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Booking Statistics
                </Typography>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Typography variant="h3" color="primary">
                    {selectedMonth.bookings}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Total Bookings
                  </Typography>
                </View>
                <View style={styles.statCard}>
                  <Typography variant="h3" color="primary">
                    ${Math.round(selectedMonth.earnings / selectedMonth.bookings).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Avg. per Booking
                  </Typography>
                </View>
              </View>
            </View>

            {/* Performance Metrics */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <TrendingUp size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Performance Metrics
                </Typography>
              </View>
              <View style={styles.metricsList}>
                <View style={styles.metricRow}>
                  <Typography variant="body" color="secondary">
                    Average Daily Revenue
                  </Typography>
                  <Typography variant="body" color="primary">
                    ${Math.round(selectedMonth.earnings / 30).toLocaleString()}
                  </Typography>
                </View>
                <View style={styles.metricRow}>
                  <Typography variant="body" color="secondary">
                    Revenue per Night
                  </Typography>
                  <Typography variant="body" color="primary">
                    ${Math.round(selectedMonth.earnings / (selectedMonth.bookings * 5)).toLocaleString()}
                  </Typography>
                </View>
                <View style={styles.metricRow}>
                  <Typography variant="body" color="secondary">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="body" color="primary">
                    {Math.round((selectedMonth.bookings * 5 / 30) * 100)}%
                  </Typography>
                </View>
              </View>
            </View>

            {/* Comparison with Previous Month */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <TrendingDown size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Month-over-Month
                </Typography>
              </View>
              <View style={styles.comparisonCard}>
                <View style={styles.comparisonRow}>
                  <Typography variant="body" color="secondary">
                    vs Previous Month
                  </Typography>
                  <View style={styles.growthIndicator}>
                    <TrendingUp size={12} color={colors.status.success} />
                    <Typography variant="label" color="success">
                      +{Math.round(((selectedMonth.earnings - 19500) / 19500) * 100)}%
                    </Typography>
                  </View>
                </View>
                <Typography variant="caption" color="secondary">
                  Based on estimated previous month earnings
                </Typography>
              </View>
            </View>

            {/* Top Properties */}
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <Home size={20} color={colors.primary.gold} />
                <Typography variant="h5" style={styles.detailTitle}>
                  Top Performing Properties
                </Typography>
              </View>
              <View style={styles.propertyList}>
                <View style={styles.propertyItem}>
                  <Typography variant="body" color="primary">
                    Luxury Oceanfront Villa
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    ${Math.round(selectedMonth.earnings * 0.4).toLocaleString()}
                  </Typography>
                </View>
                <View style={styles.propertyItem}>
                  <Typography variant="body" color="primary">
                    Swiss Alpine Chalet
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    ${Math.round(selectedMonth.earnings * 0.35).toLocaleString()}
                  </Typography>
                </View>
                <View style={styles.propertyItem}>
                  <Typography variant="body" color="primary">
                    Manhattan Penthouse Suite
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    ${Math.round(selectedMonth.earnings * 0.25).toLocaleString()}
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        )}
      </BottomSheet>
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
  overviewContainer: {
    gap: spacing.md,
  },
  mainEarningsCard: {
    backgroundColor: colors.primary.navy,
    borderRadius: 16,
    padding: spacing.lg,
  },
  mainEarningsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  mainEarningsText: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  metricContent: {
    gap: spacing.sm,
  },
  growthIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  periodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "600",
  },
  periodFilter: {
    flexDirection: "row",
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  periodTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  activePeriodTab: {
    backgroundColor: colors.primary.gold,
  },
  monthlyList: {
    paddingRight: spacing.lg,
  },
  monthlyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    minWidth: 120,
    alignItems: "center",
    gap: spacing.xs,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  monthlyCardSeparator: {
    width: spacing.md,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
  },
  transactionCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionInfo: {
    flex: 1,
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  transactionAmount: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  separator: {
    height: spacing.md,
  },
  dropdownContainer: {
    position: "relative",
    width: 140,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    gap: spacing.xs,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  selectedDropdownItem: {
    backgroundColor: colors.primary.gold,
  },
  bottomSheetContent: {
    gap: spacing.lg,
  },
  detailSection: {
    gap: spacing.sm,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailTitle: {
    fontWeight: "600",
  },
  bookingDetails: {
    gap: spacing.xs,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  financialBreakdown: {
    gap: spacing.sm,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  financialDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  metricsList: {
    gap: spacing.sm,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  comparisonCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyList: {
    gap: spacing.sm,
  },
  propertyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
});
