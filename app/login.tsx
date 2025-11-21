import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode'; 
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      const response = await axios.post(
        'http://192.168.0.240:8080/auth/login',
        {
          email: email,
          password: password,
        }
      );

      if (response.data) {
        const token = typeof response.data === 'string' ? response.data : response.data.token;
        
        if (!token) {
            throw new Error('Token not found in response');
        }

        console.log('Login Success. Token received.');

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('isAuthenticated', 'true');

        try {
          const decodedPayload: any = jwtDecode(token);

          for (const key in decodedPayload) {
            if (Object.prototype.hasOwnProperty.call(decodedPayload, key)) {
              const value = String(decodedPayload[key]);
              await AsyncStorage.setItem(key, value);
            }
          }
          console.log('Token decoded and user details stored in AsyncStorage');
        } catch (decodeError) {
          console.error('Failed to decode or store token parts:', decodeError);
        }

        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', 'Invalid credentials or Server error');
    }
  };

  // Function to navigate to Home without login
  const handleGoToHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={Platform.OS === 'web' ? styles.webCard : styles.mobileContainer}>
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* --- NEW BUTTON: Go to Home --- */}
          <TouchableOpacity style={styles.homeButton} onPress={handleGoToHome}>
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#f0f2f5' : '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', 
    alignItems: 'center',     
    padding: 20,
  },
  
  webCard: {
    width: '100%',
    maxWidth: 480, 
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },

  mobileContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: Platform.OS === 'web' ? 'center' : 'left', 
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: Platform.OS === 'web' ? 'center' : 'left',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Platform.OS === 'web' ? '#fff' : '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    // @ts-ignore
    outlineStyle: 'none',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Style for Go to Home button
  homeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  homeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});