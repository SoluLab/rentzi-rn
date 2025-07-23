import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from "react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
];

interface CountryPickerProps {
  label?: string;
  selectedCountry?: Country;
  onCountrySelect: (country: Country) => void;
  error?: string;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  label,
  selectedCountry,
  onCountrySelect,
  error,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country);
    setIsVisible(false);
    setSearchQuery("");
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryCode}>({item.code})</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.selector, error && styles.error]}
        onPress={() => setIsVisible(true)}
      >
        {selectedCountry ? (
          <View style={styles.selectedCountry}>
            <Text style={styles.flag}>{selectedCountry.flag}</Text>
            <Text style={styles.selectedText}>{selectedCountry.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>Select Country</Text>
        )}
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.secondary}
          />
          
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            style={styles.countryList}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  
  selector: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  
  error: {
    borderColor: colors.status.error,
  },
  
  selectedCountry: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  flag: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  
  selectedText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  
  placeholder: {
    fontSize: 16,
    color: colors.text.secondary,
    flex: 1,
  },
  
  arrow: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  
  closeButton: {
    padding: spacing.sm,
  },
  
  closeText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  
  searchInput: {
    margin: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    fontSize: 16,
    color: colors.text.primary,
  },
  
  countryList: {
    flex: 1,
  },
  
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  countryName: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  
  countryCode: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});