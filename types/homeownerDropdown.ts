import { z } from "zod";

// Amenity item schema
export const AmenitySchema = z.object({
  _id: z.string(),
  name: z.string(),
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

// Type definitions
export type Amenity = z.infer<typeof AmenitySchema>;
export type AmenitiesResponse = z.infer<typeof AmenitiesResponseSchema>;

// API error types
export interface DropdownApiError {
  status: number | null;
  message: string;
  originalError: Error;
  data?: any;
}
