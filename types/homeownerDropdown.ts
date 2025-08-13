import { z } from "zod";

// Amenity item schema
export const AmenitySchema = z.object({
  _id: z.string(),
  name: z.string(),
});

// Property rule item schema
export const PropertyRuleSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
});

// Amenities response schema
export const AmenitiesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    amenities: z.array(AmenitySchema),
    total: z.number(),
  }),
});

// Property rules response schema
export const PropertyRulesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    rules: z.array(PropertyRuleSchema),
    total: z.number(),
  }),
});

// Type definitions
export type Amenity = z.infer<typeof AmenitySchema>;
export type PropertyRule = z.infer<typeof PropertyRuleSchema>;
export type AmenitiesResponse = z.infer<typeof AmenitiesResponseSchema>;
export type PropertyRulesResponse = z.infer<typeof PropertyRulesResponseSchema>;

// API error types
export interface DropdownApiError {
  status: number | null;
  message: string;
  originalError: Error;
  data?: any;
}
