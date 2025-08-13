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
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import { uploadToPinata } from "@/utils/ipfsUpload";

interface DocumentsUploadData {
  // Mandatory documents
  propertyDeed: DocumentData | null;
  governmentId: DocumentData | null;
  propertyTaxBill: DocumentData | null;
  proofOfInsurance: DocumentData | null;
  utilityBill: DocumentData | null;
  appraisalReport: DocumentData | null;
  authorizationToSell: DocumentData | null;

  // Conditional documents
  mortgageStatement: DocumentData | null;
  hoaDocuments: DocumentData | null;

  // Conditional flags
  hasMortgage: boolean;
  hasHOA: boolean;
}

// Extend DocumentData to include upload status
interface ExtendedDocumentData extends DocumentData {
  uploadedUrl?: string;
  uploadedKey?: string;
}

interface DocumentsUploadErrors {
  propertyDeed?: string;
  governmentId?: string;
  propertyTaxBill?: string;
  proofOfInsurance?: string;
  utilityBill?: string;
  appraisalReport?: string;
  authorizationToSell?: string;
  mortgageStatement?: string;
  hoaDocuments?: string;
}

const MANDATORY_DOCUMENTS = [
  "propertyDeed",
  "governmentId",
  "propertyTaxBill",
  "proofOfInsurance",
  "utilityBill",
  "appraisalReport",
  "authorizationToSell",
] as const;

const CONDITIONAL_DOCUMENTS = ["mortgageStatement", "hoaDocuments"] as const;

export default function ResidentialPropertyDocumentsUploadScreen() {
  const router = useRouter();
  const { data, updateDocumentsUpload, resetStore } =
    useResidentialPropertyStore();

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

  // Sync local state with store data
  React.useEffect(() => {
    if (data.documentsUpload) {
      setFormData(data.documentsUpload);
    }
  }, [data.documentsUpload]);

  const [formData, setFormData] = useState<DocumentsUploadData>(
    data.documentsUpload || {
      propertyDeed: null,
      governmentId: null,
      propertyTaxBill: null,
      proofOfInsurance: null,
      utilityBill: null,
      appraisalReport: null,
      authorizationToSell: null,
      mortgageStatement: null,
      hoaDocuments: null,
      hasMortgage: false,
      hasHOA: false,
    }
  );
  const [errors, setErrors] = useState<DocumentsUploadErrors>({});
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocumentData, setPreviewDocumentData] =
    useState<DocumentData | null>(null);
  // Track upload status for each document field individually
  const [uploadingFields, setUploadingFields] = useState<
    Set<keyof DocumentsUploadData>
  >(new Set());

  // Validation functions
  const validateDocument = (
    document: DocumentData | null,
    documentName: string
  ): string | undefined => {
    if (!document) {
      return `${documentName} is required`;
    }

    if (document.size > 10 * 1024 * 1024) {
      // 10MB limit
      return `${documentName} must be less than 10MB`;
    }

    if (!document.name.toLowerCase().endsWith(".pdf")) {
      return `${documentName} must be a PDF file`;
    }

    return undefined;
  };

  const validateConditionalDocument = (
    document: DocumentData | null,
    documentName: string,
    isRequired: boolean
  ): string | undefined => {
    if (!isRequired) {
      return undefined; // Not required
    }

    return validateDocument(document, documentName);
  };

  const validateForm = (): boolean => {
    const newErrors: DocumentsUploadErrors = {};

    // Validate mandatory documents
    newErrors.propertyDeed = validateDocument(
      formData.propertyDeed,
      "Property Deed"
    );
    newErrors.governmentId = validateDocument(
      formData.governmentId,
      "Government-issued ID"
    );
    newErrors.propertyTaxBill = validateDocument(
      formData.propertyTaxBill,
      "Property Tax Bill"
    );
    newErrors.proofOfInsurance = validateDocument(
      formData.proofOfInsurance,
      "Proof of Insurance"
    );
    newErrors.utilityBill = validateDocument(
      formData.utilityBill,
      "Utility Bill"
    );
    newErrors.appraisalReport = validateDocument(
      formData.appraisalReport,
      "Appraisal Report"
    );
    newErrors.authorizationToSell = validateDocument(
      formData.authorizationToSell,
      "Authorization to Sell"
    );

    // Validate conditional documents
    newErrors.mortgageStatement = validateConditionalDocument(
      formData.mortgageStatement,
      "Mortgage Statement",
      formData.hasMortgage
    );
    newErrors.hoaDocuments = validateConditionalDocument(
      formData.hoaDocuments,
      "HOA Documents",
      formData.hasHOA
    );

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const updateFormData = (field: keyof DocumentsUploadData, value: any) => {
    console.log(`updateFormData called: ${field} = ${value}`);

    const newFormData = { ...formData, [field]: value };
    console.log("New form data:", newFormData);

    setFormData(newFormData);
    updateDocumentsUpload(newFormData);

    // Clear error for this field if it's a document field
    if (field !== "hasMortgage" && field !== "hasHOA") {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isFormValid = () => {
    // Re-validate the form to check if it's actually valid
    const newErrors: DocumentsUploadErrors = {};

    // Validate mandatory documents
    newErrors.propertyDeed = validateDocument(
      formData.propertyDeed,
      "Property Deed"
    );
    newErrors.governmentId = validateDocument(
      formData.governmentId,
      "Government-issued ID"
    );
    newErrors.propertyTaxBill = validateDocument(
      formData.propertyTaxBill,
      "Property Tax Bill"
    );
    newErrors.proofOfInsurance = validateDocument(
      formData.proofOfInsurance,
      "Proof of Insurance"
    );
    newErrors.utilityBill = validateDocument(
      formData.utilityBill,
      "Utility Bill"
    );
    newErrors.appraisalReport = validateDocument(
      formData.appraisalReport,
      "Appraisal Report"
    );
    newErrors.authorizationToSell = validateDocument(
      formData.authorizationToSell,
      "Authorization to Sell"
    );

    // Validate conditional documents
    newErrors.mortgageStatement = validateConditionalDocument(
      formData.mortgageStatement,
      "Mortgage Statement",
      formData.hasMortgage
    );
    newErrors.hoaDocuments = validateConditionalDocument(
      formData.hoaDocuments,
      "HOA Documents",
      formData.hasHOA
    );

    // Check if all required fields are filled and no validation errors
    const mandatoryDocumentsComplete = MANDATORY_DOCUMENTS.every(
      (doc) => formData[doc] !== null
    );

    const conditionalDocumentsComplete =
      (!formData.hasMortgage || formData.mortgageStatement !== null) &&
      (!formData.hasHOA || formData.hoaDocuments !== null);

    return (
      mandatoryDocumentsComplete &&
      conditionalDocumentsComplete &&
      Object.values(newErrors).every((error) => !error)
    );
  };

  // Document upload functions
  const pickDocument = async (documentField: keyof DocumentsUploadData) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newDocument: DocumentData = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          type: asset.mimeType || "application/pdf",
        };

        updateFormData(documentField, newDocument);

        // Upload document immediately
        await uploadDocumentToServer(newDocument, documentField);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const removeDocument = (documentField: keyof DocumentsUploadData) => {
    updateFormData(documentField, null);
  };

  const retryUpload = async (documentField: keyof DocumentsUploadData) => {
    const document = formData[documentField] as ExtendedDocumentData | null;
    if (document && !document.uploadedUrl) {
      console.log(
        `Retrying upload for document ${documentField}:`,
        document.name
      );
      await uploadDocumentToServer(document, documentField);
    }
  };

  const previewDocument = (document: DocumentData) => {
    setPreviewDocumentData(document);
    setShowDocumentPreview(true);
  };

  const transformDocumentsToFiles = (): any[] => {
    const allDocuments = [
      formData.propertyDeed,
      formData.governmentId,
      formData.propertyTaxBill,
      formData.proofOfInsurance,
      formData.utilityBill,
      formData.appraisalReport,
      formData.authorizationToSell,
      formData.hasMortgage ? formData.mortgageStatement : null,
      formData.hasHOA ? formData.hoaDocuments : null,
    ].filter(Boolean) as DocumentData[];

    return allDocuments.map((doc) => {
      // Create a file object compatible with React Native and FormData
      const file = {
        uri: doc.uri,
        name: doc.name,
        type: doc.type || "application/pdf",
        size: doc.size,
      };

      return file;
    });
  };

  const uploadDocumentToServer = async (
    document: DocumentData,
    documentField: keyof DocumentsUploadData
  ) => {
    try {
      // Set this specific field as uploading
      setUploadingFields((prev) => new Set(prev).add(documentField));

      // 1. Upload to Pinata (IPFS)
      const ipfsUrl = await uploadToPinata({
        uri: document.uri,
        name: document.name,
        type: document.type,
      });

      // 2. Update formData with IPFS url
      const updatedDocument: ExtendedDocumentData = {
        ...document,
        uploadedUrl: ipfsUrl,
        uploadedKey: document.name,
      };
      updateFormData(documentField, updatedDocument);

      console.log(
        `✅ Document ${documentField} uploaded successfully to IPFS:`,
        ipfsUrl
      );
    } catch (error: any) {
      console.error(
        `❌ Error uploading document ${documentField} to IPFS:`,
        error
      );
      Alert.alert(
        "Upload Failed",
        `Failed to upload ${documentField} to IPFS. Please try again.`
      );
    } finally {
      // Remove this field from uploading state
      setUploadingFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentField);
        return newSet;
      });
    }
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
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
      document: ExtendedDocumentData,
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

    // Mandatory documents
    if (formData.propertyDeed) {
      documents.propertyDeed = [
        createDocumentObject(
          formData.propertyDeed as ExtendedDocumentData,
          "propertyDeed"
        ),
      ];
    }

    if (formData.governmentId) {
      documents.governmentIssuedId = [
        createDocumentObject(
          formData.governmentId as ExtendedDocumentData,
          "governmentId"
        ),
      ];
    }

    if (formData.propertyTaxBill) {
      documents.propertyTaxBill = [
        createDocumentObject(
          formData.propertyTaxBill as ExtendedDocumentData,
          "propertyTaxBill"
        ),
      ];
    }

    if (formData.proofOfInsurance) {
      documents.proofOfInsurance = [
        createDocumentObject(
          formData.proofOfInsurance as ExtendedDocumentData,
          "proofOfInsurance"
        ),
      ];
    }

    if (formData.utilityBill) {
      documents.utilityBill = [
        createDocumentObject(
          formData.utilityBill as ExtendedDocumentData,
          "utilityBill"
        ),
      ];
    }

    if (formData.appraisalReport) {
      documents.appraisalReport = [
        createDocumentObject(
          formData.appraisalReport as ExtendedDocumentData,
          "appraisalReport"
        ),
      ];
    }

    if (formData.authorizationToSell) {
      documents.authorizationToTokenize = [
        createDocumentObject(
          formData.authorizationToSell as ExtendedDocumentData,
          "authorizationToSell"
        ),
      ];
    }

    // Conditional documents
    if (formData.hasMortgage && formData.mortgageStatement) {
      documents.mortgageStatement = [
        createDocumentObject(
          formData.mortgageStatement as ExtendedDocumentData,
          "mortgageStatement"
        ),
      ];
    }

    if (formData.hasHOA && formData.hoaDocuments) {
      documents.hoaDocument = [
        createDocumentObject(
          formData.hoaDocuments as ExtendedDocumentData,
          "hoaDocuments"
        ),
      ];
    }

    if (Object.keys(documents).length > 0) {
      apiData.documents = documents;
    }

    return apiData;
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Check if there are unuploaded documents
      const allDocuments = [
        formData.propertyDeed,
        formData.governmentId,
        formData.propertyTaxBill,
        formData.proofOfInsurance,
        formData.utilityBill,
        formData.appraisalReport,
        formData.authorizationToSell,
        formData.hasMortgage ? formData.mortgageStatement : null,
        formData.hasHOA ? formData.hoaDocuments : null,
      ].filter(Boolean) as ExtendedDocumentData[];

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
      updateDocumentsUpload(formData);
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
      await saveDraftPropertyMutation.mutateAsync({ propertyId, ...apiData });
    } catch (error) {
      console.error("Error in proceedWithDraft:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderDocumentField = (
    field: keyof DocumentsUploadData,
    label: string,
    description: string,
    isRequired: boolean = true
  ) => {
    const document = formData[field] as DocumentData | null;
    const error =
      field in errors
        ? errors[field as keyof DocumentsUploadErrors]
        : undefined;
    const isFieldUploading = uploadingFields.has(field);

    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Typography variant="body" style={styles.label}>
            {label} {isRequired ? "*" : ""}
          </Typography>
          {!isRequired && (
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
                {(document as ExtendedDocumentData).uploadedUrl ? (
                  <Typography variant="caption" style={styles.uploadedText}>
                    ✓ Uploaded
                  </Typography>
                ) : isFieldUploading ? (
                  <Typography variant="caption" style={styles.uploadingText}>
                    ⏳ Uploading...
                  </Typography>
                ) : (
                  <TouchableOpacity onPress={() => retryUpload(field)}>
                    <Typography variant="caption" style={styles.retryText}>
                      ↻ Retry
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeDocument(field)}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickDocument(field)}
            disabled={isFieldUploading}
          >
            <Ionicons
              name="cloud-upload"
              size={24}
              color={colors.primary.gold}
            />
            <Typography variant="body" style={styles.uploadButtonText}>
              {isFieldUploading ? "Uploading..." : `Upload ${label}`}
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

  const renderConditionalToggle = (
    field: "hasMortgage" | "hasHOA",
    label: string,
    description: string
  ) => {
    // Use store data directly to ensure we get the latest value
    const currentValue = data.documentsUpload?.[field] ?? formData[field];

    console.log(`Toggle Debug - ${field}:`, {
      currentValue,
      formData: formData,
      storeData: data.documentsUpload,
    });

    return (
      <View style={styles.fieldContainer}>
        <Typography variant="body" style={styles.label}>
          {label}
        </Typography>
        <Typography variant="caption" style={styles.helperText}>
          {description}
        </Typography>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={{
              ...styles.toggleButton,
              ...(currentValue ? styles.toggleButtonActive : {}),
            }}
            onPress={() => {
              console.log(`Setting ${field} to true`);
              updateFormData(field, true);
            }}
          >
            <Typography
              variant="body"
              style={{
                ...styles.toggleButtonText,
                ...(currentValue ? styles.toggleButtonTextActive : {}),
              }}
            >
              Yes
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...styles.toggleButton,
              ...(!currentValue ? styles.toggleButtonActive : {}),
            }}
            onPress={() => {
              console.log(`Setting ${field} to false`);
              // Force immediate state update
              const newValue = false;
              const newFormData = { ...formData, [field]: newValue };
              setFormData(newFormData);
              updateDocumentsUpload(newFormData);

              // Clear the document if toggling to No
              if (field === "hasMortgage") {
                const updatedFormData = {
                  ...newFormData,
                  mortgageStatement: null,
                };
                setFormData(updatedFormData);
                updateDocumentsUpload(updatedFormData);
              } else if (field === "hasHOA") {
                const updatedFormData = { ...newFormData, hoaDocuments: null };
                setFormData(updatedFormData);
                updateDocumentsUpload(updatedFormData);
              }
            }}
          >
            <Typography
              variant="body"
              style={{
                ...styles.toggleButtonText,
                ...(!currentValue ? styles.toggleButtonTextActive : {}),
              }}
            >
              No
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScreenContainer>
        <Header title="Required Documents" />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <Typography variant="h3" style={styles.sectionTitle}>
            Upload Required Documents
          </Typography>

          <Typography variant="body" style={styles.sectionDescription}>
            Please upload all mandatory documents and any applicable conditional
            documents. All documents must be in PDF format and under 10MB.
          </Typography>

          {/* Mandatory Documents Section */}
          <View style={styles.sectionContainer}>
            <Typography variant="h4" style={styles.sectionSubtitle}>
              Mandatory Documents
            </Typography>

            {renderDocumentField(
              "propertyDeed",
              "Property Deed",
              "Official property deed showing ownership"
            )}

            {renderDocumentField(
              "governmentId",
              "Government-issued ID",
              "Valid USA-based government identification (Driver's License, Passport, etc.)"
            )}

            {renderDocumentField(
              "propertyTaxBill",
              "Property Tax Bill",
              "Current property tax bill or statement"
            )}

            {renderDocumentField(
              "proofOfInsurance",
              "Proof of Insurance",
              "Current property insurance policy or certificate"
            )}

            {renderDocumentField(
              "utilityBill",
              "Utility Bill or Statement",
              "Recent utility bill (electricity, water, gas, etc.)"
            )}

            {renderDocumentField(
              "appraisalReport",
              "Appraisal Report",
              "Recent property appraisal report"
            )}

            {renderDocumentField(
              "authorizationToSell",
              "Authorization to Sell or Tokenize",
              "Digitally signed authorization document"
            )}
          </View>

          {/* Conditional Documents Section */}
          <View style={styles.sectionContainer}>
            <Typography variant="h4" style={styles.sectionSubtitle}>
              Conditional Documents
            </Typography>

            {renderConditionalToggle(
              "hasMortgage",
              "Do you have a mortgage on this property?",
              "If yes, please upload your current mortgage statement"
            )}

            {(data.documentsUpload?.hasMortgage ?? formData.hasMortgage) &&
              renderDocumentField(
                "mortgageStatement",
                "Mortgage Statement",
                "Current mortgage statement or loan document",
                false
              )}

            {renderConditionalToggle(
              "hasHOA",
              "Is this property part of a Homeowner Association (HOA)?",
              "If yes, please upload relevant HOA documents"
            )}

            {(data.documentsUpload?.hasHOA ?? formData.hasHOA) &&
              renderDocumentField(
                "hoaDocuments",
                "HOA Documents",
                "HOA bylaws, rules, or relevant documents",
                false
              )}
          </View>

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
      </ScreenContainer>
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
});
