import AsyncStorage from '@react-native-async-storage/async-storage';
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
    View,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rootApi } from './axiosInstance'; 

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Login Error", "Please enter email and password.");
            return;
        }

        setLoading(true);
        
        try {
            const response = await rootApi.post('auth/login', {
                email: email.trim(),
                password: password.trim(),
            });

            console.log("Login Response Data:", response.data);

            // 🚩 FIX: Check if response.data is directly the token string OR an object
            const token = typeof response.data === 'string' ? response.data : response.data?.token;

            if (token) {
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('isAuthenticated', 'true');
                
                try {
                  const decodedPayload: any = jwtDecode(token);
                  
                  if (decodedPayload.sub) await AsyncStorage.setItem('userEmail', decodedPayload.sub);
                  
                  // Extract Roles safely
                  const roles = decodedPayload.roles || decodedPayload.role || [];
                  const rolesString = JSON.stringify(roles);
                  await AsyncStorage.setItem('roles', rolesString); 

                  console.log("Logged in as:", rolesString);

                  // 🚩 ROLE BASED REDIRECT
                  if (rolesString.includes('ROLE_ADMIN') || rolesString.includes('ADMIN')) {
                      router.replace('/AdminPage');
                  } else {
                      router.replace('/(tabs)');
                  }

                } catch (decodeError) {
                  console.error('Failed to decode token:', decodeError);
                  // Fallback to user home if decode fails
                  router.replace('/(tabs)');
                }

            } else {
                Alert.alert("Login Failed", typeof response.data === 'object' ? response.data.message : "No token received.");
            }
        } catch (error: any) {
            setLoading(false);
            console.error("Login Error:", error);
            if (error.response) {
                Alert.alert("Login Failed", error.response.data?.message || "Invalid Credentials.");
            } else if (error.request) {
                Alert.alert("Network Error", "Could not connect to server. Check IP and Firewall.");
            } else {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

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
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                        style={styles.toggleButton} 
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons 
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                            size={24} 
                            color="#777" 
                        />
                    </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>LOGIN</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.homeButton} onPress={handleGoToHome}>
                <Text style={styles.homeButtonText}>Go to Home (Guest)</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? '#fff' : '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 20,
    // @ts-ignore
    outlineStyle: 'none',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  toggleButton: {
      paddingHorizontal: 15,
  },
  forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 25,
      marginTop: -10,
  },
  forgotPasswordText: {
      color: '#ff6b35',
      fontSize: 14,
      fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#ff9966',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  homeButtonText: {
    color: '#ff6b35',
    fontSize: 16,
    fontWeight: 'bold',
  },
});