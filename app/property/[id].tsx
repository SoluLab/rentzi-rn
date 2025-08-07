import React from 'react';
import {
Alert,
Dimensions,
Image,
Platform,
ScrollView,
StyleSheet,
Text,
TouchableOpacity,
View
} from 'react-native';
import { KYCHandler } from '@/services/kycHandler';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
/*import MapView, { Marker } from 'react-native-maps';*/
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { usePropertyStore } from '@/stores/propertyStore';
import { useAuthStore } from '@/stores/authStore';
import {
ArrowLeft,
MapPin,
Star,
Calendar,
TrendingUp,
Users,
Wifi,
Car,
Waves,
Share,
Play,
ChefHat,
Dumbbell,
Snowflake,
Flame,
Shield,
Home,
TreePine,
Utensils,
Coffee,
Bath,
Bed,
Phone,
Mail,
CheckCircle,
Clock,
Coins,
FileText,
RefreshCw,
DollarSign,
} from 'lucide-react-native';
import { useState } from "react";
const { width, height } = Dimensions.get('window');
export default function PropertyDetailScreen() {
const router = useRouter();
const { id } = useLocalSearchParams();
const { getPropertyById, claimRentalPayout, isLoading } = usePropertyStore();
const { user } = useAuthStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showInvestmentModal, setShowInvestmentModal] = useState(false);
    // KYC modal state removed - now using dedicated KYC screen
    const [showCalendar, setShowCalendar] = useState(false);
    const [showDatesModal, setShowDatesModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
    const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
    const [show360Tour, setShow360Tour] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedDateRange, setSelectedDateRange] = useState<string>('');
    const [showClaimModal, setShowClaimModal] = useState(false);
    const property = getPropertyById(id as string);
    if (!property) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Typography variant="h4" color="secondary" align="center">
                        Property not found
                    </Typography>
                    <Button title="Go Back" onPress={() => router.back()} variant="outline" />
                </View>
            </SafeAreaView>
        );
    }
    const handleBooking = () => {
        if (
            !property.availabilityCalendar.available ||
            !property.availabilityCalendar.availableDates?.length
        ) {
            Alert.alert('Not Available', 'This property has no available dates for booking.');
            return;
        }
        router.push({ pathname: '/calendar/check-in-out', params: { propertyId: id } });
    };
    const handleInvestment = () => {
        if (!user?.kycStatus || user.kycStatus === 'incomplete') {
            // Navigate directly to KYC verification screen for investors
            router.push('/kyc-verification?userType=investor');
            return;
        }
        if (user.kycStatus === 'pending') {
            // Show pending message and navigate to KYC screen
            Alert.alert(
                'KYC Pending',
                'Your KYC verification is currently under review. Please check back later.',
                [
                    { text: 'OK', onPress: () => router.push('/kyc-verification?userType=investor') }
                ]
            );
            return;
        }
        setShowInvestmentModal(true);
    };
    const handleBookingConfirm = () => {
        setShowBookingModal(false);
        router.push(`/booking/${property.id}`);
        //router.push({ pathname: '/calendar/check-in-out', params: { propertyId: id } })
    };
    const handleInvestmentConfirm = () => {
        setShowInvestmentModal(false);
        router.push(`/investment/${property.id}`);
    };

    // handleKYCVerification function removed - now handled directly in handleInvestment
    const handle360Tour = () => {
    if (property.mediaGallery.tour3D) {
    // Open 360° tour
    setShow360Tour(true);
    } else {
    Alert.alert('Coming Soon', '360° tour will be available soon for this property.');
    }
    };
    const handleClaimRentalPayout = async () => {
    try {
    await claimRentalPayout(property.id);
    Alert.alert('Success', 'Rental payout claimed successfully!');
    setShowClaimModal(false);
    } catch (error) {
    console.error('Error claiming rental payout:', error);
    Alert.alert('Error', 'Failed to claim rental payout. Please try again.');
    }
    };
    const amenityIcons: { [key: string]: any } = {
        'Ocean View': Waves,
        'Infinity Pool': Waves,
        'Private Beach': Waves,
        Spa: Bath,
        'Wine Cellar': Coffee,
        'City Views': MapPin,
        'Rooftop Terrace': Home,
        Concierge: Users,
        Gym: Dumbbell,
        'Private Elevator': Car,
        'Ski Access': Snowflake,
        'Mountain Views': TreePine,
        Fireplace: Flame,
        'Hot Tub': Waves,
        WiFi: Wifi,
        'Wi-Fi': Wifi,
        'High-Speed Wi-Fi': Wifi,
        Parking: Car,
        'Chef Kitchen': ChefHat,
        Kitchen: ChefHat,
        AC: Snowflake,
        'Air Conditioning': Snowflake,
        Security: Shield,
        '24/7 Security': Shield,
        'Smart Home': Home,
        Balcony: Home,
        Terrace: Home,
        Garden: TreePine,
        Pool: Waves,
        Jacuzzi: Waves,
        Sauna: Flame,
        'Game Room': Users,
        Dining: Utensils,
        'Outdoor Dining': Utensils,
        Breakfast: Coffee,
        'Room Service': Utensils,
        Laundry: Home,
        Cleaning: Home,
        Workspace: Home,
        Office: Home,
        Library: Home,
        'Reading Nook': Home,
        Entertainment: Users,
        'Sound System': Users,
        TV: Users,
        Netflix: Users,
        Streaming: Users,
    };
    // Mock host data - in real app this would come from property.hostInfo
    const hostInfo = {
        name: 'Marcus Rothschild',
        avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&quality=40',
        bio: 'Luxury property curator with 15+ years of experience in high-end real estate. Passionate about providing exceptional experiences for discerning guests.',
        responseTime: 'Within 1 hour',
        responseRate: '100%',
        verified: true,
    };
    const isAvailableForRent =
    property.availabilityCalendar.available &&
    property.availabilityCalendar.availableDates &&
    property.availabilityCalendar.availableDates.length > 0;
    const fundedPercentage = Math.round(
    ((property.investmentDetails.totalShares - property.investmentDetails.availableShares) /
    property.investmentDetails.totalShares) *
    100
    );
    // Check if user is the property owner and property has claimable rental income
    const isPropertyOwner = user?.id === property.ownerId;
    const hasClaimableIncome = property.rentalIncome &&
    property.rentalIncome.payoutStatus === 'eligible' &&
    property.rentalIncome.claimableAmount > 0;
    const isPropertyActive = property.propertyStatus === 'active';
    const shouldShowClaimButton = isPropertyOwner && hasClaimableIncome && isPropertyActive;
    // Calendar helper functions
    const generateCalendarDays = (startDate: Date, months: number = 3) => {
        const days = [];
        const currentDate = new Date(startDate);
        for (let month = 0; month < months; month++) {
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + month + 1, 0);
            const firstDayOfWeek = monthStart.getDay();
            // Add month header
            days.push({
                type: 'month-header',
                date: monthStart,
                monthName: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            });
            // Add day headers
            days.push({
                type: 'day-headers',
                headers: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            });
            // Add empty cells for days before month starts
            for (let i = 0; i < firstDayOfWeek; i++) {
                days.push({ type: 'empty', date: null });
            }
            // Add all days of the month
            for (let day = 1; day <= monthEnd.getDate(); day++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, day);
                const dateString = date.toISOString().split('T')[0];
                const isBooked = property.availabilityCalendar.bookedDates.includes(dateString);
                const isAvailable =
                    property.availabilityCalendar.availableDates?.includes(dateString) || false;
                const isPast = date < new Date();
                days.push({
                    type: 'day',
                    date,
                    day,
                    isBooked,
                    isAvailable,
                    isPast,
                    isSelectable: !isBooked && !isPast && isAvailable,
                });
            }
        }
        return days;
    };
    const handleDateSelect = (date: Date) => {
        if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
            // First selection or reset selection
            setSelectedCheckIn(date);
            setSelectedCheckOut(null);
        } else if (selectedCheckIn && !selectedCheckOut) {
            // Second selection
            if (date > selectedCheckIn) {
                // Check if any booked dates are between selected dates
                const hasBookedInBetween = property.availabilityCalendar.bookedDates.some((bookedDate) => {
                    const booked = new Date(bookedDate);
                    return booked > selectedCheckIn && booked < date;
                });
                if (hasBookedInBetween) {
                    Alert.alert(
                        'Invalid Selection',
                        'There are booked dates in your selected range. Please choose different dates.'
                    );
                    setSelectedCheckIn(date);
                    setSelectedCheckOut(null);
                } else {
                    setSelectedCheckOut(date);
                }
            } else {
                // Selected date is before check-in, reset
                setSelectedCheckIn(date);
                setSelectedCheckOut(null);
            }
        }
    };
    const isDateInRange = (date: Date) => {
        if (!selectedCheckIn || !selectedCheckOut) return false;
        return date >= selectedCheckIn && date <= selectedCheckOut;
    };
    const calendarDays = generateCalendarDays(new Date());
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.neutral.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                    <Share size={24} color={colors.neutral.white} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image Gallery with 360° Tour */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const index = Math.round(event.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                    >
                        {property.mediaGallery?.images?.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={styles.propertyImage} />
                        )) || null}
                    </ScrollView>
                    <View style={styles.imageIndicator}>
                        <Typography variant="caption" color="inverse">
                            {currentImageIndex + 1} / {property.mediaGallery?.images?.length || 0}
                        </Typography>
                    </View>
                    {/* 360° Tour Button */}
                    <TouchableOpacity style={styles.tourButton} onPress={handle360Tour}>
                        <Play size={16} color={colors.neutral.white} />
                        <Typography variant="caption" color="inverse">
                            360° Tour
                        </Typography>
                    </TouchableOpacity>
                </View>
                {/* Property Info */}
                <View style={styles.content}>
                    <Card style={styles.infoCard}>
                        <View style={styles.titleSection}>
                            <Typography variant="h4">{property.title || 'Property Title'}</Typography>
                            <View style={styles.locationRow}>
                                <MapPin size={16} color={colors.text.secondary} />
                                <Typography variant="body" color="secondary">
                                    {property.location?.address || ''}, {property.location?.city || ''}, {property.location?.country || ''}
                                </Typography>
                            </View>
                            <View style={styles.ratingRow}>
                                <Star size={16} color={colors.primary.gold} fill={colors.primary.gold} />
                                <Typography variant="body">
                                    {property.rating || 0} ({property.reviews || 0} reviews)
                                </Typography>
                                <View style={styles.propertyTypeBadge}>
                                    <Typography variant="label" color="white">
                                        {property.propertyType?.toUpperCase() || 'PROPERTY'}
                                    </Typography>
                                </View>
                            </View>
                        </View>
                        <Typography variant="body" color="secondary" style={styles.description}>
                            {property.description || 'No description available'}
                        </Typography>
                        {/* Property Highlights
                        <View style={styles.highlightsContainer}>
                            <View style={styles.highlight}>
                                <Bed size={20} color={colors.primary.gold} />
                                <Typography variant="body">{property.bedrooms} Bedrooms</Typography>
                            </View>
                            <View style={styles.highlight}>
                                <Bath size={20} color={colors.primary.gold} />
                                <Typography variant="body">{property.bathrooms} Bathrooms</Typography>
                            </View>
                        </View>
                         */}
                    </Card>
                    {/* Bedrooms Section */}
                    <Card style={styles.bedroomsCard}>
                        <Typography variant="h4" style={styles.sectionTitle}>
                            Rooms
                        </Typography>
                        <View style={styles.bedroomDetails}>
                            <View style={styles.bedroomDetailItem}>
                                <Bed size={20} color={colors.primary.gold} />
                                <View style={styles.bedroomDetailText}>
                                    <Typography variant="body">{property.bedrooms} Bedrooms</Typography>
                                    <Typography variant="caption" color="secondary">
                                        Spacious and comfortable sleeping areas
                                    </Typography>
                                </View>
                            </View>
                            <View style={styles.bedroomDetailItem}>
                                <Home size={20} color={colors.primary.gold} />
                                <View style={styles.bedroomDetailText}>
                                    <Typography variant="body">2,500 sq ft</Typography>
                                    <Typography variant="caption" color="secondary">
                                        Total living space
                                    </Typography>
                                </View>
                            </View>
                            <View style={styles.bedroomDetailItem}>
                                <Bath size={20} color={colors.primary.gold} />
                                <View style={styles.bedroomDetailText}>
                                    <Typography variant="body">Attached Bathroom</Typography>
                                    <Typography variant="caption" color="secondary">
                                        Private ensuite in master bedroom
                                    </Typography>
                                </View>
                            </View>
                        </View>
                    </Card>
                    {/* Rent Pricing Card */}
                    <Card style={styles.rentCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.rentBadge}>
                                <Typography variant="label" color="inverse">
                                    RENT
                                </Typography>
                            </View>
                        </View>
                        <View style={styles.priceSection}>
                            <Typography variant="h3" color="primary">
                                ${property.price?.rent || 0}/night
                            </Typography>
                            <View style={styles.availabilityRow}>
                                <Calendar size={16} color={colors.status.success} />
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push({ pathname: '/calendar/check-in-out', params: { propertyId: id } })
                                    } >
                                    <Typography variant="body" color="success">
                                        Dates available
                                    </Typography>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                    {/* Investment Card */}
                    <Card style={styles.investmentCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.investBadge}>
                                <Typography variant="label" color="inverse">
                                    INVEST
                                </Typography>
                            </View>
                        </View>
                        <View style={styles.priceSection}>
                            <Typography variant="h3" color="primary">
                                ${((property.price?.investment || 0) / 100).toLocaleString()}/token
                            </Typography>
                            <Typography variant="body" color="gold">
                                + {property.investmentDetails?.roiEstimate || 0}% Expected Yield
                            </Typography>
                            <View style={styles.fundingRow}>
                                <TrendingUp size={16} color={colors.primary.gold} />
                                <Typography variant="body" color="secondary">
                                    {fundedPercentage}% Funded
                                </Typography>
                            </View>
                            <View style={styles.fundingRow}>
                                <Coins size={16} color={colors.primary.gold} />
                                <Typography variant="body" color="secondary">
                                    Hurry! 200 Tokens Left
                                </Typography>
                            </View>
                        </View>
                        {/*
                            <Typography variant="caption" color="secondary" style={styles.incomeNote}>
                                Earn rental income + appreciation
                            </Typography>
                        */}
                    </Card>
                    <Card style={styles.amenitiesCard}>
                        <Typography variant="h4" style={styles.sectionTitle}>
                            Amenities & Features
                        </Typography>
                        <View style={styles.amenitiesGrid}>
                            {property.amenities?.map((amenity, index) => {
                                const IconComponent = amenityIcons[amenity] || Home;
                                return (
                                    <View key={index} style={styles.amenityItem}>
                                        <IconComponent size={20} color={colors.primary.gold} />
                                        <Typography variant="body" style={styles.amenityText}>
                                            {amenity}
                                        </Typography>
                                    </View>
                                );
                            })}
                        </View>
                    </Card>
                    {/* Map View 
        <Card style={styles.mapCard}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Location
          </Typography>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: property.location.coordinates.latitude,
                longitude: property.location.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                latitude: property.location.coordinates.latitude,
                longitude: property.location.coordinates.longitude,
                }}
                title={property.title}
                description={property.location.address}
              />
            </MapView>
          </View>
          <Typography variant="body" color="secondary" style={styles.mapDescription}>
            {property.location.address}, {property.location.city}
          </Typography>
        </Card>
        
                    {/* Smart Home Entry Section - Only show if property has smart home entry */}
                    {property.smartHomeEntry && (
                        <Card style={styles.smartHomeCard}>
                            <View style={styles.featureHeader}>
                                <Shield size={24} color={colors.primary.gold} />
                                <Typography variant="h5" style={styles.featureTitle}>
                                    Smart Home Access
                                </Typography>
                            </View>
                            <Typography variant="body" color="secondary" style={styles.featureDescription}>
                                {property.smartHomeEntry}
                            </Typography>
                        </Card>
                    )}
                    {/* Concierge Services Section - Only show if property has concierge services */}
                    {property.conciergeServices && (
                        <Card style={styles.conciergeCard}>
                            <View style={styles.featureHeader}>
                                <Users size={24} color={colors.primary.gold} />
                                <Typography variant="h5" style={styles.featureTitle}>
                                    Concierge Services Included
                                </Typography>
                            </View>
                            <Typography variant="body" color="secondary" style={styles.featureDescription}>
                                {property.conciergeServices}
                            </Typography>
                        </Card>
                    )}
                    {/* Host Information 
                    <Card style={styles.hostCard}>
                        <Typography variant="h5" style={styles.sectionTitle}>
                            Your Host
                        </Typography>
                        <View style={styles.hostInfo}>
                            <View style={styles.hostHeader}>
                                <Image source={{ uri: hostInfo.avatar }} style={styles.hostAvatar} />
                                <View style={styles.hostDetails}>
                                    <View style={styles.hostNameRow}>
                                        <Typography variant="h5">{hostInfo.name}</Typography>
                                        {hostInfo.verified && <CheckCircle size={16} color={colors.status.success} />}
                                    </View>
                                </View>
                            </View>
                            <Typography variant="body" color="secondary" style={styles.hostBio}>
                                {hostInfo.bio}
                            </Typography>
                            <View style={styles.hostActions}>
                                <Button
                                    title="Contact Host"
                                    variant="outline"
                                    size="small"
                                    style={styles.hostButton}
                                    onPress={() => Alert.alert('Contact', 'Host contact feature coming soon!')}
                                />
                            </View>
                        </View>
                    </Card>
                    */}
                    {/* Property Rules Section */}
                    <Card style={styles.propertyRulesCard}>
                    <Typography variant="h5" style={styles.sectionTitle}>
                    Property Rules
                    </Typography>
                    <View style={styles.rulesContainer}>
                    {/* Check-in & Check-out Times */}
                    <View style={styles.ruleCard}>
                    <View style={styles.ruleIconContainer}>
                    <Clock size={24} color={colors.primary.gold} />
                    </View>
                    <View style={styles.ruleContent}>
                    <Typography variant="body" style={styles.ruleTitle}>
                    Convenient check-in & out times
                    </Typography>
                    <Typography variant="caption" color="secondary" style={styles.ruleDescription}>
                    Check-in anytime after 4:00 pm, and check-out anytime before 10:00 am.
                    </Typography>
                    </View>
                    </View>
                    {/* Easy Cancellation */}
                    <View style={styles.ruleCard}>
                    <View style={styles.ruleIconContainer}>
                    <RefreshCw size={24} color={colors.primary.gold} />
                    </View>
                    <View style={styles.ruleContent}>
                    <Typography variant="body" style={styles.ruleTitle}>
                    Easy cancellation
                    </Typography>
                    <Typography variant="caption" color="secondary" style={styles.ruleDescription}>
                    Changed your mind? You can cancel your trip for up to 7 days and receive full refund in credits.
                    </Typography>
                    </View>
                    </View>
                    </View>
                    {/* See All Rules Link */}
                    <TouchableOpacity
                    style={styles.seeAllRulesButton}
                    onPress={() => Alert.alert('Property Rules', 'Complete property rules will be available soon!')}
                    >
                    <FileText size={16} color={colors.primary.gold} />
                    <Typography variant="body" color="gold" style={styles.seeAllRulesText}>
                    See all rules
                    </Typography>
                    </TouchableOpacity>
                    </Card>
                    {/* Rental Income Section - Only show for property owners */}
                    {isPropertyOwner && property.rentalIncome && (
                    <Card style={styles.rentalIncomeCard}>
                    <Typography variant="h5" style={styles.sectionTitle}>
                    Rental Income
                    </Typography>
                    <View style={styles.incomeStatsContainer}>
                    <View style={styles.incomeStatItem}>
                    <Typography variant="caption" color="secondary">
                    Total Earned
                    </Typography>
                    <Typography variant="h4" color="gold">
                    ${property.rentalIncome.totalEarned.toLocaleString()}
                    </Typography>
                    </View>
                    <View style={styles.incomeStatItem}>
                    <Typography variant="caption" color="secondary">
                    Claimable Amount
                    </Typography>
                    <Typography variant="h4" color="primary">
                    ${property.rentalIncome.claimableAmount.toLocaleString()}
                    </Typography>
                    </View>
                    </View>
                    {property.rentalIncome.lastClaimDate && (
                    <View style={styles.lastClaimInfo}>
                    <Typography variant="caption" color="secondary">
                    Last Claim: {new Date(property.rentalIncome.lastClaimDate).toLocaleDateString()}
                    </Typography>
                    </View>
                    )}
                    {shouldShowClaimButton && (
                    <TouchableOpacity
                    style={styles.claimPayoutButton}
                    onPress={() => setShowClaimModal(true)}
                    activeOpacity={0.8}
                    >
                    <DollarSign size={20} color={colors.text.inverse} />
                    <Typography variant="body" color="inverse" style={styles.claimButtonText}>
                    Claim Payout
                    </Typography>
                    </TouchableOpacity>
                    )}
                    </Card>
                    )}
                </View>
            </ScrollView>
            {/* Action Buttons */}
            <View style={styles.actionBar}>
                <Button
                    title={isAvailableForRent ? 'Rent Now' : 'Not Available'}
                    onPress={handleBooking}
                    disabled={!isAvailableForRent}
                    style={[styles.actionButton, !isAvailableForRent && styles.disabledButton]}
                />
                <Button
                    title="Start Investing"
                    onPress={handleInvestment}
                    variant="outline"
                    style={styles.actionButton}
                />
            </View>
            {/* Booking Modal */}
            <Modal visible={showBookingModal} onClose={() => setShowBookingModal(false)}>
                <View style={styles.modalContent}>
                    <Typography variant="h4" align="center" style={styles.modalTitle}>
                        Book Your Stay
                    </Typography>
                    <Typography variant="body" color="secondary" align="center">
                        Ready to book this luxury property for ${property.price?.rent || 0}/night?
                    </Typography>
                    <View style={styles.modalButtons}>
                        <Button
                            title="Continue Booking"
                            onPress={handleBookingConfirm}
                            style={styles.modalButton}
                        />
                        <Button title="Cancel" onPress={() => setShowBookingModal(false)} variant="ghost" />
                    </View>
                </View>
            </Modal>
            {/* Investment Modal */}
            <Modal visible={showInvestmentModal} onClose={() => setShowInvestmentModal(false)}>
                <View style={styles.modalContent}>
                    <Typography variant="h4" align="center" style={styles.modalTitle}>
                        Investment Opportunity
                    </Typography>
                    <Typography variant="body" color="secondary" align="center">
                        Invest in this luxury property starting from $
                        {property.investmentDetails.minimumInvestment.toLocaleString()} and earn{' '}
                        {property.investmentDetails.roiEstimate}% expected returns.
                    </Typography>
                    <View style={styles.modalButtons}>
                        <Button
                            title="Continue Investment"
                            onPress={handleInvestmentConfirm}
                            style={styles.modalButton}
                        />
                        <Button title="Cancel" onPress={() => setShowInvestmentModal(false)} variant="ghost" />
                    </View>
                </View>
            </Modal>
            {/* 360° Tour Modal */}
            <Modal visible={show360Tour} onClose={() => setShow360Tour(false)}>
            <View style={styles.modalContent}>
            <Typography variant="h4" align="center" style={styles.modalTitle}>
            360° Virtual Tour
            </Typography>
            <View style={styles.tourPlaceholder}>
            <Play size={48} color={colors.text.secondary} />
            <Typography variant="body" color="secondary" align="center">
            360° tour will be available soon
            </Typography>
            </View>
            <Button title="Close" onPress={() => setShow360Tour(false)} variant="outline" />
            </View>
            </Modal>
            {/* Claim Rental Payout Modal */}
            <Modal visible={showClaimModal} onClose={() => setShowClaimModal(false)}>
            <View style={styles.modalContent}>
            <View style={styles.claimModalHeader}>
            <DollarSign size={48} color={colors.primary.gold} />
            <Typography variant="h4" align="center" style={styles.modalTitle}>
            Claim Rental Payout
            </Typography>
            </View>
            <Typography variant="body" color="secondary" align="center" style={styles.claimModalDescription}>
            You have ${property.rentalIncome?.claimableAmount.toLocaleString()} available to claim from your rental income.
            </Typography>
            <View style={styles.claimDetailsCard}>
            <View style={styles.claimDetailRow}>
                <Typography variant="body" color="secondary">Property:</Typography>
                <Typography variant="body">{property.title}</Typography>
            </View>
            <View style={styles.claimDetailRow}>
                <Typography variant="body" color="secondary">Amount:</Typography>
                <Typography variant="h4" color="gold">
                    ${property.rentalIncome?.claimableAmount.toLocaleString()}
                </Typography>
            </View>
            <View style={styles.claimDetailRow}>
                <Typography variant="body" color="secondary">Status:</Typography>
                <Typography variant="body" color="success">Ready to Claim</Typography>
            </View>
            </View>
            <View style={styles.modalButtons}>
            <Button
            title={isLoading ? "Processing..." : "Confirm Claim"}
            onPress={handleClaimRentalPayout}
            disabled={isLoading}
            style={styles.modalButton}
            />
            <Button
            title="Cancel"
            onPress={() => setShowClaimModal(false)}
            variant="ghost"
            disabled={isLoading}
            />
            </View>
            </View>
            </Modal>
            <Modal visible={showDatePicker} onClose={() => setShowDatePicker(false)}>
                <View style={styles.datePickerModalContent}>
                    <Typography variant="h4" align="center" style={styles.modalTitle}>
                        Available Dates
                    </Typography>
                    <Typography variant="body" color="secondary" align="center" style={styles.datePickerSubtitle}>
                        Select your preferred date
                    </Typography>
                    <View style={styles.calendarContainer}>
                        <ScrollView style={styles.calendarScrollView} showsVerticalScrollIndicator={false}>
                            <View style={styles.calendarGrid}>
                                {property.availabilityCalendar.availableDates?.map((dateString, index) => {
                                    const date = new Date(dateString);
                                    const isSelected = selectedDate.toDateString() === date.toDateString();
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.calendarDateItem,
                                                isSelected && styles.selectedCalendarDate
                                            ]}
                                            onPress={() => {
                                                setSelectedDate(date);
                                                setSelectedCheckIn(date);
                                            }}
                                        >
                                            <View style={styles.calendarDateContent}>
                                                <Typography
                                                    variant="body"
                                                    color={isSelected ? "inverse" : "primary"}
                                                    style={styles.calendarDateText}
                                                >
                                                    {date.toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color={isSelected ? "inverse" : "gold"}
                                                    style={styles.calendarPriceText}
                                                >
                                                    ${property.price.rent}
                                                </Typography>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                    {selectedDate && (
                        <View style={styles.selectedDateDisplay}>
                            <Typography variant="h4" color="primary" style={styles.selectedDateTitle}>
                                Selected Date
                            </Typography>
                            <View style={styles.selectedDateInfo}>
                                <Typography variant="body" color="secondary">Date:</Typography>
                                <Typography variant="body" color="primary">
                                    {selectedDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Typography>
                            </View>
                            <View style={styles.selectedDateInfo}>
                                <Typography variant="body" color="secondary">Price:</Typography>
                                <Typography variant="body" color="gold">
                                    ${property.price.rent}/night
                                </Typography>
                            </View>
                        </View>
                    )}
                    <View style={styles.datePickerActions}>
                        {selectedDate && (
                            <Button
                                title="Book This Date"
                                onPress={() => {
                                    setShowDatePicker(false);
                                    handleBookingConfirm();
                                }}
                                style={styles.bookDateButton}
                            />
                        )}
                        <Button
                            title="Close"
                            onPress={() => setShowDatePicker(false)}
                            variant="outline"
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.card,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.layout.screenPadding,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.md,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    backButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: radius.full,
        padding: spacing.sm,
    },
    shareButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: radius.full,
        padding: spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
    },
    propertyImage: {
        width: width,
        height: 300,
    },
    imageIndicator: {
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    tourButton: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    content: {
        padding: spacing.layout.screenPadding,
        gap: spacing.lg,
    },
    infoCard: {
        gap: spacing.md,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    titleSection: {
        gap: spacing.sm,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    propertyTypeBadge: {
        backgroundColor: colors.primary.lightGold,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginLeft: 'auto',
    },
    description: {
        lineHeight: 24,
    },
    highlightsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    highlight: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    mapCard: {
        gap: spacing.md,
    },
    mapContainer: {
        height: 200,
        borderRadius: radius.md,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    mapDescription: {
        textAlign: 'center',
    },
    rentCard: {
        gap: spacing.md,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    investmentCard: {
        gap: spacing.md,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: spacing.sm,
    },
    rentBadge: {
        backgroundColor: colors.primary.blue,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    investBadge: {
        backgroundColor: colors.primary.gold,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    priceSection: {
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    fundingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    cardButton: {
        marginTop: spacing.sm,
    },
    incomeNote: {
        textAlign: 'center',
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
    sectionTitle: {
        marginBottom: spacing.sm,
    },
    calendarCard: {
        gap: spacing.md,
    },
    selectedDatesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background.light,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    selectedDateItem: {
        flex: 1,
        alignItems: 'center',
    },
    clearSelectionButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    calendarLegend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    availableDot: {
        backgroundColor: colors.status.success,
    },
    bookedDot: {
        backgroundColor: colors.status.error,
    },
    selectedDot: {
        backgroundColor: colors.primary.gold,
    },
    calendarContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    monthHeader: {
        width: '100%',
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    dayHeadersRow: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    dayHeaderCell: {
        width: '14.28%',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.sm,
        marginBottom: 2,
    },
    availableDay: {
        backgroundColor: colors.status.successLight || colors.background.light,
        borderWidth: 1,
        borderColor: colors.status.success,
    },
    bookedDay: {
        backgroundColor: colors.status.errorLight || colors.background.light,
        borderWidth: 1,
        borderColor: colors.status.error,
    },
    pastDay: {
        backgroundColor: colors.background.light,
        opacity: 0.5,
    },
    selectedDay: {
        backgroundColor: colors.primary.gold,
    },
    rangeDay: {
        backgroundColor: colors.primary.lightGold,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    availabilityStatus: {
        gap: spacing.sm,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    nextAvailable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    amenitiesCard: {
        gap: spacing.md,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.background.light,
        borderRadius: 16,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    amenityText: {
        marginLeft: spacing.xs,
        color: colors.text.primary,
        fontSize: 14,
    },
    hostCard: {
        gap: spacing.md,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    hostInfo: {
        gap: spacing.md,
    },
    hostHeader: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    hostAvatar: {
        width: 60,
        height: 60,
        borderRadius: radius.full,
    },
    hostDetails: {
        flex: 1,
        gap: spacing.xs,
    },
    hostNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    hostBio: {
        lineHeight: 20,
    },
    hostActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    hostButton: {
        flex: 1,
    },
    actionBar: {
        flexDirection: 'row',
        padding: spacing.layout.screenPadding,
        gap: spacing.md,
        backgroundColor: colors.background.card,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    actionButton: {
        flex: 1,
    },
    disabledButton: {
        opacity: 0.5,
    },
    modalContent: {
        gap: spacing.lg,
        alignItems: 'center',
    },
    modalTitle: {
        marginBottom: spacing.sm,
    },
    modalButtons: {
        width: '100%',
        gap: spacing.md,
    },
    modalButton: {
        width: '100%',
    },
    tourPlaceholder: {
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xl,
    },
    calendarPlaceholder: {
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xl,
    },
    datesList: {
        gap: spacing.xs,
        marginTop: spacing.md,
    },
    datesTitle: {
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    datesButton: {
        marginTop: spacing.md,
        alignSelf: 'center',
        paddingHorizontal: spacing.xl,
    },
    datePickerModalContent: {
        gap: spacing.lg,
        maxHeight: height * 0.8,
        width: '100%',
    },
    datePickerSubtitle: {
        marginBottom: spacing.md,
    },
    calendarContainer: {
        backgroundColor: colors.background.light,
        borderRadius: radius.md,
        padding: spacing.md,
        maxHeight: height * 0.4,
    },
    calendarScrollView: {
        flex: 1,
    },
    calendarGrid: {
        gap: spacing.sm,
    },
    calendarDateItem: {
        backgroundColor: colors.background.card,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.light,
        marginBottom: spacing.sm,
    },
    selectedCalendarDate: {
        backgroundColor: colors.primary.gold,
        borderColor: colors.primary.gold,
    },
    calendarDateContent: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    calendarDateText: {
        fontWeight: '600',
        textAlign: 'center',
    },
    calendarPriceText: {
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedDateDisplay: {
        backgroundColor: colors.background.light,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.sm,
    },
    selectedDateTitle: {
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    selectedDateInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerActions: {
        gap: spacing.md,
        paddingTop: spacing.md,
    },
    bookDateButton: {
        backgroundColor: colors.primary.gold,
    },
    kycModalHeader: {
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    kycModalDescription: {
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    dateSelectionBox: {
        borderWidth: 1,
        borderColor: colors.border.light,
        borderRadius: radius.md,
        padding: spacing.md,
        backgroundColor: colors.background.secondary,
        marginVertical: spacing.sm,
    },
    dateSelectionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    dateSelectionText: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
        paddingHorizontal: spacing.layout.screenPadding,
    },
    bedroomsCard: {
        gap: spacing.md,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    bedroomDetails: {
        gap: spacing.md,
    },
    bedroomDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    bedroomDetailText: {
        flex: 1,
        gap: spacing.xs,
    },
    smartHomeCard: {
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    conciergeCard: {
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    featureTitle: {
        flex: 1,
        fontWeight: '600',
    },
    featureDescription: {
        lineHeight: 22,
        fontSize: 15,
    },
    propertyRulesCard: {
        gap: spacing.md,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    rulesSubtitle: {
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        fontWeight: '500',
    },
    rulesContainer: {
        gap: spacing.md,
    },
    ruleCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.background.light,
        borderRadius: radius.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary.gold,
    },
    ruleIconContainer: {
        backgroundColor: colors.neutral.white,
        borderRadius: radius.full,
        padding: spacing.sm,
        shadowColor: colors.neutral.back,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    ruleContent: {
        flex: 1,
        gap: spacing.xs,
    },
    ruleTitle: {
        fontWeight: '600',
        color: colors.text.primary,
    },
    ruleDescription: {
        lineHeight: 18,
    },
    seeAllRulesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        justifyContent: 'center',
    },
    seeAllRulesText: {
    fontWeight: '500',
    },
    rentalIncomeCard: {
    gap: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    shadowColor: colors.neutral.back,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    },
    incomeStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    },
    incomeStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background.light,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    },
    lastClaimInfo: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    },
    claimPayoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    ...Platform.select({
    ios: {
    shadowColor: colors.primary.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    },
    android: {
    elevation: 6,
    },
    }),
    },
    claimButtonText: {
    fontWeight: '600',
    fontSize: 16,
    },
    claimModalHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    },
    claimModalDescription: {
    marginBottom: spacing.lg,
    lineHeight: 22,
    },
    claimDetailsCard: {
    backgroundColor: colors.background.light,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
    },
    claimDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    },
    });