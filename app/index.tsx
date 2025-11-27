import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // 1. Wait for Navigation to be ready
    if (!rootNavigationState?.key) return;

    const checkSession = async () => {
      
      let token = null;
      let roles = null;

      // 2. Retry logic to ensure we get the token on Android
      for (let i = 0; i < 3; i++) {
        token = await AsyncStorage.getItem('userToken');
        roles = await AsyncStorage.getItem('roles');
        
        if (token) break; 
        await new Promise(resolve => setTimeout(resolve, 250)); 
      }

      console.log("📱 Startup Token Check:", token ? "Found" : "Missing");

      if (token) {
        // 3. Logged In Logic
        if (roles && (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN'))) {
            
            // 🆕 RESTORE LAST ADMIN PAGE LOGIC
            const lastRoute = await AsyncStorage.getItem('lastRoute');
            console.log("📍 Restoring Route:", lastRoute);

            if (lastRoute && (lastRoute.includes('ProductPage') || lastRoute.includes('CategoryPasge') || lastRoute.includes('orders') || lastRoute.includes('users'))) {
                // Go to the specific page if saved
                // @ts-ignore
                router.replace(lastRoute);
            } else {
                // Default to Dashboard otherwise
                router.replace('/AdminPage');
            }

        } else {
          // User Logic
          router.replace('/(tabs)');
        }
      } else {
        // 4. Not Logged In -> Go to Login
        router.replace('/login');
      }
    };

    checkSession();
  }, [rootNavigationState?.key]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#191919' }}>
      <ActivityIndicator size="large" color="#ff6b35" />
    </View>
  );
}