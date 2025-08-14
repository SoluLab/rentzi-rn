import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { FileText, Upload, X, Check, Plus } from "lucide-react-native";
import { useCommercialPropertyStore } from "@/stores/commercialPropertyStore";
import {
  useHomeownerSavePropertyDraft,
  useHomeownerUploadPropertyFiles,
} from "@/services/homeownerAddProperty";
import { usePropertyDocumentsList } from "@/services/homeownerPropertyDocuments";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import { uploadToPinata } from "@/utils/ipfsUpload";
import { PropertyDocument } from "@/types/homeownerPropertyDocuments";

interface DocumentFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  uploadedUrl?: string; // Add uploaded URL field
  uploadedKey?: string; // Add uploaded key field
  apiDocumentId?: string; // Link to API document if it exists
}

interface DocumentsFormData {
  [key: string]: DocumentFile | null; // Dynamic key-value pairs
}

interface DocumentsValidationErrors {
  [key: string]: string | undefined; // Dynamic key-value pairs
}

const MAX_FILE_SIZE_MB = 50;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export default function CommercialPropertyDocumentsUploadScreen() {
  const router = useRouter();
  const { data, updateDocuments } = useCommercialPropertyStore();

  // Fetch documents from API
  const { data: apiDocuments, isLoading: isLoadingDocuments } = usePropertyDocumentsList();

  // API mutation hook for updating property draft
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Commercial property draft saved successfully with documents:",
        response
      );
      // Navigate to legal consents step
      router.push("/add-commercial-details/commercial-property-legal-consents");
    },
    onError: (error) => {
      console.error(
        "Error saving commercial property draft with documents:",
        error
      );
      Alert.alert("Error", "Failed to save property draft. Please try again.");
    },
  });

  // API mutation hook for uploading files
  const uploadFilesMutation = useHomeownerUploadPropertyFiles({
    onSuccess: (response) => {
      console.log("Files uploaded successfully:", response);
      // The uploaded URLs will be handled in the upload function
    },
    onError: (error) => {
      console.error("Error uploading files:", error);
      Alert.alert("Error", "Failed to upload files. Please try again.");
    },
  });

  const [formData, setFormData] = useState<DocumentsFormData>({});
  const [errors, setErrors] = useState<DocumentsValidationErrors>({});
  const [customDocuments, setCustomDocuments] = useState<Array<{id: string, name: string, description: string}>>([]);
  // Track upload status for each document field individually
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(new Set());

  // Initialize form data when API documents are loaded
  useEffect(() => {
    if (apiDocuments?.data?.documents) {
      const initialFormData: DocumentsFormData = {};
      apiDocuments.data.documents.forEach((doc) => {
        const key = doc.fileName.toLowerCase().replace(/\s+/g, '');
        initialFormData[key] = null;
      });
      
      // Merge with existing data from store if it exists
      if (data.documents) {
        const storeDocuments = data.documents as any;
        Object.keys(storeDocuments).forEach(key => {
          if (storeDocuments[key]) {
            initialFormData[key] = storeDocuments[key];
          }
        });
      }
      
      setFormData(initialFormData);
    }
  }, [apiDocuments, data.documents]);

  // Validation functions
  const validateDocument = (
    document: DocumentFile | null,
    fieldName: string
  ): string | undefined => {
    if (!document) {
      return `${fieldName} is required`;
    }

    if (document.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `${fieldName} file size (${formatFileSize(
        document.size
      )}) exceeds ${MAX_FILE_SIZE_MB}MB limit`;
    }

    if (!ALLOWED_FILE_TYPES.includes(document.type.toLowerCase())) {
      return `${fieldName} must be a PDF, JPG, or PNG file`;
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: DocumentsValidationErrors = {};

    // Validate all required documents from API
    if (apiDocuments?.data?.documents) {
      apiDocuments.data.documents.forEach((doc) => {
        if (doc.isRequired) {
          const key = doc.fileName.toLowerCase().replace(/\s+/g, '');
          newErrors[key] = validateDocument(formData[key], doc.fileName);
        }
      });
    }

    // Validate custom documents
    customDocuments.forEach((customDoc) => {
      const key = customDoc.id;
      if (formData[key]) {
        newErrors[key] = validateDocument(formData[key], customDoc.name);
      }
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const updateFormData = (
    field: string,
    value: DocumentFile | null
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateDocuments(newFormData);

    // Clear error when user uploads a document
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const uploadDocumentToServer = async (
    document: DocumentFile,
    documentField: string
  ) => {
    try {
      setUploadingFields((prev) => new Set([...prev, documentField]));
      // 1. Upload to Pinata (IPFS)
      const ipfsUrl = await uploadToPinata({
        uri: document.uri,
        name: document.name,
        type: document.type,
      });
      // 2. Update formData with IPFS url
      const updatedDocument: DocumentFile = {
        ...document,
        uploadedUrl: ipfsUrl,
        uploadedKey: document.name,
      };
      updateFormData(documentField, updatedDocument);
      setUploadingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentField);
        return newSet;
      });
      // 3. (Optional) If you still want to upload to your backend, do it here
      // await uploadFilesMutation.mutateAsync({ ... })
    } catch (error: any) {
      setUploadingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentField);
        return newSet;
      });
      console.error("Error uploading document to IPFS:", error);
      Alert.alert(
        "Upload Failed",
        "Failed to upload document to IPFS. Please try again."
      );
    }
  };

  const pickDocument = async (
    fieldName: string,
    displayName: string
  ) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.size && asset.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          Alert.alert(
            "Error",
            `${displayName} file size (${(asset.size / (1024 * 1024)).toFixed(
              1
            )}MB) exceeds ${MAX_FILE_SIZE_MB}MB limit.`
          );
          return;
        }

        const documentFile: DocumentFile = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          type: asset.mimeType || "application/pdf",
        };

        updateFormData(fieldName, documentFile);

        // Upload document immediately
        await uploadDocumentToServer(documentFile, fieldName);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to upload ${displayName}. Please try again.`
      );
    }
  };

  const removeDocument = (fieldName: string) => {
    updateFormData(fieldName, null);
  };

  const retryUpload = async (documentField: string) => {
    const document = formData[documentField];
    if (document && !document.uploadedUrl) {
      console.log(
        `Retrying upload for document ${documentField}:`,
        document.name
      );
      await uploadDocumentToServer(document, documentField);
    }
  };

  const addCustomDocument = () => {
    const customId = `custom_${Date.now()}`;
    const newCustomDoc = {
      id: customId,
      name: "Custom Document",
      description: "Additional document for your property"
    };
    setCustomDocuments(prev => [...prev, newCustomDoc]);
    setFormData(prev => ({ ...prev, [customId]: null }));
  };

  const removeCustomDocument = (customId: string) => {
    setCustomDocuments(prev => prev.filter(doc => doc.id !== customId));
    setFormData(prev => {
      const newFormData = { ...prev };
      delete newFormData[customId];
      return newFormData;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[customId];
      return newErrors;
    });
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
      type: "commercial",
    };

    // Helper function to extract CID from IPFS URL
    const extractCidFromUrl = (url: string): string => {
      if (url.includes("ipfs/")) {
        return url.split("ipfs/")[1];
      }
      return "";
    };

    // Helper function to create document object with new structure
    const createDocumentObject = (
      document: DocumentFile,
      defaultKey: string
    ) => {
      const ipfsUrl = document.uploadedUrl || "";
      const cid = extractCidFromUrl(ipfsUrl);
      const baseIpfsUrl = "https://gateway.pinata.cloud/ipfs/";

      return {
        url: ipfsUrl,
        cid: cid,
        ipfsUrl: baseIpfsUrl,
      };
    };

    // Transform documents to match new schema format
    const documents: any = {};

    // Process all documents from form data
    Object.entries(formData).forEach(([key, document]) => {
      if (document && document.uploadedUrl) {
        // Find the corresponding API document to get the proper field name
        const apiDoc = apiDocuments?.data?.documents.find(doc => 
          doc.fileName.toLowerCase().replace(/\s+/g, '') === key
        );
        
        if (apiDoc) {
          // Use the API document's fileName as the key
          const fieldKey = apiDoc.fileName.toLowerCase().replace(/\s+/g, '');
          documents[fieldKey] = [
            createDocumentObject(document, fieldKey),
          ];
        } else {
          // Custom document
          documents[key] = [
            createDocumentObject(document, key),
          ];
        }
      }
    });

    if (Object.keys(documents).length > 0) {
      apiData.documents = documents;
    }

    return apiData;
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Check if there are unuploaded documents
      const allDocuments = Object.values(formData).filter(Boolean) as DocumentFile[];
      const unuploadedDocuments = allDocuments.filter(
        (doc) => !doc.uploadedUrl
      );

      if (unuploadedDocuments.length > 0) {
        Alert.alert(
          "Unuploaded Documents",
          `${unuploadedDocuments.length} documents are not yet uploaded to the server. You can continue, but the documents may not be saved properly.`,
          [
            { text: "Continue Anyway", onPress: () => proceedWithDraft() },
            { text: "Upload First", style: "cancel" },
          ]
        );
      } else {
        await proceedWithDraft();
      }
    }
  };

  const proceedWithDraft = async () => {
    try {
      updateDocuments(formData);
      const apiData = transformFormDataToApiFormat();
      const propertyId = data.propertyId;
      console.log(
        "Commercial Property ID from store before draft API:",
        propertyId
      );
      if (!propertyId) {
        Alert.alert(
          "Error",
          "Property ID not found. Please go back and try again."
        );
        return;
      }
      console.log("Saving commercial property draft with documents data:", {
        propertyId,
        ...apiData,
      });
      await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
    } catch (error) {
      console.error("Error in proceedWithDraft:", error);
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: DocumentsValidationErrors = {};

    // Validate all required documents from API
    if (apiDocuments?.data?.documents) {
      apiDocuments.data.documents.forEach((doc) => {
        if (doc.isRequired) {
          const key = doc.fileName.toLowerCase().replace(/\s+/g, '');
          newErrors[key] = validateDocument(formData[key], doc.fileName);
        }
      });
    }

    // Validate custom documents
    customDocuments.forEach((customDoc) => {
      const key = customDoc.id;
      if (formData[key]) {
        newErrors[key] = validateDocument(formData[key], customDoc.name);
      }
    });

    // Check if all required documents are uploaded and no validation errors
    return Object.values(newErrors).every((error) => !error);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderDocumentField = (
    fieldName: string,
    displayName: string,
    description: string,
    isMandatory: boolean = true,
    isCustom: boolean = false
  ) => {
    const document = formData[fieldName];
    const error = errors[fieldName];
    const isUploadingField = uploadingFields.has(fieldName);

    return (
      <View style={styles.documentField}>
        <View style={styles.fieldHeader}>
          <Typography variant="h6" style={styles.fieldTitle}>
            {displayName} {isMandatory && "*"}
          </Typography>
          {!isMandatory && !isCustom && (
            <Typography
              variant="caption"
              color="secondary"
              style={styles.optionalText}
            >
              (Optional)
            </Typography>
          )}
          {isCustom && (
            <TouchableOpacity
              style={styles.removeCustomButton}
              onPress={() => removeCustomDocument(fieldName)}
            >
              <X size={16} color={colors.status.error} />
            </TouchableOpacity>
          )}
        </View>

        <Typography
          variant="caption"
          color="secondary"
          style={styles.fieldDescription}
        >
          {description}
        </Typography>

        <Button
          title={
            isUploadingField
              ? "Uploading..."
              : document
              ? "Replace Document"
              : "Upload Document"
          }
          onPress={() => pickDocument(fieldName, displayName)}
          disabled={isUploadingField || uploadFilesMutation.isPending}
          variant={document ? "outline" : "primary"}
          style={styles.uploadButton}
        />

        {error && (
          <Typography variant="caption" color="error" style={styles.errorText}>
            {error}
          </Typography>
        )}

        {document && (
          <View style={styles.documentPreview}>
            <View style={styles.documentInfo}>
              <FileText size={20} color={colors.primary.gold} />
              <View style={styles.documentDetails}>
                <Typography variant="body" style={styles.documentName}>
                  {document.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {formatFileSize(document.size)}
                </Typography>
              </View>
              <View style={styles.documentActions}>
                {isUploadingField ? (
                  <View style={styles.uploadingBadge}>
                    <Typography variant="caption" style={styles.uploadingText}>
                      Uploading...
                    </Typography>
                  </View>
                ) : document.uploadedUrl ? (
                  <View style={styles.statusBadge}>
                    <Check size={12} color={colors.neutral.white} />
                    <Typography variant="caption" style={styles.statusText}>
                      Uploaded
                    </Typography>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => retryUpload(fieldName)}
                  >
                    <Typography variant="caption" style={styles.retryText}>
                      ↻ Retry
                    </Typography>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeDocument(fieldName)}
                >
                  <X size={16} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoadingDocuments) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <Header title="Required Documents" />
        <View style={styles.loadingContainer}>
          <Typography variant="h4">Loading documents...</Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Header title="Required Documents" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h4" style={styles.sectionTitle}>
          Upload Required Documents
        </Typography>

        <Typography
          variant="body"
          color="secondary"
          style={styles.sectionDescription}
        >
          Please upload all mandatory documents to complete your commercial
          property listing. Additional documents can be uploaded if needed.
        </Typography>

        {/* API Documents Section */}
        {apiDocuments?.data?.documents && (
        <View style={styles.documentsSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
              Required Documents *
          </Typography>

            {apiDocuments.data.documents
              .filter(doc => doc.isRequired)
              .map((doc) => {
                const key = doc.fileName.toLowerCase().replace(/\s+/g, '');
                return renderDocumentField(
                  key,
                  doc.fileName,
                  doc.description,
                  true
                );
              })}

            <Typography variant="h5" style={styles.sectionSubtitle}>
              Optional Documents
            </Typography>

            {apiDocuments.data.documents
              .filter(doc => !doc.isRequired)
              .map((doc) => {
                const key = doc.fileName.toLowerCase().replace(/\s+/g, '');
                return renderDocumentField(
                  key,
                  doc.fileName,
                  doc.description,
                  false
                );
              })}
          </View>
        )}

        {/* Custom Documents Section */}
        {customDocuments.length > 0 && (
          <View style={styles.documentsSection}>
            <Typography variant="h5" style={styles.sectionSubtitle}>
              Additional Documents
            </Typography>
            {customDocuments.map((customDoc) => 
              renderDocumentField(
                customDoc.id,
                customDoc.name,
                customDoc.description,
                false,
                true
              )
            )}
          </View>
        )}

        {/* Next Button */}
        <Button
          title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
          onPress={handleNext}
          disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
          style={styles.nextButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  sectionDescription: {
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  documentsSection: {
    marginBottom: spacing.xl,
  },
  sectionSubtitle: {
    marginBottom: spacing.lg,
    fontWeight: "600",
    color: colors.primary.navy,
  },
  documentField: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  fieldTitle: {
    fontWeight: "600",
    color: colors.text.primary,
  },
  optionalText: {
    marginLeft: spacing.xs,
    fontStyle: "italic",
  },
  fieldDescription: {
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  uploadButton: {
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  documentPreview: {
    marginTop: spacing.sm,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
  },
  documentDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  documentName: {
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  documentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  statusText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  removeButton: {
    padding: spacing.xs,
  },
  retryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.gold,
    borderRadius: 12,
  },
  retryText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  uploadingBadge: {
    backgroundColor: colors.primary.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  uploadingText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  addCustomSection: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  addCustomButton: {
    width: "100%",
  },
  removeCustomButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    marginTop: spacing.xl,
  },
});
