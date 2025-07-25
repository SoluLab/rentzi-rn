import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  DollarSign,
  Star,
  Phone,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react-native';

interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  owner: {
    name: string;
    phone: string;
    avatar: string;
  };
}

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Simulate loading property data
    setTimeout(() => {
      setProperty({
        id: id as string,
        title: 'Modern 3-Bedroom Apartment',
        description: 'Beautiful modern apartment with stunning city views. Recently renovated with high-end finishes and appliances. Perfect for families or professionals.',
        price: 2500,
        location: 'Downtown, City Center',
        bedrooms: 3,
        bathrooms: 2,
        area: 1200,
        type: 'Apartment',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800',
          'https://images.unsplash.com/photo-1560448204-5c9a89c1b6c1?w=800',
        ],
        amenities: [
          'Parking',
          'Gym',
          'Pool',
          'Security',
          'Balcony',
          'Air Conditioning',
          'Dishwasher',
          'In-unit Laundry'
        ],
        rating: 4.8,
        reviews: 127,
        owner: {
          name: 'John Smith',
          phone: '+1 (555) 123-4567',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        }
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleBookNow = () => {
    router.push(`/booking/${id}`);
  };

  const handleContactOwner = () => {
    Alert.alert('Contact Owner', `Call ${property?.owner.phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling owner') }
    ]);
  };

  const handleMessageOwner = () => {
    Alert.alert('Message Owner', 'Open messaging app?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => console.log('Opening messaging app') }
    ]);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    Alert.alert('Share Property', 'Share this property listing?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Share', onPress: () => console.log('Sharing property') }
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!property) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Property not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Header
        title="Property Details"
        showBackButton={true}
        onBackPress={() => router.back()}
        rightComponent={
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity onPress={toggleFavorite}>
              <Heart size={24} color={isFavorite ? colors.status.error : colors.text.secondary} fill={isFavorite ? colors.status.error : 'none'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Property Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.images[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.priceTag}>
              <DollarSign size={16} color={colors.background.primary} />
              <Text style={styles.priceText}>{property.price.toLocaleString()}/month</Text>
            </View>
          </View>
        </View>

        {/* Property Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{property.title}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.text.secondary} />
            <Text style={styles.locationText}>{property.location}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Star size={16} color={colors.primary.gold} fill={colors.primary.gold} />
            <Text style={styles.ratingText}>{property.rating}</Text>
            <Text style={styles.reviewsText}>({property.reviews} reviews)</Text>
          </View>

          {/* Property Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Bed size={20} color={colors.text.secondary} />
              <Text style={styles.statText}>{property.bedrooms} Beds</Text>
            </View>
            <View style={styles.statItem}>
              <Bath size={20} color={colors.text.secondary} />
              <Text style={styles.statText}>{property.bathrooms} Baths</Text>
            </View>
            <View style={styles.statItem}>
              <Square size={20} color={colors.text.secondary} />
              <Text style={styles.statText}>{property.area} sq ft</Text>
            </View>
          </View>

          {/* Description */}
          <Card style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{property.description}</Text>
          </Card>

          {/* Amenities */}
          <Card style={styles.amenitiesCard}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityText}>• {amenity}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Owner Info */}
          <Card style={styles.ownerCard}>
            <Text style={styles.sectionTitle}>Property Owner</Text>
            <View style={styles.ownerInfo}>
              <Image
                source={{ uri: property.owner.avatar }}
                style={styles.ownerAvatar}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{property.owner.name}</Text>
                <Text style={styles.ownerPhone}>{property.owner.phone}</Text>
              </View>
            </View>
            <View style={styles.ownerActions}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactOwner}
              >
                <Phone size={16} color={colors.primary.gold} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleMessageOwner}
              >
                <MessageCircle size={16} color={colors.primary.gold} />
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          style={styles.bookButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.variants.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.variants.body,
    color: colors.status.error,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  priceText: {
    ...typography.variants.body,
    color: colors.background.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.variants.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationText: {
    ...typography.variants.body,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingText: {
    ...typography.variants.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  reviewsText: {
    ...typography.variants.body,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    ...typography.variants.body,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  descriptionCard: {
    marginBottom: spacing.md,
  },
  amenitiesCard: {
    marginBottom: spacing.md,
  },
  ownerCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.variants.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.variants.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    width: '50%',
    marginBottom: spacing.xs,
  },
  amenityText: {
    ...typography.variants.body,
    color: colors.text.secondary,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.sm,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    ...typography.variants.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  ownerPhone: {
    ...typography.variants.body,
    color: colors.text.secondary,
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.gold,
    borderRadius: spacing.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
    justifyContent: 'center',
  },
  contactButtonText: {
    ...typography.variants.body,
    color: colors.primary.gold,
    marginLeft: spacing.xs,
  },
  bottomBar: {
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bookButton: {
    backgroundColor: colors.primary.gold,
  },
}); 