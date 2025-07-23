import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import {
  Plus,
  Building2,
  CheckCircle2,
  CheckCircle,
  Clock,
  XCircle,
  AArrowDown,
  AArrowUp,
  Eye,
  ALargeSmall,
} from 'lucide-react-native';
// Mock data for property management
const mockProperties = [
  {
    id: '1',
    title: 'Luxury Oceanfront Villa',
    location: 'Malibu, USA',
    status: 'approved',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&quality=40',
    price: 2500,
    bedrooms: 5,
    bathrooms: 4,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Manhattan Penthouse Suite',
    location: 'New York, USA',
    status: 'pending',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&quality=40',
    price: 3500,
    bedrooms: 3,
    bathrooms: 3,
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    title: 'Swiss Alpine Chalet',
    location: 'Zermatt, Switzerland',
    status: 'approved',
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&quality=40',
    price: 4000,
    bedrooms: 6,
    bathrooms: 5,
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    title: 'Santorini Cliffside Villa',
    location: 'Santorini, Greece',
    status: 'rejected',
    image:
      'https://images.unsplash.com/photo-1533116927835-e3bfa3b8a1bd?w=400&h=300&fit=crop&quality=40',
    price: 3000,
    bedrooms: 3,
    bathrooms: 2,
    createdAt: '2024-02-05',
  },
];
export default function PropertyManagementScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>(
    'all'
  );
  const handleAddProperty = () => {
    router.push('/add-property');
  };
  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };
  const handleEditProperty = (propertyId: string) => {
    router.push(`/edit-property/${propertyId}`);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.status.success;
      case 'pending':
        return colors.primary.gold;
      case 'rejected':
        return colors.status.error;
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
      default:
        return Clock;
    }
  };
  const filteredProperties =
    selectedFilter === 'all'
      ? mockProperties
      : mockProperties.filter((property) => property.status === selectedFilter);
  const getFilterCount = (filter: string) => {
    if (filter === 'all') return mockProperties.length;
    return mockProperties.filter((property) => property.status === filter).length;
  };
  const renderPropertyCard = ({ item: property }: { item: any }) => {
    const StatusIcon = getStatusIcon(property.status);
    return (
      <Card style={styles.propertyCard}>
        <Image source={{ uri: property.image }} style={styles.propertyImage} />
        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <Typography variant="h5" numberOfLines={1} style={styles.propertyTitle}>
              {property.title}
            </Typography>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) }]}
            >
              <StatusIcon size={12} color={colors.neutral.white} />
              <Typography variant="label" color="inverse" style={styles.statusText}>
                {property.status.toUpperCase()}
              </Typography>
            </View>
          </View>
          <Typography variant="caption" color="secondary" numberOfLines={1}>
            {property.location}
          </Typography>
          <View style={styles.propertyDetails}>
            <Typography variant="body" color="gold">
              ${property.price}/night
            </Typography>
            <Typography variant="caption" color="secondary">
              {property.bedrooms} bed • {property.bathrooms} bath
            </Typography>
          </View>
          <Typography variant="caption" color="secondary">
            Listed on {new Date(property.createdAt).toLocaleDateString()}
          </Typography>
          <View style={styles.propertyActions}>
            <TouchableOpacity
              onPress={() => handlePropertyPress(property.id)}
              style={styles.actionButton}
            >
              <Eye size={16} color={colors.primary.navy} />
              <Typography variant="caption" color="primary">
                View
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEditProperty(property.id)}
              style={styles.actionButton}
            >
              <AArrowUp size={16} color={colors.primary.navy} />
              <Typography variant="caption" color="primary">
                Edit
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <ALargeSmall size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };
  return (
    <View style={styles.container}>
      <Header
        title="Property Management"
        subtitle="Manage your luxury properties"
        showBackButton={false}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Add Property Button */}
        <View style={styles.section}>
          <Button
            title="Add New Property"
            onPress={handleAddProperty}
            style={styles.addPropertyButton}
            leftIcon={<Plus size={20} color={colors.neutral.white} />}
          />
        </View>
        {/* Filter Tabs */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
              {[
                { key: 'all', label: 'All Properties' },
                { key: 'approved', label: 'Approved' },
                { key: 'pending', label: 'Pending' },
                { key: 'rejected', label: 'Rejected' },
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
                    color={selectedFilter === filter.key ? 'white' : 'secondary'}
                    style={styles.filterText}
                  >
                    {filter.label} ({getFilterCount(filter.key)})
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        {/* Properties List */}
        <View style={styles.section}>
          {filteredProperties.length > 0 ? (
            <FlatList
              data={filteredProperties}
              renderItem={renderPropertyCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <Card style={styles.emptyState}>
              <Building2 size={48} color={colors.text.secondary} />
              <Typography variant="h4" color="secondary" align="center">
                No properties found
              </Typography>
              <Typography variant="body" color="secondary" align="center">
                {selectedFilter === 'all'
                  ? 'Start by adding your first property'
                  : `No ${selectedFilter} properties at the moment`}
              </Typography>
              {selectedFilter === 'all' && (
                <Button
                  title="Add Property"
                  onPress={handleAddProperty}
                  style={styles.emptyStateButton}
                />
              )}
            </Card>
          )}
        </View>
      </ScrollView>
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 120,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyStateButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});