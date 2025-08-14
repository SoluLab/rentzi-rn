import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getHomeownerAuthBaseURL, ENDPOINTS } from "@/constants/urls";
import {
  PropertyDocumentsResponse,
  PropertyDocumentsApiError,
} from "@/types/homeownerPropertyDocuments";
import { apiGet, queryKeys } from "./apiClient";

// Property documents list API
export const usePropertyDocumentsList = (
  options?: Omit<
    UseQueryOptions<PropertyDocumentsResponse, PropertyDocumentsApiError>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PropertyDocumentsResponse, PropertyDocumentsApiError>({
    queryKey: queryKeys.propertyDocuments(),
    queryFn: async () => {
      const baseURL = getHomeownerAuthBaseURL();
      console.log(
        "[API Client] Property documents list URL:",
        `${baseURL}${ENDPOINTS.HOMEOWNER_PROPERTY.DOCUMENTS_LIST}`
      );

      const response = await apiGet<PropertyDocumentsResponse>({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROPERTY.DOCUMENTS_LIST,
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
