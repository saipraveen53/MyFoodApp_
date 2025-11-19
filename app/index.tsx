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
        // AsyncStorage lo 'isAuthenticated' value undo ledo check chesthunnam
        const value = await AsyncStorage.getItem('isAuthenticated');
        
        if (value === 'true') {
          // Already login ayi unte -> Tabs (Home) ki pampinchu
          router.replace('/(tabs)');
        } else {
          // Login avvakapothe -> Login screen ki pampinchu
          router.replace('/login');
        }
      } catch (e) {
        // Error vasthe Login ki pampinchu
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Checking jarige tapudu Loading spinner chupinchu
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return null;
}