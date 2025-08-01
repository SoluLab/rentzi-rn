import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useHomeownerCreateProperty } from './services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TestPropertyCreation = () => {
  const createPropertyMutation = useHomeownerCreateProperty();

  const testCreateProperty = async () => {
    try {
      // First check if we have a token
      const token = await AsyncStorage.getItem("token");
      console.log("Current token:", token);

      if (!token) {
        Alert.alert("Error", "No authentication token found. Please login first.");
        return;
      }

      const propertyData = {
        name: "Luxury Villa",
        description: "Beautiful 3-bedroom villa with ocean view",
        category: "villa",
        location: {
          address: "123 Ocean Drive",
          city: "Miami",
          state: "Florida",
          country: "USA",
          zipCode: "33139",
          coordinates: {
            latitude: 25.7617,
            longitude: -80.1918
          }
        },
        pricing: {
          basePrice: 500,
          currency: "USD",
          cleaningFee: 50,
          securityDeposit: 200
        },
        capacity: {
          maxGuests: 6,
          bedrooms: 3,
          bathrooms: 2,
          beds: 3
        },
        amenities: ["wifi", "pool", "kitchen", "parking"],
        features: ["oceanView", "balcony", "airConditioning"],
        rules: ["noSmoking", "noPets"],
        status: "draft"
      };

      console.log("Sending property data:", propertyData);
      
      createPropertyMutation.mutate(propertyData, {
        onSuccess: (data) => {
          console.log("Property created successfully:", data);
          Alert.alert("Success", "Property created successfully!");
        },
        onError: (error) => {
          console.error("Error creating property:", error);
          Alert.alert("Error", `Failed to create property: ${error.message}`);
        }
      });
    } catch (error) {
      console.error("Error in test function:", error);
      Alert.alert("Error", "Unexpected error occurred");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Test Property Creation
      </Text>
      <Button
        title="Create Test Property"
        onPress={testCreateProperty}
        disabled={createPropertyMutation.isPending}
      />
      {createPropertyMutation.isPending && (
        <Text style={{ marginTop: 10 }}>Creating property...</Text>
      )}
      {createPropertyMutation.isError && (
        <Text style={{ marginTop: 10, color: 'red' }}>
          Error: {createPropertyMutation.error?.message}
        </Text>
      )}
    </View>
  );
}; 