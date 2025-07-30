import React, { useState, useMemo } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { useAuthStore } from "@/stores/authStore";
import { useInvestmentStore } from "@/stores/investmentStore";
import { usePropertyStore } from "@/stores/propertyStore";
import { Header } from "@/components/ui/Header";
import { Investment } from "@/types";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Download,
  ChevronDown,
  Filter,
  Wallet,
  Hash,
} from "lucide-react-native";
import MarketplaceScreen from "../marketplace";
const { width } = Dimensions.get("window");
export default function PortfolioScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    getUserInvestments,
    getTotalPortfolioValue,
    getPortfolioROI,
    claimPayout,
    isLoading,
  } = useInvestmentStore();
  const { getPropertyById } = usePropertyStore();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] =
    useState<Investment | null>(null);
  const [showListForSaleModal, setShowListForSaleModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedSortOption, setSelectedSortOption] =
    useState<string>("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [buyForm, setBuyForm] = useState({
    quantity: "",
  });
  const [listingForm, setListingForm] = useState({
    tokensToSell: "",
    pricePerToken: "",
    listingDuration: "30",
  });
  const sortOptions = [
    { label: "Highest ROI", value: "highest_roi" },
    { label: "Lowest Price", value: "lowest_price" },
    { label: "Newest First", value: "newest" },
  ];
  const allInvestments = user ? getUserInvestments(user.id) : [];
  const filterOptions = [
    { label: "All Investments", value: "all" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Withdrawn", value: "withdrawn" },
    { label: "Date (Newest)", value: "date_newest" },
    { label: "Date (Oldest)", value: "date_oldest" },
    { label: "Value (High to Low)", value: "value_high" },
    { label: "Value (Low to High)", value: "value_low" },
    { label: "Yield (High to Low)", value: "yield_high" },
    { label: "Yield (Low to High)", value: "yield_low" },
  ];
  const investments = useMemo(() => {
    let filtered = [...allInvestments];
    // Apply status filters
    if (selectedFilter === "active") {
      filtered = filtered.filter((inv) => inv.investmentStatus === "active");
    } else if (selectedFilter === "completed") {
      filtered = filtered.filter((inv) => inv.investmentStatus === "completed");
    } else if (selectedFilter === "withdrawn") {
      filtered = filtered.filter((inv) => inv.investmentStatus === "pending"); // Using pending as withdrawn for now
    }
    // Apply sorting filters
    if (selectedFilter === "date_newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.investmentDate).getTime() -
          new Date(a.investmentDate).getTime()
      );
    } else if (selectedFilter === "date_oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.investmentDate).getTime() -
          new Date(b.investmentDate).getTime()
      );
    } else if (selectedFilter === "value_high") {
      filtered.sort((a, b) => b.currentValue - a.currentValue);
    } else if (selectedFilter === "value_low") {
      filtered.sort((a, b) => a.currentValue - b.currentValue);
    } else if (selectedFilter === "yield_high") {
      filtered.sort((a, b) => {
        const yieldA = ((a.currentValue - a.amount) / a.amount) * 100;
        const yieldB = ((b.currentValue - b.amount) / b.amount) * 100;
        return yieldB - yieldA;
      });
    } else if (selectedFilter === "yield_low") {
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
  const totalInvested = allInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const portfolioStats = [
    {
      icon: DollarSign,
      title: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      color: colors.primary.gold,
    },
    {
      icon: TrendingUp,
      title: "Total Yield",
      value: `+${portfolioROI.toFixed(1)}%`,
      color: colors.status.success,
    },
    {
      icon: PieChart,
      title: "Properties",
      value: allInvestments.length.toString(),
      color: colors.status.info,
    },
    {
      icon: BarChart3,
      title: "Invested",
      value: `$${totalInvested.toLocaleString()}`,
      color: colors.text.secondary,
    },
  ];
  const handleClaimPayout = async (investmentId: string) => {
    try {
      await claimPayout(investmentId);
      Alert.alert("Success", "Payout claimed successfully!");
      setShowTokenModal(false);
    } catch (error) {
      console.error("Error claiming payout:", error);
      Alert.alert("Error", "Failed to claim payout. Please try again.");
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
      tokensToSell: "",
      pricePerToken: "",
      listingDuration: "30",
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
        type: "warning",
        message: `Price is ${Math.abs(deviation).toFixed(1)}% ${
          deviation > 0 ? "above" : "below"
        } market price ($${mockMarketPrice})`,
        color: colors.status.warning,
      };
    } else if (Math.abs(deviation) >= 10) {
      return {
        type: "info",
        message: `Market price: $${mockMarketPrice} per token`,
        color: colors.text.secondary,
      };
    }
    return null;
  };
  const handlePreviewListing = () => {
    if (!listingForm.tokensToSell || !listingForm.pricePerToken) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    const tokensToSell = parseInt(listingForm.tokensToSell);
    const maxTokens = selectedInvestment?.shares || 0;
    if (tokensToSell > maxTokens) {
      Alert.alert("Error", `You can only list up to ${maxTokens} tokens`);
      return;
    }
    if (tokensToSell <= 0) {
      Alert.alert("Error", "Please enter a valid number of tokens");
      return;
    }
    const pricePerToken = parseFloat(listingForm.pricePerToken);
    if (pricePerToken <= 0) {
      Alert.alert("Error", "Please enter a valid price per token");
      return;
    }
    setShowPreviewModal(true);
  };
  const handleSubmitListing = () => {
    if (!listingForm.tokensToSell || !listingForm.pricePerToken) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    const tokensToSell = parseInt(listingForm.tokensToSell);
    const maxTokens = selectedInvestment?.shares || 0;
    if (tokensToSell > maxTokens) {
      Alert.alert("Error", `You can only list up to ${maxTokens} tokens`);
      return;
    }
    if (tokensToSell <= 0) {
      Alert.alert("Error", "Please enter a valid number of tokens");
      return;
    }
    const pricePerToken = parseFloat(listingForm.pricePerToken);
    if (pricePerToken <= 0) {
      Alert.alert("Error", "Please enter a valid price per token");
      return;
    }
    const totalValue = calculateTotalValue();
    const durationText =
      listingForm.listingDuration === "none"
        ? "indefinitely"
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
      tokensToSell: "",
      pricePerToken: "",
      listingDuration: "30",
    });
  };
  const handleSuccessAction = (action: "marketplace" | "listings") => {
    setShowSuccessModal(false);
    setListingForm({
      tokensToSell: "",
      pricePerToken: "",
      listingDuration: "30",
    });
    if (action === "marketplace") {
      // Navigate to marketplace - for now just show alert
      Alert.alert("Navigation", "Navigating to Secondary Marketplace...");
    } else {
      // Navigate to my listings - for now just show alert
      Alert.alert("Navigation", "Navigating to My Listings...");
    }
  };
  const handleBuyTokensPress = (listing: any) => {
    setSelectedListing(listing);
    setBuyForm({ quantity: "" });
    setShowBuyTokensModal(true);
  };
  const handleCloseBuyModal = () => {
    setShowBuyTokensModal(false);
    setSelectedListing(null);
    setBuyForm({ quantity: "" });
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
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }
    const quantity = parseInt(buyForm.quantity);
    const maxTokens = selectedListing?.quantityListed || 0;
    if (quantity > maxTokens) {
      Alert.alert("Error", `Only ${maxTokens} tokens are available`);
      return;
    }
    const totalCost = calculateBuyTotal();
    Alert.alert(
      "Purchase Confirmation",
      `You are about to purchase ${quantity} tokens of ${
        selectedListing?.propertyName
      } for $${totalCost.toLocaleString()}. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Purchase",
          onPress: () => {
            handleCloseBuyModal();
            Alert.alert("Success", "Token purchase completed successfully!");
          },
        },
      ]
    );
  };
  const handleTabChange = (tab: "Investments" | "Secondary Marketplace") => {
    setSelectedTab(tab);
  };
  const generatePortfolioPDFContent = () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const investmentRows = allInvestments
      .map((investment) => {
        const property = getPropertyById(investment.propertyId);
        const gainLoss = investment.currentValue - investment.amount;
        const gainLossPercent = (gainLoss / investment.amount) * 100;
        const investmentDate = new Date(
          investment.investmentDate
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return `
    <tr>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
    <div style="font-weight: 600; color: #1a1a2e; margin-bottom: 4px;">Transaction ID: ${
      investment.id
    }</div>
    <div style="color: #64748b;">Date: ${investmentDate}</div>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
    <div style="font-weight: 600; color: #1a1a2e;">${
      property?.title || "Property Investment"
    }</div>
    <div style="font-size: 12px; color: #64748b;">${
      property?.location.city || ""
    }, ${property?.location.country || ""}</div>
    <div style="font-size: 11px; color: #d4af37; margin-top: 2px;">Token: ${
      investment.shares
    } shares</div>
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
    $${investment.amount.toLocaleString()}
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #d4af37; font-weight: 600;">
    $${investment.currentValue.toLocaleString()}
    </td>
    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: ${
      gainLoss >= 0 ? "#10b981" : "#ef4444"
    }; font-weight: 600;">
    ${gainLoss >= 0 ? "+" : ""}$${gainLoss.toLocaleString()}
    <br><span style="font-size: 12px;">(${gainLossPercent.toFixed(1)}%)</span>
    </td>
    </tr>
    `;
      })
      .join("");
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
  <div class="logo">Rentzy</div>
  <h1>Investment Portfolio Report</h1>
  <p>Premium Real Estate Investment Platform</p>
  </div>
  <div class="content">
  <div class="summary-box">
  <h3>Portfolio Performance Summary</h3>
  <p>Total portfolio value of $${totalValue.toLocaleString()} with ${portfolioROI.toFixed(
      1
    )}% overall return</p>
  </div>
  <div class="stats-section">
  <h2>Portfolio Statistics</h2>
  <div class="stats-grid">
  <div class="stat-card">
  <div class="stat-value" style="color: #d4af37;">$${totalValue.toLocaleString()}</div>
  <div class="stat-label">Total Value</div>
  </div>
  <div class="stat-card">
  <div class="stat-value" style="color: #10b981;">+${portfolioROI.toFixed(
    1
  )}%</div>
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
  <p>This report provides a comprehensive overview of your investment portfolio through Rentzy platform.</p>
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
          mimeType: "application/pdf",
          dialogTitle: "Investment Portfolio Report",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Success", "Portfolio PDF generated successfully!");
      }
    } catch (error) {
      console.error("Error generating portfolio PDF:", error);
      Alert.alert(
        "Error",
        "Failed to generate portfolio PDF. Please try again."
      );
    }
  };
  const [selectedTab, setSelectedTab] = useState<
    "Investments" | "Secondary Marketplace"
  >("Investments");
  if (!user?.investmentStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <TrendingUp size={64} color={colors.text.secondary} />
          <Typography variant="h3" color="secondary" align="center">
            Investment Portfolio
          </Typography>
          <Typography variant="body" color="secondary" align="center">
            Make your first investment to unlock portfolio tracking and
            exclusive investor features.
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
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === "Investments" && styles.tabItemActive]}
          onPress={() => setSelectedTab("Investments")}
          activeOpacity={0.8}
        >
          <TrendingUp
            size={18}
            color={selectedTab === "Investments" ? "#fff" : "#222"}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.tabText, selectedTab === "Investments" && styles.tabTextActive]}>
            Investments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, selectedTab === "Secondary Marketplace" && styles.tabItemActive]}
          onPress={() => setSelectedTab("Secondary Marketplace")}
          activeOpacity={0.8}
        >
          <Wallet
            size={18}
            color={selectedTab === "Secondary Marketplace" ? "#fff" : "#222"}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.tabText, selectedTab === "Secondary Marketplace" && styles.tabTextActive]}>
            Marketplace
          </Text>
        </TouchableOpacity>
      </View>
      {/* Tab Content */}
      {selectedTab === "Investments" ? (
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
                    {filterOptions.find(
                      (option) => option.value === selectedFilter
                    )?.label || "All Investments"}
                  </Typography>
                  <ChevronDown
                    size={16}
                    color={colors.text.secondary}
                    style={{
                      transform: [
                        { rotate: showFilterDropdown ? "180deg" : "0deg" },
                      ],
                    }}
                  />
                </TouchableOpacity>
                {showFilterDropdown && (
                  <View style={styles.filterDropdown}>
                    {filterOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterOption,
                          selectedFilter === option.value &&
                            styles.filterOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedFilter(option.value);
                          setShowFilterDropdown(false);
                        }}
                      >
                        <Typography
                          variant="body"
                          color={
                            selectedFilter === option.value ? "gold" : "primary"
                          }
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
                  onPress={() => {
                    setSelectedInvestment(investment);
                    setShowTokenModal(true);
                  }}
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
                          {property?.title || "Property Investment"}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {property?.location.city},{" "}
                          {property?.location.country}
                        </Typography>
                        {/* Token Details Section */}
                        <View style={styles.tokenDetailsSection}>
                          <Typography
                            variant="h5"
                            style={styles.tokenDetailsTitle}
                          >
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
                                    gainLoss >= 0
                                      ? colors.status.success
                                      : colors.status.error,
                                }}
                              >
                                {gainLoss >= 0 ? "+" : ""}$
                                {gainLoss.toLocaleString()} (
                                {gainLossPercent.toFixed(1)}%)
                              </Typography>
                            </View>
                          </View>
                        </View>
                        <View style={styles.investmentFooter}>
                          <Typography variant="caption" color="secondary">
                            {investment.shares} shares • Invested{" "}
                            {new Date(
                              investment.investmentDate
                            ).toLocaleDateString()}
                          </Typography>
                          <View
                            style={[
                              styles.statusBadge,
                              styles.activeStatusBadge,
                            ]}
                          >
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
        <MarketplaceScreen />
      )}
      {/* Download Portfolio PDF Button and Token Details Modal remain as before */}
      {allInvestments.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.downloadPDFButton}
            onPress={handleDownloadPortfolioPDF}
            activeOpacity={0.8}
          >
            <Download size={20} color={colors.text.inverse} />
            <Typography
              variant="body"
              color="inverse"
              style={styles.downloadButtonText}
            >
              Download Portfolio PDF
            </Typography>
          </TouchableOpacity>
        </View>
      )}
      <Modal visible={showTokenModal} onClose={() => setShowTokenModal(false)}>
        {/* Token details modal content as before, but no secondary marketplace actions */}
        {/* ... */}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    position: "relative",
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
    alignItems: "center",
  },
  sortButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  sortDropdown: {
    position: "absolute",
    top: "100%",
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
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  filterContainer: {
    position: "relative",
    minWidth: 160,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterDropdown: {
    position: "absolute",
    top: "100%",
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
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  statText: {
    flex: 1,
  },
  chartCard: {
    paddingVertical: spacing.xl,
  },
  chartPlaceholder: {
    alignItems: "center",
    gap: spacing.md,
  },
  investmentCard: {
    marginBottom: spacing.md,
  },
  investmentContent: {
    flexDirection: "row",
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
    flexDirection: "row",
    justifyContent: "space-between",
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
    alignItems: "center",
    flex: 1,
  },
  investmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.layout.screenPadding,
    gap: spacing.lg,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind the fixed button
  },
  bottomContainer: {
    position: "absolute",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    fontSize: 16,
  },
  payoutSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  payoutInfo: {
    flex: 1,
  },
  claimPayoutButton: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    fontSize: 12,
  },
  modalContent: {
    maxHeight: "85%",
  },
  modalScrollContent: {
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  modalMetric: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    alignItems: "center",
    gap: spacing.sm,
  },
  modalClaimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryMarketplaceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  listForSaleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    fontSize: 16,
  },
  listingModalContent: {
    maxHeight: "90%",
    width: "100%",
  },
  ownershipCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  ownershipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: 0,
  },
  totalSection: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  totalLabel: {
    color: colors.primary.gold,
  },
  durationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  durationOption: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tokenSymbol: {
    fontWeight: "600",
    fontFamily: "monospace",
  },
  warningNote: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  percentageNote: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  readOnlyField: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: "center",
    gap: spacing.xs,
  },
  previewButton: {
    borderColor: colors.primary.gold,
  },
  submitListingButton: {
    backgroundColor: colors.primary.gold,
  },
  previewModalContent: {
    maxHeight: "80%",
    width: "100%",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewModalActions: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  successModalContent: {
    maxHeight: "70%",
    width: "100%",
    alignItems: "center",
  },
  successHeader: {
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  successDetails: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  successSectionTitle: {
    marginBottom: spacing.md,
    color: colors.primary.gold,
    textAlign: "center",
  },
  successDetailsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: "center",
    gap: spacing.sm,
  },
  successModalActions: {
    width: "100%",
    gap: spacing.md,
  },
  primarySuccessButton: {
    backgroundColor: colors.primary.gold,
  },
  passiveIncomeCard: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.primary.gold,
  },
  claimHistoryList: {
    gap: spacing.sm,
    maxHeight: 200,
  },
  claimHistoryItem: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    textAlign: "center",
  },
  claimHistoryProperty: {
    flex: 1.5,
    fontSize: 11,
    textAlign: "center",
  },
  claimHistoryTxId: {
    flex: 1.2,
    fontSize: 10,
    fontFamily: "monospace",
    textAlign: "center",
  },
  claimHistoryStatus: {
    fontSize: 9,
  },
  tabContainer: {
    flexDirection: "row",
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
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: "600",
  },
  // Secondary Market Token Card Styles
  tokenListingCard: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
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
    position: "relative",
    width: "100%",
    height: 200,
  },
  tokenListingImage: {
    width: "100%",
    height: "100%",
  },
  roiBadgeOverlay: {
    position: "absolute",
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
    fontWeight: "700",
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
    fontWeight: "700",
    lineHeight: 24,
    color: colors.text.primary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tokenInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  tokenInfoItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tokenPrice: {
    fontWeight: "700",
    fontSize: 18,
  },
  tokenQuantity: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.text.primary,
  },
  totalValueSection: {
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    gap: spacing.xs,
  },
  totalValueLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontWeight: "700",
    fontSize: 20,
  },
  sellerInfoSection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    alignItems: "center",
  },
  buyTokenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
    fontSize: 16,
  },
  buyModalContent: {
    maxHeight: "90%",
    width: "100%",
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
    width: "100%",
    height: 120,
    borderRadius: radius.md,
  },
  buyPropertyDetails: {
    gap: spacing.sm,
  },
  buyPropertyMetrics: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  buyMetricItem: {
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buyTotalCard: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    marginTop: spacing.md,
  },
  buyTotalHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  buyTotalDetails: {
    gap: spacing.sm,
  },
  buyTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    flexDirection: "row", // <-- Add this
  },
  tabItemActive: {
    backgroundColor: "#D4AF37", // Gold
  },
  tabText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#222",
  },
  tabTextActive: {
    color: "#fff",
  },
});
