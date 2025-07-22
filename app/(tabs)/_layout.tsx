import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { Home, User, Bot, CalendarFold, BriefcaseBusiness } from 'lucide-react-native';
export default function TabLayout() {
  const { user } = useAuthStore();
  const isInvestor = user?.investmentStatus;
  return (
    <>
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
            title: 'Explore',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        {/*
          {user?.role === 'investor' && (
          <Tabs.Screen
            name="marketplace"
            options={{
              title: 'Marketplace ',
              tabBarIcon: ({ color, size }) => <BriefcaseBusiness size={size} color={color} />,
            }}
          />
        )}
        */}
        <Tabs.Screen
          name="search"
          options={{
            title: 'My Stays',
            tabBarIcon: ({ color, size }) => <CalendarFold size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="ai-assistant"
          options={{
            title: 'AI Assistant',
            tabBarIcon: ({ color, size }) => <Bot size={size} color={color} />,
          }}
        />
        {user?.role === 'investor' && (
          <Tabs.Screen
            name="portfolio"
            options={{
              title: 'Portfolio',
              tabBarIcon: ({ color, size }) => <BriefcaseBusiness size={size} color={color} />,
            }}
          />
        )}
       
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}