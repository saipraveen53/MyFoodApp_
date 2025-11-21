import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('isAuthenticated');
        const rolesString = await AsyncStorage.getItem('roles');
        
        if (value === 'true') {
          // User is logged in, check role for redirection
          if (rolesString && (rolesString.includes('ROLE_ADMIN') || rolesString.includes('ADMIN'))) {
              // Redirect to Admin Dashboard
              router.replace('/AdminPage');
          } else {
              // Redirect to User Homepage (Tabs)
              router.replace('/(tabs)');
          }
        } else {
          // Not logged in, go to Login
          router.replace('/login');
        }
      } catch (e) {
        console.error("Error checking login status:", e);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }

  return null;
}