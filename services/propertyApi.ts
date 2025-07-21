import { Property } from '@/types';
import { View } from 'react-native';
// Mock approved properties data - in real app this would come from your backend
const mockApprovedProperties: Property[] = [
  {
    id: '1',
    ownerId: 'owner1',
    title: 'Luxury Oceanfront Villa',
    description:
      'Stunning oceanfront villa with panoramic views, infinity pool, and private beach access. Perfect for luxury getaways.',
    location: {
      address: '123 Ocean Drive',
      city: 'Malibu',
      country: 'USA',
      coordinates: { latitude: 34.0259, longitude: -118.7798 },
    },
    price: {
      rent: 2500,
      investment: 50000,
      currency: 'USD',
    },
    propertyType: 'villa',
    bedrooms: 5,
    bathrooms: 4,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/6c80b6e8b6b84b9b8e8e8e8e8e8e8e8e?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'Ocean View',
      'Infinity Pool',
      'Private Beach',
      'Spa',
      'Wine Cellar',
      'Gym',
      'Chef Kitchen',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-02-15', '2024-02-16', '2024-02-17'],
      availableDates: ['2024-02-20', '2024-02-21', '2024-03-01', '2024-03-15'],
    },
    investmentDetails: {
      totalShares: 100,
      availableShares: 75,
      roiEstimate: 12.5,
      minimumInvestment: 10000,
      fundedPercentage: 25,
    },
    rating: 4.9,
    reviews: 127,
    approvalStatus: 'approved',
  },
  {
    id: '2',
    ownerId: 'owner2',
    title: 'Manhattan Penthouse Suite',
    description:
      'Exclusive penthouse in the heart of Manhattan with 360-degree city views and luxury amenities.',
    location: {
      address: '456 Park Avenue',
      city: 'New York',
      country: 'USA',
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
    },
    price: {
      rent: 3500,
      investment: 75000,
      currency: 'USD',
    },
    propertyType: 'penthouse',
    bedrooms: 3,
    bathrooms: 3,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/7d91c7f9c7c95c0c9f9f9f9f9f9f9f9f?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'City Views',
      'Rooftop Terrace',
      'Concierge',
      'Gym',
      'Private Elevator',
      'Smart Home',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-03-01', '2024-03-02'],
      availableDates: ['2024-02-25', '2024-03-05', '2024-03-10', '2024-03-20'],
    },
    investmentDetails: {
      totalShares: 150,
      availableShares: 120,
      roiEstimate: 15.2,
      minimumInvestment: 15000,
      fundedPercentage: 20,
    },
    rating: 4.8,
    reviews: 89,
    approvalStatus: 'approved',
  },
  {
    id: '3',
    ownerId: 'owner3',
    title: 'Swiss Alpine Chalet',
    description:
      'Authentic luxury chalet in the Swiss Alps with ski-in/ski-out access and breathtaking mountain views.',
    location: {
      address: '789 Alpine Way',
      city: 'Zermatt',
      country: 'Switzerland',
      coordinates: { latitude: 46.0207, longitude: 7.7491 },
    },
    price: {
      rent: 4000,
      investment: 80000,
      currency: 'USD',
    },
    propertyType: 'mansion',
    bedrooms: 6,
    bathrooms: 5,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/8e02d8g0d8d06d1d0g0g0g0g0g0g0g0g?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'Ski Access',
      'Mountain Views',
      'Fireplace',
      'Hot Tub',
      'Wine Cellar',
      'Sauna',
      'Game Room',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-12-20', '2024-12-21', '2024-12-22'],
      availableDates: ['2024-02-28', '2024-03-12', '2024-12-15', '2024-12-25'],
    },
    investmentDetails: {
      totalShares: 200,
      availableShares: 180,
      roiEstimate: 18.7,
      minimumInvestment: 20000,
      fundedPercentage: 10,
    },
    rating: 4.9,
    reviews: 156,
    approvalStatus: 'approved',
  },
  {
    id: '4',
    ownerId: 'owner4',
    title: 'Dubai Marina Yacht',
    description:
      'Luxury yacht with premium amenities and stunning marina views. Perfect for exclusive events and getaways.',
    location: {
      address: 'Dubai Marina',
      city: 'Dubai',
      country: 'UAE',
      coordinates: { latitude: 25.0657, longitude: 55.1713 },
    },
    price: {
      rent: 5000,
      investment: 120000,
      currency: 'USD',
    },
    propertyType: 'yacht',
    bedrooms: 4,
    bathrooms: 3,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/9f13e9h1e9e17e2e1h1h1h1h1h1h1h1h?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: ['Marina Views', 'Jacuzzi', 'Sun Deck', 'Water Sports', 'Chef Service', 'Bar'],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-04-01', '2024-04-02', '2024-04-03'],
      availableDates: ['2024-03-25', '2024-04-05', '2024-04-15', '2024-05-01'],
    },
    investmentDetails: {
      totalShares: 300,
      availableShares: 210,
      roiEstimate: 22.3,
      minimumInvestment: 25000,
      fundedPercentage: 30,
    },
    rating: 4.7,
    reviews: 203,
    approvalStatus: 'approved',
  },
  {
    id: '5',
    ownerId: 'owner5',
    title: 'Santorini Cliffside Villa',
    description:
      'Romantic cliffside villa with private plunge pool, views of the caldera, and iconic blue domes.',
    location: {
      address: 'Blue Dome Street',
      city: 'Santorini',
      country: 'Greece',
      coordinates: { latitude: 36.3932, longitude: 25.4615 },
    },
    price: {
      rent: 3000,
      investment: 60000,
      currency: 'USD',
    },
    propertyType: 'villa',
    bedrooms: 3,
    bathrooms: 2,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1533116927835-e3bfa3b8a1bd?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1602080859314-eab733b2f316?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/0g24f0i2f0f28f3f2i2i2i2i2i2i2i2i?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: ['Cliffside View', 'Plunge Pool', 'Sun Terrace', 'Chef Kitchen', 'Wi-Fi'],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-06-01', '2024-06-05'],
      availableDates: ['2024-06-10', '2024-06-15', '2024-07-01'],
    },
    investmentDetails: {
      totalShares: 100,
      availableShares: 60,
      roiEstimate: 14.3,
      minimumInvestment: 10000,
      fundedPercentage: 40,
    },
    rating: 4.8,
    reviews: 92,
    approvalStatus: 'approved',
  },
  {
    id: '6',
    ownerId: 'owner6',
    title: 'Tokyo Smart Condo',
    description:
      'Modern smart apartment in Shibuya with tech integrations, skyline views, and minimalist design.',
    location: {
      address: '123 Shibuya St',
      city: 'Tokyo',
      country: 'Japan',
      coordinates: { latitude: 35.6595, longitude: 139.7004 },
    },
    price: {
      rent: 1800,
      investment: 45000,
      currency: 'USD',
    },
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1617191512087-e15d6c4216f1?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1613977257363-8f8c5d1d10ab?w=800&h=600&fit=crop&quality=40',
      ],
    },
    amenities: ['Smart Home', 'High-Speed Wi-Fi', 'Skyline Views', '24/7 Security'],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-07-01', '2024-07-04'],
      availableDates: ['2024-07-10', '2024-07-15'],
    },
    investmentDetails: {
      totalShares: 80,
      availableShares: 50,
      roiEstimate: 10.8,
      minimumInvestment: 8000,
      fundedPercentage: 37.5,
    },
    rating: 4.6,
    reviews: 73,
    approvalStatus: 'approved',
  },
  {
    id: '7',
    ownerId: 'owner7',
    title: 'Countryside Eco Farmhouse',
    description:
      'Eco-friendly farmhouse with solar panels, organic garden, and quiet countryside charm.',
    location: {
      address: 'Greenway Farm Rd',
      city: 'Tuscany',
      country: 'Italy',
      coordinates: { latitude: 43.7696, longitude: 11.2558 },
    },
    price: {
      rent: 1500,
      investment: 30000,
      currency: 'USD',
    },
    propertyType: 'farmhouse',
    bedrooms: 4,
    bathrooms: 2,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1591102185264-37c203ce46a0?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1505691723518-34b48fbb9c91?w=800&h=600&fit=crop&quality=40',
      ],
    },
    amenities: ['Organic Farm', 'Solar Energy', 'Fireplace', 'Outdoor Dining'],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-08-01'],
      availableDates: ['2024-08-10', '2024-08-20'],
    },
    investmentDetails: {
      totalShares: 60,
      availableShares: 30,
      roiEstimate: 9.5,
      minimumInvestment: 5000,
      fundedPercentage: 50,
    },
    rating: 4.5,
    reviews: 45,
    approvalStatus: 'approved',
  },
  {
    id: '8',
    ownerId: 'owner8',
    title: 'Scandinavian Forest Cabin',
    description:
      'Minimalist forest retreat with modern amenities, perfect for quiet escapes and digital detox.',
    location: {
      address: 'Nordic Trail',
      city: 'Oslo',
      country: 'Norway',
      coordinates: { latitude: 59.9139, longitude: 10.7522 },
    },
    price: {
      rent: 1200,
      investment: 25000,
      currency: 'USD',
    },
    propertyType: 'cabin',
    bedrooms: 2,
    bathrooms: 1,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1611824989581-bc82b70c2cf4?w=800&h=600&fit=crop&quality=40',
      ],
    },
    amenities: ['Wood Stove', 'Nature Trails', 'Reading Nook', 'Minimal Design'],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: [],
      availableDates: ['2024-09-01', '2024-09-10'],
    },
    investmentDetails: {
      totalShares: 50,
      availableShares: 40,
      roiEstimate: 7.2,
      minimumInvestment: 4000,
      fundedPercentage: 20,
    },
    rating: 4.4,
    reviews: 37,
    approvalStatus: 'approved',
  },
  {
    id: '9',
    ownerId: 'owner9',
    title: 'Bali Jungle Treehouse',
    description:
      'Unique jungle treehouse in Ubud, surrounded by lush greenery and close to waterfalls.',
    location: {
      address: 'Ubud Jungle Road',
      city: 'Ubud',
      country: 'Indonesia',
      coordinates: { latitude: -8.5069, longitude: 115.2625 },
    },
    price: {
      rent: 1100,
      investment: 20000,
      currency: 'USD',
    },
    propertyType: 'treehouse',
    bedrooms: 1,
    bathrooms: 1,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1578489758700-f9722a1fbf03?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1582719478236-b5b48f85043b?w=800&h=600&fit=crop&quality=40',
      ],
    },
    amenities: ['Jungle Views', 'Hammock', 'Outdoor Shower', 'Eco Materials'],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-05-01'],
      availableDates: ['2024-05-10', '2024-05-15'],
    },
    investmentDetails: {
      totalShares: 40,
      availableShares: 25,
      roiEstimate: 11.3,
      minimumInvestment: 3000,
      fundedPercentage: 37.5,
    },
    rating: 4.6,
    reviews: 50,
    approvalStatus: 'approved',
  },
  {
    id: '10',
    ownerId: 'owner10',
    title: 'Parisian Loft in Le Marais',
    description:
      'Chic loft in the heart of Paris with classic architecture, exposed beams, and artistic flair.',
    location: {
      address: 'Rue des Rosiers',
      city: 'Paris',
      country: 'France',
      coordinates: { latitude: 48.859, longitude: 2.3616 },
    },
    price: {
      rent: 2700,
      investment: 55000,
      currency: 'USD',
    },
    propertyType: 'loft',
    bedrooms: 2,
    bathrooms: 1,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&quality=40',
      ],
    },
    amenities: ['Historic Charm', 'Balcony', 'Artist Studio', 'Central Location'],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-11-01'],
      availableDates: ['2024-11-10', '2024-11-20'],
    },
    investmentDetails: {
      totalShares: 120,
      availableShares: 100,
      roiEstimate: 13.2,
      minimumInvestment: 9000,
      fundedPercentage: 16.6,
    },
    rating: 4.7,
    reviews: 112,
    approvalStatus: 'approved',
  },
  {
    id: '11',
    ownerId: 'owner11',
    title: 'Manhattan Corporate Office Tower',
    description:
      'Premium office space in the heart of Manhattan financial district with modern amenities and city views.',
    location: {
      address: '200 Wall Street',
      city: 'New York',
      country: 'USA',
      coordinates: { latitude: 40.7074, longitude: -74.0113 },
    },
    price: {
      rent: 8500,
      investment: 150000,
      currency: 'USD',
    },
    propertyType: 'office',
    bedrooms: 0,
    bathrooms: 2,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/1h24g1j3g1g39g4g3j3j3j3j3j3j3j3j?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'High-Speed Internet',
      'Conference Rooms',
      'Reception Area',
      'Security',
      'Parking',
      'City Views',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-03-15', '2024-03-16'],
      availableDates: ['2024-03-20', '2024-04-01', '2024-04-15', '2024-05-01'],
    },
    investmentDetails: {
      totalShares: 300,
      availableShares: 240,
      roiEstimate: 16.8,
      minimumInvestment: 25000,
      fundedPercentage: 20,
    },
    rating: 4.8,
    reviews: 85,
    approvalStatus: 'approved',
  },
  {
    id: '12',
    ownerId: 'owner12',
    title: 'Beverly Hills Luxury Retail Space',
    description:
      'Prime retail location on Rodeo Drive with high foot traffic and luxury brand neighbors.',
    location: {
      address: '456 Rodeo Drive',
      city: 'Beverly Hills',
      country: 'USA',
      coordinates: { latitude: 34.0696, longitude: -118.4014 },
    },
    price: {
      rent: 12000,
      investment: 200000,
      currency: 'USD',
    },
    propertyType: 'retail',
    bedrooms: 0,
    bathrooms: 1,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/2i35h2k4h2h40h5h4k4k4k4k4k4k4k4k?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'Prime Location',
      'Large Windows',
      'Storage Space',
      'Loading Dock',
      'Security System',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-04-10', '2024-04-11'],
      availableDates: ['2024-04-15', '2024-05-01', '2024-05-15', '2024-06-01'],
    },
    investmentDetails: {
      totalShares: 400,
      availableShares: 320,
      roiEstimate: 18.5,
      minimumInvestment: 30000,
      fundedPercentage: 20,
    },
    rating: 4.9,
    reviews: 67,
    approvalStatus: 'approved',
  },
  {
    id: '13',
    ownerId: 'owner13',
    title: 'Miami Industrial Warehouse',
    description:
      'Modern warehouse facility with loading docks, high ceilings, and strategic location near the port.',
    location: {
      address: '789 Industrial Blvd',
      city: 'Miami',
      country: 'USA',
      coordinates: { latitude: 25.7617, longitude: -80.1918 },
    },
    price: {
      rent: 6500,
      investment: 120000,
      currency: 'USD',
    },
    propertyType: 'warehouse',
    bedrooms: 0,
    bathrooms: 2,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/3j46i3l5i3i51i6i5l5l5l5l5l5l5l5l?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'Loading Docks',
      'High Ceilings',
      'Climate Control',
      'Security',
      'Office Space',
      'Parking',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-05-01', '2024-05-02'],
      availableDates: ['2024-05-10', '2024-05-20', '2024-06-01', '2024-06-15'],
    },
    investmentDetails: {
      totalShares: 240,
      availableShares: 180,
      roiEstimate: 14.2,
      minimumInvestment: 20000,
      fundedPercentage: 25,
    },
    rating: 4.6,
    reviews: 43,
    approvalStatus: 'approved',
  },
  {
    id: '14',
    ownerId: 'owner14',
    title: 'London Commercial Complex',
    description:
      'Multi-use commercial building in Canary Wharf with office spaces, retail units, and conference facilities.',
    location: {
      address: '25 Canada Square',
      city: 'London',
      country: 'UK',
      coordinates: { latitude: 51.5049, longitude: -0.0197 },
    },
    price: {
      rent: 9500,
      investment: 180000,
      currency: 'USD',
    },
    propertyType: 'commercial',
    bedrooms: 0,
    bathrooms: 4,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/4k57j4m6j4j62j7j6m6m6m6m6m6m6m6m?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'Multiple Units',
      'Conference Facilities',
      'Reception',
      'Elevator',
      'Security',
      'Thames Views',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-06-01', '2024-06-02'],
      availableDates: ['2024-06-10', '2024-06-20', '2024-07-01', '2024-07-15'],
    },
    investmentDetails: {
      totalShares: 360,
      availableShares: 270,
      roiEstimate: 17.3,
      minimumInvestment: 28000,
      fundedPercentage: 25,
    },
    rating: 4.7,
    reviews: 92,
    approvalStatus: 'approved',
  },
  {
    id: '15',
    ownerId: 'owner15',
    title: 'Tokyo Tech Office Hub',
    description:
      'Modern tech office space in Shibuya with cutting-edge facilities and collaborative workspaces.',
    location: {
      address: '456 Tech Street',
      city: 'Tokyo',
      country: 'Japan',
      coordinates: { latitude: 35.6595, longitude: 139.7004 },
    },
    price: {
      rent: 7500,
      investment: 140000,
      currency: 'USD',
    },
    propertyType: 'office',
    bedrooms: 0,
    bathrooms: 3,
    mediaGallery: {
      images: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&quality=40',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&quality=40',
      ],
      tour3D:
        'https://momento360.com/e/u/5l68k5n7k5k73k8k7n7n7n7n7n7n7n7n?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=medium',
    },
    amenities: [
      'Smart Technology',
      'Collaborative Spaces',
      'High-Speed Internet',
      'Kitchen',
      'Rooftop Access',
    ],
    smartHomeEntry: 'Keyless Smart Lock Available',
    conciergeServices: 'Included - 24/7 support & housekeeping',
    availabilityCalendar: {
      available: true,
      bookedDates: ['2024-07-01', '2024-07-02'],
      availableDates: ['2024-07-10', '2024-07-20', '2024-08-01', '2024-08-15'],
    },
    investmentDetails: {
      totalShares: 280,
      availableShares: 210,
      roiEstimate: 15.8,
      minimumInvestment: 22000,
      fundedPercentage: 25,
    },
    rating: 4.8,
    reviews: 76,
    approvalStatus: 'approved',
  },
];
export interface PropertyListingResponse {
  success: boolean;
  data: {
    rentProperties: Property[];
    investmentProperties: Property[];
    total: number;
  };
  message: string;
}
export interface PropertyByTypeResponse {
  success: boolean;
  data: Property[];
  total: number;
  message: string;
}
// Simulate API delay
const simulateApiDelay = (ms: number = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Fetch all approved properties separated by type (Rent/Invest)
 */
export const fetchApprovedPropertiesByType = async (): Promise<PropertyListingResponse> => {
  try {
    await simulateApiDelay(800);
    const approvedProperties = mockApprovedProperties.filter(
      (property) => property.approvalStatus === 'approved'
    );
    // Separate properties that are available for rent vs investment
    const rentProperties = approvedProperties.filter(
      (property) =>
        property.availabilityCalendar.available &&
        property.availabilityCalendar.availableDates &&
        property.availabilityCalendar.availableDates.length > 0
    );
    const investmentProperties = approvedProperties.filter(
      (property) => property.investmentDetails.availableShares > 0
    );
    return {
      success: true,
      data: {
        rentProperties,
        investmentProperties,
        total: approvedProperties.length,
      },
      message: 'Properties fetched successfully',
    };
  } catch (error) {
    return {
      success: false,
      data: {
        rentProperties: [],
        investmentProperties: [],
        total: 0,
      },
      message: 'Failed to fetch properties',
    };
  }
};
/**
 * Fetch approved properties by specific type
 */
export const fetchApprovedPropertiesBySpecificType = async (
  type: 'rent' | 'investment'
): Promise<PropertyByTypeResponse> => {
  try {
    await simulateApiDelay(600);
    const approvedProperties = mockApprovedProperties.filter(
      (property) => property.approvalStatus === 'approved'
    );
    let filteredProperties: Property[] = [];
    if (type === 'rent') {
      filteredProperties = approvedProperties.filter(
        (property) =>
          property.availabilityCalendar.available &&
          property.availabilityCalendar.availableDates &&
          property.availabilityCalendar.availableDates.length > 0
      );
    } else if (type === 'investment') {
      filteredProperties = approvedProperties.filter(
        (property) => property.investmentDetails.availableShares > 0
      );
    }
    return {
      success: true,
      data: filteredProperties,
      total: filteredProperties.length,
      message: `${type} properties fetched successfully`,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      total: 0,
      message: `Failed to fetch ${type} properties`,
    };
  }
};
/**
 * Fetch all approved properties (mixed feed)
 */
export const fetchAllApprovedProperties = async (): Promise<PropertyByTypeResponse> => {
  try {
    await simulateApiDelay(700);
    const approvedProperties = mockApprovedProperties.filter(
      (property) => property.approvalStatus === 'approved'
    );
    return {
      success: true,
      data: approvedProperties,
      total: approvedProperties.length,
      message: 'All approved properties fetched successfully',
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      total: 0,
      message: 'Failed to fetch properties',
    };
  }
};
/**
 * Fetch property by ID (only if approved)
 */
export const fetchApprovedPropertyById = async (
  id: string
): Promise<{
  success: boolean;
  data: Property | null;
  message: string;
}> => {
  try {
    await simulateApiDelay(400);
    const property = mockApprovedProperties.find(
      (p) => p.id === id && p.approvalStatus === 'approved'
    );
    if (!property) {
      return {
        success: false,
        data: null,
        message: 'Property not found or not approved',
      };
    }
    return {
      success: true,
      data: property,
      message: 'Property fetched successfully',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: 'Failed to fetch property',
    };
  }
};