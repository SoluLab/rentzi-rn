import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useHomeownerGetAllProperties, useHomeownerDashboardStats } from "@/services/homeownerDashboard";
import { useCommercialPropertyStore } from "@/stores/commercialPropertyStore";
import { useResidentialPropertyStore } from "@/stores/residentialPropertyStore";
import { useHomeownerPropertyStore } from "@/stores/homeownerPropertyStore";

interface UseHomeownerDashboardReturn {
  // Dashboard stats
  dashboardStats: any;
  isStatsLoading: boolean;
  statsError: any;
  refetchStats: () => void;
  
  // Properties data
  properties: any[];
  isPropertiesLoading: boolean;
  propertiesError: any;
  refetchProperties: () => void;
  
  // Pagination
  currentPage: number;
  hasMoreData: boolean;
  loadMoreProperties: () => void;
  refreshData: () => void;
  
  // Property management
  handlePropertyPress: (propertyId: string) => void;
}

export const useHomeownerDashboard = (): UseHomeownerDashboardReturn => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [allProperties, setAllProperties] = useState<any[]>([]);

  // Store hooks
  const { resetStore: resetCommercialStore } = useCommercialPropertyStore();
  const { resetStore: resetResidentialStore } = useResidentialPropertyStore();
  const { syncFromCommercialStore, syncFromResidentialStore } = useHomeownerPropertyStore();

  // API hooks
  const { 
    data: dashboardStats, 
    isLoading: isStatsLoading, 
    error: statsError,
    refetch: refetchStats
  } = useHomeownerDashboardStats();

  const { 
    data: propertiesData, 
    isLoading: isPropertiesLoading, 
    error: propertiesError,
    refetch: refetchProperties
  } = useHomeownerGetAllProperties({
    page: currentPage,
    limit: 10,
  });

  // Handle pagination data
  useEffect(() => {
    if (propertiesData?.data) {
      if (currentPage === 1) {
        // First page - replace all data
        setAllProperties(propertiesData.data);
      } else {
        // Subsequent pages - append data
        setAllProperties(prev => [...prev, ...propertiesData.data]);
      }
      
      // Check if there's more data
      const pagination = propertiesData.pagination;
      setHasMoreData(pagination?.currentPage < pagination?.totalPages);
    }
  }, [propertiesData, currentPage]);

  // Sync with property stores on mount
  useEffect(() => {
    syncFromCommercialStore();
    syncFromResidentialStore();
  }, []);

  // Refetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refetch dashboard stats and properties when screen is focused
      refetchStats();
      if (currentPage === 1) {
        refetchProperties();
      }
    }, [refetchStats, refetchProperties, currentPage])
  );

  const loadMoreProperties = () => {
    if (hasMoreData && !isPropertiesLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const refreshData = () => {
    setCurrentPage(1);
    setAllProperties([]);
    setHasMoreData(true);
    // Refetch both stats and properties
    refetchStats();
    refetchProperties();
  };

  const handlePropertyPress = (propertyId: string) => {
    // This will be handled by the component using the hook
    // We'll pass this function to the component
  };

  return {
    // Dashboard stats
    dashboardStats: dashboardStats?.data,
    isStatsLoading,
    statsError,
    refetchStats,
    
    // Properties data
    properties: allProperties,
    isPropertiesLoading,
    propertiesError,
    refetchProperties,
    
    // Pagination
    currentPage,
    hasMoreData,
    loadMoreProperties,
    refreshData,
    
    // Property management
    handlePropertyPress,
  };
}; 