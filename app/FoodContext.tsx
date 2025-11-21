import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rootApi, IMAGE_BASE_URL } from './axiosInstance';

export type FoodItem = {
  id: string | number; // This will be menuItemId (Product ID)
  cartItemId?: number; // This is the unique ID for the cart entry (needed for delete/decrease)
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  qty?: number;
};

type FoodContextType = {
  cart: FoodItem[];
  addToCart: (item: FoodItem) => void;
  removeFromCart: (id: string | number) => void;
  decrementFromCart: (id: string | number) => void;
  clearCart: () => void;
  fetchCart: () => void; // New function exposed
  cartTotal: number;
};

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<FoodItem[]>([]);

  // Calculate Total
  const cartTotal = cart.reduce((total, item) => total + (item.price * (item.qty || 1)), 0);

  // --- FETCH CART FROM SERVER ---
  // This syncs the local context with the backend
  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return; // Don't fetch if not logged in

      const response = await rootApi.get('cart/myCart');
      if (response.data && response.data.items) {
        // Map backend response to our local FoodItem structure
        // We map menuItem.id to item.id so index.tsx can match products
        const mappedItems = response.data.items.map((cartItem: any) => ({
          id: cartItem.menuItem.id, // PRODUCT ID
          cartItemId: cartItem.id,  // CART ENTRY ID
          name: cartItem.menuItem.name,
          price: cartItem.menuItem.price,
          description: cartItem.menuItem.description,
          imageUrl: cartItem.menuItem.imageUrl,
          qty: cartItem.quantity
        }));
        setCart(mappedItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart context:", error);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (item: FoodItem) => {
    // 1. Optimistic Update
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) => 
          i.id === item.id ? { ...i, qty: (i.qty || 1) + 1 } : i
        );
      } else {
        return [...prevCart, { ...item, qty: 1 }];
      }
    });

    // 2. API Call
    try {
      await rootApi.post('cart/addItem', {
        menuItemId: item.id,
        quantity: 1
      });
      // Sync with server to get correct cartItemIds
      fetchCart();
    } catch (error) {
      console.error("Add to cart failed:", error);
      fetchCart(); // Revert on error
    }
  };

  const decrementFromCart = async (id: string | number) => {
    // Find the item to get its cartItemId if available, or assume we need to fetch it
    const item = cart.find((i) => i.id === id);
    const cartItemId = item?.cartItemId;

    // Optimistic Update
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === id);
      if (existingItem && (existingItem.qty || 1) > 1) {
        return prevCart.map((i) => 
          i.id === id ? { ...i, qty: (i.qty || 1) - 1 } : i
        );
      } else {
        return prevCart.filter((item) => item.id !== id);
      }
    });

    if (cartItemId) {
        try {
            // Use the API logic you requested previously
            await rootApi.put(`cart/decrease/${cartItemId}`);
            fetchCart();
        } catch (error) {
            console.error("Decrease failed:", error);
            fetchCart();
        }
    } else {
        // If we don't have cartItemId yet, just fetch fresh
        fetchCart();
    }
  };

  const removeFromCart = (id: string | number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    fetchCart(); // Ideally call delete API here too
  };

  const clearCart = () => {
    setCart([]);
    fetchCart();
  };

  return (
    <FoodContext.Provider value={{ cart, addToCart, removeFromCart, decrementFromCart, clearCart, fetchCart, cartTotal }}>
      {children}
    </FoodContext.Provider>
  );
}

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};