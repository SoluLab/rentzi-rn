import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackButton } from '@/components/ui/BackButton';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { shadow } from '@/constants/shadow';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
const roleOptions = [
  {
    id: 'renter',
    title: 'Luxury Renter',
    description: 'Discover and book exclusive luxury properties for short or long-term stays',
    icon: '🏖️',
  },
  {
    id: 'homeowner',
    title: 'Property Owner',
    description: 'List and manage your luxury properties for rental and investment opportunities',
    icon: '🏛️',
  },
];
export default function RoleSelectionScreen() {
  const router = useRouter();
  const { updateUserRole } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<User['role'] | null>(null);
  const handleRoleSelect = (role: User['role']) => {
    setSelectedRole(role);
  };
  const handleContinue = () => {
    if (selectedRole) {
      updateUserRole(selectedRole);
      router.replace('/(tabs)');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <BackButton iconColor={colors.neutral.white} backgroundColor="rgba(255, 255, 255, 0.1)" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h1" color="inverse" align="center">
            Choose Your Role
          </Typography>
          <Typography variant="body" color="inverse" align="center" style={styles.subtitle}>
            Select how you'd like to use Renzi
          </Typography>
        </View>
        <View style={styles.rolesContainer}>
          {roleOptions.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleRoleSelect(role.id as User['role'])}
              activeOpacity={0.8}
            >
              <Card style={[styles.roleCard, selectedRole === role.id && styles.selectedCard]}>
                <View style={styles.roleContent}>
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <Typography variant="h4" style={styles.roleTitle}>
                    {role.title}
                  </Typography>
                  <Typography variant="body" color="secondary" align="center">
                    {role.description}
                  </Typography>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.footer}>
          <Typography variant="caption" color="inverse" align="center" style={styles.note}>
            Note: Investor role will be unlocked after your first investment
          </Typography>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedRole}
            style={styles.continueButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.navy,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxxl,
    marginTop: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.md,
    opacity: 0.8,
  },
  rolesContainer: {
    flex: 1,
    gap: spacing.lg,
  },
  roleCard: {
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.medium,
  },
  selectedCard: {
    borderColor: colors.primary.gold,
    ...shadow.gold,
  },
  roleContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  roleTitle: {
    marginBottom: spacing.sm,
  },
  footer: {
    gap: spacing.lg,
  },
  note: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  continueButton: {
    marginTop: spacing.md,
  },
});