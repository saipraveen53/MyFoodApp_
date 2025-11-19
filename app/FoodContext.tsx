import React, { createContext, ReactNode, useContext, useState } from 'react';

// Define the shape of a Food Item
export type FoodItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

// Define the Context state
type FoodContextType = {
  cart: FoodItem[];
  addToCart: (item: FoodItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

// Create the Context
const FoodContext = createContext<FoodContextType | undefined>(undefined);

// Create the Provider component
export function FoodProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<FoodItem[]>([]);

  const addToCart = (item: FoodItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <FoodContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </FoodContext.Provider>
  );
}

// Custom hook to use the context easily
export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};