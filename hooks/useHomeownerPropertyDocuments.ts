import { usePropertyDocumentsList } from "@/services/homeownerPropertyDocuments";
import { PropertyDocument } from "@/types/homeownerPropertyDocuments";

interface UseHomeownerPropertyDocumentsReturn {
  propertyDocuments: PropertyDocument[];
  propertyDocumentsLoading: boolean;
  propertyDocumentsError: any;
  propertyDocumentsTotal: number;
}

export const useHomeownerPropertyDocuments = (propertyType?: string): UseHomeownerPropertyDocumentsReturn => {
  const {
    data: propertyDocumentsData,
    isLoading: propertyDocumentsLoading,
    error: propertyDocumentsError,
  } = usePropertyDocumentsList(propertyType);

  const propertyDocuments = propertyDocumentsData?.data?.documents || [];
  const propertyDocumentsTotal = propertyDocumentsData?.data?.total || 0;

  return {
    propertyDocuments,
    propertyDocumentsLoading,
    propertyDocumentsError,
    propertyDocumentsTotal,
  };
};
