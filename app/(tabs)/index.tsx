import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Alert, 
  Platform, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  ScrollView, 
  TextInput,
  FlatList,
  useWindowDimensions,
  RefreshControl,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { rootApi, IMAGE_BASE_URL } from '../axiosInstance';
import { useFood } from '../FoodContext'; // IMPORT CONTEXT

const BRANDS = [
  { id: '1', name: "La Pino'z", image: require('../../assets/images/brand1.png') },
  { id: '2', name: "Mc'd", image: require('../../assets/images/brand2.png') },
  { id: '3', name: "Starbucks", image: require('../../assets/images/brand3.png') },
  { id: '4', name: "Pizza Hut", image: require('../../assets/images/brand4.png') },
  { id: '5', name: "Wendy's", image: require('../../assets/images/brand5.png') },
  { id: '6', name: "Burger King", image: require('../../assets/images/brand6.png') },
  { id: '7', name: "Subway", image: require('../../assets/images/brand7.png') },
  { id: '8', name: "Domino's", image: require('../../assets/images/brand8.png') },
  { id: '9', name: "Taco Bell", image: require('../../assets/images/brand9.png') },
  { id: '10', name: "Chipotle", image: require('../../assets/images/brand10.png') },
  { id: '11', name: "KFC", image: require('../../assets/images/brand11.png') },
];

// FAKE DATA FOR TOP FOODS (Static - No Interaction)
const FOOD_ITEMS = [
    { id: '1', name: 'Poultry Palace', description: 'Chicken quesadilla, avocado...', rating: 3.9, time: '25 min', dist: '3.2 km', discount: '50% OFF', badge: '', price: 150, image: require('../../assets/images/vp-1.png') },
    { id: '2', name: 'Ribeye Junction', description: 'Chicken quesadilla, avocado...', rating: 3.2, time: '10 min', dist: '1 km', discount: '50% OFF', badge: 'Newest', price: 200, image: require('../../assets/images/vp-2.png') },
    { id: '3', name: 'The Grill Master\'s...', description: 'Bread, Eggs, Butter, Fries...', rating: 4.3, time: '40 min', dist: '5 km', discount: '', badge: '', price: 120, image: require('../../assets/images/vp-3.png') },
    { id: '4', name: 'Cozy Cuppa Cafe', description: 'Cheesecake, waffles, Cakes...', rating: 3.6, time: '30 min', dist: '4 km', discount: '', badge: '', price: 180, image: require('../../assets/images/vp-4.png') },
    { id: '5', name: 'Mocha Magic Cafe', description: 'Chicken quesadilla, avocado...', rating: 3.2, time: '25 min', dist: '3.2 km', discount: '', badge: '', price: 250, image: require('../../assets/images/vp-5.png') },
    { id: '6', name: 'Latte Lounge', description: 'Chicken quesadilla, avocado...', rating: 3.6, time: '10 min', dist: '1 km', discount: '50% OFF', badge: '', price: 300, image: require('../../assets/images/vp-6.png') },
    { id: '7', name: 'The Burger Barn', description: 'Bread, Eggs, Butter, Fries...', rating: 3.8, time: '40 min', dist: '5 km', discount: '50% OFF', badge: 'Best seller', price: 140, image: require('../../assets/images/vp-7.png') },
    { id: '8', name: 'Wing Master', description: 'Cheesecake, waffles, Cakes...', rating: 3.2, time: '30 min', dist: '4 km', discount: '50% OFF', badge: 'Exclusive', price: 160, image: require('../../assets/images/vp-8.png') },
];

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

export default function UserDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  // USE CONTEXT
  const { cart, addToCart, decrementFromCart, fetchCart, clearCart } = useFood(); 

  const [isSearching, setIsSearching] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]); 
  const [hoveredItem, setHoveredItem] = useState<string | null>(null); 
  const [locationName, setLocationName] = useState('Location');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingItems, setIsSearchingItems] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Category States
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryItems, setCategoryItems] = useState<any[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  const isWebLayout = width > 768; 

  // REFRESH CART & AUTH STATUS ON SCREEN FOCUS
  useFocusEffect(
    useCallback(() => {
        const checkAuthAndFetch = async () => {
            const value = await AsyncStorage.getItem('isAuthenticated');
            const isAuth = value === 'true';
            setIsAuthenticated(isAuth);
            
            if (isAuth) {
                fetchCart(); // Load cart if logged in
            } else {
                clearCart(); // Clear cart if guest/logged out
            }
        };
        checkAuthAndFetch();
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 3000);

    fetchData();
    handleGetLocation();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setNoResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearchingItems(true);
    setNoResults(false);
    setSelectedCategory(null); // Clear category on search
    try {
      const response = await rootApi.get(`items/search?query=${query}`);
      if (response.data && response.data.length > 0) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
        setNoResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setIsSearchingItems(false);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchCategories(), fetchDeals(), fetchAllItems()]);
  };

  const fetchCategories = async () => {
    try {
      const response = await rootApi.get('/categories/all');
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await rootApi.get('offer/getActiveOffers');
      if (response.data) {
        setDeals(response.data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  // FETCH ALL ITEMS (Reset)
  const fetchAllItems = async () => {
    try {
      const response = await rootApi.get('items/allItems');
      if (response.data) {
        setAllItems(response.data);
        setSelectedCategory(null); // Reset category filter
      }
    } catch (error) {
      console.error('Error fetching all items:', error);
    }
  };

  // FETCH BY CATEGORY
  const onCategoryPress = async (category: any) => {
      setSelectedCategory(category);
      setIsLoadingCategory(true);
      try {
          const response = await rootApi.get(`items/ByCategory/${category.id}`);
          if (response.data) {
              setCategoryItems(response.data);
          } else {
              setCategoryItems([]);
          }
      } catch (error) {
          console.error('Error fetching category items:', error);
          setCategoryItems([]);
      } finally {
          setIsLoadingCategory(false);
      }
  };
  
  // --- FIX: ADDED MISSING FUNCTION ---
  const clearCategorySelection = () => {
      setSelectedCategory(null);
      fetchAllItems(); // Go back to showing all items
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      if (isAuthenticated) fetchCart();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('pizza')) return 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png';
    if (n.includes('burger')) return 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png';
    if (n.includes('chicken')) return 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png';
    if (n.includes('fries')) return 'https://cdn-icons-png.flaticon.com/512/123/123284.png';
    if (n.includes('taco')) return 'https://cdn-icons-png.flaticon.com/512/4428/4428507.png';
    if (n.includes('burrito') || n.includes('boritto')) return 'https://cdn-icons-png.flaticon.com/512/10698/10698109.png';
    if (n.includes('muffin')) return 'https://cdn-icons-png.flaticon.com/512/10240/10240804.png';
    if (n.includes('coffee') || n.includes('starbucks')) return 'https://cdn-icons-png.flaticon.com/512/2935/2935413.png';
    if (n.includes('sushi')) return 'https://cdn-icons-png.flaticon.com/512/2252/2252075.png';
    if (n.includes('salad')) return 'https://cdn-icons-png.flaticon.com/512/2515/2515183.png';
    return 'https://cdn-icons-png.flaticon.com/512/857/857681.png';
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await AsyncStorage.clear();
        clearCart(); // Clear cart on logout
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
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'ZomoApp/1.0',
            },
          }
        );
        const data = await response.json();
        
        if (data && data.address) {
          const suburb = data.address.suburb || data.address.neighbourhood;
          const city = data.address.city || data.address.town || data.address.village || data.address.county;
          const state = data.address.state;
          
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
    }
  };

  // Helper to get item quantity from context cart
  const getItemQty = (id: string | number) => {
      const item = cart.find((i) => i.id == id); 
      return item ? (item.qty || 0) : 0;
  };

  // --- Reusable Food Card Render (With Cart Logic) ---
  const renderFoodItem = (item: any) => {
      const qty = getItemQty(item.id);
      const imageUrl = item.imageUrl || item.image; 
      const uri = (typeof imageUrl === 'string' && imageUrl.startsWith('http')) 
          ? imageUrl 
          : (typeof imageUrl === 'string' ? `${IMAGE_BASE_URL}/${imageUrl}` : null);
      
      const source = typeof imageUrl === 'number' ? imageUrl : { uri };

      return (
        <TouchableOpacity 
            key={item.id} 
            style={[styles.foodCard, { width: isWebLayout ? '23%' : '48%' }]}
            onMouseEnter={() => Platform.OS === 'web' && setHoveredItem(item.id)}
            onMouseLeave={() => Platform.OS === 'web' && setHoveredItem(null)}
            onPress={() => {
                if (!isAuthenticated) {
                    Alert.alert("Login Required", "Please login to add items to cart.", [
                        { text: "Login", onPress: () => router.push('/login') },
                        { text: "Cancel" }
                    ]);
                    return;
                }

                if (qty === 0) {
                    addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        description: item.description,
                        imageUrl: imageUrl
                    });
                }
            }}
            activeOpacity={qty > 0 ? 1 : 0.7} 
        >
            <View style={styles.foodImageContainer}>
                <Image 
                    source={source} 
                    style={[styles.foodImage, { transform: [{ scale: hoveredItem === item.id ? 1.1 : 1 }] }]} 
                />
                {item.badge ? (
                    <View style={[styles.badgeContainer, 
                        item.badge === 'Newest' ? { backgroundColor: '#007bff' } : 
                        item.badge === 'Best seller' ? { backgroundColor: '#28a745' } : 
                        { backgroundColor: '#ffc107' }
                    ]}>
                        {item.badge === 'Newest' && <Ionicons name="star" size={10} color="#fff" style={{marginRight: 2}}/>}
                        <Text style={styles.badgeLabel}>{item.badge}</Text>
                    </View>
                ) : null}
                
                {item.discount ? (
                    <View style={styles.discountOverlay}>
                        <Text style={styles.discountSmall}>upto $2</Text>
                        <Text style={styles.discountLarge}>{item.discount}</Text>
                    </View>
                ) : null}

                {/* QTY Counter Overlay - Only if Authenticated */}
                {isAuthenticated && qty > 0 && (
                    <View style={styles.qtyOverlay}>
                        <TouchableOpacity 
                            style={styles.qtyBtn} 
                            onPress={() => decrementFromCart(item.id)}
                        >
                            <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{qty}</Text>
                        <TouchableOpacity 
                            style={styles.qtyBtn} 
                            onPress={() => addToCart({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                description: item.description,
                                imageUrl: imageUrl
                            })}
                        >
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.foodInfo}>
                <View style={styles.foodHeader}>
                    <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                    {item.rating && (
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={10} color="#fff" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.foodDesc} numberOfLines={1}>{item.description}</Text>
                
                <View style={styles.foodMetaRow}>
                    <View style={styles.metaItem}>
                        <Text style={styles.orderItemPrice}>${item.price}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color="#ff6b35" />
                        <Text style={styles.metaText}>{item.time || '30 min'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
      );
  };

  if (isSearching) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
         source={require('../../assets/images/food.gif')}
          style={styles.loadingIcon}
        />
        <Text style={styles.loadingText}>Searching the most delicious dish in your area...</Text>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.navLinkItem}><Text style={styles.navLinkText}>Home</Text><Ionicons name="chevron-down" size={10} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.navLinkItem}><Text style={styles.navLinkText}>Order</Text><Ionicons name="chevron-down" size={10} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.navLinkItem}><Text style={styles.navLinkText}>Blog</Text><Ionicons name="chevron-down" size={10} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.navLinkItem}><Text style={styles.navLinkText}>Pages</Text><Ionicons name="chevron-down" size={10} color="#fff" /></TouchableOpacity>
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

  const renderHero = () => (
    <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={[styles.heroMainContainer, { 
          paddingHorizontal: isWebLayout ? 50 : 20, 
          minHeight: isWebLayout ? 550 : 'auto',
          paddingBottom: isWebLayout ? 100 : 60
        }]}
        imageStyle={{ opacity: 0.25, backgroundColor: '#000' }}
    >
        <View style={[styles.heroContentWrapper, { flexDirection: isWebLayout ? 'row' : 'column' }]}>
            <View style={[styles.heroLeftColumn, { 
                maxWidth: isWebLayout ? '65%' : '100%', 
                marginBottom: isWebLayout ? 0 : 30,
                alignItems: isWebLayout ? 'flex-start' : 'center'
            }]}>
                <Text style={[styles.heroTitle, { 
                fontSize: isWebLayout ? 48 : 30, 
                lineHeight: isWebLayout ? 60 : 40,
                textAlign: isWebLayout ? 'left' : 'center'
                }]}>
                Discover restaurants that food deliver near you
                </Text>
                
                <View style={[styles.heroSearchRow, { width: isWebLayout ? '80%' : '100%' }]}>
                    <View style={styles.heroInputContainer}>
                        <Ionicons name="search" size={18} color="#999" style={{ marginLeft: 15 }} />
                        <TextInput 
                            style={styles.heroInput}
                            placeholder="Search for Restaurant"
                            placeholderTextColor="#888"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <TouchableOpacity style={styles.heroSearchBtn} onPress={() => performSearch(searchQuery)}>
                        <Text style={styles.heroSearchBtnText}>Search</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {Platform.OS === 'web' && (
                <View style={[styles.heroRightColumn, { alignItems: isWebLayout ? 'flex-end' : 'center' }]}>
                    <Image 
                    source={require('../../assets/images/home-vector.png')} 
                    style={{
                        width: isWebLayout ? width * 0.40 : width * 0.8, 
                        height: isWebLayout ? width * 0.40 : width * 0.8,
                    }}
                    resizeMode="contain"
                    />
                </View>
            )}
        </View>
        
        {Platform.OS === 'web' && (
            <View style={[styles.popcornWrapper, { left: 0 }]}>
                <Image 
                    source={require('../../assets/images/popcorn.png')}
                    style={{
                        width: isWebLayout ? 250 : 140,
                        height: isWebLayout ? 250 : 140,
                        opacity: 0.9
                    }} 
                    resizeMode="contain"
                />
            </View>
        )}
    </ImageBackground>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        {isWebLayout ? renderWebNavbar() : renderMobileNavbar()}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff6b35']}
            tintColor="#ff6b35"
            title="Pull to refresh"
            titleColor="#fff"
          />
        }
      >
        
        {renderHero()}

        <View style={[styles.whiteSection, { marginTop: -60, paddingBottom: 50 }]}>
            
            {/* CONDITIONAL RENDERING: Search > Category > Dashboard */}
            {searchQuery.trim().length > 0 ? (
                <View style={[styles.brandsContainer, { paddingHorizontal: isWebLayout ? 50 : 20, marginTop: 40 }]}>
                     <View style={styles.sectionHeader}>
                         <Text style={styles.sectionTitle}>Search Results</Text>
                     </View>

                     {isSearchingItems ? (
                         <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 20 }} />
                     ) : noResults ? (
                         <View style={{ padding: 20, alignItems: 'center' }}>
                             <Text style={{ color: '#666', fontSize: 16 }}>No items found with "{searchQuery}"</Text>
                         </View>
                     ) : (
                         <View style={styles.foodGrid}>
                            {searchResults.map((item) => renderFoodItem(item))}
                         </View>
                     )}
                </View>
            ) : selectedCategory ? (
                // --- CATEGORY ITEMS VIEW ---
                <View style={[styles.brandsContainer, { paddingHorizontal: isWebLayout ? 50 : 20, marginTop: 40 }]}>
                     <View style={styles.sectionHeader}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                             <TouchableOpacity onPress={clearCategorySelection}>
                                 <Ionicons name="arrow-back" size={24} color="#333" />
                             </TouchableOpacity>
                             <View>
                                <Text style={styles.sectionTitle}>{selectedCategory.name}</Text>
                                <View style={styles.titleUnderline} />
                             </View>
                         </View>
                     </View>

                     {isLoadingCategory ? (
                         <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 20 }} />
                     ) : (
                         <View style={styles.foodGrid}>
                            {categoryItems.length > 0 ? (
                                categoryItems.map((item) => renderFoodItem(item))
                            ) : (
                                <Text style={{ padding: 20, color: '#666' }}>No items found in {selectedCategory.name}.</Text>
                            )}
                         </View>
                     )}
                </View>
            ) : (
                // --- DEFAULT DASHBOARD CONTENT ---
                <>
                    <View style={[styles.floatingContainer, { 
                    marginHorizontal: isWebLayout ? 50 : 15,
                    }]}>
                        <View style={[styles.sectionHeader, { paddingHorizontal: 20, marginBottom: 20 }]}>
                            <View>
                                <Text style={styles.sectionTitle}>Categories For You</Text>
                                <View style={styles.titleUnderline} />
                                <Text style={styles.sectionSubtitle}>Browse out top categories here to discover different food cuision.</Text>
                            </View>
                            
                            <View style={styles.navArrows}>
                                <TouchableOpacity style={styles.arrowBtn}>
                                    <Ionicons name="chevron-back" size={20} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.arrowBtn}>
                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <FlatList 
                            data={categories}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item: any) => item.id.toString()}
                            contentContainerStyle={[styles.categoriesList, { gap: isWebLayout ? 60 : 25 }]}
                            renderItem={({ item }: { item: any }) => (
                            <TouchableOpacity 
                                style={[styles.categoryItem, { width: isWebLayout ? 120 : 70 }]}
                                onPress={() => onCategoryPress(item)} // CALL API
                            >
                                <View style={[styles.catIconWrapper, {
                                    width: isWebLayout ? 80 : 50,
                                    height: isWebLayout ? 80 : 50,
                                    borderRadius: isWebLayout ? 40 : 25
                                }]}>
                                    <Image 
                                        source={{ uri: getCategoryImage(item.name) }} 
                                        style={styles.catIcon} 
                                    />
                                </View>
                                <Text style={styles.catName}>{item.name}</Text>
                            </TouchableOpacity>
                            )}
                        />
                    </View>

                    <View style={[styles.dealsContainer, { paddingHorizontal: isWebLayout ? 50 : 20 }]}>
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>Today's Deal</Text>
                                <View style={styles.titleUnderline} />
                                <Text style={styles.sectionSubtitle}>Take a benefit from our latest offers.</Text>
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsScroll}>
                            {deals.length > 0 ? (
                                deals.map((deal) => (
                                    <ImageBackground 
                                    key={deal.id}
                                    source={{ uri: deal.imageUrl.startsWith('http') ? deal.imageUrl : `${IMAGE_BASE_URL}/${deal.imageUrl}` }} 
                                    style={styles.dealCard}
                                    imageStyle={{ borderRadius: 12 }}
                                    >
                                    <View style={styles.dealOverlay}>
                                        <Text style={styles.dealTitle}>{deal.title}</Text>
                                        <Text style={styles.dealSubtitle}>{deal.description}</Text>
                                    </View>
                                    </ImageBackground>
                                ))
                            ) : (
                                <Text style={{ padding: 20, color: '#666' }}>Loading offers...</Text>
                            )}
                        </ScrollView>
                    </View>

                    <View style={[styles.brandsContainer, { paddingHorizontal: isWebLayout ? 50 : 20 }]}>
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>Brand For You</Text>
                                <View style={styles.titleUnderline} />
                                <Text style={styles.sectionSubtitle}>Browse out top brands here to discover different food cuision.</Text>
                            </View>
                            
                            <View style={styles.navArrows}>
                                <TouchableOpacity style={styles.arrowBtn}>
                                    <Ionicons name="chevron-back" size={20} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.arrowBtn}>
                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsScroll}>
                            {BRANDS.map((brand) => (
                                <TouchableOpacity key={brand.id} style={styles.brandItem}>
                                    <View style={styles.brandLogoContainer}>
                                        <Image source={brand.image} style={styles.brandLogo} resizeMode="contain" />
                                    </View>
                                    <Text style={styles.brandName}>{brand.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Popular Foods Section - STATIC DATA (Disabled Interaction) */}
                    <View style={[styles.brandsContainer, { paddingHorizontal: isWebLayout ? 50 : 20, marginTop: 40 }]}>
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>Top Foods</Text>
                                <View style={styles.titleUnderline} />
                                <Text style={styles.sectionSubtitle}>Explore the top-rated dishes from around you.</Text>
                            </View>
                            
                            <View style={styles.navArrows}>
                                <TouchableOpacity style={styles.arrowBtn}>
                                    <Ionicons name="chevron-back" size={20} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.arrowBtn}>
                                    <Ionicons name="chevron-forward" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.foodGrid}>
                            {FOOD_ITEMS.map((item) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={[styles.foodCard, { width: isWebLayout ? '23%' : '48%' }]}
                                    onMouseEnter={() => Platform.OS === 'web' && setHoveredItem(item.id)}
                                    onMouseLeave={() => Platform.OS === 'web' && setHoveredItem(null)}
                                    activeOpacity={1} // No interaction feedback
                                    // onPress removed
                                >
                                    <View style={styles.foodImageContainer}>
                                        <Image 
                                            source={item.image} 
                                            style={[styles.foodImage, { transform: [{ scale: hoveredItem === item.id ? 1.1 : 1 }] }]} 
                                        />
                                        {item.badge ? (
                                            <View style={[styles.badgeContainer, 
                                                item.badge === 'Newest' ? { backgroundColor: '#007bff' } : 
                                                item.badge === 'Best seller' ? { backgroundColor: '#28a745' } : 
                                                { backgroundColor: '#ffc107' }
                                            ]}>
                                                {item.badge === 'Newest' && <Ionicons name="star" size={10} color="#fff" style={{marginRight: 2}}/>}
                                                <Text style={styles.badgeLabel}>{item.badge}</Text>
                                            </View>
                                        ) : null}
                                        
                                        {item.discount ? (
                                            <View style={styles.discountOverlay}>
                                                <Text style={styles.discountSmall}>upto $2</Text>
                                                <Text style={styles.discountLarge}>{item.discount}</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    <View style={styles.foodInfo}>
                                        <View style={styles.foodHeader}>
                                            <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                                            <View style={styles.ratingContainer}>
                                                <Ionicons name="star" size={10} color="#fff" />
                                                <Text style={styles.ratingText}>{item.rating}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.foodDesc} numberOfLines={1}>{item.description}</Text>
                                        
                                        <View style={styles.foodMetaRow}>
                                            <View style={styles.metaItem}>
                                                <Text style={styles.metaText}>• {item.dist}</Text>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="time-outline" size={12} color="#ff6b35" />
                                                <Text style={styles.metaText}>{item.time}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* NEW SECTION: All Items from API (With Cart Logic) */}
                    <View style={[styles.brandsContainer, { paddingHorizontal: isWebLayout ? 50 : 20, marginTop: 40, paddingBottom: 50 }]}>
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>All Items</Text>
                                <View style={styles.titleUnderline} />
                                <Text style={styles.sectionSubtitle}>Discover our complete menu.</Text>
                            </View>

                            {/* SHOW ALL BUTTON */}
                            <TouchableOpacity onPress={fetchAllItems} style={styles.showAllBtn}>
                                 <Text style={styles.showAllText}>Show All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.foodGrid}>
                            {allItems.length > 0 ? (
                                allItems.map((item) => renderFoodItem(item))
                            ) : (
                                <Text style={{ padding: 20, color: '#666' }}>Loading items...</Text>
                            )}
                        </View>
                    </View>
                </>
            )}
            
            {/* --- FOOTER SECTION (Always Visible) --- */}
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

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919', 
  },
  
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    width: 70,
    height: 70,
    marginBottom: 15,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 300,
  },

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
    maxWidth: 200, // Added width limit
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#191919',
  },

  heroMainContainer: {
    backgroundColor: '#191919',
    paddingTop: 0, 
    position: 'relative',
    justifyContent: 'center',
    width: '100%', 
  },
  heroContentWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', 
    alignSelf: 'center',
  },
  heroLeftColumn: {
    flex: 1.2,
    zIndex: 2,
  },
  heroRightColumn: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  heroTitle: {
    fontWeight: '800',
    color: '#fff',
    marginBottom: 35,
  },
  
  heroSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  heroInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333', 
    borderRadius: 50,
    height: 55,
    paddingHorizontal: 5,
  },
  heroInput: {
    flex: 1,
    height: '100%',
    color: '#fff',
    paddingHorizontal: 15,
    fontSize: 14,
    // @ts-ignore
    outlineStyle: 'none',
  },
  heroSearchBtn: {
    backgroundColor: '#ff6b35',
    borderRadius: 50,
    height: 55,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSearchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  
  popcornWrapper: {
    position: 'absolute',
    bottom: 30,
    zIndex: 0,
  },

  whiteSection: {
    backgroundColor: '#fff',
    ...Platform.select({
       default: { borderTopLeftRadius: 30, borderTopRightRadius: 30 }
    })
  },

  floatingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 20,
    width: '92%',
    maxWidth: '100%', 
    alignSelf: 'center',
    marginBottom: 30,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  catIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  catIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed to center to align button
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#ff6b35', 
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  navArrows: {
    flexDirection: 'row',
    gap: 10,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  
  // Show All Button
  showAllBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  showAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  dealsContainer: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  dealsScroll: {
    paddingVertical: 10,
    gap: 20,
  },
  dealCard: {
    width: 280,
    height: 170,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 15,
    justifyContent: 'flex-end',
  },
  dealOverlay: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dealTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dealSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },

  brandsContainer: {
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    marginTop: 10,
  },
  brandsScroll: {
    paddingVertical: 10,
    gap: 30,
  },
  brandItem: {
    alignItems: 'center',
    marginRight: 10,
  },
  brandLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  brandLogo: {
    width: 60,
    height: 60,
  },
  brandName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  foodImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    ...Platform.select({
        web: { transition: 'transform 0.3s ease' }
    })
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discountOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  discountSmall: {
    color: '#fff',
    fontSize: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  discountLarge: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  foodInfo: {
    padding: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  foodDesc: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  foodMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginTop: 5
  },
  
  // Qty Overlay Styles
  qtyOverlay: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      overflow: 'hidden',
  },
  qtyBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: '#ff6b35',
  },
  qtyBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
  },
  qtyText: {
      paddingHorizontal: 10,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
  },
  
  // Footer Styles
  footerContainer: {
    backgroundColor: '#212121',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 0,
  },
  footerBrandSection: {
    marginBottom: 25,
  },
  footerLogoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  footerLogoDot: {
    color: '#ff6b35',
  },
  footerDesc: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinksContainer: {
    gap: 10,
    marginBottom: 30,
  },
  footerAccordionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  footerAccordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accordionIndicator: {
    width: 3,
    height: 14,
    backgroundColor: '#ff6b35',
    borderRadius: 2,
  },
  accordionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  accordionContent: {
    paddingLeft: 15,
    paddingBottom: 15,
    gap: 8,
  },
  footerLink: {
    color: '#888',
    fontSize: 13,
  },
  copyrightSection: {
    paddingTop: 20,
    gap: 15,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#333',
    marginBottom: 5,
  },
  copyrightText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentImage: {
    width: '100%',
    height: 40,
  }
});