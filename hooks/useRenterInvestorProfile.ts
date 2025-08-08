import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/apiClient";
import {
  getRenterInvestorProfile,
  updateRenterInvestorProfile,
  changeRenterInvestorPassword,
} from "@/services/renterInvestorProfile";
import {
  UpdateRenterInvestorProfileRequest,
  ChangeRenterInvestorPasswordRequest,
} from "@/types/renterInvestorProfile";
import { toast } from "@/components/ui/Toast";

// Hook to get renter investor profile
export const useGetRenterInvestorProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: getRenterInvestorProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false, // Don't refetch when component mounts if data is fresh
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
};

// Hook to update renter investor profile
export const useUpdateRenterInvestorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRenterInvestorProfile,
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(queryKeys.profile(), data);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

// Hook to change renter investor password
export const useChangeRenterInvestorPassword = () => {
  return useMutation({
    mutationFn: changeRenterInvestorPassword,
    onSuccess: (response: any) => {
      toast.success(response.message || "Password changed successfully");
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to change password";
      toast.error(errorMessage);
    },
  });
}; 