import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Typography } from "@/components/ui/Typography";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Header } from "@/components/ui/Header";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { ShoppingCart, DollarSign, Hash, FileText } from "lucide-react-native";

export default function SecondaryMarketplaceListingScreen() {
  const router = useRouter();
  const { investmentId, tokenName, maxTokens } = useLocalSearchParams();

  const [selectedTab, setSelectedTab] = useState<
    "Main Listing" | "My Purchases" | "Purchase Requests" | "My Listing"
  >("Main Listing");

  const [formData, setFormData] = useState({
    tokenName: (tokenName as string) || "",
    numberOfTokens: "",
    pricePerToken: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.tokenName.trim()) {
      toast.error("Token name is required");
      return false;
    }

    if (!formData.numberOfTokens.trim()) {
      toast.error("Number of tokens is required");
      return false;
    }

    const numberOfTokens = parseInt(formData.numberOfTokens);
    const maxTokensNum = parseInt(maxTokens as string);

    if (isNaN(numberOfTokens) || numberOfTokens <= 0) {
      toast.error("Please enter a valid number of tokens");
      return false;
    }

    if (numberOfTokens > maxTokensNum) {
      toast.error(`You can only list up to ${maxTokens} tokens`);
      return false;
    }

    if (!formData.pricePerToken.trim()) {
      toast.error("Price per token is required");
      return false;
    }

    const pricePerToken = parseFloat(formData.pricePerToken);
    if (isNaN(pricePerToken) || pricePerToken <= 0) {
      toast.error("Please enter a valid price per token");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const totalValue =
        parseInt(formData.numberOfTokens) * parseFloat(formData.pricePerToken);

      Alert.alert(
        "Listing Created Successfully",
        `Your ${
          formData.numberOfTokens
        } tokens have been listed for $${totalValue.toLocaleString()} total value.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );

      toast.success("Token listing created successfully!");
    } catch (error) {
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalValue = () => {
    const tokens = parseInt(formData.numberOfTokens) || 0;
    const price = parseFloat(formData.pricePerToken) || 0;
    return tokens * price;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Header
        title="Secondary Marketplace"
        subtitle="Manage and view token listings"
        showBackButton={true}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          "Main Listing",
          "My Purchases",
          "Purchase Requests",
          "My Listing",
        ].map((tab) => (
          <Button
            key={tab}
            title={tab}
            onPress={() => setSelectedTab(tab as any)}
            style={
              selectedTab === tab
                ? { ...styles.tab, ...styles.activeTab }
                : styles.tab
            }
            textStyle={
              selectedTab === tab
                ? { ...styles.tabText, color: "white" }
                : styles.tabText
            }
            variant={selectedTab === tab ? "primary" : "ghost"}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Tab Content */}
        {selectedTab === "Main Listing" && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Card style={styles.headerCard}>
              <View style={styles.headerContent}>
                <ShoppingCart size={32} color={colors.primary.gold} />
                <View style={styles.headerText}>
                  <Typography variant="h4">Main Listing</Typography>
                  <Typography variant="body" color="secondary">
                    Browse all available token listings in the marketplace.
                  </Typography>
                </View>
              </View>
            </Card>
            {/* TODO: Replace with actual main listing content */}
            <Typography variant="body" style={{ marginTop: 32 }}>
              [Main Listing content goes here]
            </Typography>
          </ScrollView>
        )}
        {selectedTab === "My Purchases" && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Card style={styles.headerCard}>
              <View style={styles.headerContent}>
                <DollarSign size={32} color={colors.primary.gold} />
                <View style={styles.headerText}>
                  <Typography variant="h4">My Purchases</Typography>
                  <Typography variant="body" color="secondary">
                    View tokens you have purchased from the marketplace.
                  </Typography>
                </View>
              </View>
            </Card>
            {/* TODO: Replace with actual purchases content */}
            <Typography variant="body" style={{ marginTop: 32 }}>
              [My Purchases content goes here]
            </Typography>
          </ScrollView>
        )}
        {selectedTab === "Purchase Requests" && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <Card style={styles.headerCard}>
              <View style={styles.headerContent}>
                <Hash size={32} color={colors.primary.gold} />
                <View style={styles.headerText}>
                  <Typography variant="h4">Purchase Requests</Typography>
                  <Typography variant="body" color="secondary">
                    Manage requests to purchase your listed tokens.
                  </Typography>
                </View>
              </View>
            </Card>
            {/* TODO: Replace with actual purchase requests content */}
            <Typography variant="body" style={{ marginTop: 32 }}>
              [Purchase Requests content goes here]
            </Typography>
          </ScrollView>
        )}
        {selectedTab === "My Listing" && (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Card */}
            <Card style={styles.headerCard}>
              <View style={styles.headerContent}>
                <ShoppingCart size={32} color={colors.primary.gold} />
                <View style={styles.headerText}>
                  <Typography variant="h4">List Your Tokens</Typography>
                  <Typography variant="body" color="secondary">
                    List your tokens for other investors to purchase
                  </Typography>
                </View>
              </View>
            </Card>
            {/* Listing Form */}
            <Card style={styles.formCard}>
              <Typography variant="h5" style={styles.sectionTitle}>
                Token Details
              </Typography>
              {/* Token Name */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <FileText size={20} color={colors.primary.gold} />
                  <Typography variant="body">Token Name</Typography>
                </View>
                <Input
                  value={formData.tokenName}
                  onChangeText={(value) =>
                    handleInputChange("tokenName", value)
                  }
                  placeholder="Enter token name"
                  containerStyle={styles.inputContainer}
                />
              </View>
              {/* Number of Tokens */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Hash size={20} color={colors.primary.gold} />
                  <Typography variant="body">Number of Tokens</Typography>
                </View>
                <Input
                  value={formData.numberOfTokens}
                  onChangeText={(value) =>
                    handleInputChange("numberOfTokens", value)
                  }
                  placeholder={`Max: ${maxTokens} tokens`}
                  keyboardType="numeric"
                  containerStyle={styles.inputContainer}
                />
                <Typography variant="caption" color="secondary">
                  You own {maxTokens} tokens maximum
                </Typography>
              </View>
              {/* Price Per Token */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <DollarSign size={20} color={colors.primary.gold} />
                  <Typography variant="body">Price Per Token (USD)</Typography>
                </View>
                <Input
                  value={formData.pricePerToken}
                  onChangeText={(value) =>
                    handleInputChange("pricePerToken", value)
                  }
                  placeholder="Enter price per token"
                  keyboardType="numeric"
                  containerStyle={styles.inputContainer}
                />
              </View>
            </Card>
            {/* Summary Card */}
            {formData.numberOfTokens && formData.pricePerToken && (
              <Card style={styles.summaryCard}>
                <Typography variant="h5" style={styles.sectionTitle}>
                  Listing Summary
                </Typography>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Typography variant="caption" color="secondary">
                      Tokens to List
                    </Typography>
                    <Typography variant="h4" color="gold">
                      {formData.numberOfTokens}
                    </Typography>
                  </View>
                  <View style={styles.summaryItem}>
                    <Typography variant="caption" color="secondary">
                      Price Per Token
                    </Typography>
                    <Typography variant="h4">
                      $
                      {parseFloat(
                        formData.pricePerToken || "0"
                      ).toLocaleString()}
                    </Typography>
                  </View>
                </View>
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Typography variant="h4">Total Value</Typography>
                    <Typography variant="h3" color="gold">
                      ${calculateTotalValue().toLocaleString()}
                    </Typography>
                  </View>
                </View>
              </Card>
            )}
            {/* Submit Button */}
            <View style={styles.actionBar}>
              <Button
                title={isSubmitting ? "Creating Listing..." : "Create Listing"}
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={
                  !formData.tokenName ||
                  !formData.numberOfTokens ||
                  !formData.pricePerToken
                }
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.layout.screenPadding,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  formCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    color: colors.primary.gold,
    marginBottom: spacing.md,
  },
  inputSection: {
    gap: spacing.sm,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    marginBottom: 0,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  totalSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    padding: spacing.layout.screenPadding,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
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
  submitButton: {
    width: "100%",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.lightGray,
    marginHorizontal: spacing.layout.screenPadding,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: "600",
  },
});
