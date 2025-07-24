import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export const countryCodes: CountryCode[] = [
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", phoneCode: "+44" },
  { code: "CA", name: "Canada", flag: "🇨🇦", phoneCode: "+1" },
  { code: "AU", name: "Australia", flag: "🇦🇺", phoneCode: "+61" },
  { code: "DE", name: "Germany", flag: "🇩🇪", phoneCode: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", phoneCode: "+33" },
  { code: "IT", name: "Italy", flag: "🇮🇹", phoneCode: "+39" },
  { code: "ES", name: "Spain", flag: "🇪🇸", phoneCode: "+34" },
  { code: "JP", name: "Japan", flag: "🇯🇵", phoneCode: "+81" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", phoneCode: "+65" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", phoneCode: "+971" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", phoneCode: "+41" },
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "+91" },
  { code: "CN", name: "China", flag: "🇨🇳", phoneCode: "+86" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", phoneCode: "+55" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", phoneCode: "+52" },
  { code: "RU", name: "Russia", flag: "🇷🇺", phoneCode: "+7" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", phoneCode: "+82" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", phoneCode: "+66" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", phoneCode: "+60" },
];

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  selectedCountry?: CountryCode;
  onCountryChange?: (country: CountryCode) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "Enter your mobile number",
  error,
  selectedCountry,
  onCountryChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCountry, setCurrentCountry] = useState<CountryCode>(
    selectedCountry || countryCodes.find(c => c.code === "US") || countryCodes[0]
  );

  // Sync currentCountry with selectedCountry prop
  useEffect(() => {
    if (selectedCountry && selectedCountry.code !== currentCountry.code) {
      setCurrentCountry(selectedCountry);
    }
  }, [selectedCountry]);

  // Auto-detect user country (defaulting to US for now, can be enhanced with location detection)
  useEffect(() => {
    if (!selectedCountry) {
      // Simple auto-detection - can be enhanced with actual location detection
      const defaultCountry = countryCodes.find(c => c.code === "US") || countryCodes[0];
      setCurrentCountry(defaultCountry);
      onCountryChange?.(defaultCountry);
    }
  }, [selectedCountry, onCountryChange]);

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.phoneCode.includes(searchQuery)
  );

  const handleCountrySelect = (country: CountryCode) => {
    setCurrentCountry(country);
    onCountryChange?.(country);
    setIsModalVisible(false);
    setSearchQuery("");
  };

  const renderCountryItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.phoneCode}>{item.phoneCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.flag}>{currentCountry.flag}</Text>
          <Text style={styles.phoneCodeText}>{currentCountry.phoneCode}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
        
        <View style={styles.separator} />
        
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
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
  
  inputContainer: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    shadowColor: colors.neutral.black,
    borderWidth: 1,
  },
  
  inputError: {
    borderColor: colors.status.error,
  },
  
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  
  flag: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  
  phoneCodeText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
    marginRight: spacing.xs,
  },
  
  arrow: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  
  separator: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.light,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
  
  phoneCode: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500",
  },
});