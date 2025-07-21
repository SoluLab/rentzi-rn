import React, { useState, useMemo } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useAuthStore } from '@/stores/authStore';
import { useInvestmentStore } from '@/stores/investmentStore';
import { usePropertyStore } from '@/stores/propertyStore';
import { Header } from '@/components/ui/Header';
import { Investment } from '@/types';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AArrowDown,
  PieChart,
  BarChart3,
  Download,
  ChevronDown,
  Filter,
  Wallet,
  ShoppingCart,
  Tag,
  Hash,
  DollarSign as DollarSignIcon,
  Clock,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
export default function PortfolioScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getUserInvestments, getTotalPortfolioValue, getPortfolioROI, claimPayout, isLoading } =
    useInvestmentStore();
  const { getPropertyById } = usePropertyStore();
  const [selectedTab, setSelectedTab] = useState<'Investments' | 'Secondary Marketplace'>(
    'Investments'
  );
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedSortOption, setSelectedSortOption] = useState<string>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [buyForm, setBuyForm] = useState({
    quantity: '',
  });
  const [listingForm, setListingForm] = useState({
    tokensToSell: '',
    pricePerToken: '',
    listingDuration: '30',
  });
  // Dummy data for secondary marketplace listings
  const secondaryMarketListings = [
    {
      id: 'listing-1',
      propertyName: 'Luxury Villa Santorini',
      tokenSymbol: 'LVS',
      quantityListed: 150,
      pricePerToken: 125.5,
      totalValue: 18825,
      roiPercent: 12.5,
      sellerName: 'John D.',
      listingDate: '2024-12-10',
      location: 'Santorini, Greece',
      propertyImage:
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    },
    {
      id: 'listing-2',
      propertyName: 'Manhattan Penthouse',
      tokenSymbol: 'MNP',
      quantityListed: 75,
      pricePerToken: 280.0,
      totalValue: 21000,
      roiPercent: 15.8,
      sellerName: 'Sarah M.',
      listingDate: '2024-12-08',
      location: 'New York, USA',
      propertyImage:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    },
    {
      id: 'listing-3',
      propertyName: 'Dubai Marina Tower',
      tokenSymbol: 'DMT',
      quantityListed: 200,
      pricePerToken: 95.75,
      totalValue: 19150,
      roiPercent: 9.2,
      sellerName: 'Ahmed K.',
      listingDate: '2024-12-05',
      location: 'Dubai, UAE',
      propertyImage:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
    },
    {
      id: 'listing-4',
      propertyName: 'London Luxury Flat',
      tokenSymbol: 'LLF',
      quantityListed: 100,
      pricePerToken: 165.25,
      totalValue: 16525,
      roiPercent: 11.3,
      sellerName: 'Emma W.',
      listingDate: '2024-12-03',
      location: 'London, UK',
      propertyImage:
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    },
    {
      id: 'listing-5',
      propertyName: 'Tokyo Sky Residence',
      tokenSymbol: 'TSR',
      quantityListed: 120,
      pricePerToken: 210.0,
      totalValue: 25200,
      roiPercent: 18.7,
      sellerName: 'Hiroshi T.',
      listingDate: '2024-12-01',
      location: 'Tokyo, Japan',
      propertyImage:
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    },
  ];
  const sortOptions = [
    { label: 'Highest ROI', value: 'highest_roi' },
    { label: 'Lowest Price', value: 'lowest_price' },
    { label: 'Newest First', value: 'newest' },
  ];
  const sortedSecondaryMarketListings = useMemo(() => {
    let sorted = [...secondaryMarketListings];
    switch (selectedSortOption) {
      case 'highest_roi':
        sorted.sort((a, b) => b.roiPercent - a.roiPercent);
        break;
      case 'lowest_price':
        sorted.sort((a, b) => a.pricePerToken - b.pricePerToken);
        break;
      case 'newest':
        sorted.sort(
          (a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [selectedSortOption]);
  const allInvestments = user ? getUserInvestments(user.id) : [];
  const filterOptions = [
    { label: 'All Investments', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Withdrawn', value: 'withdrawn' },
    { label: 'Date (Newest)', value: 'date_newest' },
    { label: 'Date (Oldest)', value: 'date_oldest' },
    { label: 'Value (High to Low)', value: 'value_high' },
    { label: 'Value (Low to High)', value: 'value_low' },
    { label: 'Yield (High to Low)', value: 'yield_high' },
    { label: 'Yield (Low to High)', value: 'yield_low' },
  ];
  const investments = useMemo(() => {
    let filtered = [...allInvestments];
    // Apply status filters
    if (selectedFilter === 'active') {
      filtered = filtered.filter((inv) => inv.investmentStatus === 'active');
    } else if (selectedFilter === 'completed') {
      filtered = filtered.filter((inv) => inv.investmentStatus === 'completed');
    } else if (selectedFilter === 'withdrawn') {
      filtered = filtered.filter((inv) => inv.investmentStatus === 'pending'); // Using pending as withdrawn for now
    }
    // Apply sorting filters
    if (selectedFilter === 'date_newest') {
      filtered.sort(
        (a, b) => new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime()
      );
    } else if (selectedFilter === 'date_oldest') {
      filtered.sort(
        (a, b) => new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime()
      );
    } else if (selectedFilter === 'value_high') {
      filtered.sort((a, b) => b.currentValue - a.currentValue);
    } else if (selectedFilter === 'value_low') {
      filtered.sort((a, b) => a.currentValue - b.currentValue);
    } else if (selectedFilter === 'yield_high') {
      filtered.sort((a, b) => {
        const yieldA = ((a.currentValue - a.amount) / a.amount) * 100;
        const yieldB = ((b.currentValue - b.amount) / b.amount) * 100;
        return yieldB - yieldA;
      });
    } else if (selectedFilter === 'yield_low') {
      filtered.sort((a, b) => {
        const yieldA = ((a.currentValue - a.amount) / a.amount) * 100;
        const yieldB = ((b.currentValue - b.amount) / b.amount) * 100;
        return yieldA - yieldB;
      });
    }
    return filtered;
  }, [allInvestments, selectedFilter]);
  const totalValue = user ? getTotalPortfolioValue(user.id) : 0;
  const portfolioROI = user ? getPortfolioROI(user.id) : 0;
  const totalInvested = allInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const portfolioStats = [
    {
      icon: DollarSign,
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      color: colors.primary.gold,
    },
    {
      icon: TrendingUp,
      title: 'Total Yield',
      value: `+${portfolioROI.toFixed(1)}%`,
      color: colors.status.success,
    },
    {
      icon: PieChart,
      title: 'Properties',
      value: allInvestments.length.toString(),
      color: colors.status.info,
    },
    {
      icon: BarChart3,
      title: 'Invested',
      value: `$${totalInvested.toLocaleString()}`,
      color: colors.text.secondary,
    },
  ];
  const handleClaimPayout = async (investmentId: string) => {
    try {
      await claimPayout(investmentId);
      Alert.alert('Success', 'Payout claimed successfully!');
      setShowTokenModal(false);
    } catch (error) {
      console.error('Error claiming payout:', error);
      Alert.alert('Error', 'Failed to claim payout. Please try again.');
    }
  };
  const handleInvestmentPress = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowTokenModal(true);
  };
  const handleCloseModal = () => {
    setShowTokenModal(false);
    setSelectedInvestment(null);
  };
  const handleListForSale = () => {
    setShowTokenModal(false);
    setShowListForSaleModal(true);
    // Reset form
    setListingForm({
      tokensToSell: '',
      pricePerToken: '',
      listingDuration: '30',
    });
  };
  const handleListingFormChange = (field: string, value: string) => {
    setListingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const calculateTotalValue = () => {
    const tokens = parseInt(listingForm.tokensToSell) || 0;
    const price = parseFloat(listingForm.pricePerToken) || 0;
    return tokens * price;
  };
  const calculatePercentageOfBalance = () => {
    const tokensToSell = parseInt(listingForm.tokensToSell) || 0;
    const totalTokens = selectedInvestment?.shares || 0;
    if (totalTokens === 0) return 0;
    return (tokensToSell / totalTokens) * 100;
  };
  const getMarketPriceWarning = () => {
    // Mock market price - in real app this would come from API
    const mockMarketPrice = 100; // $100 per token
    const userPrice = parseFloat(listingForm.pricePerToken) || 0;
    if (userPrice === 0) return null;
    const deviation = ((userPrice - mockMarketPrice) / mockMarketPrice) * 100;
    if (Math.abs(deviation) >= 20) {
      return {
        type: 'warning',
        message: `Price is ${Math.abs(deviation).toFixed(1)}% ${deviation > 0 ? 'above' : 'below'} market price ($${mockMarketPrice})`,
        color: colors.status.warning,
      };
    } else if (Math.abs(deviation) >= 10) {
      return {
        type: 'info',
        message: `Market price: $${mockMarketPrice} per token`,
        color: colors.text.secondary,
      };
    }
    return null;
  };
  const handlePreviewListing = () => {
    if (!listingForm.tokensToSell || !listingForm.pricePerToken) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const tokensToSell = parseInt(listingForm.tokensToSell);
    const maxTokens = selectedInvestment?.shares || 0;
    if (tokensToSell > maxTokens) {
      Alert.alert('Error', `You can only list up to ${maxTokens} tokens`);
      return;
    }
    if (tokensToSell <= 0) {
      Alert.alert('Error', 'Please enter a valid number of tokens');
      return;
    }
    const pricePerToken = parseFloat(listingForm.pricePerToken);
    if (pricePerToken <= 0) {
      Alert.alert('Error', 'Please enter a valid price per token');
      return;
    }
    setShowPreviewModal(true);
  };
  const handleSubmitListing = () => {
    if (!listingForm.tokensToSell || !listingForm.pricePerToken) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const tokensToSell = parseInt(listingForm.tokensToSell);
    const maxTokens = selectedInvestment?.shares || 0;
    if (tokensToSell > maxTokens) {
      Alert.alert('Error', `You can only list up to ${maxTokens} tokens`);
      return;
    }
    if (tokensToSell <= 0) {
      Alert.alert('Error', 'Please enter a valid number of tokens');
      return;
    }
    const pricePerToken = parseFloat(listingForm.pricePerToken);
    if (pricePerToken <= 0) {
      Alert.alert('Error', 'Please enter a valid price per token');
      return;
    }
    const totalValue = calculateTotalValue();
    const durationText =
      listingForm.listingDuration === 'none'
        ? 'indefinitely'
        : `${listingForm.listingDuration} days`;
    // Close all modals and show success
    setShowListForSaleModal(false);
    setShowPreviewModal(false);
    setShowSuccessModal(true);
  };
  const handleCloseListingModal = () => {
    setShowListForSaleModal(false);
    setShowPreviewModal(false);
    setListingForm({
      tokensToSell: '',
      pricePerToken: '',
      listingDuration: '30',
    });
  };
  const handleSuccessAction = (action: 'marketplace' | 'listings') => {
    setShowSuccessModal(false);
    setListingForm({
      tokensToSell: '',
      pricePerToken: '',
      listingDuration: '30',
    });
    if (action === 'marketplace') {
      // Navigate to marketplace - for now just show alert
      Alert.alert('Navigation', 'Navigating to Secondary Marketplace...');
    } else {
      // Navigate to my listings - for now just show alert
      Alert.alert('Navigation', 'Navigating to My Listings...');
    }
  };
  const handleBuyTokensPress = (listing: any) => {
    setSelectedListing(listing);
    setBuyForm({ quantity: '' });
    setShowBuyTokensModal(true);
  };
  const handleCloseBuyModal = () => {
    setShowBuyTokensModal(false);
    setSelectedListing(null);
    setBuyForm({ quantity: '' });
  };
  const handleBuyFormChange = (field: string, value: string) => {
    setBuyForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const calculateBuyTotal = () => {
    const quantity = parseInt(buyForm.quantity) || 0;
    const price = selectedListing?.pricePerToken || 0;
    return quantity * price;
  };
  const handleConfirmPurchase = () => {
    if (!buyForm.quantity || parseInt(buyForm.quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    const quantity = parseInt(buyForm.quantity);
    const maxTokens = selectedListing?.quantityListed || 0;
    if (quantity > maxTokens) {
      Alert.alert('Error', `Only ${maxTokens} tokens are available`);
      return;
    }
    const totalCost = calculateBuyTotal();
    Alert.alert(
      'Purchase Confirmation',
      `You are about to purchase ${quantity} tokens of ${selectedListing?.propertyName} for $${totalCost.toLocaleString()}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Purchase',
          onPress: () => {
            handleCloseBuyModal();
            Alert.alert('Success', 'Token purchase completed successfully!');
          },
        },
      ]
    );
  };
  const handleTabChange = (tab: 'Investments' | 'Secondary Marketplace') => {
    setSelectedTab(tab);
  };
  const generatePortfolioPDFContent = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const investmentRows = allInvestments
      .map((investment) => {
        const property = getPropertyById(investment.propertyId);
        const gainLoss = investment.currentValue - investment.amount;
        const gainLossPercent = (gainLoss / investment.amount) * 100;
        const investmentDate = new Date(investment.investmentDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return `
    <tr>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
    <div style="font-weight: 600; color: #1a1a2e; margin-bottom: 4px;">Transaction ID: ${investment.id}</div>
    <div style="color: #64748b;">Date: ${investmentDate}</div>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
    <div style="font-weight: 600; color: #1a1a2e;">${property?.title || 'Property Investment'}</div>
    <div style="font-size: 12px; color: #64748b;">${property?.location.city || ''}, ${property?.location.country || ''}</div>
    <div style="font-size: 11px; color: #d4af37; margin-top: 2px;">Token: ${investment.shares} shares</div>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
    $${investment.amount.toLocaleString()}
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #d4af37; font-weight: 600;">
    $${investment.currentValue.toLocaleString()}
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: ${gainLoss >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
    ${gainLoss >= 0 ? '+' : ''}$${gainLoss.toLocaleString()}
    <br><span style="font-size: 12px;">(${gainLossPercent.toFixed(1)}%)</span>
    </td>
    </tr>
    `;
      })
      .join('');
    return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <title>Investment Portfolio Report</title>
  <style>
  body {
  font-family: 'Helvetica', Arial, sans-serif;
  margin: 0;
  padding: 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #333;
  }
  .container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
  .header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 40px;
  text-align: center;
  }
  .header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 2px;
  }
  .header p {
  margin: 10px 0 0 0;
  font-size: 16px;
  opacity: 0.9;
  }
  .content {
  padding: 40px;
  }
  .stats-section {
  margin-bottom: 40px;
  }
  .stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  }
  .stat-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
  }
  .stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  }
  .stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  }
  .investments-section h2 {
  color: #1a1a2e;
  font-size: 24px;
  margin-bottom: 20px;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 10px;
  }
  .investments-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .investments-table th {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  }
  .investments-table td {
  font-size: 14px;
  color: #1a1a2e;
  }
  .footer {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 12px;
  }
  .logo {
  font-size: 24px;
  font-weight: 700;
  color: #d4af37;
  margin-bottom: 8px;
  }
  .summary-box {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  color: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  text-align: center;
  }
  .summary-box h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  }
  .summary-box p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  }
  </style>
  </head>
  <body>
  <div class="container">
  <div class="header">
  <div class="logo">Renzi</div>
  <h1>Investment Portfolio Report</h1>
  <p>Premium Real Estate Investment Platform</p>
  </div>
  <div class="content">
  <div class="summary-box">
  <h3>Portfolio Performance Summary</h3>
  <p>Total portfolio value of $${totalValue.toLocaleString()} with ${portfolioROI.toFixed(1)}% overall return</p>
  </div>
  <div class="stats-section">
  <h2>Portfolio Statistics</h2>
  <div class="stats-grid">
  <div class="stat-card">
  <div class="stat-value" style="color: #d4af37;">$${totalValue.toLocaleString()}</div>
  <div class="stat-label">Total Value</div>
  </div>
  <div class="stat-card">
  <div class="stat-value" style="color: #10b981;">+${portfolioROI.toFixed(1)}%</div>
  <div class="stat-label">Total Yield</div>
  </div>
  <div class="stat-card">
  <div class="stat-value" style="color: #4682b4;">${investments.length}</div>
  <div class="stat-label">Properties</div>
  </div>
  <div class="stat-card">
  <div class="stat-value" style="color: #6c757d;">$${totalInvested.toLocaleString()}</div>
  <div class="stat-label">Total Invested</div>
  </div>
  </div>
  </div>
  <div class="investments-section">
  <h2>Investment Holdings</h2>
  <table class="investments-table">
  <thead>
  <tr>
  <th>Transaction Details</th>
  <th>Property & Token</th>
  <th style="text-align: center;">Invested</th>
  <th style="text-align: center;">Current Value</th>
  <th style="text-align: center;">Gain/Loss</th>
  </tr>
  </thead>
  <tbody>
  ${investmentRows}
  </tbody>
  </table>
  </div>
  <div class="footer">
  <p>This report provides a comprehensive overview of your investment portfolio through Renzi platform.</p>
  <p>Generated on ${currentDate} • All values in USD</p>
  </div>
  </div>
  </div>
  </body>
  </html>
  `;
  };
  const handleDownloadPortfolioPDF = async () => {
    try {
      const htmlContent = generatePortfolioPDFContent();
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Investment Portfolio Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', 'Portfolio PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error generating portfolio PDF:', error);
      Alert.alert('Error', 'Failed to generate portfolio PDF. Please try again.');
    }
  };
  if (!user?.investmentStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <TrendingUp size={64} color={colors.text.secondary} />
          <Typography variant="h3" color="secondary" align="center">
            Investment Portfolio
          </Typography>
          <Typography variant="body" color="secondary" align="center">
            Make your first investment to unlock portfolio tracking and exclusive investor features.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <View style={styles.container}>
      <Header
        title="Investment Portfolio"
        subtitle="Track luxury real estate investments."
        showBackButton={false}
      />
      {/* Property Type Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Investments' && styles.activeTab]}
          onPress={() => handleTabChange('Investments')}
        >
          <Typography
            variant="body"
            color={selectedTab === 'Investments' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Investments
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Secondary Marketplace' && styles.activeTab]}
          onPress={() => handleTabChange('Secondary Marketplace')}
        >
          <Typography
            variant="body"
            color={selectedTab === 'Secondary Marketplace' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Secondary Marketplace
          </Typography>
        </TouchableOpacity>
      </View>
      {/* Tab Container   
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Investments' && styles.activeTab]}
          onPress={() => handleTabChange('Investments')}
        >
          <Typography
            variant="body"
            color={selectedTab === 'Investments' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Investments
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Secondary Marketplace' && styles.activeTab]}
          onPress={() => handleTabChange('Secondary Marketplace')}
        >
          <Typography
            variant="body"
            color={selectedTab === 'Secondary Marketplace' ? 'white' : 'secondary'}
            style={styles.tabText}
          >
            Secondary Marketplace
          </Typography>
        </TouchableOpacity>
      </View>
 */}
      {/* Tab Content */}
      {selectedTab === 'Investments' ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Portfolio Stats */}
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              {portfolioStats.map((stat, index) => (
                <Card key={index} style={styles.statCard}>
                  <View style={styles.statContent}>
                    <stat.icon size={24} color={stat.color} />
                    <View style={styles.statText}>
                      <Typography variant="h4" style={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        {stat.title}
                      </Typography>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
          {/* Investment Holdings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="h5" style={styles.sectionTitle}>
                Your Investments
              </Typography>
              {/* Filter Dropdown */}
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilterDropdown(!showFilterDropdown)}
                  activeOpacity={0.7}
                >
                  <Filter size={16} color={colors.text.secondary} />
                  <Typography variant="caption" color="secondary">
                    {filterOptions.find((option) => option.value === selectedFilter)?.label ||
                      'All Investments'}
                  </Typography>
                  <ChevronDown
                    size={16}
                    color={colors.text.secondary}
                    style={{ transform: [{ rotate: showFilterDropdown ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {showFilterDropdown && (
                  <View style={styles.filterDropdown}>
                    {filterOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterOption,
                          selectedFilter === option.value && styles.filterOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedFilter(option.value);
                          setShowFilterDropdown(false);
                        }}
                      >
                        <Typography
                          variant="body"
                          color={selectedFilter === option.value ? 'gold' : 'primary'}
                        >
                          {option.label}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            {investments.map((investment) => {
              const property = getPropertyById(investment.propertyId);
              const gainLoss = investment.currentValue - investment.amount;
              const gainLossPercent = (gainLoss / investment.amount) * 100;
              return (
                <TouchableOpacity
                  key={investment.id}
                  onPress={() => handleInvestmentPress(investment)}
                >
                  <Card style={styles.investmentCard}>
                    <View style={styles.investmentContent}>
                      {property && (
                        <Image
                          source={{ uri: property.mediaGallery.images[0] }}
                          style={styles.investmentImage}
                        />
                      )}
                      <View style={styles.investmentDetails}>
                        <Typography variant="h4" numberOfLines={1}>
                          {property?.title || 'Property Investment'}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {property?.location.city}, {property?.location.country}
                        </Typography>
                        {/* Token Details Section */}
                        <View style={styles.tokenDetailsSection}>
                          <Typography variant="h5" style={styles.tokenDetailsTitle}>
                            Token Details
                          </Typography>
                          <View style={styles.investmentMetrics}>
                            <View style={styles.metric}>
                              <Typography variant="caption" color="secondary">
                                Tokens Owned
                              </Typography>
                              <Typography variant="body" color="gold">
                                {investment.shares}
                              </Typography>
                            </View>
                            <View style={styles.metric}>
                              <Typography variant="caption" color="secondary">
                                Invested
                              </Typography>
                              <Typography variant="body">
                                ${investment.amount.toLocaleString()}
                              </Typography>
                            </View>
                            <View style={styles.metric}>
                              <Typography variant="caption" color="secondary">
                                Current Value
                              </Typography>
                              <Typography variant="body" color="gold">
                                ${investment.currentValue.toLocaleString()}
                              </Typography>
                            </View>
                            <View style={styles.metric}>
                              <Typography variant="caption" color="secondary">
                                Gain/Loss
                              </Typography>
                              <Typography
                                variant="body"
                                style={{
                                  color:
                                    gainLoss >= 0 ? colors.status.success : colors.status.error,
                                }}
                              >
                                {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()} (
                                {gainLossPercent.toFixed(1)}%)
                              </Typography>
                            </View>
                          </View>
                        </View>
                        <View style={styles.investmentFooter}>
                          <Typography variant="caption" color="secondary">
                            {investment.shares} shares • Invested{' '}
                            {new Date(investment.investmentDate).toLocaleDateString()}
                          </Typography>
                          <View style={[styles.statusBadge, styles.activeStatusBadge]}>
                            <Typography variant="label" color="inverse">
                              ACTIVE
                            </Typography>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        // Secondary Marketplace Tab Content
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Typography variant="h5" style={styles.sectionTitle}>
                  Available Token Listings
                </Typography>
                <Typography variant="caption" color="secondary">
                  {secondaryMarketListings.length} listings available
                </Typography>
              </View>
              {/* Sort By Dropdown */}
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setShowSortDropdown(!showSortDropdown)}
                  activeOpacity={0.7}
                >
                 {/* <Typography variant="caption" color="secondary">
                    Sort By
                  </Typography> */}
                  <Typography variant="body" color="primary" style={styles.sortButtonText}>
                    {sortOptions.find((option) => option.value === selectedSortOption)?.label ||
                      'Newest First'}
                  </Typography>
                  <ChevronDown
                    size={16}
                    color={colors.text.secondary}
                    style={{ transform: [{ rotate: showSortDropdown ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                {showSortDropdown && (
                  <View style={styles.sortDropdown}>
                    {sortOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.sortOption,
                          selectedSortOption === option.value && styles.sortOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedSortOption(option.value);
                          setShowSortDropdown(false);
                        }}
                      >
                        <Typography
                          variant="body"
                          color={selectedSortOption === option.value ? 'gold' : 'primary'}
                        >
                          {option.label}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            {sortedSecondaryMarketListings.map((listing) => (
              <Card key={listing.id} style={styles.tokenListingCard}>
                {/* Property Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri:
                        listing.propertyImage ||
                        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
                    }}
                    style={styles.tokenListingImage}
                    resizeMode="cover"
                    onError={() => {
                      console.log('Image loading error, using fallback');
                    }}
                  />
                  {/* ROI Badge Overlay */}
                  <View
                    style={[
                      styles.roiBadgeOverlay,
                      {
                        backgroundColor:
                          listing.roiPercent >= 15
                            ? colors.status.success
                            : listing.roiPercent >= 10
                              ? colors.primary.gold
                              : colors.text.secondary,
                      },
                    ]}
                  >
                    <Typography variant="label" color="inverse" style={styles.roiBadgeText}>
                      +{listing.roiPercent}% ROI
                    </Typography>
                  </View>
                </View>
                {/* Card Content */}
                <View style={styles.tokenListingContent}>
                  {/* Property Title and Location */}
                  <View style={styles.propertyTitleSection}>
                    <Typography variant="h4" numberOfLines={2} style={styles.propertyTitle}>
                      {listing.propertyName}
                    </Typography>
                    <View style={styles.locationContainer}>
                      <Typography variant="body" color="secondary" style={styles.locationText}>
                        📍 {listing.location}
                      </Typography>
                    </View>
                  </View>
                  {/* Token Information Grid */}
                  <View style={styles.tokenInfoGrid}>
                    <View style={styles.tokenInfoItem}>
                      <Typography variant="caption" color="secondary" style={styles.infoLabel}>
                        Token Price
                      </Typography>
                      <Typography variant="h4" color="gold" style={styles.tokenPrice}>
                      ${listing.pricePerToken.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        per token
                      </Typography>
                    </View>
                    <View style={styles.tokenInfoItem}>
                      <Typography variant="caption" color="secondary" style={styles.infoLabel}>
                        Available
                      </Typography>
                      <Typography variant="h4" style={styles.tokenQuantity}>
                        {listing.quantityListed.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        tokens left
                      </Typography>
                    </View>
                  </View>
                  {/* Total Investment Value */}
                  <View style={styles.totalValueSection}>
                    <Typography variant="caption" color="secondary" style={styles.totalValueLabel}>
                      Total Investment Value
                    </Typography>
                    <Typography variant="h3" color="gold" style={styles.totalValue}>
                    ${listing.totalValue.toLocaleString()}
                    </Typography>
                  </View>
                  {/* Seller Information */}
                  <View style={styles.sellerInfoSection}>
                    <Typography variant="caption" color="secondary">
                      Listed by {listing.sellerName} •{' '}
                      {new Date(listing.listingDate).toLocaleDateString()}
                    </Typography>
                  </View>
                  {/* Buy Button */}
                  <TouchableOpacity
                    style={styles.buyTokenButton}
                    onPress={() => handleBuyTokensPress(listing)}
                    activeOpacity={0.8}
                  >
                    <ShoppingCart size={20} color={colors.text.inverse} />
                    <Typography variant="body" color="inverse" style={styles.buyTokenButtonText}>
                      Buy Tokens
                    </Typography>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
      {/* Fixed Download PDF Button */}
      {allInvestments.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.downloadPDFButton}
            onPress={handleDownloadPortfolioPDF}
            activeOpacity={0.8}
          >
            <Download size={20} color={colors.text.inverse} />
            <Typography variant="body" color="inverse" style={styles.downloadButtonText}>
              Download Portfolio PDF
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      {/* Token Details Modal */}
      <Modal visible={showTokenModal} onClose={handleCloseModal}>
        {selectedInvestment && (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" color="primary">
                {selectedInvestment.payoutDetails?.payoutStatus === 'claimed'
                  ? 'Claim History'
                  : 'Token Details'}
              </Typography>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Typography variant="h4" color="secondary">
                  ×
                </Typography>
              </TouchableOpacity>
            </View>
            {selectedInvestment.payoutDetails?.payoutStatus === 'claimed' ? (
              // Claimed Token Bottom Sheet
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Property Info */}
                <View style={styles.modalSection}>
                  <View style={styles.propertyInfo}>
                    {(() => {
                      const property = getPropertyById(selectedInvestment.propertyId);
                      return (
                        <>
                          {property && (
                            <Image
                              source={{ uri: property.mediaGallery.images[0] }}
                              style={styles.modalPropertyImage}
                            />
                          )}
                          <View style={styles.propertyDetails}>
                            <Typography variant="h4" numberOfLines={2}>
                              {property?.title || 'Property Investment'}
                            </Typography>
                            <Typography variant="caption" color="secondary">
                              {property?.location.city}, {property?.location.country}
                            </Typography>
                          </View>
                        </>
                      );
                    })()}
                  </View>
                </View>
                {/* Total Passive Income Summary */}
                {selectedInvestment.claimHistory && selectedInvestment.claimHistory.length > 0 && (
                  <View style={styles.modalSection}>
                    <View style={styles.passiveIncomeCard}>
                      <Typography variant="h5" style={styles.modalSectionTitle}>
                        Total Passive Income Claimed
                      </Typography>
                      <Typography variant="h2" color="gold">
                        $
                        {selectedInvestment.claimHistory[0]?.totalPassiveIncome?.toLocaleString() ||
                          '0'}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Across {selectedInvestment.claimHistory.length} claim
                        {selectedInvestment.claimHistory.length > 1 ? 's' : ''}
                      </Typography>
                    </View>
                  </View>
                )}
                {/* Claim History */}
                <View style={styles.modalSection}>
                  <Typography variant="h5" style={styles.modalSectionTitle}>
                    Claim Transactions
                  </Typography>
                  {selectedInvestment.claimHistory?.map((claim, index) => (
                    <View key={index} style={styles.claimHistoryCard}>
                      <View style={styles.claimHistoryHeader}>
                        <View>
                          <Typography variant="h4">${claim.amount.toLocaleString()}</Typography>
                          <Typography variant="caption" color="secondary">
                            {new Date(claim.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Typography>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            claim.status === 'Completed'
                              ? styles.completedStatusBadge
                              : styles.pendingStatusBadge,
                          ]}
                        >
                          <Typography variant="label" color="inverse">
                            {claim.status.toUpperCase()}
                          </Typography>
                        </View>
                      </View>
                      <View style={styles.claimHistoryDetails}>
                        <View style={styles.detailRow}>
                          <Typography variant="caption" color="secondary">
                            Transaction Hash
                          </Typography>
                          <Typography variant="caption" style={styles.txHash}>
                            {claim.txHash.substring(0, 10)}...
                            {claim.txHash.substring(claim.txHash.length - 8)}
                          </Typography>
                        </View>
                        <View style={styles.detailRow}>
                          <Typography variant="caption" color="secondary">
                            Amount
                          </Typography>
                          <Typography variant="caption">
                            ${claim.amount.toLocaleString()} USDT
                          </Typography>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              // Unclaimed Token Bottom Sheet (existing UI)
              (() => {
                const property = getPropertyById(selectedInvestment.propertyId);
                const gainLoss = selectedInvestment.currentValue - selectedInvestment.amount;
                const gainLossPercent = (gainLoss / selectedInvestment.amount) * 100;
                return (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Property Info */}
                    <View style={styles.modalSection}>
                      <View style={styles.propertyInfo}>
                        {property && (
                          <Image
                            source={{ uri: property.mediaGallery.images[0] }}
                            style={styles.modalPropertyImage}
                          />
                        )}
                        <View style={styles.propertyDetails}>
                          <Typography variant="h4" numberOfLines={2}>
                            {property?.title || 'Property Investment'}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {property?.location.city}, {property?.location.country}
                          </Typography>
                        </View>
                      </View>
                    </View>
                    {/* Token Metrics */}
                    <View style={styles.modalSection}>
                      <Typography variant="h5" style={styles.modalSectionTitle}>
                        Investment Overview
                      </Typography>
                      <View style={styles.modalMetricsGrid}>
                        <View style={styles.modalMetric}>
                          <Typography variant="caption" color="secondary">
                            Tokens Owned
                          </Typography>
                          <Typography variant="h4" color="gold">
                            {selectedInvestment.shares}
                          </Typography>
                        </View>
                        <View style={styles.modalMetric}>
                          <Typography variant="caption" color="secondary">
                            Initial Investment
                          </Typography>
                          <Typography variant="h4">
                            ${selectedInvestment.amount.toLocaleString()}
                          </Typography>
                        </View>
                        <View style={styles.modalMetric}>
                          <Typography variant="caption" color="secondary">
                            Current Value
                          </Typography>
                          <Typography variant="h4" color="gold">
                            ${selectedInvestment.currentValue.toLocaleString()}
                          </Typography>
                        </View>
                        <View style={styles.modalMetric}>
                          <Typography variant="caption" color="secondary">
                            Gain/Loss
                          </Typography>
                          <Typography
                            variant="h4"
                            style={{
                              color: gainLoss >= 0 ? colors.status.success : colors.status.error,
                            }}
                          >
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()}
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{
                              color: gainLoss >= 0 ? colors.status.success : colors.status.error,
                            }}
                          >
                            ({gainLossPercent.toFixed(1)}%)
                          </Typography>
                        </View>
                      </View>
                    </View>
                    {/* Investment Details */}
                    <View style={styles.modalSection}>
                      <Typography variant="h5" style={styles.modalSectionTitle}>
                        Investment Details
                      </Typography>
                      <View style={styles.detailRow}>
                        <Typography variant="body" color="secondary">
                          Investment Date
                        </Typography>
                        <Typography variant="body">
                          {new Date(selectedInvestment.investmentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </View>
                      <View style={styles.detailRow}>
                        <Typography variant="body" color="secondary">
                          ROI Estimate
                        </Typography>
                        <Typography variant="body" color="gold">
                          {selectedInvestment.roiEstimate}%
                        </Typography>
                      </View>
                      <View style={styles.detailRow}>
                        <Typography variant="body" color="secondary">
                          Status
                        </Typography>
                        <View style={[styles.statusBadge, styles.activeStatusBadge]}>
                          <Typography variant="label" color="inverse">
                            {selectedInvestment.investmentStatus.toUpperCase()}
                          </Typography>
                        </View>
                      </View>
                    </View>
                    {/* Claim History Section */}
                    <View style={styles.modalSection}>
                      <Typography variant="h5" style={styles.modalSectionTitle}>
                        Claim History
                      </Typography>
                      <View style={styles.claimHistoryList}>
                        {/* Dummy claim history data */}
                        <View style={styles.claimHistoryItem}>
                          <Typography
                            variant="caption"
                            color="secondary"
                            style={styles.claimHistoryDate}
                          >
                            Dec 15, 2024
                          </Typography>
                          <Typography variant="body" style={styles.claimHistoryAmount}>
                            $1,250
                          </Typography>
                          <Typography
                            variant="caption"
                            color="secondary"
                            style={styles.claimHistoryProperty}
                          >
                            Luxury Villa
                          </Typography>
                          <Typography
                            variant="caption"
                            color="gold"
                            style={styles.claimHistoryTxId}
                          >
                            0x7a8b...c9d2
                          </Typography>
                          <View style={[styles.statusBadge, styles.completedStatusBadge]}>
                            <Typography
                              variant="label"
                              color="inverse"
                              style={styles.claimHistoryStatus}
                            >
                              COMPLETED
                            </Typography>
                          </View>
                        </View>
                        <View style={styles.claimHistoryItem}>
                          <Typography
                            variant="caption"
                            color="secondary"
                            style={styles.claimHistoryDate}
                          >
                            Nov 28, 2024
                          </Typography>
                          <Typography variant="body" style={styles.claimHistoryAmount}>
                            $980
                          </Typography>
                          <Typography
                            variant="caption"
                            color="secondary"
                            style={styles.claimHistoryProperty}
                          >
                            Penthouse Suite
                          </Typography>
                          <Typography
                            variant="caption"
                            color="gold"
                            style={styles.claimHistoryTxId}
                          >
                            0x3f4e...a1b8
                          </Typography>
                          <View style={[styles.statusBadge, styles.pendingStatusBadge]}>
                            <Typography
                              variant="label"
                              color="inverse"
                              style={styles.claimHistoryStatus}
                            >
                              PENDING
                            </Typography>
                          </View>
                        </View>
                        <View style={styles.claimHistoryItem}>
                          <Typography
                            variant="caption"
                            color="secondary"
                            style={styles.claimHistoryDate}
                          >
                            Oct 10, 2024
                          </Typography>
                          <Typography variant="body" style={styles.claimHistoryAmount}>
                            $1,450
                          </Typography>
                          <Typography
                            variant="caption"
                            color="secondary"
                            style={styles.claimHistoryProperty}
                          >
                            Beach Resort
                          </Typography>
                          <Typography
                            variant="caption"
                            color="gold"
                            style={styles.claimHistoryTxId}
                          >
                            0x9c2d...e5f7
                          </Typography>
                          <View style={[styles.statusBadge, styles.completedStatusBadge]}>
                            <Typography
                              variant="label"
                              color="inverse"
                              style={styles.claimHistoryStatus}
                            >
                              COMPLETED
                            </Typography>
                          </View>
                        </View>
                      </View>
                    </View>
                    {/* Payout Section - Always show if investment exists */}
                    <View style={styles.modalSection}>
                      <Typography variant="h5" style={styles.modalSectionTitle}>
                        Payout Information
                      </Typography>
                      <View style={styles.payoutCard}>
                        <View style={styles.payoutHeader}>
                          <Typography variant="body" color="secondary">
                            Claimable Amount
                          </Typography>
                          <Typography variant="h3" color="gold">
                            $
                            {selectedInvestment.payoutDetails?.claimableAmount?.toFixed(2) ||
                              '0.00'}{' '}
                            USDT
                          </Typography>
                        </View>
                        {selectedInvestment.payoutDetails?.lastClaimDate && (
                          <View style={styles.detailRow}>
                            <Typography variant="caption" color="secondary">
                              Last Claim Date
                            </Typography>
                            <Typography variant="caption">
                              {new Date(
                                selectedInvestment.payoutDetails.lastClaimDate
                              ).toLocaleDateString()}
                            </Typography>
                          </View>
                        )}
                      
                        {/* Always show Claim Payout button */}
                        <TouchableOpacity
                          style={[
                            styles.modalClaimButton,
                            (!selectedInvestment.payoutDetails ||
                              selectedInvestment.payoutDetails.payoutStatus !== 'eligible' ||
                              isLoading) &&
                              styles.modalClaimButtonDisabled,
                          ]}
                          onPress={() => handleClaimPayout(selectedInvestment.id)}
                          disabled={
                            !selectedInvestment.payoutDetails ||
                            selectedInvestment.payoutDetails.payoutStatus !== 'eligible' ||
                            isLoading
                          }
                          activeOpacity={0.7}
                        >
                          <Wallet
                            size={20}
                            color={
                              selectedInvestment.payoutDetails?.payoutStatus === 'eligible' &&
                              !isLoading
                                ? colors.text.inverse
                                : colors.text.secondary
                            }
                          />
                          <Typography
                            variant="body"
                            color={
                              selectedInvestment.payoutDetails?.payoutStatus === 'eligible' &&
                              !isLoading
                                ? 'inverse'
                                : 'secondary'
                            }
                            style={styles.modalClaimButtonText}
                          >
                            {!selectedInvestment.payoutDetails
                              ? 'No Payout Available'
                              : selectedInvestment.payoutDetails.payoutStatus === 'eligible'
                                ? isLoading
                                  ? 'Claiming...'
                                  : 'Claim Payout'
                                : selectedInvestment.payoutDetails.payoutStatus === 'claimed'
                                  ? 'Already Claimed'
                                  : selectedInvestment.payoutDetails.payoutStatus ===
                                      'pending_approval'
                                    ? 'Pending Approval'
                                    : 'Insufficient Yield'}
                          </Typography>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* List for Sale Button - Always visible */}
                    <View style={styles.modalSection}>
                      <View style={styles.listForSaleContainer}>
                        <Typography variant="h5" style={styles.modalSectionTitle}>
                          Secondary Marketplace
                        </Typography>
                        <Typography
                          variant="body"
                          color="secondary"
                          style={styles.listForSaleDescription}
                        >
                          List your tokens for sale to other investors
                        </Typography>
                        <TouchableOpacity
                          style={styles.listForSaleButton}
                          onPress={handleListForSale}
                          activeOpacity={0.7}
                        >
                          <Tag size={20} color={colors.text.inverse} />
                          <Typography
                            variant="body"
                            color="inverse"
                            style={styles.listForSaleButtonText}
                          >
                            List for Sale
                          </Typography>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ScrollView>
                );
              })()
            )}
          </View>
        )}
      </Modal>
      {/* List for Sale Modal */}
      <Modal visible={showListForSaleModal} onClose={handleCloseListingModal}>
        <View style={styles.listingModalContent}>
          <View style={styles.modalHeader}>
            <Typography variant="h3" color="primary">
              List Tokens for Sale
            </Typography>
            <TouchableOpacity onPress={handleCloseListingModal} style={styles.closeButton}>
              <Typography variant="h4" color="secondary">
                ×
              </Typography>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Property Name and Token Symbol */}
            {selectedInvestment && (
              <View style={styles.modalSection}>
                <View style={styles.propertyHeaderCard}>
                  {(() => {
                    const property = getPropertyById(selectedInvestment.propertyId);
                    return (
                      <>
                        <Typography variant="h4" numberOfLines={2}>
                          {property?.title || 'Property Investment'}
                        </Typography>
                        <Typography variant="body" color="secondary">
                          {property?.location.city}, {property?.location.country}
                        </Typography>
                        <View style={styles.tokenSymbolContainer}>
                          <Typography variant="caption" color="secondary">
                            Token Symbol:
                          </Typography>
                          <Typography variant="body" color="gold" style={styles.tokenSymbol}>
                            {property?.title?.substring(0, 3).toUpperCase() || 'TKN'}
                          </Typography>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}
            {/* Token Ownership Info */}
            <View style={styles.modalSection}>
              <Typography variant="h5" style={styles.modalSectionTitle}>
                Token Ownership
              </Typography>
              <View style={styles.ownershipCard}>
                <View style={styles.ownershipHeader}>
                  <Hash size={20} color={colors.primary.gold} />
                  <Typography variant="body">Tokens You Own</Typography>
                </View>
                <Typography variant="h3" color="gold">
                  {selectedInvestment?.shares || 0}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Available for listing
                </Typography>
              </View>
            </View>
            {/* Listing Form */}
            <View style={styles.modalSection}>
              <Typography variant="h5" style={styles.modalSectionTitle}>
                Listing Details
              </Typography>
              {/* Tokens to Sell */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Hash size={20} color={colors.primary.gold} />
                  <Typography variant="body">Number of Tokens to Sell</Typography>
                </View>
                <Input
                  value={listingForm.tokensToSell}
                  onChangeText={(value) => handleListingFormChange('tokensToSell', value)}
                  placeholder={`Max: ${selectedInvestment?.shares || 0} tokens`}
                  keyboardType="numeric"
                  containerStyle={styles.inputContainer}
                />
                {/* Lock Period Warning */}
                <View style={styles.warningNote}>
                  <Typography variant="caption" color="secondary">
                    ⚠️ Tokens listed will be locked for 3 months minimum
                  </Typography>
                </View>
                {/* Percentage of Balance */}
                {listingForm.tokensToSell && (
                  <View style={styles.percentageNote}>
                    <Typography variant="caption" color="gold">
                      You are listing {calculatePercentageOfBalance().toFixed(1)}% of your balance
                    </Typography>
                  </View>
                )}
              </View>
              {/* Price Per Token */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <DollarSignIcon size={20} color={colors.primary.gold} />
                  <Typography variant="body">Price Per Token (USD)</Typography>
                </View>
                <Input
                  value={listingForm.pricePerToken}
                  onChangeText={(value) => handleListingFormChange('pricePerToken', value)}
                  placeholder="Enter price per token"
                  keyboardType="numeric"
                  containerStyle={styles.inputContainer}
                />
                {/* Market Price Warning */}
                {(() => {
                  const warning = getMarketPriceWarning();
                  if (warning) {
                    return (
                      <View style={[styles.marketPriceWarning, { borderColor: warning.color }]}>
                        <Typography variant="caption" style={{ color: warning.color }}>
                          {warning.message}
                        </Typography>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
              {/* Total Expected Amount (Read-only) */}
              {listingForm.tokensToSell && listingForm.pricePerToken && (
                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <DollarSignIcon size={20} color={colors.primary.gold} />
                    <Typography variant="body">Total Expected (USD)</Typography>
                  </View>
                  <View style={styles.readOnlyField}>
                    <Typography variant="h4" color="gold">
                      ${calculateTotalValue().toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      Auto-calculated: {listingForm.tokensToSell} × ${listingForm.pricePerToken}
                    </Typography>
                  </View>
                </View>
              )}
              {/* Listing Duration */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Clock size={20} color={colors.primary.gold} />
                  <Typography variant="body">Listing Duration</Typography>
                </View>
                <View style={styles.durationContainer}>
                  {['7', '30', '90', 'none'].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationOption,
                        listingForm.listingDuration === duration && styles.durationOptionSelected,
                      ]}
                      onPress={() => handleListingFormChange('listingDuration', duration)}
                    >
                      <Typography
                        variant="body"
                        color={listingForm.listingDuration === duration ? 'inverse' : 'primary'}
                      >
                        {duration === 'none' ? 'No Limit' : `${duration} Days`}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
          {/* Action Buttons */}
          <View style={styles.listingModalActions}>
            <Button
              title="Preview Listing"
              onPress={handlePreviewListing}
              disabled={!listingForm.tokensToSell || !listingForm.pricePerToken}
              style={styles.previewButton}
              variant="outline"
            />
            <Button
              title="Create Listing"
              onPress={handleSubmitListing}
              disabled={!listingForm.tokensToSell || !listingForm.pricePerToken}
              style={styles.submitListingButton}
            />
            <Button title="Cancel" onPress={handleCloseListingModal} variant="outline" />
          </View>
        </View>
      </Modal>
      {/* Preview Listing Modal */}
      <Modal visible={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
        <View style={styles.previewModalContent}>
          <View style={styles.modalHeader}>
            <Typography variant="h3" color="primary">
              Preview Listing
            </Typography>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)} style={styles.closeButton}>
              <Typography variant="h4" color="secondary">
                ×
              </Typography>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedInvestment && (
              <>
                {/* Property Info */}
                <View style={styles.previewSection}>
                  {(() => {
                    const property = getPropertyById(selectedInvestment.propertyId);
                    return (
                      <View style={styles.previewPropertyCard}>
                        <Typography variant="h4">
                          {property?.title || 'Property Investment'}
                        </Typography>
                        <Typography variant="body" color="secondary">
                          {property?.location.city}, {property?.location.country}
                        </Typography>
                      </View>
                    );
                  })()}
                </View>
                {/* Listing Summary */}
                <View style={styles.previewSection}>
                  <Typography variant="h5" style={styles.previewSectionTitle}>
                    Listing Summary
                  </Typography>
                  <View style={styles.previewDetailsCard}>
                    <View style={styles.previewDetailRow}>
                      <Typography variant="body" color="secondary">
                        Tokens to Sell:
                      </Typography>
                      <Typography variant="body" color="gold">
                        {listingForm.tokensToSell}
                      </Typography>
                    </View>
                    <View style={styles.previewDetailRow}>
                      <Typography variant="body" color="secondary">
                        Price per Token:
                      </Typography>
                      <Typography variant="body">${listingForm.pricePerToken}</Typography>
                    </View>
                    <View style={styles.previewDetailRow}>
                      <Typography variant="body" color="secondary">
                        Total Expected:
                      </Typography>
                      <Typography variant="h4" color="gold">
                        ${calculateTotalValue().toLocaleString()}
                      </Typography>
                    </View>
                    <View style={styles.previewDetailRow}>
                      <Typography variant="body" color="secondary">
                        Duration:
                      </Typography>
                      <Typography variant="body">
                        {listingForm.listingDuration === 'none'
                          ? 'No Limit'
                          : `${listingForm.listingDuration} Days`}
                      </Typography>
                    </View>
                    <View style={styles.previewDetailRow}>
                      <Typography variant="body" color="secondary">
                        Percentage of Holdings:
                      </Typography>
                      <Typography variant="body">
                        {calculatePercentageOfBalance().toFixed(1)}%
                      </Typography>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
          <View style={styles.previewModalActions}>
            <Button
              title="Confirm & Create Listing"
              onPress={handleSubmitListing}
              style={styles.submitListingButton}
            />
            <Button
              title="Back to Edit"
              onPress={() => setShowPreviewModal(false)}
              variant="outline"
            />
          </View>
        </View>
      </Modal>
      {/* Buy Tokens Modal */}
      <Modal visible={showBuyTokensModal} onClose={handleCloseBuyModal}>
        {selectedListing && (
          <View style={styles.buyModalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" color="primary">
                Buy Tokens
              </Typography>
              <TouchableOpacity onPress={handleCloseBuyModal} style={styles.closeButton}>
                <Typography variant="h4" color="secondary">
                  ×
                </Typography>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Property Info */}
              <View style={styles.modalSection}>
                <View style={styles.buyPropertyCard}>
                  <Image
                    source={{
                      uri:
                        selectedListing.propertyImage ||
                        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
                    }}
                    style={styles.buyPropertyImage}
                    resizeMode="cover"
                  />
                  <View style={styles.buyPropertyDetails}>
                    <Typography variant="h4" numberOfLines={2}>
                      {selectedListing.propertyName}
                    </Typography>
                    <Typography variant="body" color="secondary">
                      {selectedListing.location}
                    </Typography>
                    <View style={styles.buyPropertyMetrics}>
                      <View style={styles.buyMetricItem}>
                        <Typography variant="caption" color="secondary">
                          Token Symbol
                        </Typography>
                        <Typography variant="body" color="gold">
                          {selectedListing.tokenSymbol}
                        </Typography>
                      </View>
                      <View style={styles.buyMetricItem}>
                        <Typography variant="caption" color="secondary">
                          ROI
                        </Typography>
                        <Typography variant="body" color="gold">
                          +{selectedListing.roiPercent}%
                        </Typography>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {/* Token Details */}
              <View style={styles.modalSection}>
                <Typography variant="h5" style={styles.modalSectionTitle}>
                  Token Information
                </Typography>
                <View style={styles.buyTokenDetailsCard}>
                  <View style={styles.buyTokenDetailRow}>
                    <Typography variant="body" color="secondary">
                      Price per Token:
                    </Typography>
                    <Typography variant="h4" color="gold">
                    ${selectedListing.pricePerToken.toLocaleString()}
                    </Typography>
                  </View>
                  <View style={styles.buyTokenDetailRow}>
                    <Typography variant="body" color="secondary">
                      Available Tokens:
                    </Typography>
                    <Typography variant="h4">
                      {selectedListing.quantityListed.toLocaleString()}
                    </Typography>
                  </View>
                </View>
              </View>
              {/* Purchase Form */}
              <View style={styles.modalSection}>
                <Typography variant="h5" style={styles.modalSectionTitle}>
                  Purchase Details
                </Typography>
                <View style={styles.inputSection}>
                  <View style={styles.inputHeader}>
                    <Hash size={20} color={colors.primary.gold} />
                    <Typography variant="body">Quantity to Buy</Typography>
                  </View>
                  <Input
                    value={buyForm.quantity}
                    onChangeText={(value) => handleBuyFormChange('quantity', value)}
                    placeholder={`Max: ${selectedListing.quantityListed} tokens`}
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                  />
                  <Typography variant="caption" color="secondary">
                    Enter the number of tokens you want to purchase
                  </Typography>
                </View>
                {/* Total Calculation */}
                {buyForm.quantity && parseInt(buyForm.quantity) > 0 && (
                  <View style={styles.buyTotalCard}>
                    <View style={styles.buyTotalHeader}>
                      <Typography variant="h5">Purchase Summary</Typography>
                    </View>
                    <View style={styles.buyTotalDetails}>
                      <View style={styles.buyTotalRow}>
                        <Typography variant="body" color="secondary">
                          Quantity:
                        </Typography>
                        <Typography variant="body">{buyForm.quantity} tokens</Typography>
                      </View>
                      <View style={styles.buyTotalRow}>
                        <Typography variant="body" color="secondary">
                          Price per Token:
                        </Typography>
                        <Typography variant="body">
                        ${selectedListing.pricePerToken.toLocaleString()}
                        </Typography>
                      </View>
                      <View style={[styles.buyTotalRow, styles.buyTotalFinal]}>
                        <Typography variant="h4">Total Cost:</Typography>
                        <Typography variant="h3" color="gold">
                        ${calculateBuyTotal().toLocaleString()}
                        </Typography>
                      </View>
                    </View>
                  </View>
                )}
                {/* Action Buttons */}
                <View style={styles.buyModalActions}>
                  <Button
                    title="Confirm Purchase"
                    onPress={handleConfirmPurchase}
                    disabled={!buyForm.quantity || parseInt(buyForm.quantity) <= 0}
                    style={styles.confirmPurchaseButton}
                  />
                  <Button title="Cancel" onPress={handleCloseBuyModal} variant="outline" />
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
      {/* Success Modal */}
      <Modal visible={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <View style={styles.successModalContent}>
          <View style={styles.successHeader}>
            <CheckCircle2 size={64} color={colors.status.success} />
            <Typography variant="h3" color="primary" align="center">
              Listing Created Successfully!
            </Typography>
            <Typography variant="body" color="secondary" align="center">
              Your tokens are now listed on the secondary marketplace
            </Typography>
          </View>
          <View style={styles.successDetails}>
            <Typography variant="h5" style={styles.successSectionTitle}>
              Listing Details
            </Typography>
            <View style={styles.successDetailsCard}>
              <Typography variant="body" color="secondary">
                {listingForm.tokensToSell} tokens listed for $
                {calculateTotalValue().toLocaleString()}
              </Typography>
              <Typography variant="caption" color="secondary">
                Duration:{' '}
                {listingForm.listingDuration === 'none'
                  ? 'No Limit'
                  : `${listingForm.listingDuration} Days`}
              </Typography>
            </View>
          </View>
          <View style={styles.successModalActions}>
            <Button
              title="Go to Marketplace"
              onPress={() => handleSuccessAction('marketplace')}
              style={styles.primarySuccessButton}
            />
            <Button
              title="View My Listings"
              onPress={() => handleSuccessAction('listings')}
              variant="outline"
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary.navy,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  sortContainer: {
    position: 'relative',
    minWidth: 140,
  },
  sortButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
  },
  sortButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sortDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginTop: spacing.xs,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sortOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sortOptionSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  filterContainer: {
    position: 'relative',
    minWidth: 160,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginTop: spacing.xs,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statText: {
    flex: 1,
  },
  chartCard: {
    paddingVertical: spacing.xl,
  },
  chartPlaceholder: {
    alignItems: 'center',
    gap: spacing.md,
  },
  investmentCard: {
    marginBottom: spacing.md,
  },
  investmentContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  investmentImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  investmentDetails: {
    flex: 1,
    gap: spacing.sm,
  },
  investmentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tokenDetailsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  tokenDetailsTitle: {
    marginBottom: spacing.sm,
    color: colors.primary.gold,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  investmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  activeStatusBadge: {
    backgroundColor: colors.status.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.layout.screenPadding,
    gap: spacing.lg,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind the fixed button
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  downloadPDFButton: {
    backgroundColor: colors.primary.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  downloadButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  payoutSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  payoutInfo: {
    flex: 1,
  },
  claimPayoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginLeft: spacing.md,
  },
  claimPayoutButtonDisabled: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  claimButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
  modalContent: {
    maxHeight: '85%',
  },
  modalScrollContent: {
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary.gold,
  },
  propertyInfo: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  modalPropertyImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  propertyDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  modalMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  modalMetric: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  payoutCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  payoutHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalClaimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalClaimButtonDisabled: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  modalClaimButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryMarketplaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.navy,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  listForSaleContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  listForSaleDescription: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  listForSaleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.navy,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  listForSaleButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  listingModalContent: {
    maxHeight: '90%',
    width: '100%',
  },
  ownershipCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  ownershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: 0,
  },
  totalSection: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  totalLabel: {
    color: colors.primary.gold,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  durationOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  durationOptionSelected: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  listingModalActions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  propertyHeaderCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  tokenSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tokenSymbol: {
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  warningNote: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  percentageNote: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  marketPriceWarning: {
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  readOnlyField: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewButton: {
    borderColor: colors.primary.gold,
  },
  submitListingButton: {
    backgroundColor: colors.primary.gold,
  },
  previewModalContent: {
    maxHeight: '80%',
    width: '100%',
  },
  previewSection: {
    marginBottom: spacing.lg,
  },
  previewSectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary.gold,
  },
  previewPropertyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  previewDetailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.md,
  },
  previewDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewModalActions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  successModalContent: {
    maxHeight: '70%',
    width: '100%',
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  successDetails: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  successSectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary.gold,
    textAlign: 'center',
  },
  successDetailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
    gap: spacing.sm,
  },
  successModalActions: {
    width: '100%',
    gap: spacing.md,
  },
  primarySuccessButton: {
    backgroundColor: colors.primary.gold,
  },
  passiveIncomeCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  claimHistoryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  claimHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  claimHistoryDetails: {
    gap: spacing.sm,
  },
  completedStatusBadge: {
    backgroundColor: colors.status.success,
  },
  pendingStatusBadge: {
    backgroundColor: colors.status.warning,
  },
  txHash: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.primary.gold,
  },
  claimHistoryList: {
    gap: spacing.sm,
    maxHeight: 200,
  },
  claimHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.sm,
  },
  claimHistoryDate: {
    flex: 1.2,
    fontSize: 11,
  },
  claimHistoryAmount: {
    flex: 1,
    fontWeight: '600',
    textAlign: 'center',
  },
  claimHistoryProperty: {
    flex: 1.5,
    fontSize: 11,
    textAlign: 'center',
  },
  claimHistoryTxId: {
    flex: 1.2,
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  claimHistoryStatus: {
    fontSize: 9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.lightGray,
    marginHorizontal: spacing.layout.screenPadding,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: '600',
  },
  // Secondary Market Token Card Styles
  tokenListingCard: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  tokenListingImage: {
    width: '100%',
    height: '100%',
  },
  roiBadgeOverlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  roiBadgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  tokenListingContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  propertyTitleSection: {
    gap: spacing.sm,
  },
  propertyTitle: {
    fontWeight: '700',
    lineHeight: 24,
    color: colors.text.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  tokenInfoItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tokenPrice: {
    fontWeight: '700',
    fontSize: 18,
  },
  tokenQuantity: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.text.primary,
  },
  totalValueSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    gap: spacing.xs,
  },
  totalValueLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 20,
  },
  sellerInfoSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    alignItems: 'center',
  },
  buyTokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buyTokenButtonText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buyButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  buyModalContent: {
    maxHeight: '90%',
    width: '100%',
  },
  buyPropertyCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.md,
  },
  buyPropertyImage: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
  },
  buyPropertyDetails: {
    gap: spacing.sm,
  },
  buyPropertyMetrics: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  buyMetricItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  buyTokenDetailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    gap: spacing.md,
  },
  buyTokenDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyTotalCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    marginTop: spacing.md,
  },
  buyTotalHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buyTotalDetails: {
    gap: spacing.sm,
  },
  buyTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  buyTotalFinal: {
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.primary.gold,
  },
  buyModalActions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  confirmPurchaseButton: {
    backgroundColor: colors.primary.gold,
  },
});