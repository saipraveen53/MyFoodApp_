import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserDashboard() {
  const router = useRouter();

  const adminpage=()=>{
    router.replace('/AdminPage')
  }

  const handleLogout = async () => {
    // Common Logout Logic Function
    const performLogout = async () => {
      try {
        // --- IMPORTANT CHANGE ---
        // Manam Login appudu 'userToken' inka chala keys save chesam.
        // Vaatinnitini okkesari delete cheyadaniki 'clear()' vadali.
        // Idi entire app storage ni clean chesthundi.
        await AsyncStorage.clear();
        
        console.log('Storage cleared successfully');
        
        // Redirect to Login
        router.replace('/login');
      } catch (error) {
        console.error('Logout Error:', error);
        Alert.alert('Error', 'Failed to logout properly');
      }
    };

    // --- WEB SPECIFIC LOGIC ---
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        await performLogout();
      }
    } 
    // --- MOBILE (ANDROID/iOS) LOGIC ---
    else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userText}>User</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Dashboard</Text>
          <Text style={styles.cardBody}>
            You are successfully logged in!
            {Platform.OS === 'web' ? ' (Running on Web)' : ' (Running on Mobile)'}
          </Text>
          <Text style={[styles.cardBody, { marginTop: 10, fontSize: 12, fontStyle: 'italic' }]}>
            Note: Clicking logout will now clear all tokens and session data.
          </Text>
          <TouchableOpacity onPress={adminpage}>
            <Text>
              Admin page
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    // Web specific cursor pointer
    ...Platform.select({
        web: { cursor: 'pointer' }
    }),
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardBody: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});