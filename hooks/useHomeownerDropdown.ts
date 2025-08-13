import { useAmenitiesDropdown, usePropertyRulesDropdown } from "@/services/homeownerDropdown";
import { Amenity, PropertyRule } from "@/types/homeownerDropdown";

interface UseHomeownerDropdownReturn {
  amenities: Amenity[];
  amenitiesLoading: boolean;
  amenitiesError: any;
  amenitiesTotal: number;
  propertyRules: PropertyRule[];
  propertyRulesLoading: boolean;
  propertyRulesError: any;
  propertyRulesTotal: number;
}

export const useHomeownerDropdown = (): UseHomeownerDropdownReturn => {
  const {
    data: amenitiesData,
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useAmenitiesDropdown();

  const {
    data: propertyRulesData,
    isLoading: propertyRulesLoading,
    error: propertyRulesError,
  } = usePropertyRulesDropdown();

  const amenities = amenitiesData?.data?.amenities || [];
  const amenitiesTotal = amenitiesData?.data?.total || 0;
  const propertyRules = propertyRulesData?.data?.rules || [];
  const propertyRulesTotal = propertyRulesData?.data?.total || 0;

  return {
    amenities,
    amenitiesLoading,
    amenitiesError,
    amenitiesTotal,
    propertyRules,
    propertyRulesLoading,
    propertyRulesError,
    propertyRulesTotal,
  };
};
