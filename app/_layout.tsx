import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router'; // 1. Import usePathname
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // 2. Import AsyncStorage

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FoodProvider } from './FoodContext'; 

export const unstable_settings = {
  initialRouteName: 'index',
};
 
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname(); // 3. Get current route path

  // 4. Effect: Save the route whenever it changes
  useEffect(() => {
    const saveLastRoute = async () => {
      // Only save specific Admin pages. 
      // We avoid saving 'login' or 'index' to prevent getting stuck in loops.
      if (pathname && (pathname.includes('AdminPage') || pathname.includes('ProductPage') || pathname.includes('CategoryPasge') || pathname.includes('orders')|| pathname.includes('users'))) {
        console.log("📍 Saving Route:", pathname);
        await AsyncStorage.setItem('lastRoute', pathname);
      }
    };
    saveLastRoute();
  }, [pathname]);

  return (
    <FoodProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          <Stack.Screen name="AdminPage" options={{ headerShown: false }} />
          <Stack.Screen name="CategoryPasge" options={{ headerShown: false }} />
          <Stack.Screen name="ProductPage" options={{ headerShown: false }} />
          <Stack.Screen name="orders" options={{ headerShown: false }} />
          <Stack.Screen name="users" options={{ headerShown: false }} />
          
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </FoodProvider>
  );
}