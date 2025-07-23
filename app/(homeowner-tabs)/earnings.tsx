import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Download,
} from 'lucide-react-native';

// Mock data for earnings
const mockEarningsData = {
  totalEarnings: 125000,
  monthlyEarnings: 18500,
  monthlyGrowth: 12.5,
  averageNightlyRate: 2850,
  occupancyRate: 78,
  transactions: [
    {
      id: '1',
      propertyTitle: 'Luxury Oceanfront Villa',
      guestName: 'Alexander Sterling',
      amount: 12500,
      date: '2024-03-15',
      nights: 5,
      commission: 1250,
      netAmount: 11250,
    },
    {
      id: '2',
      propertyTitle: 'Swiss Alpine Chalet',
      guestName: 'Victoria Blackwood',
      amount: 20000,
      date: '2024-03-10',
      nights: 5,
      commission: 2000,
      netAmount: 18000,
    },
    {
      id: '3',
      propertyTitle: 'Luxury Oceanfront Villa',
      guestName: 'Marcus Rothschild',
      amount: 15000,
      date: '2024-03-05',
      nights: 6,
      commission: 1500,
      netAmount: 13500,
    },
    {
      id: '4',
      propertyTitle: 'Manhattan Penthouse Suite',
      guestName: 'Isabella Chen',
      amount: 14000,
      date: '2024-02-28',
      nights: 4,
      commission: 1400,
      netAmount: 12600,
    },
  ],
  monthlyBreakdown: [
    { month: 'Jan 2024', earnings: 22000, bookings: 8 },
    { month: 'Feb 2024', earnings: 19500, bookings: 7 },
    { month: 'Mar 2024', earnings: 18500, bookings: 6 },
  ],
};

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const renderTransactionCard = ({ item: transaction }: { item: any }) => (
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
            {transaction.nights} nights • {new Date(transaction.date).toLocaleDateString()}
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
  );

  const renderMonthlyCard = ({ item: month }: { item: any }) => (
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
  );

  return (
    <View style={styles.container}>
      <Header
        title="Earnings"
        subtitle="Track your property income"
        showBackButton={false}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <View style={styles.periodFilter}>
              {[
                { key: 'month', label: 'Month' },
                { key: 'quarter', label: 'Quarter' },
                { key: 'year', label: 'Year' },
              ].map((period) => (
                <TouchableOpacity
                  key={period.key}
                  onPress={() => setSelectedPeriod(period.key as any)}
                  style={[
                    styles.periodTab,
                    selectedPeriod === period.key && styles.activePeriodTab,
                  ]}
                >
                  <Typography
                    variant="caption"
                    color={selectedPeriod === period.key ? 'white' : 'secondary'}
                  >
                    {period.label}
                  </Typography>
                </TouchableOpacity>
              ))}
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
            ItemSeparatorComponent={() => <View style={styles.monthlyCardSeparator} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mainEarningsText: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
  },
  periodFilter: {
    flexDirection: 'row',
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
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  separator: {
    height: spacing.md,
  },
});