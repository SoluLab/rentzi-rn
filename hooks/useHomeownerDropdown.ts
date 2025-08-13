import { useAmenitiesDropdown } from "@/services/homeownerDropdown";
import { Amenity } from "@/types/homeownerDropdown";

interface UseHomeownerDropdownReturn {
  amenities: Amenity[];
  amenitiesLoading: boolean;
  amenitiesError: any;
  amenitiesTotal: number;
}

export const useHomeownerDropdown = (): UseHomeownerDropdownReturn => {
  const {
    data: amenitiesData,
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useAmenitiesDropdown();

  const amenities = amenitiesData?.data?.amenities || [];
  const amenitiesTotal = amenitiesData?.data?.total || 0;

  return {
    amenities,
    amenitiesLoading,
    amenitiesError,
    amenitiesTotal,
  };
};
