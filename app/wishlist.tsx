import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from '@/components/ui/Toast';
import { MapPin, Heart, TrendingUp, Star } from 'lucide-react-native';

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getUserWishlist, removeFromWishlist } = useWishlistStore();

  const wishlistItems = user ? getUserWishlist(user.id) : [];

  const handlePropertyPress = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };

  const handleRemoveFromWishlist = (propertyId: string) => {
    if (!user) return;
    
    removeFromWishlist(user.id, propertyId);
    toast.success('Removed from wishlist');
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => handlePropertyPress(item.property.id)} 
      style={styles.propertyItem}
    >
      <Card style={styles.propertyCard}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.property.mediaGallery.images[0] }} 
            style={styles.propertyImage} 
          />
          <TouchableOpacity
            onPress={() => handleRemoveFromWishlist(item.property.id)}
            style={styles.wishlistButton}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={colors.status.error}
              fill={colors.status.error}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.propertyContent}>
          <View style={styles.propertyHeader}>
            <Typography variant="h4" numberOfLines={1}>
              {item.property.title}
            </Typography>
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.primary.gold} fill={colors.primary.gold} />
              <Typography variant="caption" color="secondary">
                {item.property.rating}
              </Typography>
            </View>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.text.secondary} />
            <Typography variant="caption" color="secondary" numberOfLines={1}>
              {item.property.location.city}, {item.property.location.country}
            </Typography>
          </View>
          
          <View style={styles.propertyDetails}>
            <Typography variant="caption" color="secondary">
              {item.property.bedrooms} bed • {item.property.bathrooms} bath
            </Typography>
          </View>
          
          <View style={styles.propertyFooter}>
            <View>
              <Typography variant="body" color="gold">
                ${item.property.price.rent}/night
              </Typography>
              <Typography variant="caption" color="secondary">
                Investment from ${item.property.price.investment.toLocaleString()}
              </Typography>
              <View style={styles.investmentInfo}>
                <TrendingUp size={12} color={colors.status.success} />
                <Typography variant="caption" color="success">
                  {item.property.investmentDetails.roiEstimate}% yield
                </Typography>
              </View>
            </View>
            <View style={styles.propertyType}>
              <Typography variant="caption" color="white">
                {item.property.propertyType.toUpperCase()}
              </Typography>
            </View>
          </View>
          
          <Typography variant="label" color="secondary" style={styles.addedDate}>
            Added {new Date(item.addedAt).toLocaleDateString()}
          </Typography>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Heart size={64} color={colors.text.secondary} />
      <Typography variant="h3" color="secondary" align="center" style={styles.emptyTitle}>
        Your Wishlist is Empty
      </Typography>
      <Typography variant="body" color="secondary" align="center" style={styles.emptySubtitle}>
        Start exploring luxury properties and save your favorites here
      </Typography>
      <TouchableOpacity 
        onPress={() => router.push('/(tabs)')}
        style={styles.exploreButton}
      >
        <Typography variant="body" color="gold">
          Explore Properties
        </Typography>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Wishlist" showBackButton={true} />
      
      {wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.propertiesList}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  propertiesList: {
    padding: spacing.layout.screenPadding,
  },
  propertyItem: {
    marginBottom: spacing.lg,
  },
  propertyCard: {
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.primary.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 200,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
  wishlistButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.full,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  propertyContent: {
    gap: spacing.sm,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  propertyDetails: {
    marginVertical: spacing.xs,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  investmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  propertyType: {
    backgroundColor: colors.primary.lightGold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addedDate: {
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.layout.screenPadding,
    gap: spacing.lg,
  },
  emptyTitle: {
    marginTop: spacing.md,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    borderRadius: radius.md,
  },
});