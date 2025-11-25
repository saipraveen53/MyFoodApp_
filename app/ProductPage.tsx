import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
    Alert,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker'; 
import { rootApi, IMAGE_BASE_URL } from './axiosInstance'; 
import { Ionicons } from '@expo/vector-icons'; 

// Get screen dimensions and define drawer width
const screenWidth = Dimensions.get('window').width; 
const DRAWER_WIDTH = 250; 

// --- SIDEBAR CONSTANTS ---
const sidebarItems = [
    { icon: '🏠', label: 'Dashboard', route: '/AdminPage' },
    { icon: '📦', label: 'Product', route: '/ProductPage', active: true },
    { icon: '🏷️', label: 'Category', route: '/CategoryPasge' },
    { icon: '⚙️', label: 'Attributes', route: '/attributes' },
    { icon: '🏢', label: 'Restaurants', route: '/restaurants' },
    { icon: '🚚', label: 'Drivers', route: '/drivers' },
    { icon: '🍔', label: 'Foods', route: '/foods' },
    { icon: '🧑', label: 'Users', route: '/users' },
    { icon: '👥', label: 'Roles', route: '/roles' },
    { icon: '📰', label: 'Media', route: '/media' },
    { icon: '📍', label: 'Live Traking', route: '/live-tracking' },
    { icon: '📅', label: 'Orders', route: '/orders' },
    { icon: '🧭', label: 'Localization', route: '/localization' },
    { icon: '🎫', label: 'Coupons', route: '/coupons' },
    { icon: '🪙', label: 'Tax', route: '/tax' },
    { icon: '⭐️', label: 'Product Review', route: '/review' },
    { icon: '📞', label: 'Support Ticket', route: '/support' },
    { icon: '🛠️', label: 'Settings', route: '/settings' },
    { icon: '📊', label: 'Reports', route: '/reports' },
    { icon: '📋', label: 'List Page', route: '/list' },
];

// --- INTERFACES ---
interface MenuCategory {
    id: number;
    name: string;
    imageUrl: string | null;
}

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    rating: number;
    menuCategory: MenuCategory;
    active?: boolean; 
}

// --- REUSABLE COMPONENTS ---

const SearchBar = ({ onSearchClose, isMobile }: { onSearchClose: () => void, isMobile: boolean }) => (
    <View style={[styles.searchBarContainer, isMobile && styles.searchBarContainerMobile]}>
        <Text style={styles.searchIconText}>🔍</Text>
        <TextInput 
            style={styles.searchInput}
            placeholder="Search here..."
            placeholderTextColor="#999"
            autoFocus={true} 
        />
        <TouchableOpacity style={styles.searchCloseButton} onPress={onSearchClose}>
            <Text style={styles.searchCloseText}>&#10005;</Text>
        </TouchableOpacity>
    </View>
);

const LogoutDropdown = ({ positionStyle, onLogout, onClose }: any) => (
    <View style={[styles.logoutDropdown, positionStyle]}>
        <TouchableOpacity style={styles.dropdownCloseButton} onPress={onClose}>
            <Text style={styles.dropdownCloseText}>&#10005;</Text> 
        </TouchableOpacity>
        
        <View style={styles.dropdownProfileInfo}>
             <Text style={styles.dropdownProfileName}>Emay Walter</Text>
             <Text style={styles.dropdownProfileRole}>Admin</Text>
        </View>
        <TouchableOpacity 
            style={styles.logoutButton}
            onPress={onLogout}
        >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
    </View>
);

// --- SIDEBAR COMPONENTS ---

const SidebarContent = ({ isDarkMode }: any) => {
    const router = useRouter(); 

    return (
        <>
            <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarLogoText}>ZOMO.</Text>
                <TouchableOpacity style={styles.sidebarUtilityIcon}>
                    <Text style={styles.sidebarIconText}>&#8861;</Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {sidebarItems.map((item, index) => (
                    <TouchableOpacity 
                        key={index}
                        style={[styles.sidebarItem, item.active && styles.sidebarItemActive]}
                        onPress={() => {
                            if (item.route) {
                                // @ts-ignore
                                router.push(item.route);
                            } else {
                                console.log("No route defined for:", item.label);
                            }
                        }}
                    >
                        <Text style={styles.sidebarItemIcon}>{item.icon}</Text>
                        <Text style={[styles.sidebarItemText, item.active && styles.sidebarItemTextActive]}>
                            {item.label}
                        </Text>
                        {item.route && <Text style={styles.sidebarItemArrow}>&gt;</Text>}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </>
    );
};

const Sidebar = ({ isDarkMode }: any) => (
    <View style={styles.sidebar}>
        <SidebarContent isDarkMode={isDarkMode} />
    </View>
);

// --- NAV/HEADER COMPONENTS ---
const WebHeader = ({ handleLogout, isDarkMode, toggleDarkMode }: any) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); 
    
    const profilePicRef = useRef<any>(null);
    const [profilePicLayout, setProfilePicLayout] = useState<any>(null);

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(prev => !prev);
    };

    const onProfilePicLayout = (event: any) => {
        if (!profilePicLayout) {
            profilePicRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
                setProfilePicLayout({ x, y, width, height });
            });
        }
    };

    return (
        <View style={styles.headerCardWrapper}> 
            <View style={[styles.headerCard, isDarkMode && darkStyles.headerCard]}>
                <View style={styles.headerTitleGroup}>
                    <Text style={[styles.headerTitle, isDarkMode && darkStyles.textPrimary]}>
                        Products
                    </Text>
                    <Text style={[styles.headerSubtitle, isDarkMode && darkStyles.textSecondary]}>
                        Manage your product inventory here
                    </Text>
                </View>
                
                <View style={styles.headerButtonGroup}>
                    <View style={styles.iconButtons}>
                        {isSearchOpen ? (
                            <SearchBar onSearchClose={() => setIsSearchOpen(false)} isMobile={false} />
                        ) : (
                            <TouchableOpacity style={[styles.iconButton, isDarkMode && darkStyles.iconButton]} onPress={() => setIsSearchOpen(true)}>
                                <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>🔍</Text>
                            </TouchableOpacity>
                        )}
                        
                        {!isSearchOpen && (
                            <>
                                <TouchableOpacity style={[styles.iconButton, isDarkMode && darkStyles.iconButton]}>
                                    <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>🔔</Text>
                                    <View style={styles.notificationBadge} />
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.iconButton, isDarkMode && darkStyles.iconButton]} onPress={toggleDarkMode}>
                                    <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>
                                        {isDarkMode ? '☀️' : '🌙'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.userProfile, isDarkMode && darkStyles.userProfile]} 
                        onPress={toggleProfileDropdown}
                        ref={profilePicRef}
                        onLayout={onProfilePicLayout}
                    >
                        <Image
                            source={{ uri: 'https://picsum.photos/id/64/50/50' }}
                            style={styles.profileImage}
                            contentFit="cover"
                        />
                        <View>
                            <Text style={[styles.profileName, isDarkMode && darkStyles.textPrimary]}>Emay Walter</Text>
                            <Text style={[styles.profileRole, isDarkMode && darkStyles.textSecondary]}>Admin ⌵</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            
            {isProfileDropdownOpen && profilePicLayout && (
                <LogoutDropdown 
                    onLogout={handleLogout}
                    onClose={toggleProfileDropdown} 
                    positionStyle={{
                        position: 'absolute',
                        top: profilePicLayout.y + profilePicLayout.height - 10,
                        right: 30,
                        zIndex: 10000,
                    }}
                />
            )}
        </View>
    );
};

const MobileHeader = ({ onHamburgerPress, handleLogout, isDarkMode, toggleDarkMode }: any) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); 

    const profilePicRef = useRef<any>(null);
    const [profilePicLayout, setProfilePicLayout] = useState<any>(null);

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(prev => !prev);
    };
    
    const onProfilePicLayout = (event: any) => {
        if (!profilePicLayout) {
            profilePicRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
                setProfilePicLayout({ x, y, width, height });
            });
        }
    };

    return (
        <View style={{zIndex: 9000}}>
            {isSearchOpen ? (
                <SearchBar onSearchClose={() => setIsSearchOpen(false)} isMobile={true} />
            ) : (
                <View style={[styles.mobileHeaderContainer, isDarkMode && darkStyles.mobileHeaderContainer]}>
                    <View style={styles.mobileHeaderLeft}>
                        <TouchableOpacity 
                            style={[styles.mobileIconContainer, isDarkMode && darkStyles.iconButton]}
                            onPress={onHamburgerPress}
                        >
                            <Text style={[styles.mobileHamburgerIcon, isDarkMode && darkStyles.textPrimary]}>≡</Text>
                        </TouchableOpacity>
                        <Text style={[styles.mobileLogoText, isDarkMode && darkStyles.textPrimary]}>ZOMO.</Text>
                    </View>

                    <View style={styles.mobileHeaderRight}>
                        <TouchableOpacity style={[styles.mobileIconContainer, isDarkMode && darkStyles.iconButton]} onPress={() => setIsSearchOpen(true)}>
                            <Text style={[styles.mobileIconText, isDarkMode && darkStyles.textPrimary]}>🔍</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconButton, isDarkMode && darkStyles.iconButton]}>
                            <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>🔔</Text>
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.iconButton, isDarkMode && darkStyles.iconButton]} onPress={toggleDarkMode}>
                            <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>
                                {isDarkMode ? '☀️' : '🌙'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={toggleProfileDropdown} 
                            ref={profilePicRef}
                            onLayout={onProfilePicLayout}
                        >
                            <Image
                                source={{ uri: 'https://picsum.photos/id/64/50/50' }}
                                style={styles.profileImage}
                                contentFit="cover"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
            {isProfileDropdownOpen && profilePicLayout && (
                <LogoutDropdown 
                    onLogout={handleLogout}
                    onClose={toggleProfileDropdown} 
                    positionStyle={{
                        position: 'absolute',
                        top: profilePicLayout.y + profilePicLayout.height,
                        right: 15,
                        zIndex: 10000,
                    }}
                />
            )}
        </View>
    );
};

// --- PRODUCT CARD COMPONENT ---
const ProductCard = ({ 
    product, 
    isDarkMode, 
    isWeb, 
    onDelete,
    onEdit,
    onActivate, 
    isArchived = false
}: { 
    product: Product, 
    isDarkMode: boolean, 
    isWeb: boolean, 
    onDelete: (id: number) => void,
    onEdit: (product: Product) => void,
    onActivate?: (id: number) => void,
    isArchived?: boolean
}) => {
    const imageSource = product.imageUrl?.startsWith('http') 
        ? { uri: product.imageUrl }
        : { uri: `${IMAGE_BASE_URL}/${product.imageUrl}` };

    return (
        <View style={[
            styles.productCard, 
            isWeb && styles.productCardWeb, 
            isDarkMode && darkStyles.productCard,
            isArchived && styles.archivedProductCard
        ]}>
            <View style={styles.productImageContainer}>
                <Image 
                    source={imageSource} 
                    style={[styles.productImage, isArchived && { opacity: 0.6 }]} 
                    contentFit="cover" 
                />
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {product.rating}</Text>
                </View>
                
                {isArchived && (
                    <TouchableOpacity 
                        style={styles.outOfStockOverlay} 
                        onPress={() => onActivate && onActivate(product.id)} 
                    >
                        <Text style={styles.outOfStockText}>Out of Stock (Tap to Activate)</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <View style={[styles.productInfo, isArchived && { opacity: 0.5 }]}>
                <View style={styles.productHeaderRow}>
                    <Text style={[styles.productName, isDarkMode && darkStyles.textPrimary]} numberOfLines={1}>
                        {product.name}
                    </Text>
                    <Text style={styles.productPrice}>${product.price}</Text>
                </View>
                
                <Text style={[styles.productCategory, isDarkMode && darkStyles.textSecondary]}>
                    {product.menuCategory?.name || 'Uncategorized'}
                </Text>
                
                <Text style={[styles.productDescription, isDarkMode && darkStyles.textSecondary]} numberOfLines={2}>
                    {product.description}
                </Text>
                
                <View style={styles.cardActions}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => onEdit(product)} 
                        disabled={isArchived} 
                    >
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => onDelete(product.id)}
                    >
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// --- ADD/EDIT PRODUCT MODAL ---
const ProductModal = ({ isVisible, onClose, onSave, isDarkMode, productToEdit }: any) => {
    const isEditMode = !!productToEdit;

    const [open, setOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState(null);
    const [categoryItems, setCategoryItems] = useState([]);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<any>(null);

    useEffect(() => {
        if (isVisible) {
            const fetchCategories = async () => {
                try {
                    const response = await rootApi.get('categories/all');
                    if (response.data) {
                        const mapped = response.data.map((c: any) => ({
                            label: `${c.name} (${c.id})`,
                            value: c.id
                        }));
                        setCategoryItems(mapped);
                    }
                } catch (e) {
                    console.error("Failed to fetch categories in modal", e);
                }
            };
            fetchCategories();

            if (productToEdit) {
                setCategoryValue(productToEdit.menuCategory?.id || null);
                setName(productToEdit.name);
                setPrice(productToEdit.price?.toString() || '');
                setDescription(productToEdit.description);
                setRating(productToEdit.rating?.toString() || '');
                
                const img = productToEdit.imageUrl;
                const fullUri = img?.startsWith('http') ? img : `${IMAGE_BASE_URL}/${img}`;
                setImageUri(fullUri);
                setImageFile(null);
            } else {
                setCategoryValue(null);
                setName('');
                setPrice('');
                setDescription('');
                setRating('');
                setImageUri(null);
                setImageFile(null);
            }
        }
        setOpen(false); 
    }, [isVisible, productToEdit]);

    if (!isVisible) return null;

    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access media library is required!');
            return;
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!pickerResult.canceled) {
            const uri = pickerResult.assets[0].uri;
            setImageUri(uri);
            
            if (Platform.OS === 'web') {
                setImageFile(pickerResult.assets[0].file);
            } else {
                setImageFile(null); 
            }
        }
    };

    const handleSave = () => {
        if (!name.trim() || !price || !description || !rating) {
            Alert.alert("Validation Error", "Fields Name, Price, Description, Rating are required.");
            return;
        }
        
        const catId = categoryValue || productToEdit?.menuCategory?.id;

        if (!isEditMode && !catId) {
             Alert.alert("Validation Error", "Please select a category.");
             return;
        }

        onSave(catId, name, price, description, rating, imageUri, imageFile);
    };

    return (
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && darkStyles.modalContent]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, isDarkMode && darkStyles.textPrimary]}>
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={{paddingBottom: 20}} 
                    nestedScrollEnabled={true} 
                    keyboardShouldPersistTaps="handled"
                >
                    {/* 🚩 MODAL MODE for Dropdown (Fixes Scrolling on Android) */}
                    <View style={[styles.inputContainer, { zIndex: 2000 }]}>
                        <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Category</Text>
                        <DropDownPicker
                            open={open}
                            value={categoryValue}
                            items={categoryItems}
                            setOpen={setOpen}
                            setValue={setCategoryValue}
                            setItems={setCategoryItems}
                            placeholder="Select Category"
                            style={[
                                styles.dropdownStyle, 
                                isDarkMode && { backgroundColor: '#f5f5f5', borderColor: '#eee' }
                            ]}
                            // Using MODAL mode ensures it opens in a scrollable overlay
                            listMode="MODAL" 
                            modalTitle="Select Category"
                            modalAnimationType="slide"
                            disabled={isEditMode} 
                            textStyle={{ fontSize: 16, color: '#333' }}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Product Name</Text>
                        <TextInput
                            style={[styles.modalInput, isDarkMode && darkStyles.modalInput]}
                            placeholder="e.g., Chicken Puff"
                            placeholderTextColor={isDarkMode ? '#555' : '#aaa'}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.rowInputs}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                            <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Price</Text>
                            <TextInput
                                style={[styles.modalInput, isDarkMode && darkStyles.modalInput]}
                                placeholder="e.g., 150"
                                placeholderTextColor={isDarkMode ? '#555' : '#aaa'}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputContainer, { flex: 1 }]}>
                            <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Rating</Text>
                            <TextInput
                                style={[styles.modalInput, isDarkMode && darkStyles.modalInput]}
                                placeholder="e.g., 4.5"
                                placeholderTextColor={isDarkMode ? '#555' : '#aaa'}
                                value={rating}
                                onChangeText={setRating}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Description</Text>
                        <TextInput
                            style={[styles.modalInput, styles.modalDescriptionInput, isDarkMode && darkStyles.modalInput]}
                            placeholder="Product description..."
                            placeholderTextColor={isDarkMode ? '#555' : '#aaa'}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Product Image</Text>
                        <TouchableOpacity 
                            style={[styles.imagePickerButton, imageUri && styles.imagePickerActive]} 
                            onPress={pickImage}
                        >
                            <Text style={styles.imagePickerButtonText}>
                                {imageUri ? '✅ Image Selected (Change)' : '🖼️ Pick Image'}
                            </Text>
                        </TouchableOpacity>
                        {imageUri && (
                             <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
                        )}
                    </View>
                </ScrollView>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                        <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
                        <Text style={styles.modalSaveButtonText}>
                            {isEditMode ? 'Update Product' : 'Add Product'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// --- MAIN PRODUCT PAGE COMPONENT ---
const ProductPage = () => {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current; 

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const toggleDrawer = () => {
    const newState = !isDrawerOpen;
    setIsDrawerOpen(newState);
    
    Animated.timing(drawerAnim, {
        toValue: newState ? 0 : -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
      try {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('roles'); 
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('isAuthenticated');
          Alert.alert("Logged Out", "Logged out successfully! Redirecting to login...");
          router.replace("/login"); 
      } catch (error) {
          console.error("Error during logout:", error);
      }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const [allItemsRes, archivedRes] = await Promise.all([
            rootApi.get('items/allItems'),
            rootApi.get('items/archieved')
        ]);

        if (allItemsRes.data) {
            setProducts(allItemsRes.data);
        }
        if (archivedRes.data) {
            setArchivedProducts(archivedRes.data);
        }

    } catch (error) {
        console.error("Failed to fetch products:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
      setEditingProduct(null);
      setIsAddModalVisible(true);
  };

  const handleOpenEdit = (product: Product) => {
      setEditingProduct(product);
      setIsAddModalVisible(true);
  };

  const handleSaveProduct = async (categoryId: string, name: string, price: string, description: string, rating: string, imageUri: string, imageFile: any) => {
      setIsAddModalVisible(false); 

      try {
          const isUpdate = !!editingProduct;
          const productId = editingProduct?.id;

          const queryParams = new URLSearchParams({
              name: name,
              price: price,
              description: description,
              rating: rating
          }).toString();

          let endpoint;
          let method;

          if (isUpdate) {
              endpoint = `items/update/${productId}?${queryParams}`;
              method = 'put';
          } else {
              endpoint = `items/addItem/${categoryId}?${queryParams}`;
              method = 'post';
          }

          const formData = new FormData();
          
          const isNewImagePicked = imageUri && !(imageUri.startsWith('http') || imageUri.startsWith(IMAGE_BASE_URL));

          if (isNewImagePicked) {
              if (Platform.OS === 'web') {
                  if (imageFile) {
                      formData.append('imageFile', imageFile);
                  }
              } else {
                  if (imageUri) {
                      const filename = imageUri.split('/').pop() || 'image.jpg';
                      const match = /\.(\w+)$/.exec(filename);
                      const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : `image/jpeg`;

                      let uri = imageUri;
                      if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
                           uri = 'file://' + uri;
                      }
                      
                      // @ts-ignore
                      formData.append('imageFile', {
                          uri: uri,
                          name: filename,
                          type: type,
                      });
                  }
              }
          }
          
          const response = await rootApi[method](endpoint, formData, {
              headers: {
                  "Content-Type": "multipart/form-data", 
              },
              transformRequest: (data) => data, 
          });

          if (response.status === 200 || response.status === 201) {
              Alert.alert("Success", `Product ${isUpdate ? 'updated' : 'added'} successfully!`);
              fetchProducts(); 
          }

      } catch (error: any) {
          console.error("Failed to save product:", error);
          const errMsg = error.response?.data?.message || error.message || "Operation failed";
          Alert.alert("Error", errMsg);
      }
  };

  const handleDeleteProduct = async (id: number) => {
    const performDelete = async () => {
        try {
            await rootApi.put(`items/delete/${id}`);
            setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
            setArchivedProducts(prev => prev.filter(p => p.id !== id));
            
            if (!isWeb) Alert.alert("Success", "Product deleted successfully");
            
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
            Alert.alert("Error", "Failed to delete product. Please try again.");
        }
    };

    if (isWeb) {
        if (window.confirm("Are you sure you want to delete this product?")) {
            await performDelete();
        }
    } else {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this product? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: performDelete }
            ]
        );
    }
  };

  const handleActivateProduct = async (id: number) => {
    try {
        await rootApi.put(`items/activate/${id}`);
        Alert.alert("Success", "Product activated successfully");
        fetchProducts();
    } catch (error) {
        console.error("Activation failed", error);
        Alert.alert("Error", "Failed to activate product");
    }
  };

  return (
    <View style={[isWeb ? styles.containerWebLayout : styles.containerMobile, isDarkMode && darkStyles.containerWebLayout]}>
        
        {isWeb && <Sidebar isDarkMode={isDarkMode} />}

        <View style={[styles.mainContentArea, isDarkMode && darkStyles.mainContentArea]}>
            {!isWeb && (
                <MobileHeader 
                    onHamburgerPress={toggleDrawer} 
                    handleLogout={handleLogout} 
                    isDarkMode={isDarkMode} 
                    toggleDarkMode={toggleDarkMode} 
                />
            )}

            <ScrollView 
                contentContainerStyle={isWeb ? [styles.scrollContentWeb, isDarkMode && darkStyles.scrollContentWeb] : [styles.scrollContentMobile, isDarkMode && darkStyles.containerMobileBackground]} 
                showsVerticalScrollIndicator={false}
            >
                {isWeb && (
                    <WebHeader 
                        handleLogout={handleLogout} 
                        isDarkMode={isDarkMode} 
                        toggleDarkMode={toggleDarkMode} 
                    />
                )}

                <View style={[styles.productsContainer, isDarkMode && darkStyles.productsContainer]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textPrimary]}>All Products</Text>
                        <TouchableOpacity 
                            style={styles.addProductBtn} 
                            onPress={handleOpenAdd}
                        >
                            <Text style={styles.addProductBtnText}>+ Add New</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ff6b35" />
                        </View>
                    ) : (
                        <>
                            <View style={styles.productsGrid}>
                                {products.length > 0 ? (
                                    products.map((item) => (
                                        <ProductCard 
                                            key={item.id} 
                                            product={item} 
                                            isDarkMode={isDarkMode} 
                                            isWeb={isWeb}
                                            onDelete={handleDeleteProduct} 
                                            onEdit={handleOpenEdit} 
                                        />
                                    ))
                                ) : (
                                    <Text style={[styles.noDataText, isDarkMode && darkStyles.textSecondary]}>
                                        No active products found.
                                    </Text>
                                )}
                            </View>

                            {archivedProducts.length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { marginTop: 40, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 }]}>
                                         <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textPrimary, { color: '#888' }]}>Archived / Out of Stock</Text>
                                    </View>
                                    <View style={styles.productsGrid}>
                                        {archivedProducts.map((item) => (
                                            <ProductCard 
                                                key={item.id} 
                                                product={item} 
                                                isDarkMode={isDarkMode} 
                                                isWeb={isWeb}
                                                onDelete={handleDeleteProduct} 
                                                onEdit={handleOpenEdit} 
                                                isArchived={true} 
                                                onActivate={handleActivateProduct} 
                                            />
                                        ))}
                                    </View>
                                </>
                            )}
                        </>
                    )}
                </View>

            </ScrollView>
        </View>

        {!isWeb && (
            <Animated.View
                style={[
                    styles.drawerOverlay,
                    {
                        opacity: drawerAnim.interpolate({
                            inputRange: [-DRAWER_WIDTH, 0],
                            outputRange: [0, 1],
                            extrapolate: 'clamp',
                        }),
                        pointerEvents: isDrawerOpen ? 'auto' : 'none', 
                    },
                ]}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={toggleDrawer}
                />
                <Animated.View
                    style={[
                        styles.sidebar, 
                        {
                            width: DRAWER_WIDTH,
                            position: 'absolute', 
                            top: 0,
                            left: 0,
                            height: '100%',
                            zIndex: 9999, 
                            transform: [{ translateX: drawerAnim }], 
                        },
                    ]}
                    onStartShouldSetResponder={() => true} 
                >
                    <SidebarContent isDarkMode={isDarkMode} /> 
                </Animated.View>
            </Animated.View>
        )}

        <ProductModal 
            isVisible={isAddModalVisible}
            onClose={() => setIsAddModalVisible(false)}
            onSave={handleSaveProduct}
            isDarkMode={isDarkMode}
            productToEdit={editingProduct} 
        />

    </View>
  );
}

export default ProductPage;

// --- STYLES ---
const DARK_BACKGROUND = '#1c1c1c';
const DARK_CARD = '#2a2a2a';
const DARK_TEXT_PRIMARY = '#ffffff';
const DARK_TEXT_SECONDARY = '#b0b0b0';

const darkStyles = StyleSheet.create({
    containerWebLayout: { backgroundColor: DARK_BACKGROUND },
    mainContentArea: { backgroundColor: DARK_BACKGROUND },
    scrollContentWeb: { backgroundColor: DARK_BACKGROUND },
    mobileHeaderContainer: { backgroundColor: DARK_CARD },
    headerCard: { backgroundColor: DARK_CARD },
    textPrimary: { color: DARK_TEXT_PRIMARY },
    textSecondary: { color: DARK_TEXT_SECONDARY },
    iconButton: { backgroundColor: DARK_CARD, borderColor: '#444' },
    userProfile: { backgroundColor: DARK_CARD },
    containerMobileBackground: { backgroundColor: DARK_BACKGROUND },
    productCard: { backgroundColor: DARK_CARD, borderColor: '#444' },
    productsContainer: { backgroundColor: 'transparent' },
    
    // Modal Dark Mode
    modalContent: { backgroundColor: DARK_CARD },
    modalInput: { backgroundColor: '#333', color: DARK_TEXT_PRIMARY, borderColor: '#444' },
});

const styles = StyleSheet.create({
    containerMobile: { flex: 1, backgroundColor: '#fff' },
    containerWebLayout: { flex: 1, flexDirection: 'row', backgroundColor: '#f0f2f5' },
    mainContentArea: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#f0f2f5' : 'transparent' },
    scrollContentWeb: { paddingVertical: 20, paddingHorizontal: 20, alignSelf: 'center', width: '100%', maxWidth: 1400 },
    scrollContentMobile: { paddingBottom: 20, backgroundColor: '#f5f5f5' },
    
    // Header Styles (Same as Admin)
    headerCardWrapper: { marginBottom: 20, zIndex: 10 },
    headerCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fff', padding: 20, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    headerSubtitle: { fontSize: 16, color: '#666' },
    headerButtonGroup: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    iconButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconButton: {
        width: 40, height: 40, backgroundColor: '#fff', borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    iconText: { fontSize: 18, color: '#333' },
    notificationBadge: {
        position: 'absolute', top: 5, right: 5, width: 8, height: 8,
        borderRadius: 4, backgroundColor: '#ff3b30', borderWidth: 1, borderColor: '#fff',
    },
    userProfile: {
        flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15,
        paddingVertical: 5, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
        ...Platform.select({ web: { cursor: 'pointer' } }), zIndex: 100,
    },
    profileImage: { width: 30, height: 30, borderRadius: 15 },
    profileName: { fontSize: 14, fontWeight: '600', color: '#333' },
    profileRole: { fontSize: 12, color: '#999' },
    
    // Mobile Header Styles
    mobileHeaderContainer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff',
        marginBottom: 10, marginTop: 10, zIndex: 9000,
    },
    mobileHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    mobileLogoText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    mobileHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    mobileIconContainer: {
        width: 35, height: 35, alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, backgroundColor: '#f5f5f5',
    },
    mobileHamburgerIcon: { fontSize: 24, color: '#333', fontWeight: 'bold', transform: [{ scaleY: 0.8 }] },
    mobileIconText: { fontSize: 16 },

    // Search Bar Styles
    searchBarContainer: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8,
        borderRadius: 8, backgroundColor: '#fff', width: 300, marginRight: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
        shadowRadius: 3, elevation: 1,
    },
    searchBarContainerMobile: { width: '100%', borderRadius: 0, paddingVertical: 12, marginBottom: 10 },
    searchInput: { flex: 1, fontSize: 16, paddingHorizontal: 10, color: '#333', ...Platform.select({ web: { outlineStyle: 'none' } }) },
    searchIconText: { fontSize: 18, color: '#999' },
    searchCloseButton: { paddingHorizontal: 5 },
    searchCloseText: { fontSize: 18, color: '#999' },

    // Logout Dropdown
    logoutDropdown: {
        backgroundColor: '#fff', width: 180, borderRadius: 10, padding: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15,
        shadowRadius: 10, elevation: 10, position: 'relative',
    },
    dropdownProfileInfo: {
        paddingVertical: 5, paddingHorizontal: 5, borderBottomWidth: 1,
        borderBottomColor: '#eee', marginBottom: 5, marginTop: 5,
    },
    dropdownProfileName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    dropdownProfileRole: { fontSize: 12, color: '#999' },
    logoutButton: {
        padding: 10, borderRadius: 8, backgroundColor: '#ff3b30', alignItems: 'center',
        marginTop: 5, ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    dropdownCloseButton: {
        position: 'absolute', top: 5, right: 5, width: 25, height: 25,
        alignItems: 'center', justifyContent: 'center', zIndex: 10,
    },
    dropdownCloseText: { fontSize: 18, color: '#999', fontWeight: 'bold' },

    // Sidebar
    sidebar: {
        width: 250, backgroundColor: '#272727', height: '100%', paddingVertical: 20, overflow: 'hidden',
    },
    sidebarHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 15, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#444',
    },
    sidebarLogoText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    sidebarUtilityIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    sidebarIconText: { fontSize: 20, color: '#fff' },
    sidebarItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15,
        marginHorizontal: 10, borderRadius: 8, marginBottom: 5,
    },
    sidebarItemActive: { backgroundColor: '#FF9500' },
    sidebarItemIcon: { fontSize: 18, color: '#fff', width: 30, textAlign: 'center' },
    sidebarItemText: { flex: 1, fontSize: 15, color: '#bbb', marginLeft: 10, fontWeight: '600' },
    sidebarItemTextActive: { color: '#272727', fontWeight: 'bold' },
    sidebarItemArrow: { fontSize: 16, color: '#bbb' },
    
    // Drawer Overlay
    drawerOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9990, 
    },

    // --- PRODUCT PAGE SPECIFIC STYLES ---
    productsContainer: {
        paddingHorizontal: Platform.OS === 'web' ? 0 : 15,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    addProductBtn: {
        backgroundColor: '#FF9500', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8,
    },
    addProductBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    
    loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    noDataText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },

    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        justifyContent: 'flex-start', 
    },
    productCard: {
        width: '47%', 
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    productCardWeb: {
        width: 250, 
    },
    archivedProductCard: {
        backgroundColor: '#f9f9f9', 
        borderColor: '#eee',
    },
    productImageContainer: {
        height: 160,
        backgroundColor: '#eee',
        position: 'relative',
    },
    productImage: { width: '100%', height: '100%' },
    ratingBadge: {
        position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
    },
    ratingText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    outOfStockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    outOfStockText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: '#ff3b30',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        transform: [{ rotate: '-10deg' }],
    },
    productInfo: { padding: 12 },
    productHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6,
    },
    productName: {
        fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 5,
    },
    productPrice: {
        fontSize: 16, fontWeight: 'bold', color: '#FF9500',
    },
    productCategory: {
        fontSize: 12, color: '#999', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    productDescription: {
        fontSize: 13, color: '#666', marginBottom: 15, height: 36,
    },
    cardActions: {
        flexDirection: 'row', gap: 10,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1, borderColor: '#eee',
    },
    deleteButton: {
        backgroundColor: '#fff0f0', borderColor: '#ffcccc',
    },
    actionButtonText: {
        fontSize: 12, fontWeight: '600', color: '#555',
    },

    // Modal Styles
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10001,
        elevation: 100,
    },
    modalContent: {
        width: Platform.OS === 'web' ? 500 : '90%',
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 15,
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 5,
    },
    modalInput: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
        color: '#333',
        ...Platform.select({
            web: { outlineStyle: 'none' },
        }),
    },
    modalDescriptionInput: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#ccc',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    modalCancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: '#FF9500',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    modalSaveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    imagePickerButton: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        marginBottom: 10,
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    imagePickerActive: {
        borderColor: '#34c759',
    },
    imagePickerButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    imagePreview: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    // Dropdown Styles
    dropdownStyle: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
    },
    dropdownContainerStyle: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
    },
});