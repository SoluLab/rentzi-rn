import { create } from 'zustand';
import { RenterInvestorProfileData } from '@/types/renterInvestorProfile';

interface ProfileState {
  profileData: RenterInvestorProfileData | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  lastFetched: number | null;
}

interface ProfileActions {
  setProfileData: (data: RenterInvestorProfileData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  clearError: () => void;
  clearProfileData: () => void;
  updateLastFetched: () => void;
  isDataStale: () => boolean;
}

type ProfileStore = ProfileState & ProfileActions;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profileData: null,
  isLoading: false,
  isError: false,
  error: null,
  lastFetched: null,

  // Actions
  setProfileData: (data: RenterInvestorProfileData) => {
    set({ 
      profileData: data, 
      isLoading: false, 
      isError: false, 
      error: null,
      lastFetched: Date.now()
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: any) => {
    set({ 
      error, 
      isError: true, 
      isLoading: false 
    });
  },

  clearError: () => {
    set({ error: null, isError: false });
  },

  clearProfileData: () => {
    set({ 
      profileData: null, 
      isLoading: false, 
      isError: false, 
      error: null,
      lastFetched: null
    });
  },

  updateLastFetched: () => {
    set({ lastFetched: Date.now() });
  },

  isDataStale: () => {
    const { lastFetched } = get();
    if (!lastFetched) return true;
    
    // Consider data stale after 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastFetched > fiveMinutes;
  },
})); 