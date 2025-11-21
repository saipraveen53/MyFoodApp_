import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../FoodContext'; 

// Custom Component to Render Cart Icon with Badge
const CartIconWithBadge = ({ color, focused }: { color: string; focused: boolean }) => {
    // Get total quantity from Context
    const { cart } = useFood();
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

    return (
        <View style={iconStyles.iconWrapper}>
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
            {totalQty > 0 && (
                <View style={iconStyles.badge}>
                    <Text style={iconStyles.badgeText}>{totalQty > 9 ? '9+' : totalQty}</Text>
                </View>
            )}
        </View>
    );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff6b35',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: Platform.OS === 'android' ? 65 : 90, 
          paddingBottom: Platform.OS === 'android' ? 10 : 30,
          paddingTop: 10,
          elevation: 0, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: CartIconWithBadge, 
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const iconStyles = StyleSheet.create({
    iconWrapper: {
        width: 28, 
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#ff6b35',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});