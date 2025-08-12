import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "./Typography";
import { Button } from "./Button";
import { DatePicker } from "./DatePicker";
import { Stepper } from "./Stepper";
import { RangeSlider } from "./RangeSlider";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { shadow } from "@/constants/shadow";

import {
  X,
  Calendar,
  CheckCircle2,
  Bed,
  Users,
  DollarSign,
  Bath, // <-- Add Bath icon if available
} from "lucide-react-native";

const { height: screenHeight } = Dimensions.get("window");

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: any;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
}
const propertyTypes = [
  "Apartment",
  "Villa",
  "Penthouse",
  "Townhouse",
  "Studio",
  "Loft",
];
const amenities = [
  "WiFi",
  "Pool",
  "Gym",
  "Spa",
  "Parking",
  "Balcony",
  "Kitchen",
  "AC",
  "Heating",
  "Washer",
  "Dryer",
  "TV",
  "Fireplace",
  "Garden",
  "Terrace",
  "Elevator",
];
export function FilterModal({
  visible,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}: FilterModalProps) {
  // Ensure filters has default values to prevent undefined errors
  const defaultFilters = {
    priceRange: [0, 200000],
    bedrooms: 0,
    guests: 1,
    bathrooms: 1,
    propertyTypes: [],
    amenities: [],
    checkInDate: null,
    checkOutDate: null,
    location: "",
    ...filters, // Override with actual filters if provided
  };
  
  const [localFilters, setLocalFilters] = useState(defaultFilters);
  
  // Update localFilters when filters prop changes
  useEffect(() => {
    const updatedFilters = {
      priceRange: [0, 200000],
      bedrooms: 0,
      guests: 1,
      bathrooms: 1,
      propertyTypes: [],
      amenities: [],
      checkInDate: null,
      checkOutDate: null,
      location: "",
      ...filters, // Override with actual filters if provided
    };
    setLocalFilters(updatedFilters);
  }, [filters]);
  
  const updateFilter = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };
  const handleClear = () => {
    const clearedFilters = {
      priceRange: [0, 200000],
      bedrooms: 0,
      guests: 1,
      propertyTypes: [],
      amenities: [],
      checkInDate: null,
      checkOutDate: null,
      location: "",
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };
  const togglePropertyType = (type: string) => {
    const current = localFilters.propertyTypes || [];
    const updated = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    updateFilter("propertyTypes", updated);
  };
  const toggleAmenity = (amenity: string) => {
    const current = localFilters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    updateFilter("amenities", updated);
  };
  return (
    <Modal
      visible={visible}
      animationType={"slide"}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={styles.safeContainer} edges={["top"]}>
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            {/* Close Icon */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Date Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Calendar size={20} color={colors.primary.gold} />
                  <Typography variant="h5">Available Dates</Typography>
                </View>
                <View style={styles.dateContainer}>
                  <View style={styles.dateInput}>
                    <Typography variant="caption" color="secondary">
                      Check-in
                    </Typography>
                    <DatePicker
                      date={localFilters.checkInDate}
                      onDateChange={(date: Date) => updateFilter("checkInDate", date)}
                      placeholder="Select date"
                      minimumDate={new Date()}
                    />
                  </View>
                  <View style={styles.dateInput}>
                    <Typography variant="caption" color="secondary">
                      Check-out
                    </Typography>
                    <DatePicker
                      date={localFilters.checkOutDate}
                      onDateChange={(date: Date) => updateFilter("checkOutDate", date)}
                      placeholder="Select date"
                      minimumDate={localFilters.checkInDate ? localFilters.checkInDate : new Date()}
                    />
                  </View>
                </View>
              </View>

              {/* Price Range Slider */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <DollarSign size={20} color={colors.primary.gold} />
                  <Typography variant="h5">Select your budget range</Typography>
                </View>
                <View style={styles.priceRangeContainer}>
                  <RangeSlider
                    min={0}
                    max={200000}
                    step={1000}
                    values={Array.isArray(localFilters.priceRange) ? localFilters.priceRange : [0, 200000]}
                    onValuesChange={(values) =>
                      updateFilter("priceRange", values)
                    }
                    width={280}
                    formatValue={(value) => `$${value.toLocaleString()}`}
                  />
                </View>
              </View>

              {/* Guests, Bedrooms, and Bathrooms Side by Side */}
              <View style={styles.section}>
                <View style={styles.guestBedroomContainer}>
                  <View style={styles.guestBedroomItem}>
                    <View style={styles.sectionHeader}>
                      <Users size={20} color={colors.primary.gold} />
                      <Typography variant="caption">Guests</Typography>
                    </View>
                      <Stepper
                        value={Number(localFilters.guests) || 1}
                        onValueChange={(value) => updateFilter("guests", value)}
                        min={1}
                        max={20}
                        label="Number of guests"
                        compact={true}
                      />
                  </View>
                  <View style={styles.guestBedroomItem}>
                    <View style={styles.sectionHeader}>
                      <Bed size={20} color={colors.primary.gold} />
                      <Typography variant="caption">Bedrooms</Typography>
                    </View>
                      <Stepper
                        value={Number(localFilters.bedrooms) || 0}
                        onValueChange={(value) => updateFilter("bedrooms", value)}
                        min={0}
                        max={10}
                        label="Number of bedrooms"
                        compact={true}
                      />
                  </View>
                  <View style={styles.guestBedroomItem}>
                    <View style={styles.sectionHeader}>
                      {/* Use Bath icon if available, otherwise fallback to Bed */}
                      {Bath ? (
                        <Bath size={20} color={colors.primary.gold} />
                      ) : (
                        <Bed size={20} color={colors.primary.gold} />
                      )}
                      <Typography variant="caption">Bathrooms</Typography>
                    </View>
                      <Stepper
                        value={Number(localFilters.bathrooms) || 1}
                        onValueChange={(value) => updateFilter("bathrooms", value)}
                        min={1}
                        max={10}
                        label="Number of bathrooms"
                        compact={true}
                      />
                  </View>
                </View>
              </View>

              {/* Property Types */}
              <View style={styles.section}>
                <Typography variant="h5" style={styles.sectionTitle}>
                  Property Type
                </Typography>
                <View style={styles.chipContainer}>
                  {propertyTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => togglePropertyType(type)}
                      style={[
                        styles.chip,
                        (localFilters.propertyTypes || []).includes(type) &&
                          styles.selectedChip,
                      ]}
                    >
                      {(localFilters.propertyTypes || []).includes(type) && (
                        <CheckCircle2 size={16} color={colors.neutral.white} />
                      )}
                      <Typography
                        variant="caption"
                        color={
                          (localFilters.propertyTypes || []).includes(type)
                            ? "inverse"
                            : "secondary"
                        }
                      >
                        {type}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Amenities */}
              <View style={styles.section}>
                <Typography variant="h5" style={styles.sectionTitle}>
                  Amenities
                </Typography>
                <View style={styles.chipContainer}>
                  {amenities.map((amenity) => (
                    <TouchableOpacity
                      key={amenity}
                      onPress={() => toggleAmenity(amenity)}
                      style={[
                        styles.chip,
                        (localFilters.amenities || []).includes(amenity) &&
                          styles.selectedChip,
                      ]}
                    >
                      {(localFilters.amenities || []).includes(amenity) && (
                        <CheckCircle2 size={16} color={colors.neutral.white} />
                      )}
                      <Typography
                        variant="caption"
                        color={
                          (localFilters.amenities || []).includes(amenity)
                            ? "inverse"
                            : "secondary"
                        }
                      >
                        {amenity}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <SafeAreaView style={styles.actionContainer} edges={["bottom"]}>
              <Button
                title="Clear"
                size="smMedium"
                onPress={handleClear}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Apply Filters"
                size="smMedium"
                onPress={handleApply}
                style={styles.actionButton}
              />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
  },
  safeContainer: {
    flex: 1,
    maxHeight: screenHeight * 0.8,
    backgroundColor: colors.background.card,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    padding: spacing.lg,
    ...shadow.large,
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.card,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    padding: 0,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dateInput: {
    flex: 1,
    gap: spacing.xs,
  },
  guestBedroomContainer: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  guestBedroomItem: {
    flex: 1,
  },
  priceRangeContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.lightGray,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  selectedChip: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  actionContainer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  actionButton: {
    flex: 1,
  },
});
