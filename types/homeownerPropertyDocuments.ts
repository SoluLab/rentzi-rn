import { z } from "zod";

// Property document item schema
export const PropertyDocumentSchema = z.object({
  _id: z.string(),
  fileName: z.string(),
  isRequired: z.boolean(),
  description: z.string(),
});

// Property documents response schema
export const PropertyDocumentsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    documents: z.array(PropertyDocumentSchema),
    total: z.number(),
  }),
});

// Type definitions
export type PropertyDocument = z.infer<typeof PropertyDocumentSchema>;
export type PropertyDocumentsResponse = z.infer<typeof PropertyDocumentsResponseSchema>;

// API error types
export interface PropertyDocumentsApiError {
  status: number | null;
  message: string;
  originalError: Error;
  data?: any;
}
