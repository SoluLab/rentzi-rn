import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { FileText, Upload, X, Check } from 'lucide-react-native';
import { useCommercialPropertyStore } from '@/stores/commercialPropertyStore';
import { useHomeownerSavePropertyDraft, useHomeownerUploadPropertyFiles } from '@/services/homeownerAddProperty';
import { BASE_URLS, ENDPOINTS } from '@/constants/urls';

interface DocumentFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  uploadedUrl?: string; // Add uploaded URL field
  uploadedKey?: string; // Add uploaded key field
}

interface DocumentsFormData {
  // Mandatory Documents
  propertyDeed: DocumentFile | null;
  zoningCertificate: DocumentFile | null;
  titleReport: DocumentFile | null;
  governmentId: DocumentFile | null;
  certificateOfOccupancy: DocumentFile | null;
  rentRoll: DocumentFile | null;
  incomeExpenseStatements: DocumentFile | null;
  camAgreement: DocumentFile | null;
  environmentalReport: DocumentFile | null;
  propertyConditionAssessment: DocumentFile | null;
  proofOfInsurance: DocumentFile | null;
  utilityBill: DocumentFile | null;
  propertyAppraisal: DocumentFile | null;
  authorizationToTokenize: DocumentFile | null;
  
  // Conditional Documents
  mortgageStatement: DocumentFile | null;
  hoaDocuments: DocumentFile | null;
  franchiseAgreement: DocumentFile | null;
  businessLicenses: DocumentFile | null;
  adaComplianceReport: DocumentFile | null;
  fireSafetyInspection: DocumentFile | null;
}

interface DocumentsValidationErrors {
  propertyDeed?: string;
  zoningCertificate?: string;
  titleReport?: string;
  governmentId?: string;
  certificateOfOccupancy?: string;
  rentRoll?: string;
  incomeExpenseStatements?: string;
  camAgreement?: string;
  environmentalReport?: string;
  propertyConditionAssessment?: string;
  proofOfInsurance?: string;
  utilityBill?: string;
  propertyAppraisal?: string;
  authorizationToTokenize?: string;
}

const MAX_FILE_SIZE_MB = 50;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export default function CommercialPropertyDocumentsUploadScreen() {
  const router = useRouter();
  const { data, updateDocuments } = useCommercialPropertyStore();

  // API mutation hook for updating property draft
  const saveDraftPropertyMutation = useHomeownerSavePropertyDraft({
    onSuccess: (response) => {
      console.log(
        "Commercial property draft saved successfully with documents:",
        response
      );
      // Navigate to legal consents step
      router.push('/add-commercial-details/commercial-property-legal-consents');
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
  
  const [formData, setFormData] = useState<DocumentsFormData>(data.documents);
  const [errors, setErrors] = useState<DocumentsValidationErrors>({});
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Validation functions
  const validateDocument = (document: DocumentFile | null, fieldName: string): string | undefined => {
    if (!document) {
      return `${fieldName} is required`;
    }
    
    if (document.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `${fieldName} file size (${formatFileSize(document.size)}) exceeds ${MAX_FILE_SIZE_MB}MB limit`;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(document.type.toLowerCase())) {
      return `${fieldName} must be a PDF, JPG, or PNG file`;
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: DocumentsValidationErrors = {};

    // Validate all mandatory documents
    newErrors.propertyDeed = validateDocument(formData.propertyDeed, 'Property Deed');
    newErrors.zoningCertificate = validateDocument(formData.zoningCertificate, 'Zoning Certificate');
    newErrors.titleReport = validateDocument(formData.titleReport, 'Title Report or Title Insurance');
    newErrors.governmentId = validateDocument(formData.governmentId, 'Government-issued ID');
    newErrors.certificateOfOccupancy = validateDocument(formData.certificateOfOccupancy, 'Certificate of Occupancy');
    newErrors.rentRoll = validateDocument(formData.rentRoll, 'Rent Roll');
    newErrors.incomeExpenseStatements = validateDocument(formData.incomeExpenseStatements, 'Income and Expense Statements');
    newErrors.camAgreement = validateDocument(formData.camAgreement, 'CAM Agreement');
    newErrors.environmentalReport = validateDocument(formData.environmentalReport, 'Environmental Report');
    newErrors.propertyConditionAssessment = validateDocument(formData.propertyConditionAssessment, 'Property Condition Assessment');
    newErrors.proofOfInsurance = validateDocument(formData.proofOfInsurance, 'Proof of Insurance');
    newErrors.utilityBill = validateDocument(formData.utilityBill, 'Utility Bill');
    newErrors.propertyAppraisal = validateDocument(formData.propertyAppraisal, 'Property Appraisal');
    newErrors.authorizationToTokenize = validateDocument(formData.authorizationToTokenize, 'Authorization to Tokenize');

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const updateFormData = (field: keyof DocumentsFormData, value: DocumentFile | null) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateDocuments(newFormData);
    
    // Clear error when user uploads a document
    if (errors[field as keyof DocumentsValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const uploadDocumentToServer = async (document: DocumentFile, documentField: keyof DocumentsFormData) => {
    try {
      const propertyId = data.propertyId;
      if (!propertyId) {
        console.error("Property ID not found for document upload");
        Alert.alert("Error", "Property ID not found. Please go back and try again.");
        return;
      }

      // Create file object for upload - ensure proper format for React Native
      const file = {
        uri: document.uri,
        type: document.type || "application/pdf",
        name: document.name || `document_${Date.now()}.pdf`,
      };

      console.log("Uploading document:", file);
      console.log("Property ID:", propertyId);
      console.log("Full URL:", BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER + ENDPOINTS.HOMEOWNER_PROPERTY.UPLOAD_FILES(propertyId));
      
      const response = await uploadFilesMutation.mutateAsync({
        propertyId,
        files: [file],
        fileType: "document",
      });

      console.log("Document upload response:", response);

      // Update the document with uploaded URL and key
      if (response.data?.uploadedFiles?.[0]) {
        const uploadedDocument = response.data.uploadedFiles[0];
        const updatedDocument: DocumentFile = {
          ...document,
          uploadedUrl: uploadedDocument.url,
          uploadedKey: uploadedDocument.key,
        };
        updateFormData(documentField, updatedDocument);
        console.log("Updated document with uploaded URL:", uploadedDocument.url);
      } else {
        console.warn("No uploaded documents in response:", response);
      }
    } catch (error: any) {
      console.error("Error uploading document to server:", error);
      
      // Show a more specific error message
      if (error?.message === "Network Error") {
        Alert.alert(
          "Upload Failed", 
          "Network error occurred. Please check your internet connection and try again."
        );
      } else if (error?.status === 401) {
        Alert.alert(
          "Authentication Error", 
          "Please log in again to continue."
        );
      } else if (error?.status === 413) {
        Alert.alert(
          "File Too Large", 
          "The document file is too large. Please select a smaller file."
        );
      } else if (error?.status === 422) {
        Alert.alert(
          "Upload Failed", 
          "Invalid document format. Please try again with a different file."
        );
      } else {
        Alert.alert(
          "Upload Failed", 
          "Failed to upload document. Please try again."
        );
      }
    }
  };

  const pickDocument = async (fieldName: keyof DocumentsFormData, displayName: string) => {
    try {
      setIsUploading(fieldName);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (asset.size && asset.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          Alert.alert('Error', `${displayName} file size (${(asset.size / (1024 * 1024)).toFixed(1)}MB) exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
          return;
        }

        const documentFile: DocumentFile = {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          type: asset.mimeType || 'application/pdf',
        };

        updateFormData(fieldName, documentFile);

        // Upload document immediately
        await uploadDocumentToServer(documentFile, fieldName);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to upload ${displayName}. Please try again.`);
    } finally {
      setIsUploading(null);
    }
  };

  const removeDocument = (fieldName: keyof DocumentsFormData) => {
    updateFormData(fieldName, null);
  };

  const retryUpload = async (documentField: keyof DocumentsFormData) => {
    const document = formData[documentField];
    if (document && !document.uploadedUrl) {
      console.log(`Retrying upload for document ${documentField}:`, document.name);
      await uploadDocumentToServer(document, documentField);
    }
  };

  const transformFormDataToApiFormat = () => {
    const apiData: any = {
      title: data.propertyDetails?.propertyTitle || "",
      type: "commercial",
    };

    // Transform documents to match schema format based on schema.txt
    const documents: any = {};

    // Mandatory documents
    if (formData.propertyDeed) {
      documents.propertyDeed = [{
        key: formData.propertyDeed.uploadedKey || 'propertyDeed',
        url: formData.propertyDeed.uploadedUrl || formData.propertyDeed.uri,
      }];
    }

    if (formData.zoningCertificate) {
      documents.zoningCertificate = [{
        key: formData.zoningCertificate.uploadedKey || 'zoningCertificate',
        url: formData.zoningCertificate.uploadedUrl || formData.zoningCertificate.uri,
      }];
    }

    if (formData.titleReport) {
      documents.titleReportOrInsurance = [{
        key: formData.titleReport.uploadedKey || 'titleReport',
        url: formData.titleReport.uploadedUrl || formData.titleReport.uri,
      }];
    }

    if (formData.governmentId) {
      documents.governmentIssuedId = [{
        key: formData.governmentId.uploadedKey || 'governmentId',
        url: formData.governmentId.uploadedUrl || formData.governmentId.uri,
      }];
    }

    if (formData.certificateOfOccupancy) {
      documents.occupancyCertificate = [{
        key: formData.certificateOfOccupancy.uploadedKey || 'certificateOfOccupancy',
        url: formData.certificateOfOccupancy.uploadedUrl || formData.certificateOfOccupancy.uri,
      }];
    }

    if (formData.rentRoll) {
      documents.rentRoll = [{
        key: formData.rentRoll.uploadedKey || 'rentRoll',
        url: formData.rentRoll.uploadedUrl || formData.rentRoll.uri,
      }];
    }

    if (formData.incomeExpenseStatements) {
      documents.incomeandExpenseStatement = [{
        key: formData.incomeExpenseStatements.uploadedKey || 'incomeExpenseStatements',
        url: formData.incomeExpenseStatements.uploadedUrl || formData.incomeExpenseStatements.uri,
      }];
    }

    if (formData.camAgreement) {
      documents.camAgreement = [{
        key: formData.camAgreement.uploadedKey || 'camAgreement',
        url: formData.camAgreement.uploadedUrl || formData.camAgreement.uri,
      }];
    }

    if (formData.environmentalReport) {
      documents.propertyConditionAssessment = [{
        key: formData.environmentalReport.uploadedKey || 'environmentalReport',
        url: formData.environmentalReport.uploadedUrl || formData.environmentalReport.uri,
      }];
    }

    if (formData.propertyConditionAssessment) {
      documents.propertyConditionAssessment = [{
        key: formData.propertyConditionAssessment.uploadedKey || 'propertyConditionAssessment',
        url: formData.propertyConditionAssessment.uploadedUrl || formData.propertyConditionAssessment.uri,
      }];
    }

    if (formData.proofOfInsurance) {
      documents.proofOfInsurance = [{
        key: formData.proofOfInsurance.uploadedKey || 'proofOfInsurance',
        url: formData.proofOfInsurance.uploadedUrl || formData.proofOfInsurance.uri,
      }];
    }

    if (formData.utilityBill) {
      documents.utilityBill = [{
        key: formData.utilityBill.uploadedKey || 'utilityBill',
        url: formData.utilityBill.uploadedUrl || formData.utilityBill.uri,
      }];
    }

    if (formData.propertyAppraisal) {
      documents.propertyAppraisal = [{
        key: formData.propertyAppraisal.uploadedKey || 'propertyAppraisal',
        url: formData.propertyAppraisal.uploadedUrl || formData.propertyAppraisal.uri,
      }];
    }

    if (formData.authorizationToTokenize) {
      documents.authorizationToTokenize = [{
        key: formData.authorizationToTokenize.uploadedKey || 'authorizationToTokenize',
        url: formData.authorizationToTokenize.uploadedUrl || formData.authorizationToTokenize.uri,
      }];
    }

    // Conditional documents
    if (formData.mortgageStatement) {
      documents.mortgageStatement = [{
        key: formData.mortgageStatement.uploadedKey || 'mortgageStatement',
        url: formData.mortgageStatement.uploadedUrl || formData.mortgageStatement.uri,
      }];
    }

    if (formData.hoaDocuments) {
      documents.hoaDocument = [{
        key: formData.hoaDocuments.uploadedKey || 'hoaDocuments',
        url: formData.hoaDocuments.uploadedUrl || formData.hoaDocuments.uri,
      }];
    }

    if (formData.franchiseAgreement) {
      documents.granchiseAgreement = [{
        key: formData.franchiseAgreement.uploadedKey || 'franchiseAgreement',
        url: formData.franchiseAgreement.uploadedUrl || formData.franchiseAgreement.uri,
      }];
    }

    if (formData.businessLicenses) {
      documents.businessLicense = [{
        key: formData.businessLicenses.uploadedKey || 'businessLicenses',
        url: formData.businessLicenses.uploadedUrl || formData.businessLicenses.uri,
      }];
    }

    if (formData.adaComplianceReport) {
      documents.adaComplianceReport = [{
        key: formData.adaComplianceReport.uploadedKey || 'adaComplianceReport',
        url: formData.adaComplianceReport.uploadedUrl || formData.adaComplianceReport.uri,
      }];
    }

    if (formData.fireSafetyInspection) {
      documents.safetyReport = [{
        key: formData.fireSafetyInspection.uploadedKey || 'fireSafetyInspection',
        url: formData.fireSafetyInspection.uploadedUrl || formData.fireSafetyInspection.uri,
      }];
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
        formData.zoningCertificate,
        formData.titleReport,
        formData.governmentId,
        formData.certificateOfOccupancy,
        formData.rentRoll,
        formData.incomeExpenseStatements,
        formData.camAgreement,
        formData.environmentalReport,
        formData.propertyConditionAssessment,
        formData.proofOfInsurance,
        formData.utilityBill,
        formData.propertyAppraisal,
        formData.authorizationToTokenize,
        formData.mortgageStatement,
        formData.hoaDocuments,
        formData.franchiseAgreement,
        formData.businessLicenses,
        formData.adaComplianceReport,
        formData.fireSafetyInspection,
      ].filter(Boolean) as DocumentFile[];

      const unuploadedDocuments = allDocuments.filter(doc => !doc.uploadedUrl);
      
      if (unuploadedDocuments.length > 0) {
        Alert.alert(
          "Unuploaded Documents",
          `${unuploadedDocuments.length} documents are not yet uploaded to the server. You can continue, but the documents may not be saved properly.`,
          [
            { text: "Continue Anyway", onPress: () => proceedWithDraft() },
            { text: "Upload First", style: "cancel" }
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

    // Validate all mandatory documents
    newErrors.propertyDeed = validateDocument(formData.propertyDeed, 'Property Deed');
    newErrors.zoningCertificate = validateDocument(formData.zoningCertificate, 'Zoning Certificate');
    newErrors.titleReport = validateDocument(formData.titleReport, 'Title Report or Title Insurance');
    newErrors.governmentId = validateDocument(formData.governmentId, 'Government-issued ID');
    newErrors.certificateOfOccupancy = validateDocument(formData.certificateOfOccupancy, 'Certificate of Occupancy');
    newErrors.rentRoll = validateDocument(formData.rentRoll, 'Rent Roll');
    newErrors.incomeExpenseStatements = validateDocument(formData.incomeExpenseStatements, 'Income and Expense Statements');
    newErrors.camAgreement = validateDocument(formData.camAgreement, 'CAM Agreement');
    newErrors.environmentalReport = validateDocument(formData.environmentalReport, 'Environmental Report');
    newErrors.propertyConditionAssessment = validateDocument(formData.propertyConditionAssessment, 'Property Condition Assessment');
    newErrors.proofOfInsurance = validateDocument(formData.proofOfInsurance, 'Proof of Insurance');
    newErrors.utilityBill = validateDocument(formData.utilityBill, 'Utility Bill');
    newErrors.propertyAppraisal = validateDocument(formData.propertyAppraisal, 'Property Appraisal');
    newErrors.authorizationToTokenize = validateDocument(formData.authorizationToTokenize, 'Authorization to Tokenize');

    // Check if all mandatory documents are uploaded and no validation errors
    return Object.values(newErrors).every(error => !error);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderDocumentField = (
    fieldName: keyof DocumentsFormData,
    displayName: string,
    description: string,
    isMandatory: boolean = true
  ) => {
    const document = formData[fieldName];
    const error = errors[fieldName as keyof DocumentsValidationErrors];
    const isUploadingField = isUploading === fieldName;

    return (
      <View style={styles.documentField}>
        <View style={styles.fieldHeader}>
          <Typography variant="h6" style={styles.fieldTitle}>
            {displayName} {isMandatory && '*'}
          </Typography>
          {!isMandatory && (
            <Typography variant="caption" color="secondary" style={styles.optionalText}>
              (Optional)
            </Typography>
          )}
        </View>
        
        <Typography variant="caption" color="secondary" style={styles.fieldDescription}>
          {description}
        </Typography>

        <Button
          title={isUploadingField ? "Uploading..." : document ? "Replace Document" : "Upload Document"}
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
                {document.uploadedUrl ? (
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

        <Typography variant="body" color="secondary" style={styles.sectionDescription}>
          Please upload all mandatory documents to complete your commercial property listing. 
          Conditional documents should be uploaded if applicable to your property.
        </Typography>

        {/* Mandatory Documents Section */}
        <View style={styles.documentsSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
            Mandatory Documents *
          </Typography>
          
          {renderDocumentField(
            'propertyDeed',
            'Property Deed',
            'Official property deed showing ownership'
          )}
          
          {renderDocumentField(
            'zoningCertificate',
            'Zoning Certificate',
            'Certificate confirming current zoning classification'
          )}
          
          {renderDocumentField(
            'titleReport',
            'Title Report or Title Insurance',
            'Title report or insurance policy showing clear title'
          )}
          
          {renderDocumentField(
            'governmentId',
            'Government-issued ID',
            'Valid government ID for identity verification'
          )}
          
          {renderDocumentField(
            'certificateOfOccupancy',
            'Certificate of Occupancy',
            'Certificate showing the building is safe for occupancy'
          )}
          
          {renderDocumentField(
            'rentRoll',
            'Rent Roll',
            'Current rent roll showing tenant information and lease terms'
          )}
          
          {renderDocumentField(
            'incomeExpenseStatements',
            'Income and Expense Statements',
            'Last 12-24 months of income and expense statements'
          )}
          
          {renderDocumentField(
            'camAgreement',
            'CAM Agreement',
            'Common Area Maintenance agreement'
          )}
          
          {renderDocumentField(
            'environmentalReport',
            'Environmental Report',
            'Phase I or II Environmental Site Assessment (ESA)'
          )}
          
          {renderDocumentField(
            'propertyConditionAssessment',
            'Property Condition Assessment',
            'PCA report detailing property condition'
          )}
          
          {renderDocumentField(
            'proofOfInsurance',
            'Proof of Insurance',
            'Current property insurance policy'
          )}
          
          {renderDocumentField(
            'utilityBill',
            'Utility Bill',
            'Recent utility bill for the property'
          )}
          
          {renderDocumentField(
            'propertyAppraisal',
            'Property Appraisal',
            'Recent property appraisal report'
          )}
          
          {renderDocumentField(
            'authorizationToTokenize',
            'Authorization to Tokenize',
            'Digitally signed authorization for fractional interest sale'
          )}
        </View>

        {/* Conditional Documents Section */}
        <View style={styles.documentsSection}>
          <Typography variant="h5" style={styles.sectionSubtitle}>
            Conditional Documents
          </Typography>
          
          {renderDocumentField(
            'mortgageStatement',
            'Mortgage Statement',
            'Current mortgage statement (if property has a loan)',
            false
          )}
          
          {renderDocumentField(
            'hoaDocuments',
            'HOA Documents',
            'HOA governing documents (if property is governed by HOA)',
            false
          )}
          
          {renderDocumentField(
            'franchiseAgreement',
            'Franchise Agreement',
            'Franchise agreement (if property is branded)',
            false
          )}
          
          {renderDocumentField(
            'businessLicenses',
            'Business Licenses',
            'Active business licenses for the property',
            false
          )}
          
          {renderDocumentField(
            'adaComplianceReport',
            'ADA Compliance Report',
            'ADA compliance report (if property has public use)',
            false
          )}
          
          {renderDocumentField(
            'fireSafetyInspection',
            'Fire Safety, Sprinkler, or Alarm Inspection',
            'Fire safety inspection reports (if operational)',
            false
          )}
        </View>

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
    fontWeight: '600',
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
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fieldTitle: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  optionalText: {
    marginLeft: spacing.xs,
    fontStyle: 'italic',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.input,
  },
  documentDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  documentName: {
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  statusText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
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
    fontWeight: '500',
  },
  nextButton: {
    marginTop: spacing.xl,
  },
}); 