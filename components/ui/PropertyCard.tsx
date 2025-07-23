import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { Card } from './Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from './Toast';
import { MapPin, TrendingUp, Calendar, Users, Heart } from 'lucide-react-native';
interface Property {
  id: string;
  title: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  mediaGallery: {
    images: string[];
  };
  pricing: {
    rentPerNight: number;
    currency: string;
  };
  investmentDetails: {
    roiEstimate: number;
    minimumInvestment: number;
  };
  availability: {
    startDate: string;
    endDate: string;
  };
  capacity: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
  };
  amenities: string[];
  propertyType: string;
  status: string;
}
interface PropertyCardProps {
  property: Property;
  showType?: 'rental' | 'investment' | 'both';
  onPress?: () => void;
}
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showType = 'both',
  onPress,
}) => {
  const { user } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const showRental = showType === 'rental' || showType === 'both';
  const showInvestment = showType === 'investment' || showType === 'both';
  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    const isWishlisted = isInWishlist(user.id, property.id);
    if (isWishlisted) {
      removeFromWishlist(user.id, property.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(user.id, property);
      toast.success('Added to wishlist');
    }
  };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.mediaGallery?.images?.[0] }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={handleWishlistToggle}
            style={styles.wishlistButton}
            activeOpacity={0.8}
          >
            <Heart
              size={20}
              color={
                user && isInWishlist(user.id, property.id)
                  ? colors.status.error
                  : colors.neutral.white
              }
              fill={
                user && isInWishlist(user.id, property.id) ? colors.status.error : 'transparent'
              }
            />
          </TouchableOpacity>
          <View style={styles.statusBadge}>
            <Typography variant="label" color="inverse">
              {property.status?.toUpperCase()}
            </Typography>
          </View>
        </View>
        <View style={styles.content}>
          <Typography variant="h4" numberOfLines={2} style={styles.title}>
            {property.title}
          </Typography>
          <View style={styles.location}>
            <MapPin size={16} color={colors.text.secondary} />
            <Typography variant="body" color="secondary" numberOfLines={1}>
              {property.location?.city}, {property.location?.state}
            </Typography>
          </View>
          <View style={styles.details}>
            <View style={styles.capacity}>
              <Users size={16} color={colors.text.secondary} />
              <Typography variant="caption" color="secondary">
                {property.capacity?.guests} guests • {property.capacity?.bedrooms} bed •{' '}
                {property.capacity?.bathrooms} bath
              </Typography>
            </View>
          </View>
          <View style={styles.pricing}>
            {showRental && (
              <View style={styles.priceSection}>
                <Typography variant="h4" color="gold">
                  ${property.pricing?.rentPerNight}
                </Typography>
                <Typography variant="caption" color="secondary">
                  per night
                </Typography>
              </View>
            )}
            {showInvestment && (
              <View style={styles.investmentSection}>
                <View style={styles.roiContainer}>
                  <TrendingUp size={16} color={colors.primary.gold} />
                  <Typography variant="body" color="gold">
                    {property.investmentDetails?.roiEstimate}% ROI
                  </Typography>
                </View>
                <Typography variant="caption" color="secondary">
                  Min. ${property.investmentDetails?.minimumInvestment?.toLocaleString()}
                </Typography>
              </View>
            )}
          </View>
          <View style={styles.availability}>
            <Calendar size={16} color={colors.text.secondary} />
            <Typography variant="caption" color="secondary">
              Available: {new Date(property.availability?.startDate)?.toLocaleDateString()} -{' '}
              {new Date(property.availability?.endDate)?.toLocaleDateString()}
            </Typography>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  wishlistButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: radius.full,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    marginBottom: spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  details: {
    gap: spacing.xs,
  },
  capacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  priceSection: {
    alignItems: 'flex-start',
  },
  investmentSection: {
    alignItems: 'flex-end',
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});