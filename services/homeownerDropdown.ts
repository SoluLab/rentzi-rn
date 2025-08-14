import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getHomeownerAuthBaseURL, ENDPOINTS } from "@/constants/urls";
import { AmenitiesResponse, PropertyRulesResponse, PropertyTypesResponse, PropertyFeaturesResponse, DropdownApiError, ZoningClassificationsResponse } from "@/types/homeownerDropdown";
import { apiGet, queryKeys } from "./apiClient";

// Amenities dropdown API
export const useAmenitiesDropdown = (
  options?: Omit<
    UseQueryOptions<AmenitiesResponse, DropdownApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<AmenitiesResponse, DropdownApiError>({
    queryKey: queryKeys.amenities(),
    queryFn: async () => {
      const baseURL = getHomeownerAuthBaseURL();
      console.log("[API Client] Amenities dropdown URL:", `${baseURL}/property/dropdowns/amenities`);
      
      const response = await apiGet<AmenitiesResponse>({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.AMENITIES_DROPDOWN,
        auth: true, // Requires JWT bearer token
      });
      
      console.log("[API Client] Amenities dropdown response:", response);
      return response;
    },
    ...options,
  });
};

// Property rules dropdown API
export const usePropertyRulesDropdown = (
  options?: Omit<
    UseQueryOptions<PropertyRulesResponse, DropdownApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PropertyRulesResponse, DropdownApiError>({
    queryKey: queryKeys.propertyRules(),
    queryFn: async () => {
      const baseURL = getHomeownerAuthBaseURL();
      console.log("[API Client] Property rules dropdown URL:", `${baseURL}/property/dropdowns/rules`);
      
      const response = await apiGet<PropertyRulesResponse>({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.RULES_DROPDOWN,
        auth: true, // Requires JWT bearer token
      });
      
      console.log("[API Client] Property rules dropdown response:", response);
      return response;
    },
    ...options,
  });
};

// Property types dropdown API
export const usePropertyTypesDropdown = (
  options?: Omit<
    UseQueryOptions<PropertyTypesResponse, DropdownApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PropertyTypesResponse, DropdownApiError>({
    queryKey: queryKeys.propertyTypes(),
    queryFn: async () => {
      const baseURL = getHomeownerAuthBaseURL();
      console.log("[API Client] Property types dropdown URL:", `${baseURL}${ENDPOINTS.HOMEOWNER_PROPERTY.TYPES_DROPDOWN}`);
      
      const response = await apiGet<PropertyTypesResponse>({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.TYPES_DROPDOWN,
        auth: true, // Requires JWT bearer token
      });
      
      console.log("[API Client] Property types dropdown response:", response);
      return response;
    },
    ...options,
  });
};

// Property features dropdown API
export const usePropertyFeaturesDropdown = (
  options?: Omit<
    UseQueryOptions<PropertyFeaturesResponse, DropdownApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PropertyFeaturesResponse, DropdownApiError>({
    queryKey: queryKeys.propertyFeatures(),
    queryFn: async () => {
      const baseURL = getHomeownerAuthBaseURL();
      console.log("[API Client] Property features dropdown URL:", `${baseURL}/property/dropdowns/features`);
      
      const response = await apiGet<PropertyFeaturesResponse>({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.FEATURES_DROPDOWN,
        auth: true, // Requires JWT bearer token
      });
      
      console.log("[API Client] Property features dropdown response:", response);
      return response;
    },
    ...options,
  });
};

// Zoning classifications dropdown API
export const useZoningClassificationsDropdown = (
  options?: Omit<
    UseQueryOptions<ZoningClassificationsResponse, DropdownApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ZoningClassificationsResponse, DropdownApiError>({
    queryKey: queryKeys.zoningClassifications(),
    queryFn: async () => {
      const baseURL = getHomeownerAuthBaseURL();
      console.log("[API Client] Zoning classifications dropdown URL:", `${baseURL}${ENDPOINTS.HOMEOWNER_PROPERTY.ZONING_CLASSIFICATIONS_DROPDOWN}`);

      const response = await apiGet<ZoningClassificationsResponse>({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.ZONING_CLASSIFICATIONS_DROPDOWN,
        auth: true,
      });

      console.log("[API Client] Zoning classifications dropdown response:", response);
      return response;
    },
    ...options,
  });
};


