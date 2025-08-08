import { apiGet, apiPut, apiPost } from "./apiClient";
import { getRenterAuthBaseURL } from "@/constants/urls";
import { ENDPOINTS } from "@/constants/urls";
import {
  RenterInvestorProfileResponse,
  UpdateRenterInvestorProfileRequest,
  ChangeRenterInvestorPasswordRequest,
} from "@/types/renterInvestorProfile";

// Get Renter Investor Profile
export const getRenterInvestorProfile = async (): Promise<RenterInvestorProfileResponse> => {
  return apiGet<RenterInvestorProfileResponse>({
    baseURL: getRenterAuthBaseURL(),
    endpoint: ENDPOINTS.RENTER_INVESTOR.PROFILE.GET,
    auth: true,
  });
};

// Update Renter Investor Profile
export const updateRenterInvestorProfile = async (
  data: UpdateRenterInvestorProfileRequest
): Promise<RenterInvestorProfileResponse> => {
  return apiPut<RenterInvestorProfileResponse>({
    baseURL: getRenterAuthBaseURL(),
    endpoint: ENDPOINTS.RENTER_INVESTOR.PROFILE.UPDATE,
    data,
    auth: true,
  });
};

// Change Renter Investor Password
export const changeRenterInvestorPassword = async (
  data: ChangeRenterInvestorPasswordRequest
): Promise<RenterInvestorProfileResponse> => {
  return apiPost<RenterInvestorProfileResponse>({
    baseURL: getRenterAuthBaseURL(),
    endpoint: ENDPOINTS.RENTER_INVESTOR.PROFILE.CHANGE_PASSWORD,
    data,
    auth: true,
  });
}; 