import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { usePropertyStore } from '@/stores/propertyStore';
import { useInvestmentStore } from '@/stores/investmentStore';
import { useAuthStore } from '@/stores/authStore';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Coins,
  FileText,
  Download,
  Shield,
  Calendar,
  BarChart3,
  Users,
  MapPin,
  Star,
  Info,
  AlertTriangle,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
export default function InvestmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getPropertyById } = usePropertyStore();
  const { createInvestment, isLoading } = useInvestmentStore();
  const { user } = useAuthStore();
  const property = getPropertyById(id as string);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showKYCModal, setShowKYCModal] = useState(false);
  // Mock token metadata
  const tokenMetadata = {
    tokenId: `TOKEN-${property?.id}`,
    tokenName: `${property?.title.replace(/\s+/g, '')}Token`,
    tokenSymbol: `${property?.title.substring(0, 3).toUpperCase()}T`,
    totalSupply: property?.investmentDetails.totalShares || 0,
    availableTokens: property?.investmentDetails.availableShares || 0,
    tokenPrice: property ? property.price.investment / property.investmentDetails.totalShares : 0,
    contractAddress: '0x742d35Cc6634C0532925a3b8D4C2C8b8C2C8b8C2',
    blockchain: 'Ethereum',
    tokenStandard: 'ERC-20',
    isLive: property?.approvalStatus === 'approved',
    launchDate: '2024-01-15',
    lockupPeriod: '12 months',
  };
  // Mock yield forecast data
  const yieldForecast = {
    year1: { yield: 12.5, value: 112500 },
    averageYield: 13.9,
  };
  // Mock ownership terms
  const ownershipTerms = {
    votingRights: true,
    dividendRights: true,
    transferRights: true,
    liquidityOptions: 'Secondary market available after 12 months',
    managementFee: '2% annually',
    performanceFee: '20% of profits above 10% return',
    minimumHoldingPeriod: '12 months',
    exitStrategy: 'Property sale or token buyback program',
  };
  // Mock legal documents
  const legalDocuments = [
    { name: 'Token Purchase Agreement', size: '2.4 MB', type: 'PDF' },
    { name: 'Property Prospectus', size: '5.1 MB', type: 'PDF' },
    { name: 'Risk Disclosure Statement', size: '1.8 MB', type: 'PDF' },
    { name: 'Ownership Structure', size: '3.2 MB', type: 'PDF' },
    { name: 'Legal Opinion', size: '2.9 MB', type: 'PDF' },
  ];
  const calculateShares = () => {
    const amount = parseFloat(investmentAmount) || 0;
    return Math.floor(amount / tokenMetadata.tokenPrice);
  };
  const calculateEstimatedReturns = () => {
    const amount = parseFloat(investmentAmount) || 0;
    const roiRate = property?.investmentDetails.roiEstimate || 0;
    return (amount * roiRate) / 100;
  };
  const handleInvestment = async () => {
    // Check KYC status first
    if (!user?.kycStatus || user.kycStatus !== 'complete') {
      setShowKYCModal(true);
      return;
    }
    if (!property || !user || !investmentAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const amount = parseFloat(investmentAmount);
    if (amount < property.investmentDetails.minimumInvestment) {
      toast.error(
        `Minimum investment is $${property.investmentDetails.minimumInvestment.toLocaleString()}`
      );
      return;
    }
    if (calculateShares() > property.investmentDetails.availableShares) {
      toast.error('Not enough tokens available');
      return;
    }
    try {
      await createInvestment({
        propertyId: property.id,
        userId: user.id,
        amount: amount,
        currency: paymentMethod === 'fiat' ? 'USD' : 'BTC',
        investmentDate: new Date().toISOString(),
        roiEstimate: property.investmentDetails.roiEstimate,
        investmentStatus: 'active',
        shares: calculateShares(),
      });
      // Calculate ownership percentage
      const ownershipPercentage =
        (calculateShares() / property.investmentDetails.totalShares) * 100;
      toast.success('Investment completed successfully!');
      // Navigate to success screen with investment details
      router.replace({
        pathname: '/investment/success',
        params: {
          propertyId: property.id,
          tokenQuantity: calculateShares().toString(),
          amount: amount.toString(),
          paymentMethod: paymentMethod,
          investmentDate: new Date().toISOString(),
          ownershipPercentage: ownershipPercentage.toString(),
        },
      });
    } catch (error) {
      toast.error('Investment failed. Please try again.');
    }
  };
  const handleDownloadDocument = (docName: string) => {
    Alert.alert('Download Document', `${docName} will be downloaded to your device.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Download', onPress: () => toast.success(`${docName} downloaded successfully`) },
    ]);
  };
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
  // Only show if token is live/approved
  if (!tokenMetadata.isLive) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={colors.status.warning} />
          <Typography variant="h3" color="secondary" align="center">
            Token Not Available
          </Typography>
          <Typography variant="body" color="secondary" align="center">
            This investment token is not currently live or approved for trading.
          </Typography>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Typography variant="h3">Investment Details</Typography>
        <View style={styles.placeholder} />
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Property Images Gallery */}
          <Card style={styles.imageCard}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
            >
              {property.mediaGallery.images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.propertyImage} />
              ))}
            </ScrollView>
            <View style={styles.imageIndicator}>
              <Typography variant="caption" color="inverse">
                {currentImageIndex + 1} / {property.mediaGallery.images.length}
              </Typography>
            </View>
            <View style={styles.propertyOverlay}>
              <Typography variant="h4" color="inverse">
                {property.title}
              </Typography>
              <View style={styles.locationRow}>
                <MapPin size={16} color={colors.neutral.white} />
                <Typography variant="body" color="inverse">
                  {property.location.city}, {property.location.country}
                </Typography>
              </View>
              <View style={styles.ratingRow}>
                <Star size={16} color={colors.primary.gold} fill={colors.primary.gold} />
                <Typography variant="body" color="inverse">
                  {property.rating} ({property.reviews} reviews)
                </Typography>
              </View>
            </View>
          </Card>
          {/* Token Metadata */}
          <Card style={styles.tokenCard}>
            <View style={styles.tokenHeader}>
              <Coins size={24} color={colors.primary.gold} />
              <Typography variant="h4">Token Metadata</Typography>
            </View>
            <View style={styles.tokenGrid}>
              <View style={styles.tokenItem}>
                <Typography variant="caption" color="secondary">
                  Token Name
                </Typography>
                <Typography variant="body">{tokenMetadata.tokenName}</Typography>
              </View>
              <View style={styles.tokenItem}>
                <Typography variant="caption" color="secondary">
                  Symbol
                </Typography>
                <Typography variant="body">{tokenMetadata.tokenSymbol}</Typography>
              </View>
              <View style={styles.tokenItem}>
                <Typography variant="caption" color="secondary">
                Per Token
                </Typography>
                <Typography variant="body" color="gold">
                  ${tokenMetadata.tokenPrice.toLocaleString()}
                </Typography>
              </View>
              <View style={styles.tokenItem}>
                <Typography variant="caption" color="secondary">
                  Available Tokens
                </Typography>
                <Typography variant="body">{tokenMetadata.availableTokens}</Typography>
              </View>
              <View style={styles.tokenItem}>
                <Typography variant="caption" color="secondary">
                  Total Supply
                </Typography>
                <Typography variant="body">{tokenMetadata.totalSupply}</Typography>
              </View>
            
            </View>
           
          </Card>
          {/* Yield Forecast */}
          <Card style={styles.yieldCard}>
            <View style={styles.yieldHeader}>
              <BarChart3 size={24} color={colors.status.success} />
              <Typography variant="h4">Yield Forecast</Typography>
            </View>
            <View style={styles.yieldSummary}>
              <Typography variant="h2" color="success">
                {yieldForecast.averageYield}%
              </Typography>
              <Typography variant="caption" color="secondary">
                Average Annual Yield
              </Typography>
            </View>
            <View style={styles.yieldProjections}>
              {Object.entries(yieldForecast)
                .filter(([key]) => key.startsWith('year'))
                .map(([period, data]) => (
                  <View key={period} style={styles.yieldRow}>
                    <Typography variant="body">
                      {period === 'year1'
                        ? 'Year 1'
                        : period === 'year2'
                          ? 'Year 2'
                          : period === 'year3'
                            ? 'Year 3'
                            : 'Year 5'}
                    </Typography>
                    <View style={styles.yieldValues}>
                      <Typography variant="body" color="success">
                        {data.yield}%
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        ${data.value.toLocaleString()}
                      </Typography>
                    </View>
                  </View>
                ))}
            </View>
          </Card>
          {/* Ownership Terms */}
          <Card style={styles.ownershipCard}>
            <View style={styles.ownershipHeader}>
              <Shield size={24} color={colors.primary.blue} />
              <Typography variant="h4">Ownership Terms</Typography>
            </View>
            <View style={styles.termsList}>
              
              <View style={styles.termItem}>
                <CheckCircle2 size={16} color={colors.status.success} />
                <View style={styles.termContent}>
                  <Typography variant="body">Dividend Rights</Typography>
                  <Typography variant="caption" color="secondary">
                    Receive proportional rental income
                  </Typography>
                </View>
              </View>
              <View style={styles.termItem}>
                <Info size={16} color={colors.primary.gold} />
                <View style={styles.termContent}>
                  <Typography variant="body">Minimum Holding Period</Typography>
                  <Typography variant="caption" color="secondary">
                    {ownershipTerms.minimumHoldingPeriod}
                  </Typography>
                </View>
              </View>
              <View style={styles.termItem}>
                <Info size={16} color={colors.primary.gold} />
                <View style={styles.termContent}>
                  <Typography variant="body">Management Fee</Typography>
                  <Typography variant="caption" color="secondary">
                    {ownershipTerms.managementFee}
                  </Typography>
                </View>
              </View>
            </View>
          </Card>
          {/* Legal Summary */}
          <Card style={styles.legalCard}>
            <View style={styles.legalHeader}>
              <FileText size={24} color={colors.text.primary} />
              <Typography variant="h4">Legal Summary</Typography>
            </View>
            <Typography variant="body" color="secondary" style={styles.legalDescription}>
              This investment is structured as a tokenized real estate investment. All legal
              documents are available for download and review.
            </Typography>
            <View style={styles.documentsList}>
              {legalDocuments.map((doc, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.documentItem}
                  onPress={() => handleDownloadDocument(doc.name)}
                >
                  <View style={styles.documentInfo}>
                    <FileText size={20} color={colors.primary.gold} />
                    <View style={styles.documentText}>
                      <Typography variant="body">{doc.name}</Typography>
                      <Typography variant="caption" color="secondary">
                        {doc.type} • {doc.size}
                      </Typography>
                    </View>
                  </View>
                  <Download size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          {/* Investment Form - Only show if KYC complete */}
          {user?.kycStatus === 'complete' && (
            <>
              {/* Investment Details */}
              <Card style={styles.investmentCard}>
                <Typography variant="h4" style={styles.sectionTitle}>
                  Investment Amount
                </Typography>
                <View style={styles.amountSection}>
                  <View style={styles.amountRow}>
                    <DollarSign size={20} color={colors.primary.gold} />
                    <Typography variant="body">Investment Amount</Typography>
                  </View>
                  <Input
                    value={investmentAmount}
                    onChangeText={setInvestmentAmount}
                    placeholder={`Minimum $${property.investmentDetails.minimumInvestment.toLocaleString()}`}
                    keyboardType="numeric"
                    containerStyle={styles.amountInput}
                  />
                  <Typography variant="caption" color="secondary">
                    Minimum investment: $
                    {property.investmentDetails.minimumInvestment.toLocaleString()}
                  </Typography>

                  <View style={styles.warningNote}>
                  <Typography variant="caption" color="secondary">
                    ⚠️ Tokens listed will be locked for 3 months minimum
                  </Typography>
                </View>

                </View>
                <View style={styles.paymentSection}>
                  <Typography variant="body" style={styles.paymentLabel}>
                    Payment Method
                  </Typography>
                  <View style={styles.paymentOptions}>
                    <Button
                      title="Pay via Fiat"
                      onPress={() => setPaymentMethod('fiat')}
                      variant={paymentMethod === 'fiat' ? 'primary' : 'outline'}
                      style={styles.paymentOption}
                    />
                    <Button
                      title="Pay via Crypto"
                      onPress={() => setPaymentMethod('crypto')}
                      variant={paymentMethod === 'crypto' ? 'primary' : 'outline'}
                      style={styles.paymentOption}
                    />
                  </View>
                </View>
              </Card>
              {/* Investment Summary */}
              <Card style={styles.summaryCard}>
                <Typography variant="h4" style={styles.sectionTitle}>
                  Investment Summary
                </Typography>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <CheckCircle2 size={24} color={colors.primary.gold} />
                    <View style={styles.summaryText}>
                      <Typography variant="h4">{calculateShares()}</Typography>
                      <Typography variant="caption" color="secondary">
                        Tokens
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.summaryItem}>
                    <TrendingUp size={24} color={colors.status.success} />
                    <View style={styles.summaryText}>
                      <Typography variant="h4" style={{ color: colors.status.success }}>
                        ${calculateEstimatedReturns().toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Est. Annual Returns
                      </Typography>
                    </View>
                  </View>
                </View>
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Typography variant="body">Investment Amount</Typography>
                    <Typography variant="body">
                      ${parseFloat(investmentAmount || '0').toLocaleString()}
                    </Typography>
                  </View>
                  <View style={styles.totalRow}>
                    <Typography variant="body">Processing Fee</Typography>
                    <Typography variant="body">$50</Typography>
                  </View>
                  <View style={[styles.totalRow, styles.finalTotal]}>
                    <Typography variant="h4">Total</Typography>
                    <Typography variant="h4" color="gold">
                      ${(parseFloat(investmentAmount || '0') + 50).toLocaleString()}
                    </Typography>
                  </View>
                </View>
              </Card>
            </>
          )}
        </ScrollView>
        {/* Action Button */}
        <View style={styles.actionBar}>
          {user?.kycStatus === 'complete' ? (
            <Button
              title={isLoading ? 'Processing...' : 'Confirm Investment'}
              onPress={handleInvestment}
              loading={isLoading}
              disabled={
                !investmentAmount ||
                parseFloat(investmentAmount) < property.investmentDetails.minimumInvestment
              }
              style={styles.confirmButton}
            />
          ) : (
            <Button
              title="Complete KYC to Invest"
              onPress={() => setShowKYCModal(true)}
              variant="outline"
              style={styles.confirmButton}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      {/* KYC Modal */}
      <Modal visible={showKYCModal} onClose={() => setShowKYCModal(false)}>
        <View style={styles.modalContent}>
          <View style={styles.kycModalHeader}>
            <Shield size={48} color={colors.primary.gold} />
            <Typography variant="h4" align="center" style={styles.modalTitle}>
              KYC Required
            </Typography>
          </View>
          <Typography
            variant="body"
            color="secondary"
            align="center"
            style={styles.kycModalDescription}
          >
            You need to complete KYC verification before you can invest in tokenized properties.
          </Typography>
          <View style={styles.modalButtons}>
            <Button
              title="Start KYC Process"
              onPress={() => {
                setShowKYCModal(false);
                router.push('/kyc-verification');
              }}
              style={styles.modalButton}
            />
            <Button title="Cancel" onPress={() => setShowKYCModal(false)} variant="ghost" />
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.sm,
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
  imageCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  propertyImage: {
    width: width - spacing.layout.screenPadding * 2,
    height: 250,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  propertyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tokenCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tokenItem: {
    width: '48%',
    gap: spacing.xs,
  },
  contractInfo: {
    backgroundColor: colors.background.light,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  contractAddress: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  yieldCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  yieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  yieldSummary: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.light,
    borderRadius: radius.md,
  },
  yieldProjections: {
    gap: spacing.md,
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  yieldValues: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  ownershipCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  ownershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  termsList: {
    gap: spacing.md,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  termContent: {
    flex: 1,
    gap: spacing.xs,
  },
  legalCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  legalDescription: {
    lineHeight: 22,
  },
  documentsList: {
    gap: spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.light,
    borderRadius: radius.md,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  documentText: {
    flex: 1,
    gap: spacing.xs,
  },
  investmentCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  amountSection: {
    gap: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountInput: {
    marginBottom: 0,
  },
  paymentSection: {
    gap: spacing.md,
  },
  paymentLabel: {
    marginBottom: spacing.sm,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentOption: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryText: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  totalSection: {
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalTotal: {
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
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.layout.screenPadding,
  },
  modalContent: {
    gap: spacing.lg,
    alignItems: 'center',
  },
  kycModalHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.sm,
  },
  kycModalDescription: {
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalButtons: {
    width: '100%',
    gap: spacing.md,
  },
  modalButton: {
    width: '100%',
  },

  warningNote: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: radius.md,
    padding: spacing.sm, 
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
});