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
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import { rootApi, IMAGE_BASE_URL } from './axiosInstance';

const screenWidth = Dimensions.get('window').width; 
const DRAWER_WIDTH = 250; 

// --- SIDEBAR CONSTANTS ---
const sidebarItems = [
    { icon: '🏠', label: 'Dashboard', route: '/AdminPage' },
    { icon: '📦', label: 'Product', route: '/ProductPage' },
    { icon: '🏷️', label: 'Category', route: '/CategoryPasge', active: true }, 
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
interface Category {
    id: number;
    name: string;
    imageUrl: string | null;
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
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
    </View>
);

// --- SIDEBAR & HEADER COMPONENTS ---
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

const WebHeader = ({ handleLogout, isDarkMode, toggleDarkMode }: any) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); 
    const profilePicRef = useRef<any>(null);
    const [profilePicLayout, setProfilePicLayout] = useState<any>(null);

    const toggleProfileDropdown = () => setIsProfileDropdownOpen(prev => !prev);
    
    const onProfilePicLayout = () => {
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
                    <Text style={[styles.headerTitle, isDarkMode && darkStyles.textPrimary]}>Categories</Text>
                    <Text style={[styles.headerSubtitle, isDarkMode && darkStyles.textSecondary]}>Manage your food categories here</Text>
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
                                    <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>{isDarkMode ? '☀️' : '🌙'}</Text>
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
                        <Image source={{ uri: 'https://picsum.photos/id/64/50/50' }} style={styles.profileImage} contentFit="cover" />
                        <View>
                            <Text style={[styles.profileName, isDarkMode && darkStyles.textPrimary]}>Emay Walter</Text>
                            <Text style={[styles.profileRole, isDarkMode && darkStyles.textSecondary]}>Admin ⌵</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            {isProfileDropdownOpen && profilePicLayout && (
                <LogoutDropdown onLogout={handleLogout} onClose={toggleProfileDropdown} positionStyle={{ position: 'absolute', top: profilePicLayout.y + profilePicLayout.height - 10, right: 30, zIndex: 10000 }} />
            )}
        </View>
    );
};

const MobileHeader = ({ onHamburgerPress, handleLogout, isDarkMode, toggleDarkMode }: any) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); 
    const profilePicRef = useRef<any>(null);
    const [profilePicLayout, setProfilePicLayout] = useState<any>(null);

    const toggleProfileDropdown = () => setIsProfileDropdownOpen(prev => !prev);
    
    const onProfilePicLayout = () => {
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
                        <TouchableOpacity style={[styles.mobileIconContainer, isDarkMode && darkStyles.iconButton]} onPress={onHamburgerPress}>
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
                            <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>{isDarkMode ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleProfileDropdown} ref={profilePicRef} onLayout={onProfilePicLayout}>
                            <Image source={{ uri: 'https://picsum.photos/id/64/50/50' }} style={styles.profileImage} contentFit="cover" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {isProfileDropdownOpen && profilePicLayout && (
                <LogoutDropdown onLogout={handleLogout} onClose={toggleProfileDropdown} positionStyle={{ position: 'absolute', top: profilePicLayout.y + profilePicLayout.height, right: 15, zIndex: 10000 }} />
            )}
        </View>
    );
};

// --- CATEGORY CARD COMPONENT ---
const CategoryCard = ({ category, isDarkMode, isWeb, onEdit, onDelete }: { category: Category, isDarkMode: boolean, isWeb: boolean, onEdit: (cat: Category) => void, onDelete: (id: number) => void }) => {
    const imageSource = category.imageUrl 
        ? { uri: category.imageUrl }
        : require('../assets/images/p5.png'); 

    return (
        <View style={[styles.categoryCard, isWeb && styles.categoryCardWeb, isDarkMode && darkStyles.categoryCard]}>
            <View style={styles.cardImageWrapper}>
                <Image source={imageSource} style={styles.cardImage} contentFit="cover" />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, isDarkMode && darkStyles.textPrimary]} numberOfLines={1}>{category.name}</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(category)}>
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(category.id)}>
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// --- CATEGORY MODAL COMPONENT ---
const CategoryModal = ({ isVisible, onClose, onSave, onUpdate, isDarkMode, categoryData }: any) => {
    const [name, setName] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<any>(null); 

    useEffect(() => {
        if (isVisible) {
            if (categoryData) {
                setName(categoryData.name);
                setImageUri(categoryData.imageUrl);
                setImageFile(null);
            } else {
                setName('');
                setImageUri(null);
                setImageFile(null);
            }
        }
    }, [isVisible, categoryData]);

    if (!isVisible) return null;

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImageUri(uri);
            if (Platform.OS === 'web') {
                setImageFile(result.assets[0].file);
            } else {
                setImageFile(null); 
            }
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Validation", "Category name is required");
            return;
        }
        if (!categoryData && !imageUri) {
            Alert.alert("Validation", "Please select an image for the category");
            return;
        }

        if (categoryData) {
             onUpdate(categoryData.id, name, imageUri, imageFile);
        } else {
             onSave(name, imageUri, imageFile);
        }
    };

    return (
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && darkStyles.modalContent]}>
                <Text style={[styles.modalTitle, isDarkMode && darkStyles.textPrimary]}>
                    {categoryData ? 'Edit Category' : 'Add New Category'}
                </Text>
                
                <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Category Name</Text>
                    <TextInput
                        style={[styles.modalInput, isDarkMode && darkStyles.modalInput]}
                        placeholder="e.g., Desserts"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Category Image</Text>
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

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
                        <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
                        <Text style={styles.modalSaveButtonText}>
                            {categoryData ? 'Update' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// --- MAIN COMPONENT ---
const CategoryPage = () => {
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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

  // --- FETCH ---
  const fetchCategories = async () => {
      try {
          const response = await rootApi.get('categories/all');
          if (response.data) {
              setCategories(response.data);
          }
      } catch (error) {
          console.error("Failed to fetch categories:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchCategories();
  }, []);

  // --- 1. HANDLE SAVE CATEGORY (ADD ONLY) ---
  const handleSaveCategory = async (name: string, imageUri: string | null, imageFile: any) => {
      if (!name.trim()) {
          Alert.alert("Error", "Category name is required.");
          return;
      }
      if (!imageUri && Platform.OS !== 'web') {
           Alert.alert("Error", "Please select an image.");
           return;
      }

      setIsModalVisible(false); 

      try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
              Alert.alert("Auth Error", "Please login again.");
              return;
          }

          const formData = new FormData();
          const endpoint = `/categories/addCategory?name=${encodeURIComponent(name)}`;
          
          if (imageUri) {
              if (Platform.OS === 'web') {
                  if (imageFile) {
                      formData.append('imageFile', imageFile); 
                  }
              } else {
                  let filename = imageUri.split('/').pop();
                  let match = /\.(\w+)$/.exec(filename || '');
                  let type = match ? `image/${match[1]}` : `image/jpeg`;
                  if (type === 'image/jpg') type = 'image/jpeg';

                  let uri = imageUri;
                  if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
                       uri = 'file://' + uri;
                  }

                  // @ts-ignore
                  formData.append('imageFile', {
                      uri: uri,
                      name: filename || `photo.jpg`,
                      type: type, 
                  });
              }
          }

          const response = await rootApi.post(endpoint, formData, {
              headers: {
                  'Content-Type': undefined, 
                  'Authorization': `Bearer ${token}`
              },
              transformRequest: (data, headers) => {
                  return data; 
              },
          });

          if (response.data) {
              Alert.alert("Success", "Category added successfully!");
              setCategories(prev => [...prev, response.data]);
          }

      } catch (error: any) {
          console.error("❌ Failed to save category:", error);
          if (error.response) {
              Alert.alert("Server Error", `Code: ${error.response.status}`);
          } else {
              Alert.alert("Error", error.message);
          }
      }
  };

  // --- 2. HANDLE UPDATE CATEGORY (EDIT ONLY) ---
  const handleUpdateCategory = async (id: number, name: string, imageUri: string | null, imageFile: any) => {
      if (!name.trim()) {
          Alert.alert("Error", "Category name is required.");
          return;
      }
      setIsModalVisible(false);

      try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
              Alert.alert("Auth Error", "Please login again.");
              return;
          }

          const endpoint = `/categories/update/${id}?name=${encodeURIComponent(name)}`;
          
          const isNewImage = imageUri && !imageUri.startsWith('http');
          
          let config: any = {};
          let payload: any = null;

          if (isNewImage && imageUri) {
              const formData = new FormData();
              
              if (Platform.OS === 'web') {
                  if (imageFile) {
                      formData.append('imageFile', imageFile); 
                  }
              } else {
                  let filename = imageUri.split('/').pop();
                  let match = /\.(\w+)$/.exec(filename || '');
                  let type = match ? `image/${match[1]}` : `image/jpeg`;
                  if (type === 'image/jpg') type = 'image/jpeg';

                  let uri = imageUri;
                  if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
                       uri = 'file://' + uri;
                  }

                  // @ts-ignore
                  formData.append('imageFile', {
                      uri: uri,
                      name: filename || `photo.jpg`,
                      type: type, 
                  });
              }
              
              payload = formData;
              config = {
                  headers: {
                      'Content-Type': undefined,
                      'Authorization': `Bearer ${token}`
                  },
                  transformRequest: (data: any) => data,
              };
          } else {
              payload = {};
              config = {
                   headers: {
                      'Authorization': `Bearer ${token}`
                   }
              };
          }

          const response = await rootApi.put(endpoint, payload, config);

          if (response.data) {
              Alert.alert("Success", "Category updated successfully!");
              setCategories(prev => prev.map(cat => cat.id === id ? response.data : cat));
          }

      } catch (error: any) {
          console.error("❌ Failed to update category:", error);
          if (error.response) {
              Alert.alert("Server Error", `Code: ${error.response.status}`);
          } else {
              Alert.alert("Error", error.message);
          }
      }
  };

  const handleAddBtnPress = () => {
      setSelectedCategory(null);
      setIsModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
      setSelectedCategory(category);
      setIsModalVisible(true);
  };

  const handleDeleteCategory = async (id: number) => {
      const performDelete = async () => {
          try {
              await rootApi.delete(`categories/delete/${id}`);
              setCategories(prev => prev.filter(c => c.id !== id));
              if (Platform.OS !== 'web') Alert.alert("Success", "Category deleted.");
          } catch (error: any) {
              console.error("Failed to delete category:", error);
              Alert.alert("Error", "Failed to delete category.");
          }
      };

      if (Platform.OS === 'web') {
          const confirmed = window.confirm("Are you sure you want to delete this category?");
          if (confirmed) performDelete();
      } else {
          Alert.alert(
              "Delete Category",
              "Are you sure you want to delete this category?",
              [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: performDelete }
              ]
          );
      }
  };

  return (
    <View style={[isWeb ? styles.containerWebLayout : styles.containerMobile, isDarkMode && darkStyles.containerWebLayout]}>
        {isWeb && <Sidebar isDarkMode={isDarkMode} />}
        
        <View style={[styles.mainContentArea, isDarkMode && darkStyles.mainContentArea]}>
            {!isWeb && <MobileHeader onHamburgerPress={toggleDrawer} handleLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}

            <ScrollView 
                contentContainerStyle={isWeb ? [styles.scrollContentWeb, isDarkMode && darkStyles.scrollContentWeb] : [styles.scrollContentMobile, isDarkMode && darkStyles.containerMobileBackground]} 
                showsVerticalScrollIndicator={false}
            >
                {isWeb && <WebHeader handleLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}

                <View style={[styles.pageContainer, isDarkMode && darkStyles.pageContainer]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textPrimary]}>All Categories</Text>
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddBtnPress}>
                            <Text style={styles.addBtnText}>+ Add Category</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#ff6b35" />
                        </View>
                    ) : (
                        <View style={styles.gridContainer}>
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <CategoryCard 
                                        key={cat.id} 
                                        category={cat} 
                                        isDarkMode={isDarkMode} 
                                        isWeb={isWeb} 
                                        onEdit={handleEditCategory}
                                        onDelete={handleDeleteCategory}
                                    />
                                ))
                            ) : (
                                <Text style={[styles.placeholderText, isDarkMode && darkStyles.textSecondary]}>
                                    No categories found.
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>

        {!isWeb && (
            <Animated.View style={[styles.drawerOverlay, { opacity: drawerAnim.interpolate({ inputRange: [-DRAWER_WIDTH, 0], outputRange: [0, 1], extrapolate: 'clamp' }), pointerEvents: isDrawerOpen ? 'auto' : 'none' }]}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={toggleDrawer} />
                <Animated.View style={[styles.sidebar, { width: DRAWER_WIDTH, position: 'absolute', top: 0, left: 0, height: '100%', zIndex: 9999, transform: [{ translateX: drawerAnim }] }]} onStartShouldSetResponder={() => true}>
                    <SidebarContent isDarkMode={isDarkMode} /> 
                </Animated.View>
            </Animated.View>
        )}

        <CategoryModal 
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSave={handleSaveCategory}
            onUpdate={handleUpdateCategory}
            isDarkMode={isDarkMode}
            categoryData={selectedCategory} 
        />
    </View>
  );
}

export default CategoryPage;

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
    pageContainer: { backgroundColor: 'transparent' },
    categoryCard: { backgroundColor: DARK_CARD, borderColor: '#444' },
    modalContent: { backgroundColor: DARK_CARD },
    modalInput: { backgroundColor: '#333', color: DARK_TEXT_PRIMARY, borderColor: '#444' },
});

const styles = StyleSheet.create({
    containerMobile: { flex: 1, backgroundColor: '#fff' },
    containerWebLayout: { flex: 1, flexDirection: 'row', backgroundColor: '#f0f2f5' },
    mainContentArea: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#f0f2f5' : 'transparent' },
    scrollContentWeb: { paddingVertical: 20, paddingHorizontal: 20, alignSelf: 'center', width: '100%', maxWidth: 1400 },
    scrollContentMobile: { paddingBottom: 20, backgroundColor: '#f5f5f5' },
    
    // Header Styles
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

    // --- Content Specific ---
    pageContainer: {
        paddingHorizontal: Platform.OS === 'web' ? 0 : 15,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    addBtn: {
        backgroundColor: '#FF9500', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8,
    },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    
    loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    placeholderText: { color: '#999', fontSize: 16, textAlign: 'center', marginTop: 20 },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        justifyContent: 'flex-start',
    },
    categoryCard: {
        width: Platform.OS === 'web' ? 220 : '47%', 
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
        marginBottom: 10,
    },
    categoryCardWeb: {
        width: 220,
    },
    cardImageWrapper: {
        height: 140,
        backgroundColor: '#f5f5f5',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    deleteButton: {
        backgroundColor: '#fff0f0',
        borderColor: '#ffcccc',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#555',
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
        width: Platform.OS === 'web' ? 450 : '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 15,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 15,
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
});