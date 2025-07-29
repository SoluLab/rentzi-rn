import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Modal } from '@/components/ui/Modal';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { shadow } from '@/constants/shadow';
import { useCommercialPropertyStore } from '@/stores/commercialPropertyStore';
import { useResidentialPropertyStore } from '@/stores/residentialPropertyStore';
import { useHomeownerPropertyStore, HomeownerProperty } from '@/stores/homeownerPropertyStore';
import {
  Plus,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AArrowUp,
  Eye,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  X,
  Home,
  Building,
  Edit3,
  Trash2,
  Coins,
  DollarSign,
  TrendingUp,
} from 'lucide-react-native';

export default function TokenizedHomeownerScreen() {
  const router = useRouter();
  const { resetStore: resetCommercialStore } = useCommercialPropertyStore();
  const { resetStore: resetResidentialStore } = useResidentialPropertyStore();
  const { 
    properties, 
    isLoading, 
    fetchProperties, 
    deleteProperty, 
    updatePropertyStatus,
    syncFromCommercialStore,
    syncFromResidentialStore
  } = useHomeownerPropertyStore();
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<HomeownerProperty | null>(null);

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
    // Sync with property stores
    syncFromCommercialStore();
    syncFromResidentialStore();
  }, []);

  const handleAddProperty = () => {
    setShowPropertyModal(true);
  };

  const handleCloseModal = () => {
    setShowPropertyModal(false);
  };

  const handleAddCommercialProperty = () => {
    setShowPropertyModal(false);
    resetCommercialStore();
    router.push('/add-commercial-details/add-commercial-property');
  };

  const handleAddResidentialProperty = () => {
    setShowPropertyModal(false);
    resetResidentialStore();
    router.push('/add-residential-details/add-residential-property');
  };

  const handleViewProperty = (property: HomeownerProperty) => {
    setSelectedProperty(property);
    router.push(`/property-details/${property.id}`);
  };

  const handleEditProperty = (property: HomeownerProperty) => {
    if (property.type === 'commercial') {
      router.push('/add-commercial-details/add-commercial-property');
    } else {
      router.push({
        pathname: '/add-residential-details/add-residential-property',
        params: { id: property.id },
      });
    }
  };

  const handleDeleteProperty = (property: HomeownerProperty) => {
    Alert.alert(
      'Delete Tokenized Property',
      `Are you sure you want to delete "${property.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProperty(property.id);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.status.success;
      case 'pending':
        return colors.primary.gold;
      case 'rejected':
        return colors.status.error;
      case 'draft':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
        return XCircle;
      case 'draft':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Tokenized';
      case 'pending':
        return 'Pending Tokenization';
      case 'rejected':
        return 'Tokenization Failed';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  // Filter properties based on search query and selected filter
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || property.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getFilterCount = (filter: string) => {
    if (filter === 'all') return properties.length;
    return properties.filter((property) => property.status === filter).length;
  };

  const renderTokenizedPropertyCard = ({ item: property }: { item: HomeownerProperty }) => {
    const StatusIcon = getStatusIcon(property.status);
    
    return (
      <Card style={styles.propertyCard}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: property.image }} style={styles.propertyImage} />
          <View style={styles.statusContainer}>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) }]}
            >
              <StatusIcon size={12} color={colors.neutral.white} />
              <Typography variant="label" color="inverse" style={styles.statusText}>
                {getStatusLabel(property.status)}
              </Typography>
            </View>
            {property.rejectionReason && (
              <View style={styles.rejectionReasonContainer}>
                <AlertCircle size={12} color={colors.status.error} />
                <Typography variant="caption" color="error" numberOfLines={2}>
                  {property.rejectionReason}
                </Typography>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <Typography variant="h5" numberOfLines={1} style={styles.propertyTitle}>
              {property.title}
            </Typography>
            <View style={styles.propertyTypeBadge}>
              <Typography variant="caption" color="secondary">
                {property.type === 'commercial' ? 'Commercial' : 'Residential'}
              </Typography>
            </View>
          </View>
          
          <Typography variant="caption" color="secondary" numberOfLines={1}>
            {property.location}
          </Typography>
          
          <View style={styles.propertyDetails}>
            {property.price && (
              <View style={styles.tokenizedPriceContainer}>
                <DollarSign size={16} color={colors.primary.gold} />
                <Typography variant="body" color="gold">
                  ${parseInt(property.price).toLocaleString()}
                </Typography>
              </View>
            )}
            <View style={styles.propertySpecs}>
              {property.bedrooms && (
                <Typography variant="caption" color="secondary">
                  {property.bedrooms} bed
                </Typography>
              )}
              {property.bathrooms && (
                <Typography variant="caption" color="secondary">
                  • {property.bathrooms} bath
                </Typography>
              )}
              {property.squareFootage && (
                <Typography variant="caption" color="secondary">
                  • {property.squareFootage} sq ft
                </Typography>
              )}
            </View>
          </View>
          
          <View style={styles.tokenizedInfo}>
            <View style={styles.tokenizedStats}>
              <TrendingUp size={14} color={colors.primary.gold} />
              <Typography variant="caption" color="gold">
                Token Value: $1,250,000
              </Typography>
            </View>
            <Typography variant="caption" color="secondary">
              {property.status === 'draft' ? 'Created' : 'Tokenized'} on {(property.createdAt instanceof Date ? property.createdAt : new Date(property.createdAt || Date.now())).toLocaleDateString()}
            </Typography>
          </View>
          
          <View style={styles.propertyActions}>
            <TouchableOpacity
              onPress={() => handleViewProperty(property)}
              style={styles.actionButton}
            >
              <Eye size={16} color={colors.primary.navy} />
              <Typography variant="caption" color="primary">
                View Details
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleEditProperty(property)}
              style={styles.actionButton}
            >
              <Edit3 size={16} color={colors.primary.navy} />
              <Typography variant="caption" color="primary">
                Edit
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleDeleteProperty(property)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Trash2 size={16} color={colors.status.error} />
              <Typography variant="caption" color="error">
                Delete
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  const PropertyTypeModal = () => (
    <Modal visible={showPropertyModal} onClose={handleCloseModal}>
      <View style={styles.modalHeader}>
        <Typography variant="h4" style={styles.modalTitle}>
          Tokenize New Property
        </Typography>
        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
          <X size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <Typography variant="body" color="secondary" style={styles.modalSubtitle}>
        Choose the type of property you want to tokenize in your portfolio
      </Typography>

      <View style={styles.propertyTypeContainer}>
        <TouchableOpacity
          style={styles.propertyTypeCard}
          onPress={handleAddResidentialProperty}
        >
          <View style={styles.propertyTypeIcon}>
            <Home size={32} color={colors.primary.gold} />
          </View>
          <View style={styles.propertyTypeContent}>
            <Typography variant="h5" style={styles.propertyTypeTitle}>
              Residential Property
            </Typography>
            <Typography variant="caption" color="secondary" style={styles.propertyTypeDescription}>
              Houses, apartments, villas, and other residential units for tokenization
            </Typography>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.propertyTypeCard}
          onPress={handleAddCommercialProperty}
        >
          <View style={styles.propertyTypeIcon}>
            <Building size={32} color={colors.primary.blue} />
          </View>
          <View style={styles.propertyTypeContent}>
            <Typography variant="h5" style={styles.propertyTypeTitle}>
              Commercial Property
            </Typography>
            <Typography variant="caption" color="secondary" style={styles.propertyTypeDescription}>
              Office buildings, retail spaces, warehouses, and other commercial real estate for tokenization
            </Typography>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Tokenized Properties"
        subtitle="Manage your tokenized luxury properties"
        showBackButton={true}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

      
        {/* Search and Filter Section */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={colors.text.secondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tokenized properties..."
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={colors.primary.navy} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
              {[
                { key: 'all', label: 'All Tokenized' },
                { key: 'pending', label: 'Pending Tokenization' },
                { key: 'approved', label: 'Tokenized' },
                { key: 'rejected', label: 'Tokenization Failed' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key as any)}
                  style={[
                    styles.filterTab,
                    selectedFilter === filter.key && styles.activeFilterTab,
                  ]}
                >
                  <Typography
                    variant="body"
                    color={selectedFilter === filter.key ? 'inverse' : 'secondary'}
                    style={styles.filterText}
                  >
                    {filter.label} ({getFilterCount(filter.key)})
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tokenized Properties List */}
        <View style={styles.section}>
          {filteredProperties.length > 0 ? (
            <FlatList
              data={filteredProperties}
              renderItem={renderTokenizedPropertyCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <Card style={styles.emptyState}>
              <Coins size={48} color={colors.text.secondary} />
              <Typography variant="h4" color="secondary" align="center">
                No tokenized properties found
              </Typography>
              <Typography variant="body" color="secondary" align="center">
                {searchQuery
                  ? 'No tokenized properties match your search criteria'
                  : selectedFilter === 'all'
                  ? 'Start by tokenizing your first property'
                  : `No ${selectedFilter} tokenized properties at the moment`}
              </Typography>
              {selectedFilter === 'all' && !searchQuery && (
                <Button
                  title="Tokenize Property"
                  onPress={handleAddProperty}
                  style={styles.emptyStateButton}
                />
              )}
            </Card>
          )}
        </View>
      </ScrollView>
      
      <PropertyTypeModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  addPropertyButton: {
    marginHorizontal: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'Montserrat-Regular',
  },
  filterButton: {
    padding: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.small,
  },
  activeFilterTab: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  filterText: {
    fontWeight: '500',
  },
  propertyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.medium,
  },
  cardHeader: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 140,
  },
  statusContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    ...shadow.small,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rejectionReasonContainer: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: 150,
    ...shadow.small,
  },
  propertyContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  propertyTypeBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenizedPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  propertySpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tokenizedInfo: {
    gap: spacing.xs,
  },
  tokenizedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.background.secondary,
  },
  deleteButton: {
    backgroundColor: colors.background.tertiary,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    ...shadow.medium,
  },
  emptyStateButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  modalSubtitle: {
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  propertyTypeContainer: {
    gap: spacing.md,
  },
  propertyTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  propertyTypeContent: {
    flex: 1,
  },
  propertyTypeTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  propertyTypeDescription: {
    lineHeight: 16,
  },
}); 