import { z } from "zod";

// Uploaded file schema
export const UploadedFileSchema = z.object({
  key: z.string(),
  url: z.string(),
  originalName: z.string(),
  fileName: z.string(),
  type: z.string(),
  size: z.number(),
  mimetype: z.string(),
  isPublic: z.boolean().optional(),
});

// File upload response schema
export const FileUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    propertyId: z.string(),
    uploadedFiles: z.array(UploadedFileSchema),
    totalFiles: z.number(),
  }),
});

// File upload request schema
export const FileUploadRequestSchema = z.object({
  propertyId: z.string(),
  files: z.array(z.object({
    uri: z.string(),
    type: z.string(),
    name: z.string(),
  })),
});

// Media file interface for React Native
export interface MediaFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  uploadedUrl?: string;
  uploadedKey?: string;
  originalName?: string;
  fileName?: string;
  mimetype?: string;
  isPublic?: boolean;
}

// Video file interface
export interface VideoFile {
  uri: string;
  name: string;
  size: number;
  type: string;
  uploadedUrl?: string;
  uploadedKey?: string;
  originalName?: string;
  fileName?: string;
  mimetype?: string;
  isPublic?: boolean;
}

// File upload form data interface
export interface FileUploadFormData {
  photos: MediaFile[];
  virtualTour: VideoFile | string;
  video360: VideoFile | null;
}

// File upload validation errors interface
export interface FileUploadValidationErrors {
  photos?: string;
  virtualTour?: string;
  video360?: string;
}

// Type definitions
export type UploadedFile = z.infer<typeof UploadedFileSchema>;
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;
export type FileUploadRequest = z.infer<typeof FileUploadRequestSchema>;

// API error types
export interface FileUploadApiError {
  status: number | null;
  message: string;
  originalError: Error;
  data?: any;
}
