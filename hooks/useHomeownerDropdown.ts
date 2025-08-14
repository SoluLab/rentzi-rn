import { useAmenitiesDropdown, usePropertyRulesDropdown, usePropertyTypesDropdown, usePropertyFeaturesDropdown, useZoningClassificationsDropdown } from "@/services/homeownerDropdown";
import { Amenity, PropertyRule, PropertyType, PropertyFeature, ZoningClassification } from "@/types/homeownerDropdown";

interface UseHomeownerDropdownReturn {
  amenities: Amenity[];
  amenitiesLoading: boolean;
  amenitiesError: any;
  amenitiesTotal: number;
  propertyRules: PropertyRule[];
  propertyRulesLoading: boolean;
  propertyRulesError: any;
  propertyRulesTotal: number;
  propertyTypes: PropertyType[];
  propertyTypesLoading: boolean;
  propertyTypesError: any;
  propertyTypesTotal: number;
  propertyFeatures: PropertyFeature[];
  propertyFeaturesLoading: boolean;
  propertyFeaturesError: any;
  propertyFeaturesTotal: number;
  zoningClassifications: ZoningClassification[];
  zoningClassificationsLoading: boolean;
  zoningClassificationsError: any;
  zoningClassificationsTotal: number;
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

  const {
    data: propertyTypesData,
    isLoading: propertyTypesLoading,
    error: propertyTypesError,
  } = usePropertyTypesDropdown();

  const {
    data: propertyFeaturesData,
    isLoading: propertyFeaturesLoading,
    error: propertyFeaturesError,
  } = usePropertyFeaturesDropdown();

  const {
    data: zoningClassificationsData,
    isLoading: zoningClassificationsLoading,
    error: zoningClassificationsError,
  } = useZoningClassificationsDropdown();

  const amenities = amenitiesData?.data?.amenities || [];
  const amenitiesTotal = amenitiesData?.data?.total || 0;
  const propertyRules = propertyRulesData?.data?.rules || [];
  const propertyRulesTotal = propertyRulesData?.data?.total || 0;
  const propertyTypes = propertyTypesData?.data?.categories || [];
  const propertyTypesTotal = propertyTypesData?.data?.total || 0;
  const propertyFeatures = propertyFeaturesData?.data?.features || [];
  const propertyFeaturesTotal = propertyFeaturesData?.data?.total || 0;
  const zoningClassifications = zoningClassificationsData?.data?.classifications || [];
  const zoningClassificationsTotal = zoningClassificationsData?.data?.total || 0;

  return {
    amenities,
    amenitiesLoading,
    amenitiesError,
    amenitiesTotal,
    propertyRules,
    propertyRulesLoading,
    propertyRulesError,
    propertyRulesTotal,
    propertyTypes,
    propertyTypesLoading,
    propertyTypesError,
    propertyTypesTotal,
    propertyFeatures,
    propertyFeaturesLoading,
    propertyFeaturesError,
    propertyFeaturesTotal,
    zoningClassifications,
    zoningClassificationsLoading,
    zoningClassificationsError,
    zoningClassificationsTotal,
  };
};
