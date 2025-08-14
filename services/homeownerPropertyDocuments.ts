import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getHomeownerAuthBaseURL, ENDPOINTS } from "@/constants/urls";
import {
  PropertyDocumentsResponse,
  PropertyDocumentsApiError,
} from "@/types/homeownerPropertyDocuments";
import { apiGet, queryKeys } from "./apiClient";

// Property documents list API
export const usePropertyDocumentsList = (
  propertyType?: string,
  options?: Omit<
    UseQueryOptions<PropertyDocumentsResponse, PropertyDocumentsApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PropertyDocumentsResponse, PropertyDocumentsApiError>({
    queryKey: queryKeys.propertyDocuments(propertyType),
    queryFn: async () => {
      const baseURL = getHomeownerAuthBaseURL();
      const endpoint = ENDPOINTS.HOMEOWNER_PROPERTY.DOCUMENTS_LIST(propertyType);
      console.log(
        "[API Client] Property documents list URL:",
        `${baseURL}${endpoint}`
      );

      const response = await apiGet<PropertyDocumentsResponse>({
        baseURL,
        endpoint,
        auth: true,  
      });

      console.log(
        "[API Client] Property documents list response:",
        response
      );
      return response;
    },
    ...options,
  });
};
