import { create } from 'zustand';
import { Property } from '@/types';

interface WishlistItem {
  id: string;
  propertyId: string;
  userId: string;
  property: Property;
  addedAt: string;
}

interface WishlistState {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
}

interface WishlistActions {
  addToWishlist: (userId: string, property: Property) => void;
  removeFromWishlist: (userId: string, propertyId: string) => void;
  isInWishlist: (userId: string, propertyId: string) => boolean;
  getUserWishlist: (userId: string) => WishlistItem[];
  clearWishlist: (userId: string) => void;
}

type WishlistStore = WishlistState & WishlistActions;

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  // Initial state
  wishlistItems: [],
  isLoading: false,

  // Actions
  addToWishlist: (userId: string, property: Property) => {
    const { wishlistItems } = get();
    
    // Check if already in wishlist
    const exists = wishlistItems.find(
      item => item.userId === userId && item.propertyId === property.id
    );
    
    if (!exists) {
      const newItem: WishlistItem = {
        id: Date.now().toString(),
        propertyId: property.id,
        userId,
        property,
        addedAt: new Date().toISOString(),
      };
      
      set({
        wishlistItems: [...wishlistItems, newItem],
      });
    }
  },

  removeFromWishlist: (userId: string, propertyId: string) => {
    const { wishlistItems } = get();
    
    set({
      wishlistItems: wishlistItems.filter(
        item => !(item.userId === userId && item.propertyId === propertyId)
      ),
    });
  },

  isInWishlist: (userId: string, propertyId: string) => {
    const { wishlistItems } = get();
    return wishlistItems.some(
      item => item.userId === userId && item.propertyId === propertyId
    );
  },

  getUserWishlist: (userId: string) => {
    const { wishlistItems } = get();
    return wishlistItems
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  },

  clearWishlist: (userId: string) => {
    const { wishlistItems } = get();
    
    set({
      wishlistItems: wishlistItems.filter(item => item.userId !== userId),
    });
  },
}));