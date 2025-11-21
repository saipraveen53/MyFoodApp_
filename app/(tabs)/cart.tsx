import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomNavbar from '../../components/CustomNavbar';
import { rootApi, IMAGE_BASE_URL } from '../axiosInstance';
import { useFood } from '../FoodContext';

// --- SVG Markup (Login Prompt) ---
const CHECKOUT_ILLUSTRATION = `
<svg xmlns="http://www.w3.org/2000/svg" width="437" height="371" fill="none" viewBox="0 0 437 371">
  <g clip-path="url(#a)">
    <path fill="#FC8019" d="m367.371 96.624-33.812 72.397-57.278-11.894 2.944-9.052 47.521 10.586 30.157-62.251a4.209 4.209 0 0 1 1.338-1.606c1.522-1.105 4.705-2.744 8.31-.643a1.92 1.92 0 0 1 .82 2.463Z"/>
    <path fill="#FFBC85" d="M190.876 370.052h109.611V204.738H190.876v165.314Z"/>
    <path fill="#545454" d="m295.024 271.772-4.445 13.179s6.813 8.048 6.489 17.26c0 0-27.672-13.448-27.31-15.688.362-2.24 9.799-23.03 9.799-23.03l15.467 8.279ZM365.608 254.857l8.092 11.317s10.513-.807 17.793 4.85c0 0-27.1 14.553-28.715 12.935-1.615-1.618-12.944-21.433-12.944-21.433l15.774-7.669Z"/>
    <path fill="#fff" stroke="#545454" stroke-miterlimit="10" stroke-width="1.92" d="M330.014 176.442c1.837-3.58 46.423 74.431 45.709 75.99l-33.572 16.978-22.651-36.785 10.514-56.183Z"/>
    <path fill="#fff" stroke="#545454" stroke-miterlimit="10" stroke-width="1.92" d="M272.063 154.572s68.586 6.111 64.684 35.411c0 0 2.069 22.029-32.265 86.903l-34.732-11.922 28.714-59.823-85.139-1.328s-30.098-9.695-20.606-50.06l39.417-8.46 39.927 9.279Z"/>
    <path fill="#fff" stroke="#545454" stroke-miterlimit="10" stroke-width=".96" d="M228.086 83.075s-2.023 11.72-4.045 13.742c-2.023 2.022-8.491 2.022-8.491 2.022l-11.729-9.296 8.491-12.528 15.774 6.06Z"/>
    <path fill="#fff" d="M230.488 83.99c11.576-1.878 19.436-12.777 17.557-24.344-1.879-11.567-12.786-19.422-24.361-17.545-11.575 1.878-19.436 12.777-17.557 24.344 1.879 11.568 12.786 19.423 24.361 17.545Z"/>
    <path fill="#545454" d="M227.077 42.05c4.159 0 8.224 1.233 11.682 3.542a21.005 21.005 0 0 1 3.186 32.33 21.041 21.041 0 0 1-32.352-3.184 21.005 21.005 0 0 1-3.543-11.675 21.03 21.03 0 0 1 6.167-14.85 21.066 21.066 0 0 1 14.86-6.163Zm0-.42a21.459 21.459 0 0 0-11.916 3.612 21.434 21.434 0 0 0-9.12 22.002 21.436 21.436 0 0 0 16.852 16.84c4.16.827 8.473.402 12.392-1.22a21.445 21.445 0 0 0 9.625-7.894 21.42 21.42 0 0 0-2.667-27.062 21.456 21.456 0 0 0-15.166-6.278Z"/>
    <path fill="#FCFCFC" d="M305.832 150.378c1.72.706 2.86 4.783 4.294 6.169 1.434 1.387 3.516.24 1.35-2.967m-5.816 1.139c2.166 3.203.601 4.682-1.064 3.577-.736-.488-1.682-1.938-2.498-3.362a8.826 8.826 0 0 0-6.354-4.363c-5.169-.769-14.896-.966-30.633 3.178-25.653 6.749-41.848 6.135-46.462-19.819l17.487-4.476c.201.487 3.276 13.427 3.276 13.427s47.391-5.438 54.456-5.438c7.313 0 18.748 10.086 20.152 15.469.265 1.017.307 3.539-2.544.652-.753-.761-1.438-2.686-3.566-4.354m.719 5.106c2.166 3.202.656 4.597-1.064 3.572-1.632-.967-1.888-5.182-4.357-6.997"/><path stroke="#545454" stroke-miterlimit="10" stroke-width="1.92" d="M324.353 136.422c3.234.807 5.236 4.95 7.28 5.253 2.153.324 3.099-1.706-.421-4.043m2.561-1.929c3.507 2.333 1.888 4.354-.134 3.547-2.023-.807-4.854-4.446-6.876-4.446m7.01.899c3.507 2.333 1.888 4.354-.134 3.547-2.023-.807-4.854-4.446-6.876-4.446m1.619 4.446c3.503 2.337 2.523 4.467.42 4.043-.942-.189-2.523-1.261-3.898-2.341a9.632 9.632 0 0 0-8.205-1.778c-5.526 1.358-15.409 5.174-29.56 15.84-23.054 17.381-39.636 23.441-55.007-.807l15.774-11.725c.421.42 6.473 8.892 6.473 8.892s47.887-21.739 55.007-24.656c7.368-3.013 23.054 2.429 26.696 7.279.685.912 1.77 3.438-2.292 1.706-1.072-.458-2.561-2.101-5.391-2.921"/><path fill="#FFBC85" d="M97.242 369.85h78.873V233.638H97.242V369.85Z"/><path fill="#E6F0FF" d="M133.754 253.999a3.917 3.917 0 1 0 0-7.833 3.919 3.919 0 0 0-3.92 3.917 3.918 3.918 0 0 0 3.92 3.916ZM110.528 260.685a3.916 3.916 0 0 0 0-5.539 3.922 3.922 0 0 0-5.543 0 3.914 3.914 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0ZM128.413 277.126a3.913 3.913 0 1 0 0-7.825 3.913 3.913 0 1 0 0 7.825ZM124.061 299.117a3.916 3.916 0 0 0 0-5.539 3.922 3.922 0 0 0-5.543 0 3.914 3.914 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0ZM118.363 325.095a3.914 3.914 0 0 0 0-5.539 3.92 3.92 0 0 0-5.543 0 3.916 3.916 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0ZM132.333 344.038a3.918 3.918 0 1 0 0-7.833 3.918 3.918 0 0 0-3.92 3.916 3.919 3.919 0 0 0 3.92 3.917ZM117.084 351.268c.824-2-.131-4.289-2.132-5.113a3.921 3.921 0 0 0-5.117 2.132 3.92 3.92 0 0 0 7.249 2.981ZM145.075 318.332a3.914 3.914 0 0 0 0-5.539 3.92 3.92 0 0 0-5.543 0 3.916 3.916 0 0 0 0 5.539 3.922 3.922 0 0 0 5.543 0ZM146.219 293.86a3.918 3.918 0 0 0 3.92-3.916 3.918 3.918 0 0 0-3.92-3.917 3.917 3.917 0 1 0 0 7.833ZM167.166 284.132a3.915 3.915 0 0 0 .633-5.503 3.922 3.922 0 0 0-5.507-.633 3.915 3.915 0 0 0-.633 5.503 3.922 3.922 0 0 0 5.507.633ZM167.17 312.602a3.915 3.915 0 0 0 .633-5.503 3.922 3.922 0 0 0-5.506-.633 3.915 3.915 0 0 0-.634 5.503 3.922 3.922 0 0 0 5.507.633ZM155.122 335.848a3.914 3.914 0 1 0-3.915-3.913 3.914 3.914 0 0 0 3.915 3.913ZM165.706 352.834a3.915 3.915 0 0 0 2.792-4.784 3.92 3.92 0 0 0-7.58 1.994 3.919 3.919 0 0 0 4.788 2.79ZM153.976 267.085a3.914 3.914 0 0 0 0-5.539 3.92 3.92 0 0 0-5.543 0 3.916 3.916 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0Z"/><path stroke="#545454" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.92" d="M158.722 54.582s-22.247 15.764-33.976-10.926c-11.729-26.69 23.601 3.303-8.125 17.175-14.719 4.85-20.392-14.145-26.46-23.845-6.069-9.7-15.775-5.627-17.39 10.116-2.052 18.751-13.243 7.77-19.244.31-6.947-8.636-19.867-9.69-27.916-2.075l-.567.554M.404 169.974c14.719-4.849 20.392 14.146 26.456 23.846 6.065 9.699 15.775 5.66 17.394-10.087 2.052-18.751 13.243-7.77 19.244-.31 6.947 8.636 19.862 9.695 27.916 2.076.189-.181.378-.362.567-.551"/><path stroke="#545454" stroke-miterlimit="10" stroke-width="2.88" d="M437 370.052H.168"/><path fill="#545454" d="M161.766 97.153c15.847 6.073 29.691 7.804 38.413-1.546l17.797-23.446c-2.022 1.223-7.267-7.678-2.022-9.703 5.244-2.026 6.472 3.231 6.472 3.231 10.934 1.618 15.371-10.506 15.371-10.506 4.853 8.49 10.513 6.871 10.513 6.871-2.149-22.021-23.046-23.345-36.587-17.604a7.105 7.105 0 0 0 1.404-4.203c0-4.24-3.784-7.678-8.495-7.678-4.71 0-8.495 3.438-8.495 7.678s3.785 7.682 8.495 7.682c.349 0 .697-.02 1.043-.063-3.507 2.614-5.673 5.775-5.492 8.956.286 4.988-5.257 4.039-5.257 4.039-15.375-1.631-15.757 9.279-15.757 9.279-1.216 8.489-6.473 8.892-6.473 8.892-9.819 2.282-13.264 7.27-14.399 11.183a5.744 5.744 0 0 0 3.469 6.938Z"/><path fill="#545454" d="M225.635 95.607c.323-.034.664 8.06.786 11.254a2.909 2.909 0 0 0 1.001 2.102c3.701 3.231 17.242 15.675 23.971 30.123a2.939 2.939 0 0 1-.967 3.589l-18.778 13.448a2.947 2.947 0 0 1-1.627.551l-52.072 1.479a2.956 2.956 0 0 1-2.315-1.054 2.944 2.944 0 0 1-.629-2.464c2.204-10.678 9.732-42.42 24.602-60.432a2.8 2.8 0 0 0 .311-.462l1.716-3.185a2.945 2.945 0 0 1 3.966-1.198c4.437 2.383 13.747 6.846 20.035 6.25Z"/><path stroke="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4.81" d="M201.798 98.839v8.19M221.265 106.979h-8.196M200.448 119.099l5.934-5.648M219.137 117.448l-.702 8.161M228.469 117.674l7.326 3.669M232.973 132.459l8.028-1.652M228.154 142.431l4.722 6.695M206.222 95.04l7.33 3.668M188.517 122.953l5.526 6.043M202.98 128.399l8.154-.807M211.778 134.556l6.737 4.66M187.508 135.77l6.737 4.661M182.083 140.473l-.21 8.186M198.207 149.16l-8.188-.29M214.217 151.992l-4.618-6.766"/><path fill="#545454" d="M218.582 65.265c-1.19 1.68-.496 3.274 1.224 4.131a.421.421 0 1 1-.375.719c-1.766-1.206-2.447-3.182-.841-4.85h-.008ZM233.953 83.075c-2.864-.126-5.631-1.98-6.308-4.841 0-.01.003-.018.01-.024a.031.031 0 0 1 .023-.01c.009 0 .018.004.024.01.007.006.01.015.01.024.753 2.731 3.491 4.446 6.249 4.455a.21.21 0 1 1 0 .42l-.008-.034Z"/><path stroke="#545454" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.85" d="M397.158 204.536a5.457 5.457 0 0 0 5.458-5.455 5.457 5.457 0 0 0-5.458-5.455 5.457 5.457 0 0 0-5.459 5.455 5.457 5.457 0 0 0 5.459 5.455ZM30.3 19.416a5.457 5.457 0 0 0 5.459-5.455A5.457 5.457 0 0 0 30.3 8.506a5.457 5.457 0 0 0-5.458 5.455 5.457 5.457 0 0 0 5.458 5.455Z"/><path fill="#545454" d="M227.481 86.215s-5.257-.106-8.495-3.341c0 0 6.068 2.02 8.697 1.45l-.202 1.89Z"/><path fill="#FDBF8C" d="M309.016 1.26c6.205 0 12.27 1.838 17.43 5.282a31.337 31.337 0 0 1 4.762 48.234 31.393 31.393 0 0 1-34.187 6.803 31.37 31.37 0 0 1-14.082-11.543 31.342 31.342 0 0 1-5.292-17.416 31.376 31.376 0 0 1 9.199-22.154 31.418 31.418 0 0 1 22.17-9.193m0-1.26a32.65 32.65 0 0 0-18.131 5.496 32.617 32.617 0 0 0-12.02 14.636 32.585 32.585 0 0 0-1.856 18.843 32.61 32.61 0 0 0 8.932 16.697 32.645 32.645 0 0 0 35.566 7.067 32.628 32.628 0 0 0 14.645-12.013 32.589 32.589 0 0 0 3.014-30.598A32.63 32.63 0 0 0 309.016.013Z"/><path stroke="#FDBF8C" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M309.02 9.094v23.517M320.564 44.143 309.02 32.611"/><path fill="#545454" d="M311.459 32.62a2.44 2.44 0 0 1-1.505 2.259 2.445 2.445 0 0 1-3.334-1.777 2.435 2.435 0 0 1 1.038-2.508 2.444 2.444 0 0 1 3.801 2.026Z"/>
  </g>
  <defs>
    <clipPath id="a">
      <path fill="#fff" d="M0 0h437v370.657H0z"/>
    </clipPath>
  </defs>
</svg>
`;

// --- HELPER COMPONENT: Footer Accordion ---
const FooterAccordion = ({ title }: { title: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <View style={styles.footerAccordionItem}>
          <TouchableOpacity style={styles.footerAccordionHeader} onPress={() => setIsOpen(!isOpen)}>
              <View style={styles.accordionLeft}>
                  <View style={styles.accordionIndicator} />
                  <Text style={styles.accordionTitle}>{title}</Text>
              </View>
              <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#fff" />
          </TouchableOpacity>
          
          {isOpen && (
              <View style={styles.accordionContent}>
                  <Text style={styles.footerLink}>About Us</Text>
                  <Text style={styles.footerLink}>Terms & Conditions</Text>
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                  <Text style={styles.footerLink}>Help Center</Text>
              </View>
          )}
      </View>
    );
};

// --- Helper Component: Cart Item Row ---
const CartItem = ({ name, price, desc, serve, quantity, onAdd, onRemove }: { name: string, price: string, desc: string, serve: string, quantity: number, onAdd: () => void, onRemove: () => void }) => (
  <View style={styles.cartItemContainer}>
      <View style={styles.cartItemInfo}>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.itemDesc}>{desc}</Text>
          <Text style={styles.itemServe}>{serve}</Text>
      </View>
      
      <View style={styles.cartItemRight}>
          <Text style={styles.itemPrice}>{price}</Text>
          <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={onRemove}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={onAdd}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
          </View>
      </View>
  </View>
);

// --- Helper Component: Bill Detail Row ---
const BillRow = ({ label, value, isTotal = false, isGreen = false }: { label: string, value: string, isTotal?: boolean, isGreen?: boolean }) => (
  <View style={[styles.billRow, isTotal && styles.billRowTotal]}>
      <Text style={[styles.billLabel, isTotal && styles.billLabelTotal]}>{label}</Text>
      <Text style={[
          styles.billValue, 
          isTotal && styles.billValueTotal,
          isGreen && styles.greenText
      ]}>{value}</Text>
  </View>
);

// --- Helper Component: Address Card ---
const AddressCard = ({ type, title, address, phone, onDeliverPress }: { type: 'home' | 'office', title: string, address: string, phone?: string, onDeliverPress: () => void }) => (
    <View style={styles.addressCard}>
        <View style={styles.addrCardHeader}>
            <View style={styles.addrTypeContainer}>
                <Ionicons name={type === 'home' ? 'home' : 'briefcase'} size={18} color="#ff6b35" />
                <Text style={styles.addrTitle}>{title}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
        </View>
        
        <Text style={styles.addrText}>{address}</Text>
        {phone ? <Text style={styles.addrPhone}>{phone}</Text> : null}
        
        <TouchableOpacity style={styles.deliverBtn} onPress={onDeliverPress}>
            <Text style={styles.deliverBtnText}>Deliver Here</Text>
        </TouchableOpacity>
    </View>
);

// --- Helper Component: Order Summary Item ---
const OrderSummaryItem = ({ name, price, desc }: { name: string, price: string, desc: string }) => (
    <View style={styles.orderItemContainer}>
        <View style={styles.orderItemInfo}>
            <Text style={styles.itemName}>{name}</Text>
            <Text style={styles.itemDesc}>{desc}</Text>
        </View>
        <Text style={styles.itemPrice}>{price}</Text>
    </View>
);

export default function CartScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState<'cart' | 'address' | 'payment' | 'confirm'>('cart');
  
  // Cart Data State
  const [cartData, setCartData] = useState<any>(null);
  const [loadingCart, setLoadingCart] = useState(false);

  // Addresses State (For Address Selection Step)
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null); // NEW STATE

  // Add Address Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipentName: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: ''
  });

  // Context Hooks
  const { fetchCart: refreshContextCart, clearCart } = useFood();

  // Check Auth Status
  useFocusEffect(
    useCallback(() => {
      const checkAuthAndFetch = async () => {
        try {
          const value = await AsyncStorage.getItem('isAuthenticated');
          const isAuth = value === 'true';
          setIsAuthenticated(isAuth);
          
          if (isAuth) {
            fetchCart(); 
          }
        } catch (e) {
          console.error("Auth check failed", e);
        } finally {
          setIsLoading(false);
        }
      };
      checkAuthAndFetch();
    }, [])
  );

  // Confirmation Reset Logic
  useEffect(() => {
      if (viewState === 'confirm') {
          // No auto reset
      }
  }, [viewState]);


  // Stepper Click Handler
  const handleStepClick = (stage: 'cart' | 'address' | 'payment' | 'confirm') => {
      if (viewState === 'confirm') return;

      if (stage === 'cart') {
          setViewState('cart'); 
      } else if (stage === 'address') {
          if (subTotal > 0 && (viewState === 'cart' || viewState === 'payment')) {
             setViewState('address');
          } else if (subTotal <= 0) {
              Alert.alert("Empty Cart", "Please add items to proceed to Address selection.");
          }
      } else if (stage === 'payment') {
          if (viewState === 'address') {
              // Validate Address Selection
              if (!selectedAddress) {
                  Alert.alert("Select Address", "Please select a delivery address first.");
                  return;
              }
              setViewState('payment');
          }
      }
  };

  // Fetch Addresses when entering Address View
  useEffect(() => {
      if (viewState === 'address') {
          fetchAddresses();
      }
  }, [viewState]);


  // FETCH CART API
  const fetchCart = async () => {
    setLoadingCart(true);
    try {
      const response = await rootApi.get('cart/myCart');
      if (response.data) {
        setCartData(response.data);
        refreshContextCart(); 
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoadingCart(false);
    }
  };

  // API: Place Order
  const handlePayNow = async () => {
      try {
          const response = await rootApi.post('order/placeOrder');

          if (response.status === 200 || response.status === 201) {
              Alert.alert("Success", "Your order has been placed!");
              setViewState('confirm'); 
          }
      } catch (error) {
          console.error("Order placement failed:", error);
          Alert.alert("Error", "Order placement failed. Please try again.");
      }
  };

  // API: Fetch Addresses
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
        const response = await rootApi.get('address/getAllAddresess');
        if (response.data) {
            setAddresses(response.data);
            // Auto-select default if none selected
            if (!selectedAddress) {
                const defaultAddr = response.data.find((a: any) => a.default);
                if (defaultAddr) setSelectedAddress(defaultAddr);
            }
        }
    } catch (error) {
        console.error("Failed to fetch addresses:", error);
    } finally {
        setLoadingAddresses(false);
    }
  };
  
  // API: Add New Address
  const handleAddAddress = async () => {
    if (!newAddress.recipentName || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipcode || !newAddress.country) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setModalVisible(false);
    try {
      const response = await rootApi.post('address/add', newAddress);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Address added successfully");
        setNewAddress({ recipentName: '', street: '', city: '', state: '', zipcode: '', country: '' }); 
        fetchAddresses(); 
      }
    } catch (error) {
      console.error("Failed to add address", error);
      Alert.alert("Error", "Failed to add address");
    }
  };

  // HANDLERS FOR CART ACTIONS
  const handleIncrement = async (menuItemId: number) => {
    try {
      await rootApi.post('cart/addItem', {
        menuItemId: menuItemId,
        quantity: 1
      });
      fetchCart(); 
    } catch (error) {
      console.error("Failed to add item:", error);
      Alert.alert("Error", "Failed to update cart");
    }
  };

  const handleDecrement = async (cartItemId: number) => {
    try {
      await rootApi.put(`cart/decrease/${cartItemId}`);
      fetchCart();
    } catch (error) {
       console.error("Failed to decrease item:", error);
       Alert.alert("Error", "Failed to update cart");
    }
  };

  const handleResetCart = () => {
      setCartData(null);
      clearCart(); 
      refreshContextCart(); 
      setViewState('cart');
      setSelectedAddress(null);
      Alert.alert("Cart Reset", "Your cart has been successfully reset.");
  };

  // Totals
  const subTotal = cartData ? cartData.totalAmount : 0;
  const deliveryCharge = 0; 
  const discount = subTotal * 0.10; 
  const total = subTotal - discount + deliveryCharge;

  // Steps Status
  const steps = [
    { 
        label: 'Account', 
        icon: 'person', 
        status: 'completed',
        target: 'cart' 
    },
    { 
        label: 'Address', 
        icon: 'location-sharp', 
        status: (viewState === 'address') ? 'active' : (viewState === 'payment' || viewState === 'confirm') ? 'completed' : 'inactive',
        target: 'address'
    },
    { 
        label: 'Payment', 
        icon: 'wallet', 
        status: (viewState === 'payment') ? 'active' : (viewState === 'confirm') ? 'completed' : 'inactive',
        target: 'payment'
    },
    { 
        label: 'Confirm', 
        icon: 'checkmark-circle', 
        status: (viewState === 'confirm') ? 'active' : 'inactive',
        target: 'confirm'
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomNavbar />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Checkout</Text>
            <View style={styles.breadcrumb}>
                <Ionicons name="home-outline" size={14} color="#ccc" />
                <Text style={styles.breadcrumbText}> Home / <Text style={styles.activeBreadcrumb}>Checkout</Text></Text>
            </View>
        </View>

        <View style={styles.mainContent}>
            
            {isAuthenticated && (
                <View style={styles.stepperContainer}>
                {steps.map((step, index) => {
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';
                    return (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.stepWrapper}
                        onPress={() => handleStepClick(step.target as any)}
                        disabled={viewState === 'confirm' || (step.target === 'payment' && !selectedAddress && viewState !== 'payment')}
                    >
                        {index < steps.length - 1 && <View style={styles.stepLine} />}
                        
                        <View style={[
                        styles.stepCircle,
                        (isActive || isCompleted) ? styles.stepCircleActive : styles.stepCircleInactive
                        ]}>
                        <Ionicons 
                            name={step.icon as any} 
                            size={18} 
                            color={(isActive || isCompleted) ? '#fff' : '#999'} 
                        />
                        </View>
                        
                        <Text style={[
                        styles.stepLabel,
                        (isActive || isCompleted) ? styles.stepLabelActive : styles.stepLabelInactive
                        ]}>
                        {step.label}
                        </Text>
                    </TouchableOpacity>
                    );
                })}
                </View>
            )}

            {!isLoading && (
              isAuthenticated ? (
                <>
                    {/* --- VIEW 1: CART ITEMS LIST --- */}
                    {viewState === 'cart' && (
                        <View style={styles.cartContent}>
                            {loadingCart ? (
                                <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 20 }} />
                            ) : (
                              cartData && cartData.items && cartData.items.length > 0 ? (
                                  cartData.items.map((item: any) => (
                                      <CartItem 
                                          key={item.id}
                                          name={item.menuItem.name} 
                                          price={`$${item.menuItem.price * item.quantity}`} 
                                          desc={item.menuItem.description || "Delicious Food"}
                                          serve={`x${item.quantity}`} 
                                          quantity={item.quantity} 
                                          onAdd={() => handleIncrement(item.menuItem.id)}
                                          onRemove={() => handleDecrement(item.id)} 
                                      />
                                  ))
                              ) : (
                                  <Text style={{ textAlign: 'center', marginVertical: 20, color: '#666' }}>Your cart is empty.</Text>
                              )
                            )}

                            {cartData && cartData.items && cartData.items.length > 0 && (
                                <>
                                    <View style={styles.billContainer}>
                                        <Text style={styles.billTitle}>Bill Details</Text>
                                        <BillRow label="Sub Total" value={`$${subTotal.toFixed(2)}`} />
                                        <BillRow label="Delivery Charge (2 kms)" value="Free" isGreen />
                                        <BillRow label="Discount (10%)" value={`$${discount.toFixed(2)}`} />
                                        <View style={styles.divider} />
                                        <BillRow label="To Pay" value={`$${total.toFixed(2)}`} isTotal />
                                    </View>

                                    <TouchableOpacity style={styles.checkoutButton} onPress={() => handleStepClick('address')}>
                                        <Text style={styles.checkoutButtonText}>CHECKOUT</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                    {/* --- VIEW 2: ADDRESS SELECTION --- */}
                    {viewState === 'address' && (
                        <View style={styles.addressContent}>
                            <View style={styles.addressHeaderRow}>
                                <View>
                                    <Text style={styles.sectionTitle}>Select Saved Address</Text>
                                    <Text style={styles.sectionSubtitle}>You've add some address before, You can select one of below.</Text>
                                </View>
                                <TouchableOpacity 
                                  style={styles.addNewBtn} 
                                  onPress={() => setModalVisible(true)}
                                >
                                  <Text style={styles.addNewBtnText}>+ Add New</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.addressList}>
                                {loadingAddresses ? (
                                     <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 20 }} />
                                ) : (
                                    addresses.length > 0 ? (
                                        addresses.map((addr) => (
                                            <View key={addr.id} style={selectedAddress?.id === addr.id ? styles.selectedAddrCard : {}}>
                                                <AddressCard 
                                                    type={addr.default ? 'home' : 'office'} 
                                                    title={addr.recipentName} 
                                                    address={`${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipcode}, ${addr.country}`}
                                                    onDeliverPress={() => {
                                                        setSelectedAddress(addr);
                                                        setViewState('payment');
                                                    }}
                                                />
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No addresses found. Add one now!</Text>
                                    )
                                )}
                            </View>
                            
                            <TouchableOpacity style={styles.backToCartBtn} onPress={() => handleStepClick('cart')}>
                                <Ionicons name="arrow-back" size={18} color="#ff6b35" />
                                <Text style={styles.backToCartText}>Change Items (Go to Cart)</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* --- VIEW 3: PAYMENT & ORDER SUMMARY --- */}
                    {viewState === 'payment' && (
                        <View style={styles.paymentContent}>
                            <View style={styles.deliverySummaryCard}>
                                <Image 
                                    source={require('../../assets/images/home.png')} 
                                    style={styles.mapImage}
                                />
                                <View style={styles.deliveryTextContainer}>
                                    <Text style={styles.deliveryTitle}>Deliver to : {selectedAddress?.recipentName || "Home"}</Text>
                                    <Text style={styles.deliveryAddress}>
                                        {selectedAddress 
                                            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.zipcode}, ${selectedAddress.country}`
                                            : "Please select an address"}
                                    </Text> 
                                </View>
                                <TouchableOpacity onPress={() => setViewState('address')}>
                                    <Text style={styles.changeText}>Change</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.sectionTitle}>Order Summary</Text>
                            {cartData && cartData.items && cartData.items.map((item: any) => (
                                <OrderSummaryItem 
                                    key={item.id}
                                    name={item.menuItem.name} 
                                    price={`$${item.menuItem.price * item.quantity}`} 
                                    desc={`${item.menuItem.description || "Food"} x${item.quantity}`} 
                                />
                            ))}

                            <View style={styles.promoContainer}>
                                <TextInput 
                                    placeholder="Enter promo code"
                                    placeholderTextColor="#999"
                                    style={styles.promoInput}
                                />
                                <TouchableOpacity style={styles.applyBtn}>
                                    <Text style={styles.applyBtnText}>APPLY</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.billContainer}>
                                <Text style={styles.billTitle}>Bill Details</Text>
                                <BillRow label="Sub Total" value={`$${subTotal.toFixed(2)}`} />
                                <BillRow label="Delivery Charge (2 kms)" value="Free" isGreen />
                                <BillRow label="Discount (10%)" value={`$${discount.toFixed(2)}`} />
                                <View style={styles.divider} />
                                <BillRow label="Total" value={`$${total.toFixed(2)}`} isTotal />
                            </View>

                             <TouchableOpacity style={styles.checkoutButton} onPress={handlePayNow}>
                                <Text style={styles.checkoutButtonText}>PAY NOW</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* --- VIEW 4: CONFIRMATION (SUCCESS) --- */}
                    {viewState === 'confirm' && (
                        <View style={styles.confirmContent}>
                            <View style={styles.successContainer}>
                                <Image 
                                    source={require('../../assets/images/confirm.gif')} 
                                    style={styles.successGif} 
                                    resizeMode="contain"
                                />
                                <Text style={styles.successTitle}>Your order has been successfully placed</Text>
                                <Text style={styles.successSub}>
                                    Sit and relax while your order is being worked on.
                                </Text>
                                
                                <TouchableOpacity style={styles.trackBtn} onPress={() => router.push('/(tabs)/profile')}>
                                    <Text style={styles.trackBtnText}>TRACK ORDER</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.resetCartBtn} onPress={handleResetCart}>
                                    <Text style={styles.resetCartBtnText}>RESET CART & START NEW ORDER</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.infoCard}>
                                <View style={styles.infoIconWrapper}>
                                   <Image 
                                      source={require('../../assets/images/home.png')} 
                                      style={{ width: 24, height: 24, tintColor: '#aaa' }}
                                      resizeMode="contain"
                                   />
                                </View>
                                <View style={styles.infoTextWrapper}>
                                    <Text style={styles.infoLabel}>Deliver to : {selectedAddress?.recipentName || "Home"}</Text>
                                    <Text style={styles.infoValue}>
                                        {selectedAddress 
                                            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`
                                            : "N/A"}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoCard}>
                                <View style={styles.infoIconWrapper}>
                                    <Ionicons name="wallet-outline" size={24} color="#aaa" />
                                </View>
                                <View style={styles.infoTextWrapper}>
                                    <Text style={styles.infoLabel}>Payment Method:</Text>
                                    <Text style={styles.infoValue}>Card: 98** **** **20</Text>
                                </View>
                            </View>

                        </View>
                    )}

                </>
              ) : (
                // --- GUEST VIEW ---
                <View style={styles.guestContent}>
                    <View style={styles.illustrationContainer}>
                      <SvgXml xml={CHECKOUT_ILLUSTRATION} width="100%" height={250} />
                    </View>

                    <View style={styles.bottomSection}>
                      <Text style={styles.bottomTitle}>Account</Text>
                      <Text style={styles.bottomDesc}>
                        To place your order now, log in to in your existing account or sign up
                      </Text>

                      <View style={styles.authButtonsRow}>
                        <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/login')}>
                          <Text style={styles.outlineButtonText}>SIGN IN</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/login')}>
                          <Text style={styles.outlineButtonText}>SIGN UP</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                </View>
              )
            )}

        </View>

        {/* --- FOOTER SECTION --- */}
        <View style={styles.footerContainer}>
            <View style={styles.footerBrandSection}>
                <Text style={styles.footerLogoText}>ZOMO<Text style={styles.footerLogoDot}>.</Text></Text>
                <Text style={styles.footerDesc}>
                    Welcome to our online order website! Here, you can browse our wide selection of products and place orders from the comfort of your own home.
                </Text>
                <View style={styles.socialRow}>
                    {['logo-facebook', 'logo-twitter', 'logo-linkedin', 'logo-instagram', 'logo-youtube'].map((icon, index) => (
                        <TouchableOpacity key={index} style={styles.socialIconBtn}>
                            <Ionicons name={icon as any} size={14} color="#fff" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.footerLinksContainer}>
                <FooterAccordion title="Company" />
                <FooterAccordion title="Account" />
                <FooterAccordion title="Useful links" />
                <FooterAccordion title="Top Brands" />
            </View>

            <View style={styles.copyrightSection}>
                <View style={styles.footerDivider} />
                <Text style={styles.copyrightText}>@ Copyright 2024 ZOMO. All rights Reserved.</Text>
                <Image 
                    source={require('../../assets/images/footer-card.png')} 
                    style={styles.paymentImage}
                    resizeMode="contain"
                />
            </View>
        </View>

      </ScrollView>

      {/* --- ADD ADDRESS MODAL (Copied from Profile) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Add New Address</Text>
               <TouchableOpacity onPress={() => setModalVisible(false)}>
                 <Ionicons name="close" size={24} color="#333" />
               </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Recipient Name</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="e.g. John Doe"
                    value={newAddress.recipentName}
                    onChangeText={(text) => setNewAddress({...newAddress, recipentName: text})}
                  />
               </View>

               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="e.g. 123 Main St"
                    value={newAddress.street}
                    onChangeText={(text) => setNewAddress({...newAddress, street: text})}
                  />
               </View>

               <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.inputLabel}>City</Text>
                      <TextInput 
                        style={styles.modalInput} 
                        placeholder="City"
                        value={newAddress.city}
                        onChangeText={(text) => setNewAddress({...newAddress, city: text})}
                      />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>State</Text>
                      <TextInput 
                        style={styles.modalInput} 
                        placeholder="State"
                        value={newAddress.state}
                        onChangeText={(text) => setNewAddress({...newAddress, state: text})}
                      />
                  </View>
               </View>

               <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.inputLabel}>Zipcode</Text>
                      <TextInput 
                        style={styles.modalInput} 
                        placeholder="Zipcode"
                        keyboardType="numeric"
                        value={newAddress.zipcode}
                        onChangeText={(text) => setNewAddress({...newAddress, zipcode: text})}
                      />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Country</Text>
                      <TextInput 
                        style={styles.modalInput} 
                        placeholder="Country"
                        value={newAddress.country}
                        onChangeText={(text) => setNewAddress({...newAddress, country: text})}
                      />
                  </View>
               </View>

               <TouchableOpacity style={styles.saveAddrBtn} onPress={handleAddAddress}>
                  <Text style={styles.saveAddrBtnText}>Save Address</Text>
               </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#191919' },
  scrollContent: { flexGrow: 1, backgroundColor: '#f8f9fa' }, 
  
  headerSection: { backgroundColor: '#191919', paddingVertical: 40, alignItems: 'center', paddingBottom: 60 },
  pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  breadcrumbText: { color: '#ccc', fontSize: 14 },
  activeBreadcrumb: { color: '#ff6b35', fontWeight: '600' },

  mainContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingBottom: 40,
  },

  stepperContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40, paddingHorizontal: 20 },
  stepWrapper: { alignItems: 'center', width: '25%', position: 'relative' },
  stepLine: { position: 'absolute', top: 20, left: '50%', width: '100%', height: 0, borderBottomWidth: 1.5, borderColor: '#ccc', borderStyle: 'dashed' },
  stepCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, backgroundColor: '#fff', zIndex: 1 },
  stepCircleActive: { backgroundColor: '#ff6b35', borderColor: '#ff6b35' },
  stepCircleInactive: { backgroundColor: '#f5f5f5', borderColor: '#eee' },
  stepLabel: { fontSize: 12 },
  stepLabelActive: { color: '#ff6b35', fontWeight: '600' },
  stepLabelInactive: { color: '#999' },
  backToCartBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 20, alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
  backToCartText: { color: '#ff6b35', fontSize: 14, fontWeight: '600', marginLeft: 8 },


  guestContent: { alignItems: 'center', paddingHorizontal: 20 },
  illustrationContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  bottomSection: { alignItems: 'center', width: '100%', maxWidth: 400 },
  bottomTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  bottomDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 30, paddingHorizontal: 20 },
  authButtonsRow: { flexDirection: 'row', gap: 20 },
  outlineButton: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30, borderWidth: 1, borderColor: '#ff6b35', backgroundColor: '#fff', minWidth: 120, alignItems: 'center' },
  outlineButtonText: { color: '#ff6b35', fontWeight: 'bold', fontSize: 14 },

  cartContent: { paddingHorizontal: 20 },
  cartItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 20 },
  cartItemInfo: { flex: 1, paddingRight: 10 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#888', marginBottom: 8 },
  itemServe: { fontSize: 13, color: '#555', fontWeight: '500' },
  cartItemRight: { alignItems: 'flex-end' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  qtyBtnText: { fontSize: 16, color: '#666' },
  qtyText: { fontSize: 14, fontWeight: '600', color: '#333', marginHorizontal: 5 },

  billContainer: { marginTop: 10, marginBottom: 20 },
  billTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billRowTotal: { marginTop: 5 },
  billLabel: { fontSize: 14, color: '#666' },
  billValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  billLabelTotal: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  billValueTotal: { fontSize: 16, fontWeight: 'bold', color: '#16a34a' }, 
  greenText: { color: '#16a34a' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  
  checkoutButton: { backgroundColor: '#ff6b35', paddingVertical: 16, borderRadius: 8, alignItems: 'center', shadowColor: '#ff6b35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // --- Address Styles ---
  addressContent: { paddingHorizontal: 20 },
  addressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20, maxWidth: '80%' },
  
  // Improved "Add New" Button Styling
  addNewBtn: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addNewBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  addressList: { gap: 20 },
  addressCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 10 },
  selectedAddrCard: { borderWidth: 2, borderColor: '#ff6b35', borderRadius: 14 }, // Highlight style
  addrCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addrTypeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrTitle: { fontSize: 16, fontWeight: 'bold', color: '#ff6b35' },
  editBtn: { backgroundColor: '#fff5f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  editBtnText: { color: '#ff6b35', fontSize: 12, fontWeight: '600' },
  addrText: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },
  addrPhone: { fontSize: 14, color: '#777', marginBottom: 15 },
  deliverBtn: { backgroundColor: '#f9f9f9', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  deliverBtnText: { color: '#555', fontSize: 14, fontWeight: '600' },
  
  // --- Payment Styles ---
  paymentContent: { paddingHorizontal: 20 },
  deliverySummaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  mapImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  deliveryTextContainer: { flex: 1, marginRight: 10 },
  deliveryTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  deliveryAddress: { fontSize: 12, color: '#777', lineHeight: 16 },
  changeText: { color: '#ff6b35', fontSize: 13, fontWeight: '600' },
  
  orderItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  orderItemInfo: { flex: 1, paddingRight: 10 },
  promoContainer: { flexDirection: 'row', marginVertical: 20, gap: 10 },
  promoInput: { flex: 1, height: 45, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 15, fontSize: 14, backgroundColor: '#fdfdfd' },
  applyBtn: { backgroundColor: '#ff6b35', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // --- Confirm Styles ---
  confirmContent: { paddingHorizontal: 20, alignItems: 'center' },
  successContainer: { alignItems: 'center', marginBottom: 30 },
  successGif: { 
    width: 150, 
    height: 150, 
    marginBottom: 15,
    borderRadius: 75,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#16a34a',
  },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  successSub: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  trackBtn: { backgroundColor: '#ff6b35', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30, shadowColor: '#ff6b35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, marginBottom: 15 },
  trackBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  resetCartBtn: {
      backgroundColor: '#f5f5f5',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: '#ccc',
  },
  resetCartBtnText: {
      color: '#333',
      fontSize: 14,
      fontWeight: '600',
  },

  infoCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#eee', marginBottom: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  infoIconWrapper: { width: 40, height: 40, backgroundColor: '#f5f5f5', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoTextWrapper: { flex: 1 },
  infoLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  infoValue: { fontSize: 13, color: '#666' },

  // --- Footer Styles ---
  footerContainer: { backgroundColor: '#212121', paddingVertical: 30, paddingHorizontal: 20, marginTop: 0 },
  footerBrandSection: { marginBottom: 25 },
  footerLogoText: { fontSize: 24, fontWeight: '900', color: '#fff', fontStyle: 'italic', marginBottom: 15 },
  footerLogoDot: { color: '#ff6b35' },
  footerDesc: { color: '#aaa', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  footerLinksContainer: { gap: 10, marginBottom: 30 },
  footerAccordionItem: { borderBottomWidth: 1, borderBottomColor: '#333' },
  footerAccordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  accordionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accordionIndicator: { width: 3, height: 14, backgroundColor: '#ff6b35', borderRadius: 2 },
  accordionTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  accordionContent: { paddingLeft: 15, paddingBottom: 15, gap: 8 },
  footerLink: { color: '#888', fontSize: 13 },
  copyrightSection: { paddingTop: 20, gap: 15 },
  footerDivider: { height: 1, backgroundColor: '#333', marginBottom: 5 },
  copyrightText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  paymentImage: { width: '100%', height: 40 },

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    gap: 15,
  },
  inputGroup: {
    gap: 6,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  saveAddrBtn: {
    backgroundColor: '#ff6b35',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveAddrBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});