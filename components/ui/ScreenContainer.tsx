import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/radius';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: any;
}

export function ScreenContainer({ children, scrollable = true, style }: ScreenContainerProps) {
  const Container = scrollable ? ScrollView : View;
  
  return (
    <Container 
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={scrollable ? styles.scrollContent : undefined}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
  },
  scrollContent: {
    flexGrow: 1,
  },
});