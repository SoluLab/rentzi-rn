import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { 
  CheckCircle2, 
  User, 
  Building2, 
  Calendar, 
  DollarSign 
} from 'lucide-react-native';

export default function HomeownerTabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'light'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background.primary,
            borderTopColor: colors.border.light,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.primary.gold,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: spacing.xs,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <CheckCircle2 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="property-management"
          options={{
            title: 'Properties',
            tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="earnings"
          options={{
            title: 'Earnings',
            tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}