import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { Check, AlertTriangle } from 'lucide-react-native';
import { useCommercialPropertyStore } from '@/stores/commercialPropertyStore';

interface ConsentData {
  investmentRisks: boolean;
  platformTerms: boolean;
  variableIncome: boolean;
  tokenizationConsent: boolean;
  usageRights: boolean;
  liquidityLimitations: boolean;
  governanceRights: boolean;
}

interface ConsentValidationErrors {
  investmentRisks?: string;
  platformTerms?: string;
  variableIncome?: string;
  tokenizationConsent?: string;
  usageRights?: string;
  liquidityLimitations?: string;
  governanceRights?: string;
}

const CONSENT_ITEMS = [
  {
    key: 'investmentRisks' as keyof ConsentData,
    title: 'Investment Risks Understanding',
    description: 'I understand the risks of investment and market fluctuations',
    details: 'Commercial real estate investments carry inherent risks including market volatility, economic downturns, and property-specific challenges. I acknowledge that property values and rental income may fluctuate.',
  },
  {
    key: 'platformTerms' as keyof ConsentData,
    title: 'Platform Terms Agreement',
    description: 'I agree to the use restrictions and platform terms',
    details: 'I accept and agree to comply with all platform terms of service, usage restrictions, and operational guidelines. This includes adherence to platform policies and procedures.',
  },
  {
    key: 'variableIncome' as keyof ConsentData,
    title: 'Variable Income Understanding',
    description: 'I understand income from rentals is variable',
    details: 'Rental income is subject to market conditions, tenant turnover, maintenance costs, and other factors. I understand that income may vary and is not guaranteed.',
  },
  {
    key: 'tokenizationConsent' as keyof ConsentData,
    title: 'Tokenization Consent',
    description: 'I consent to tokenize or fractionalize my property',
    details: 'I authorize the platform to create digital tokens representing fractional ownership of my property. This process involves legal and technical considerations for digital asset creation.',
  },
  {
    key: 'usageRights' as keyof ConsentData,
    title: 'Usage Rights Agreement',
    description: 'I agree to usage rights including nights and revenue share',
    details: 'I agree to the platform\'s usage rights model, which may include revenue sharing arrangements and operational requirements for property management.',
  },
  {
    key: 'liquidityLimitations' as keyof ConsentData,
    title: 'Liquidity Limitations',
    description: 'I understand liquidity limitations and lock-in restrictions',
    details: 'I understand that fractional ownership may have limited liquidity and may include lock-in periods. Selling fractional interests may be subject to market conditions and platform restrictions.',
  },
  {
    key: 'governanceRights' as keyof ConsentData,
    title: 'Governance and Voting Rights',
    description: 'I accept governance and voting rights setup (if applicable)',
    details: 'I accept the governance structure and voting rights framework that may apply to fractional ownership. This includes participation in decision-making processes related to the property.',
  },
];

export default function CommercialPropertyLegalConsentsScreen() {
  const router = useRouter();
  const { data, updateLegalConsents } = useCommercialPropertyStore();
  
  const [consents, setConsents] = useState<ConsentData>(data.legalConsents);
  const [errors, setErrors] = useState<ConsentValidationErrors>({});
  const [expandedItem, setExpandedItem] = useState<keyof ConsentData | null>(null);

  // Validation functions
  const validateConsent = (consent: boolean, fieldName: string): string | undefined => {
    if (!consent) {
      return `${fieldName} consent is required`;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ConsentValidationErrors = {};

    newErrors.investmentRisks = validateConsent(consents.investmentRisks, 'Investment Risks Understanding');
    newErrors.platformTerms = validateConsent(consents.platformTerms, 'Platform Terms Agreement');
    newErrors.variableIncome = validateConsent(consents.variableIncome, 'Variable Income Understanding');
    newErrors.tokenizationConsent = validateConsent(consents.tokenizationConsent, 'Tokenization Consent');
    newErrors.usageRights = validateConsent(consents.usageRights, 'Usage Rights Agreement');
    newErrors.liquidityLimitations = validateConsent(consents.liquidityLimitations, 'Liquidity Limitations');
    newErrors.governanceRights = validateConsent(consents.governanceRights, 'Governance and Voting Rights');

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const updateConsent = (field: keyof ConsentData, value: boolean) => {
    const newConsents = { ...consents, [field]: value };
    setConsents(newConsents);
    updateLegalConsents(newConsents);
    
    // Clear error when user checks the consent
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleExpanded = (key: keyof ConsentData) => {
    setExpandedItem(expandedItem === key ? null : key);
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to listing type selection step
      router.push('/add-commercial-details/commercial-property-listing-type');
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: ConsentValidationErrors = {};

    newErrors.investmentRisks = validateConsent(consents.investmentRisks, 'Investment Risks Understanding');
    newErrors.platformTerms = validateConsent(consents.platformTerms, 'Platform Terms Agreement');
    newErrors.variableIncome = validateConsent(consents.variableIncome, 'Variable Income Understanding');
    newErrors.tokenizationConsent = validateConsent(consents.tokenizationConsent, 'Tokenization Consent');
    newErrors.usageRights = validateConsent(consents.usageRights, 'Usage Rights Agreement');
    newErrors.liquidityLimitations = validateConsent(consents.liquidityLimitations, 'Liquidity Limitations');
    newErrors.governanceRights = validateConsent(consents.governanceRights, 'Governance and Voting Rights');

    // Check if all consents are checked and no validation errors
    return Object.values(newErrors).every(error => !error);
  };

  const renderConsentItem = (item: typeof CONSENT_ITEMS[0]) => {
    const isChecked = consents[item.key];
    const error = errors[item.key];
    const isExpanded = expandedItem === item.key;

    return (
      <View key={item.key} style={styles.consentItem}>
        <TouchableOpacity
          style={[styles.consentHeader, error && styles.consentHeaderError]}
          onPress={() => toggleExpanded(item.key)}
        >
          <View style={styles.consentCheckboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              onPress={() => updateConsent(item.key, !isChecked)}
            >
              {isChecked && <Check size={16} color={colors.neutral.white} />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.consentContent}>
            <Typography variant="h6" style={styles.consentTitle}>
              {item.title}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.consentDescription}>
              {item.description}
            </Typography>
          </View>
          
          <View style={styles.expandIcon}>
            <Typography variant="body" color="secondary">
              {isExpanded ? '−' : '+'}
            </Typography>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.consentDetails}>
            <Typography variant="body" color="secondary" style={styles.detailsText}>
              {item.details}
            </Typography>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <AlertTriangle size={16} color={colors.status.error} />
            <Typography variant="caption" color="error" style={styles.errorText}>
              {error}
            </Typography>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScreenContainer>
        <Header title="Legal Consents & Terms" />
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Typography variant="h4" style={styles.sectionTitle}>
            Legal Consents & Platform Terms
          </Typography>

          <View style={styles.warningBanner}>
            <AlertTriangle size={20} color={colors.status.warning} />
            <Typography variant="body" color="secondary" style={styles.warningText}>
              Please read and understand all terms before proceeding. All consents are mandatory for property tokenization.
            </Typography>
          </View>

          <Typography variant="body" color="secondary" style={styles.sectionDescription}>
            By checking each box below, you acknowledge that you have read, understood, and agree to the terms and conditions associated with tokenizing your commercial property.
          </Typography>

          {/* Consent Items */}
          <View style={styles.consentsContainer}>
            {CONSENT_ITEMS.map(renderConsentItem)}
          </View>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <Typography variant="h6" style={styles.summaryTitle}>
              Summary
            </Typography>
            <Typography variant="body" color="secondary" style={styles.summaryText}>
              You have agreed to {Object.values(consents).filter(Boolean).length} of {CONSENT_ITEMS.length} required consents.
            </Typography>
          </View>

          {/* Next Button */}
          <Button
            title="Next"
            onPress={handleNext}
            disabled={!isFormValid()}
            style={styles.nextButton}
          />
        </ScrollView>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.status.warning + '20',
    padding: spacing.md,
    borderRadius: radius.input,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    lineHeight: 20,
  },
  sectionDescription: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  consentsContainer: {
    marginBottom: spacing.xl,
  },
  consentItem: {
    marginBottom: spacing.md,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  consentHeaderError: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.error + '10',
  },
  consentCheckboxContainer: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  consentContent: {
    flex: 1,
  },
  consentTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  consentDescription: {
    lineHeight: 18,
  },
  expandIcon: {
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
    width: 20,
    alignItems: 'center',
  },
  consentDetails: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: radius.input,
    borderBottomRightRadius: radius.input,
    marginTop: -1,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border.light,
  },
  detailsText: {
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.status.error,
  },
  summaryContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  summaryText: {
    lineHeight: 18,
  },
  nextButton: {
    marginTop: spacing.xl,
  },
}); 