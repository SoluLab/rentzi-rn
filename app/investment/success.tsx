import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { usePropertyStore } from '@/stores/propertyStore';
import {
  CheckCircle2,
  Calendar,
  Coins,
  DollarSign,
  AArrowDown,
  AArrowUp,
  ArrowRight,
  Home,
  PieChart,
  Download,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
export default function InvestmentSuccessScreen() {
  const router = useRouter();
  const { propertyId, tokenQuantity, amount, paymentMethod, investmentDate, ownershipPercentage } =
    useLocalSearchParams();
  const { getPropertyById } = usePropertyStore();
  const property = getPropertyById(propertyId as string);
  const investmentDetails = [
    {
      icon: Coins,
      label: 'Token Quantity',
      value: `${tokenQuantity} tokens`,
      color: colors.primary.gold,
    },
    {
      icon: Home,
      label: 'Property',
      value: property?.title || 'Luxury Property',
      color: colors.primary.blue,
    },
    {
      icon: Calendar,
      label: 'Investment Date',
      value: new Date(investmentDate as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      color: colors.text.primary,
    },
    {
      icon: PieChart,
      label: 'Ownership',
      value: `${parseFloat(ownershipPercentage as string).toFixed(3)}%`,
      color: colors.status.success,
    },
    {
      icon: DollarSign,
      label: 'Amount Paid',
      value: `$${parseFloat(amount as string).toLocaleString()}`,
      color: colors.primary.gold,
    },
  ];
  const handleViewPortfolio = () => {
    router.replace('/(tabs)/portfolio');
  };
  const handleViewProperty = () => {
    router.push(`/property/${propertyId}`);
  };
  const generatePDFContent = () => {
    const formattedDate = new Date(investmentDate as string).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <title>Investment Certificate</title>
  <style>
  body {
  font-family: 'Helvetica', Arial, sans-serif;
  margin: 0;
  padding: 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #333;
  }
  .container {
  max-width: 800px;
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
  .success-badge {
  text-align: center;
  margin-bottom: 30px;
  }
  .success-badge h2 {
  color: #10b981;
  font-size: 24px;
  margin: 0;
  font-weight: 600;
  }
  .property-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  border-left: 4px solid #d4af37;
  }
  .property-section h3 {
  margin: 0 0 8px 0;
  color: #1a1a2e;
  font-size: 20px;
  }
  .property-section p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  }
  .details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
  }
  .detail-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  }
  .detail-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  font-weight: 600;
  }
  .detail-value {
  font-size: 18px;
  color: #1a1a2e;
  font-weight: 600;
  }
  .payment-section {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  color: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 30px;
  }
  .payment-section h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  }
  .payment-section p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
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
  </style>
  </head>
  <body>
  <div class="container">
  <div class="header">
  <div class="logo">Renzi</div>
  <h1>Investment Certificate</h1>
  <p>Premium Real Estate Investment Platform</p>
  </div>
  <div class="content">
  <div class="success-badge">
  <h2>✓ Investment Successful</h2>
  </div>
  <div class="property-section">
  <h3>${property?.title || 'Luxury Property'}</h3>
  <p>${property?.location.city || ''}, ${property?.location.country || ''}</p>
  </div>
  <div class="details-grid">
  <div class="detail-item">
  <div class="detail-label">Token Quantity</div>
  <div class="detail-value">${tokenQuantity} tokens</div>
  </div>
  <div class="detail-item">
  <div class="detail-label">Investment Date</div>
  <div class="detail-value">${formattedDate}</div>
  </div>
  <div class="detail-item">
  <div class="detail-label">Ownership Percentage</div>
  <div class="detail-value">${parseFloat(ownershipPercentage as string).toFixed(3)}%</div>
  </div>
  <div class="detail-item">
  <div class="detail-label">Amount Paid</div>
  <div class="detail-value">$${parseFloat(amount as string).toLocaleString()}</div>
  </div>
  </div>
  <div class="payment-section">
  <h3>Payment Method</h3>
  <p>${paymentMethod === 'fiat' ? 'Fiat Currency (USD)' : 'Cryptocurrency'}</p>
  </div>
  <div class="footer">
  <p>This certificate confirms your investment in the above property through Renzi platform.</p>
  <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
  </div>
  </div>
  </body>
  </html>
  `;
  };
  const handleDownloadPDF = async () => {
    try {
      const htmlContent = generatePDFContent();
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Investment Certificate',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <CheckCircle2 size={64} color={colors.status.success} />
          </View>
          <Typography variant="h2" align="center" style={styles.successTitle}>
            Investment Successful!
          </Typography>
          <Typography
            variant="body"
            color="secondary"
            align="center"
            style={styles.successSubtitle}
          >
            Your investment has been confirmed and processed successfully.
          </Typography>
        </View>
        {/* Property Image */}
        {property && (
          <Card style={styles.propertyCard}>
            <Image source={{ uri: property.mediaGallery.images[0] }} style={styles.propertyImage} />
            <View style={styles.propertyOverlay}>
              <Typography variant="h4" color="inverse">
                {property.title}
              </Typography>
              <Typography variant="body" color="inverse">
                {property.location.city}, {property.location.country}
              </Typography>
            </View>
          </Card>
        )}
        {/* Investment Details */}
        <Card style={styles.detailsCard}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Investment Summary
          </Typography>
          <View style={styles.detailsList}>
            {investmentDetails.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <detail.icon size={24} color={detail.color} />
                </View>
                <View style={styles.detailContent}>
                  <Typography variant="caption" color="secondary">
                    {detail.label}
                  </Typography>
                  <Typography variant="h4" style={{ color: detail.color }}>
                    {detail.value}
                  </Typography>
                </View>
              </View>
            ))}
          </View>
          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Typography variant="body" color="secondary">
              Payment Method
            </Typography>
            <Typography variant="h4" color="gold">
              {paymentMethod === 'fiat' ? 'Fiat Currency (USD)' : 'Cryptocurrency'}
            </Typography>
          </View>
          {/* Download PDF Button */}
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
            <Download size={20} color={colors.primary.gold} />
            <Typography variant="body" style={styles.downloadButtonText}>
              Download PDF
            </Typography>
          </TouchableOpacity>
        </Card>
        {/* Next Steps */}
        <Card style={styles.nextStepsCard}>
          <Typography variant="h3" style={styles.sectionTitle}>
            What's Next?
          </Typography>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Typography variant="label" color="inverse">
                  1
                </Typography>
              </View>
              <View style={styles.stepContent}>
                <Typography variant="body">Track Your Investment</Typography>
                <Typography variant="caption" color="secondary">
                  Monitor your investment performance in your portfolio
                </Typography>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Typography variant="label" color="inverse">
                  2
                </Typography>
              </View>
              <View style={styles.stepContent}>
                <Typography variant="body">Receive Updates</Typography>
                <Typography variant="caption" color="secondary">
                  Get notifications about property performance and dividends
                </Typography>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Typography variant="label" color="inverse">
                  3
                </Typography>
              </View>
              <View style={styles.stepContent}>
                <Typography variant="body">Legal Documentation</Typography>
                <Typography variant="caption" color="secondary">
                  Access your investment certificates and legal documents
                </Typography>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <Button title="View Portfolio" onPress={handleViewPortfolio} style={styles.primaryButton} />
        <Button
          title="View Property"
          onPress={handleViewProperty}
          variant="outline"
          style={styles.secondaryButton}
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
  scrollView: {
    flex: 1,
    padding: spacing.layout.screenPadding,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  propertyCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 200,
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
  detailsCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  detailsList: {
    gap: spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentSection: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.light,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary.gold,
  },
  downloadButtonText: {
    color: colors.primary.gold,
    fontWeight: '600',
  },
  nextStepsCard: {
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  stepsList: {
    gap: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    gap: spacing.xs,
  },
  actionBar: {
    padding: spacing.layout.screenPadding,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});