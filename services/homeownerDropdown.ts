import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getHomeownerAuthBaseURL, ENDPOINTS } from "@/constants/urls";
import { AmenitiesResponse, PropertyRulesResponse, PropertyTypesResponse, PropertyFeaturesResponse, DropdownApiError } from "@/types/homeownerDropdown";
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
      console.log("[API Client] Property types dropdown URL:", `${baseURL}/property/dropdowns/types`);
      
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


