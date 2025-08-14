import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import {
  useResidentialPropertyStore,
  DocumentData,
} from "@/stores/residentialPropertyStore";
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

export default function ResidentialPropertyDocumentsUploadScreen() {
  const router = useRouter();
  const { data, updateDocumentsUpload, resetStore } =
    useResidentialPropertyStore();

  // Fetch documents from API
  const { data: apiDocuments, isLoading: isLoadingDocuments } =
    usePropertyDocumentsList("residential");

  // API mutation hook for updating property draft
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Residential property draft saved successfully with documents:",
        response
      );
      // Navigate to legal consents step
      router.push(
        "/add-residential-details/residential-property-legal-consents"
      );
    },
    onError: (error) => {
      console.error(
        "Error saving residential property draft with documents:",
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

  // Reset store if property was already submitted
  React.useEffect(() => {
    if (data.isSubmitted) {
      resetStore();
    }
  }, []);

  const [formData, setFormData] = useState<DocumentsFormData>({});
  const [errors, setErrors] = useState<DocumentsValidationErrors>({});
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocumentData, setPreviewDocumentData] =
    useState<DocumentFile | null>(null);
  // Track upload status for each document field individually
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(
    new Set()
  );

  // Initialize form data when API documents are loaded
  useEffect(() => {
    if (apiDocuments?.data?.documents) {
      const initialFormData: DocumentsFormData = {};
      apiDocuments.data.documents.forEach((doc) => {
        // Use fieldName from API response instead of generating from fileName
        const key = doc.fieldName || doc.fileName.toLowerCase().replace(/\s+/g, "");
        initialFormData[key] = null;
      });

      // Merge with existing data from store if it exists
      if (data.documentsUpload) {
        const storeDocuments = data.documentsUpload as any;
        Object.keys(storeDocuments).forEach((key) => {
          if (
            storeDocuments[key] &&
            typeof storeDocuments[key] === "object" &&
            storeDocuments[key].uri
          ) {
            initialFormData[key] = storeDocuments[key];
          }
        });
      }

      setFormData(initialFormData);
    }
  }, [apiDocuments, data.documentsUpload]);

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
          const key = doc.fieldName || doc.fileName.toLowerCase().replace(/\s+/g, "");
          newErrors[key] = validateDocument(formData[key], doc.fileName);
        }
      });
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const updateFormData = (field: string, value: DocumentFile | null) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Update store with new data
    const storeData = { ...data.documentsUpload, [field]: value };
    updateDocumentsUpload(storeData);

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

  const pickDocument = async (fieldName: string, displayName: string) => {
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

  const previewDocument = (document: DocumentFile) => {
    setPreviewDocumentData(document);
    setShowDocumentPreview(true);
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
      description: "Draft property description",
      type: "residential",
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
      apiDoc: any
    ) => {
      const ipfsUrl = document.uploadedUrl || "";
      const cid = extractCidFromUrl(ipfsUrl);
      const baseIpfsUrl = "https://gateway.pinata.cloud/ipfs/";

      return {
        _propertyDocument: apiDoc._id,
        url: ipfsUrl,
        cid: cid,
        ipfsUrl: baseIpfsUrl,
      };
    };

    // Transform documents to match new schema format
    const documents: any = {};

    // Process only documents that match the API response structure
    if (apiDocuments?.data?.documents) {
      apiDocuments.data.documents.forEach((apiDoc) => {
        const fieldKey = apiDoc.fieldName || apiDoc.fileName.toLowerCase().replace(/\s+/g, "");
        const document = formData[fieldKey];
        
      if (document && document.uploadedUrl) {
          documents[fieldKey] = [
            createDocumentObject(document, apiDoc),
          ];
        }
      });
    }

    if (Object.keys(documents).length > 0) {
      apiData.documents = documents;
    }

    return apiData;
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Check if there are unuploaded documents
      const allDocuments = Object.values(formData).filter(
        Boolean
      ) as DocumentFile[];
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
      // Update store with current form data
      const storeData = { ...data.documentsUpload, ...formData };
      updateDocumentsUpload(storeData);

      const apiData = transformFormDataToApiFormat();
      const propertyId = data.propertyId;
      console.log(
        "Residential Property ID from store before draft API:",
        propertyId
      );
      if (!propertyId) {
        Alert.alert(
          "Error",
          "Property ID not found. Please go back and try again."
        );
        return;
      }
      console.log("Saving residential property draft with documents data:", {
        propertyId,
        ...apiData,
      });
      console.log("Transformed documents structure:", apiData.documents);
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
          const key = doc.fieldName || doc.fileName.toLowerCase().replace(/\s+/g, "");
          newErrors[key] = validateDocument(formData[key], doc.fileName);
        }
      });
    }

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
    isMandatory: boolean = true
  ) => {
    const document = formData[fieldName];
    const error = errors[fieldName];
    const isUploadingField = uploadingFields.has(fieldName);

    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Typography variant="body" style={styles.label}>
            {displayName} {isMandatory && "*"}
          </Typography>
          {!isMandatory && (
            <Typography variant="caption" style={styles.optionalText}>
              (Optional)
            </Typography>
          )}
        </View>

        <Typography variant="caption" style={styles.helperText}>
          {description}
        </Typography>

        {document ? (
          <View style={styles.documentDisplay}>
            <TouchableOpacity
              style={styles.documentInfo}
              onPress={() => previewDocument(document)}
            >
              <Ionicons
                name="document-text"
                size={24}
                color={colors.primary.gold}
              />
              <View style={styles.documentDetails}>
                <Typography variant="caption" style={styles.documentName}>
                  {document.name}
                </Typography>
                <Typography variant="caption" style={styles.documentSize}>
                  {formatFileSize(document.size)}
                </Typography>
                {document.uploadedUrl ? (
                  <Typography variant="caption" style={styles.uploadedText}>
                    ✓ Uploaded
                  </Typography>
                ) : isUploadingField ? (
                  <Typography variant="caption" style={styles.uploadingText}>
                    ⏳ Uploading...
                  </Typography>
                ) : (
                  <TouchableOpacity onPress={() => retryUpload(fieldName)}>
                    <Typography variant="caption" style={styles.retryText}>
                      ↻ Retry
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeDocument(fieldName)}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(fieldName, displayName)}
            disabled={isUploadingField}
          >
            <Ionicons
              name="cloud-upload"
              size={24}
              color={colors.primary.gold}
            />
            <Typography variant="body" style={styles.uploadButtonText}>
              {isUploadingField ? "Uploading..." : `Upload ${displayName}`}
            </Typography>
          </TouchableOpacity>
        )}

        {error && (
          <Typography variant="caption" style={styles.errorText}>
            {error}
          </Typography>
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
        >
          <Typography variant="h4" style={styles.sectionTitle}>
            Upload Required Documents
          </Typography>

          <Typography variant="body" style={styles.sectionDescription}>
            Please upload all mandatory documents to complete your residential
            property listing. Additional documents can be uploaded if needed.
          </Typography>

          {/* API Documents Section */}
          {apiDocuments?.data?.documents && (
            <View style={styles.sectionContainer}>
              <Typography variant="h5" style={styles.sectionSubtitle}>
                Required Documents *
              </Typography>

              {apiDocuments.data.documents
                .filter((doc) => doc.isRequired)
                .map((doc) => {
                  const key = doc.fieldName || doc.fileName.toLowerCase().replace(/\s+/g, "");
                  return renderDocumentField(
                    key,
                    doc.fileName,
                    doc.description,
                    true
                  );
                })}

              {/* Only show Optional Documents section if there are optional documents */}
              {apiDocuments.data.documents.filter((doc) => !doc.isRequired)
                .length > 0 && (
                <>
                  <Typography variant="h4" style={styles.sectionSubtitle}>
                    Optional Documents
                  </Typography>

                  {apiDocuments.data.documents
                    .filter((doc) => !doc.isRequired)
                    .map((doc) => {
                      const key = doc.fieldName || doc.fileName
                        .toLowerCase()
                        .replace(/\s+/g, "");
                      return renderDocumentField(
                        key,
                        doc.fileName,
                        doc.description,
                        false
                      );
                    })}
                </>
              )}
            </View>
          )}

          <Button
            title={saveDraftPropertyMutation.isPending ? "Saving..." : "Next"}
            onPress={handleNext}
            disabled={!isFormValid() || saveDraftPropertyMutation.isPending}
            style={styles.nextButton}
          />
        </ScrollView>

        {/* Document Preview Modal */}
        <Modal
          visible={showDocumentPreview}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Typography variant="h4">Document Preview</Typography>
              <TouchableOpacity onPress={() => setShowDocumentPreview(false)}>
                <Typography variant="h4">✕</Typography>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {previewDocumentData && (
                <View style={styles.previewContainer}>
                  <Ionicons
                    name="document-text"
                    size={64}
                    color={colors.primary.gold}
                  />
                  <Typography variant="h4" style={styles.previewTitle}>
                    {previewDocumentData.name}
                  </Typography>
                  <Typography variant="body" style={styles.previewDetails}>
                    Size: {formatFileSize(previewDocumentData.size)}
                  </Typography>
                  <Typography variant="body" style={styles.previewDetails}>
                    Type: {previewDocumentData.type}
                  </Typography>
                </View>
              )}
            </View>
          </View>
        </Modal> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  sectionDescription: {
    marginBottom: spacing.xl,
    color: colors.text.secondary,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionSubtitle: {
    marginBottom: spacing.lg,
    fontWeight: "600",
    color: colors.primary.gold,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  optionalText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
    fontSize: 12,
  },
  helperText: {
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.primary.gold,
    borderStyle: "dashed",
    borderRadius: radius.input,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  uploadButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary.gold,
    fontWeight: "500",
  },
  documentDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    padding: spacing.md,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  documentDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  documentName: {
    color: colors.text.primary,
    fontWeight: "500",
  },
  documentSize: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.lightGray,
    borderRadius: radius.input,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.input,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary.gold,
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleButtonText: {
    color: colors.text.secondary,
    fontWeight: "500",
  },
  toggleButtonTextActive: {
    color: colors.neutral.white,
  },
  errorText: {
    color: colors.status.error,
    marginTop: spacing.sm,
  },
  uploadStatus: {
    color: colors.status.success,
    fontSize: 9,
    fontWeight: "600",
  },
  retryStatus: {
    color: colors.primary.gold,
    fontSize: 9,
    fontWeight: "600",
  },
  nextButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
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
  modalContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    alignItems: "center",
    padding: spacing.xl,
  },
  previewTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  previewDetails: {
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  uploadedText: {
    color: colors.status.success,
    fontSize: 9,
    fontWeight: "600",
  },
  uploadingText: {
    color: colors.primary.gold,
    fontSize: 9,
    fontWeight: "600",
  },
  retryText: {
    color: colors.primary.gold,
    fontSize: 9,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
});
