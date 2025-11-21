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
        
        if (value === 'true') {
          // User login ayi unte direct ga Tabs ki vellu
          router.replace('/(tabs)');
        } else {
          // Lekapothe Login page ki vellu
          router.replace('/login');
        }
      } catch (e) {
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