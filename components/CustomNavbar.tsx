import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function CustomNavbar() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWebLayout = width > 768;
  const [locationName, setLocationName] = useState('Location');

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await AsyncStorage.clear();
        router.replace('/login');
      } catch (error) {
        Alert.alert('Error', 'Failed to logout');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        await performLogout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  const handleGetLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      // Print Coordinates to Console as requested
      console.log('Platform:', Platform.OS);
      console.log('Latitude:', lat);
      console.log('Longitude:', lon);

      // Use OpenStreetMap Nominatim for Reverse Geocoding (Works without API Key)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'ZomoApp/1.0', // Nominatim requires a User-Agent
            },
          }
        );
        const data = await response.json();
        
        if (data && data.address) {
          // Extract relevant address parts
          const suburb = data.address.suburb || data.address.neighbourhood;
          const city = data.address.city || data.address.town || data.address.village || data.address.county;
          const state = data.address.state;
          
          // Format: "Ameerpet, Hyderabad" or just "Hyderabad"
          let formattedAddress = "Unknown Location";
          if (suburb && city) {
            formattedAddress = `${suburb}, ${city}`;
          } else if (city) {
            formattedAddress = `${city}, ${state || ''}`;
          } else if (state) {
            formattedAddress = state;
          }

          setLocationName(formattedAddress);
        } else {
          setLocationName("Location Not Found");
        }
      } catch (geocodeError) {
        console.error("Geocoding failed:", geocodeError);
        setLocationName("Unknown Location");
      }
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not fetch location details');
    }
  };

  const renderMobileNavbar = () => (
    <View style={styles.mobileNavbar}>
      <View style={styles.mobileLeftSection}>
        <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logoText}>ZOMO<Text style={styles.logoDot}>.</Text></Text>
      </View>

      <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
        <Ionicons name="location-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
        <Text style={styles.locationButtonText} numberOfLines={1}>{locationName}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWebNavbar = () => (
    <View style={styles.webNavbar}>
      <View style={styles.webLeftSection}>
        <Text style={styles.logoText}>ZOMO<Text style={styles.logoDot}>.</Text></Text>
        
        <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
          <Ionicons name="location-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.locationButtonText} numberOfLines={1}>{locationName}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.webNavLinks}>
        <TouchableOpacity style={styles.navLinkItem} onPress={() => router.push('/(tabs)')}><Text style={styles.navLinkText}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navLinkItem} onPress={() => router.push('/(tabs)/cart')}><Text style={styles.navLinkText}>Order</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navLinkItem}><Text style={styles.navLinkText}>Blog</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navLinkItem}><Text style={styles.navLinkText}>Pages</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navLinkItem}><Text style={styles.navLinkText}>Contact</Text></TouchableOpacity>
      </View>

      <View style={styles.webRightSection}>
        <TouchableOpacity style={styles.cartContainer} onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>5</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.divider} />

        <TouchableOpacity style={styles.profileSection} onPress={handleLogout}>
           <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=32' }} 
            style={styles.avatar} 
           />
           <View>
             <Text style={styles.greetingText}>Hi, Mark Jecno</Text>
             <Text style={styles.accountText}>My Account</Text>
           </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.headerContainer}>
        {isWebLayout ? renderWebNavbar() : renderMobileNavbar()}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#191919', 
    width: '100%',
    zIndex: 10,
  },
  mobileNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#191919',
  },
  mobileLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  webNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 18,
    backgroundColor: '#191919',
    width: '100%', 
  },
  webLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  webNavLinks: {
    flexDirection: 'row',
    gap: 25,
  },
  navLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  webRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  cartContainer: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#444',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  greetingText: {
    color: '#ccc',
    fontSize: 11,
  },
  accountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    fontStyle: 'italic',
  },
  logoDot: {
    color: '#ff6b35',
  },
  locationButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b35',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 30, 
    alignItems: 'center',
    maxWidth: 200, 
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});