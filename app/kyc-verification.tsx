import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BackButton } from '@/components/ui/BackButton';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, radius } from '@/constants';
import {
  Shield,
  FileText,
  Camera,
  CheckCircle2,
  Clock,
  AArrowDown,
  User,
  CreditCard,
  MapPin,
  Upload,
} from 'lucide-react-native';

export default function KYCVerificationScreen() {
  const router = useRouter();
  const { user, setUser, isLoading } = useAuthStore();
  
  const [kycStatus, setKycStatus] = useState<'start' | 'pending' | 'complete'>('start');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    idNumber: '',
    idType: 'passport',
  });

  useEffect(() => {
    // Check if user already has KYC status
    if (user?.kycStatus === 'pending') {
      setKycStatus('pending');
    } else if (user?.kycStatus === 'complete') {
      setKycStatus('complete');
      // If already complete, navigate to homeowner tabs
      router.replace('/(homeowner-tabs)');
    }
  }, [user?.kycStatus]);

  const handleStartKYC = () => {
    setKycStatus('pending');
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitKYC();
    }
  };

  const handleSubmitKYC = async () => {
    try {
      // Simulate KYC submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user KYC status to complete
      if (user) {
        const updatedUser = { ...user, kycStatus: 'complete' as const };
        setUser(updatedUser);
      }
      
      toast.success('KYC verification completed successfully!');
      
      // Navigate to homeowner tabs
      router.replace('/(homeowner-tabs)');
    } catch (error) {
      toast.error('KYC submission failed. Please try again.');
    }
  };

  const handleDemoTogglePending = () => {
    if (kycStatus === 'pending') {
      setKycStatus('start');
      toast.info('Switched to Start KYC view');
    } else {
      setKycStatus('pending');
      toast.info('Switched to Pending KYC view');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStartKYCScreen = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={48} color={colors.primary.gold} />
          </View>
          <Typography variant="h1" style={styles.title}>
            Complete KYC Verification
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            As a homeowner, you need to complete KYC verification to list and manage properties on our platform.
          </Typography>
        </View>

        {/* Benefits Card */}
        <Card style={styles.benefitsCard}>
          <Typography variant="h4" style={styles.cardTitle}>
            Why KYC is Required
          </Typography>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color={colors.status.success} />
              <Typography variant="body" style={styles.benefitText}>
                List luxury properties on our platform
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color={colors.status.success} />
              <Typography variant="body" style={styles.benefitText}>
                Receive rental payments securely
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color={colors.status.success} />
              <Typography variant="body" style={styles.benefitText}>
                Access advanced property management tools
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <CheckCircle2 size={20} color={colors.status.success} />
              <Typography variant="body" style={styles.benefitText}>
                Build trust with potential renters
              </Typography>
            </View>
          </View>
        </Card>

        {/* Process Steps */}
        <Card style={styles.stepsCard}>
          <Typography variant="h4" style={styles.cardTitle}>
            Verification Process
          </Typography>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Typography variant="body" color="inverse">1</Typography>
              </View>
              <View style={styles.stepContent}>
                <Typography variant="body" style={styles.stepTitle}>
                  Personal Information
                </Typography>
                <Typography variant="caption" color="secondary">
                  Provide your basic details and address
                </Typography>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Typography variant="body" color="inverse">2</Typography>
              </View>
              <View style={styles.stepContent}>
                <Typography variant="body" style={styles.stepTitle}>
                  Identity Verification
                </Typography>
                <Typography variant="caption" color="secondary">
                  Upload government-issued ID documents
                </Typography>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Typography variant="body" color="inverse">3</Typography>
              </View>
              <View style={styles.stepContent}>
                <Typography variant="body" style={styles.stepTitle}>
                  Review & Approval
                </Typography>
                <Typography variant="caption" color="secondary">
                  Our team will review your documents
                </Typography>
              </View>
            </View>
          </View>
        </Card>

        {/* Start Button */}
        <Button
          title="Start KYC Verification"
          onPress={handleStartKYC}
          style={styles.startButton}
          leftIcon={<Shield size={20} color={colors.neutral.white} />}
        />

        {/* Demo Button */}
        <Button
          title="Demo: Toggle Pending Status"
          onPress={handleDemoTogglePending}
          variant="outline"
          style={styles.demoButton}
        />

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Typography variant="caption" style={styles.helpText}>
            The verification process typically takes 1-2 business days. You'll be notified once approved.
          </Typography>
        </View>
      </View>
    </ScrollView>
  );

  const renderPendingKYCScreen = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, styles.pendingIconContainer]}>
            <Clock size={48} color={colors.primary.gold} />
          </View>
          <Typography variant="h1" style={styles.title}>
            KYC Under Review
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Your KYC documents are being reviewed by our team. This process typically takes 1-2 business days.
          </Typography>
        </View>

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIcon}>
              <Clock size={24} color={colors.primary.gold} />
            </View>
            <View style={styles.statusContent}>
              <Typography variant="h4" color="primary">
                Verification Pending
              </Typography>
              <Typography variant="caption" color="secondary">
                Submitted on {new Date().toLocaleDateString()}
              </Typography>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
            <Typography variant="caption" color="secondary" style={styles.progressText}>
              2 of 3 steps completed
            </Typography>
          </View>
        </Card>

        {/* Steps Progress */}
        <Card style={styles.progressCard}>
          <Typography variant="h4" style={styles.cardTitle}>
            Verification Progress
          </Typography>
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, styles.completedStep]}>
              <CheckCircle2 size={20} color={colors.status.success} />
              <Typography variant="body" color="success">
                Personal Information
              </Typography>
            </View>
            <View style={[styles.progressStep, styles.completedStep]}>
              <CheckCircle2 size={20} color={colors.status.success} />
              <Typography variant="body" color="success">
                Document Upload
              </Typography>
            </View>
            <View style={[styles.progressStep, styles.pendingStep]}>
              <Clock size={20} color={colors.primary.gold} />
              <Typography variant="body" color="primary">
                Review & Approval
              </Typography>
            </View>
          </View>
        </Card>

        {/* What's Next */}
        <Card style={styles.nextStepsCard}>
          <Typography variant="h4" style={styles.cardTitle}>
            What's Next?
          </Typography>
          <View style={styles.nextStepsList}>
            <View style={styles.nextStepItem}>
              <AArrowDown size={20} color={colors.primary.gold} />
              <Typography variant="body" style={styles.nextStepText}>
                Our team is reviewing your documents
              </Typography>
            </View>
            <View style={styles.nextStepItem}>
              <CheckCircle2 size={20} color={colors.status.success} />
              <Typography variant="body" style={styles.nextStepText}>
                You'll receive an email notification once approved
              </Typography>
            </View>
            <View style={styles.nextStepItem}>
              <Shield size={20} color={colors.primary.gold} />
              <Typography variant="body" style={styles.nextStepText}>
                Start listing your properties immediately after approval
              </Typography>
            </View>
          </View>
        </Card>

        {/* Demo Complete Button */}
        <Button
          title="Demo: Complete KYC"
          onPress={handleSubmitKYC}
          loading={isLoading}
          style={styles.completeButton}
        />

        {/* Demo Toggle Button */}
        <Button
          title="Demo: Back to Start Screen"
          onPress={handleDemoTogglePending}
          variant="outline"
          style={styles.demoButton}
        />

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Typography variant="caption" style={styles.supportText}>
            Need help? Contact our support team for assistance.
          </Typography>
          <Button
            title="Contact Support"
            variant="ghost"
            size="small"
            onPress={() => Alert.alert('Support', 'Support contact feature coming soon!')}
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <BackButton />
        
        {kycStatus === 'start' ? renderStartKYCScreen() : renderPendingKYCScreen()}
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
  content: {
    padding: spacing.layout.screenPadding,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  pendingIconContainer: {
    backgroundColor: colors.primary.gold + '20',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: 24,
  },
  benefitsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  stepsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitText: {
    flex: 1,
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
  stepTitle: {
    fontWeight: '600',
  },
  startButton: {
    marginBottom: spacing.md,
  },
  demoButton: {
    marginBottom: spacing.lg,
  },
  helpSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  helpText: {
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: 20,
  },
  statusCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContent: {
    flex: 1,
    gap: spacing.xs,
  },
  progressContainer: {
    gap: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.gold,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  progressSteps: {
    gap: spacing.lg,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  completedStep: {
    opacity: 1,
  },
  pendingStep: {
    opacity: 0.8,
  },
  nextStepsCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  nextStepsList: {
    gap: spacing.md,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nextStepText: {
    flex: 1,
  },
  completeButton: {
    marginBottom: spacing.md,
    backgroundColor: colors.status.success,
  },
  supportSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  supportText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});