import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
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
import { rootApi } from './axiosInstance'; 

const screenWidth = Dimensions.get('window').width; 
const DRAWER_WIDTH = 250; 

// --- SIDEBAR CONSTANTS ---
const sidebarItems = [
    { icon: '🏠', label: 'Dashboard', route: '/AdminPage' },
    { icon: '📦', label: 'Product', route: '/ProductPage' },
    { icon: '🏷️', label: 'Category', route: '/CategoryPasge' },
    { icon: '🧑', label: 'Users', route: '/users' },
    { icon: '📅', label: 'Orders', route: '/orders', active: true },
];

// --- FORMATTING HELPERS ---
const formatDate = (isoDate: string) => {
    try {
        const datePart = isoDate.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return 'N/A';
    }
};

const formatPrice = (amount: any) => {
    return `$${Number(amount).toFixed(2)}`;
};

// --- REUSABLE COMPONENTS (Headers & Sidebar) ---

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

const SidebarContent = ({ isDarkMode }: any) => {
    const router = useRouter(); 
    return (
        <>
            <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarLogoText}>ZOMO.</Text>
                {/* <TouchableOpacity style={styles.sidebarUtilityIcon}>
                    <Text style={styles.sidebarIconText}>&#8861;</Text>
                </TouchableOpacity> */}
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
                    <Text style={[styles.headerTitle, isDarkMode && darkStyles.textPrimary]}>Orders</Text>
                    <Text style={[styles.headerSubtitle, isDarkMode && darkStyles.textSecondary]}>Manage and track all customer orders</Text>
                </View>
                <View style={styles.headerButtonGroup}>
                    <View style={styles.iconButtons}>
                        <TouchableOpacity style={[styles.iconButton, isDarkMode && darkStyles.iconButton]} onPress={toggleDarkMode}>
                            <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>{isDarkMode ? '☀️' : '🌙'}</Text>
                        </TouchableOpacity>
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
            <View style={[styles.mobileHeaderContainer, isDarkMode && darkStyles.mobileHeaderContainer]}>
                <View style={styles.mobileHeaderLeft}>
                    <TouchableOpacity style={[styles.mobileIconContainer, isDarkMode && darkStyles.iconButton]} onPress={onHamburgerPress}>
                        <Text style={[styles.mobileHamburgerIcon, isDarkMode && darkStyles.textPrimary]}>≡</Text>
                    </TouchableOpacity>
                    <Text style={[styles.mobileLogoText, isDarkMode && darkStyles.textPrimary]}>ZOMO.</Text>
                </View>
                <View style={styles.mobileHeaderRight}>
                    <TouchableOpacity style={[styles.iconButton, isDarkMode && darkStyles.iconButton]} onPress={toggleDarkMode}>
                        <Text style={[styles.iconText, isDarkMode && darkStyles.textPrimary]}>{isDarkMode ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleProfileDropdown} ref={profilePicRef} onLayout={onProfilePicLayout}>
                        <Image source={{ uri: 'https://picsum.photos/id/64/50/50' }} style={styles.profileImage} contentFit="cover" />
                    </TouchableOpacity>
                </View>
            </View>
            {isProfileDropdownOpen && profilePicLayout && (
                <LogoutDropdown onLogout={handleLogout} onClose={toggleProfileDropdown} positionStyle={{ position: 'absolute', top: profilePicLayout.y + profilePicLayout.height, right: 15, zIndex: 10000 }} />
            )}
        </View>
    );
};

// --- ORDER TABLE COMPONENT ---
const OrderReportsTable = ({ orders, isLoading, isDarkMode }: any) => {
    return (
        <View style={[styles.orderReportsContainer, isDarkMode && darkStyles.orderReportsContainer]}>
            <View style={styles.tableHeaderSection}>
                <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textPrimary]}>All Orders</Text>
            </View>
            
            {isLoading && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF9500" />
                    <Text style={{ color: isDarkMode ? '#aaa' : '#999', marginTop: 10 }}>Loading orders...</Text>
                </View>
            )}
            
            {!isLoading && orders.length === 0 && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: isDarkMode ? '#aaa' : '#999', fontSize: 16 }}>No orders found.</Text>
                </View>
            )}

            {!isLoading && orders.length > 0 && (
                <ScrollView 
                    horizontal={true} 
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{flexGrow: 1}}
                >
                    <View style={styles.table}> 
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colId]}>ID</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colFood]}>Food Item</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colCustomer]}>Customer</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colOrderDate]}>Order Date</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colPrice]}>Amount</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colStatus]}>Status</Text>
                        </View>
                        
                        {orders.map((item: any) => (
                            <View key={item.id} style={[styles.tableRow, isDarkMode && darkStyles.tableRow]}>
                                <Text style={[styles.dataCol, styles.colId, isDarkMode && darkStyles.textSecondary]}>#{item.id}</Text>
                                <View style={[styles.dataCol, styles.colFood]}>
                                    <Image 
                                        source={{ uri: item.image }}
                                        style={styles.foodImage} 
                                        contentFit="cover" 
                                    />
                                    <Text style={[styles.foodText, isDarkMode && darkStyles.textPrimary]} numberOfLines={2}>{item.food}</Text>
                                </View>
                                <Text style={[styles.dataCol, styles.colCustomer, isDarkMode && darkStyles.textPrimary]}>{item.customer}</Text>
                                <Text style={[styles.dataCol, styles.colOrderDate, isDarkMode && darkStyles.textPrimary]}>{item.date}</Text>
                                <Text style={[styles.dataCol, styles.colPrice, isDarkMode && darkStyles.textPrimary]}>{item.price}</Text>
                                <View style={[styles.dataCol, styles.colStatus]}>
                                    <View style={
                                        item.status === 'Delivered' ? styles.statusDelivered :
                                        item.status === 'Cancelled' ? styles.statusCancelled :
                                        styles.statusPending
                                    }>
                                        <Text style={
                                            item.status === 'Delivered' ? styles.statusTextDelivered :
                                            item.status === 'Cancelled' ? styles.statusTextCancelled :
                                            styles.statusTextPending
                                        }>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function OrdersPage() {
    const isWeb = Platform.OS === 'web';
    const router = useRouter();
    
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current; 

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
            await AsyncStorage.clear();
            Alert.alert("Logged Out", "Logged out successfully!");
            router.replace("/login"); 
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // --- FETCH ORDERS ---
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await rootApi.get('/order/allOrders');
            
            const mappedOrders = response.data.map((order: any) => {
                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                const rawStatus = order.orderStatus?.toLowerCase() || 'pending';
                const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

                return {
                    id: order.id,
                    food: firstItem?.menuItem?.name || 'Multiple Items',
                    customer: order.user?.name || 'Unknown User',
                    date: formatDate(order.orderDate),
                    price: formatPrice(order.totalAmount),
                    status: status,
                    image: firstItem?.menuItem?.imageUrl || 'https://picsum.photos/50',
                };
            });
            
            setOrders(mappedOrders.reverse()); 
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            if(Platform.OS !== 'web') Alert.alert("Error", "Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchOrders();
    }, []);

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

                    <View style={styles.pageContent}>
                        <OrderReportsTable 
                            orders={orders} 
                            isLoading={loading} 
                            isDarkMode={isDarkMode} 
                        />
                    </View>

                    <Text style={[styles.copyrightText, isDarkMode && darkStyles.textSecondary]}>
                        Copyright 2024 ©Zomo template by pixelstrap
                    </Text>
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
        </View>
    );
}

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
    orderReportsContainer: { backgroundColor: DARK_CARD },
    tableRow: { borderBottomColor: '#333' },
});

const styles = StyleSheet.create({
    containerMobile: { flex: 1, backgroundColor: '#fff' },
    containerWebLayout: { flex: 1, flexDirection: 'row', backgroundColor: '#f0f2f5' },
    mainContentArea: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#f0f2f5' : 'transparent' },
    scrollContentWeb: { paddingVertical: 20, paddingHorizontal: 20, alignSelf: 'center', width: '100%', maxWidth: 1400 },
    scrollContentMobile: { paddingBottom: 20, backgroundColor: '#f5f5f5' },
    pageContent: { paddingHorizontal: Platform.OS === 'web' ? 0 : 15 },
    
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
        paddingTop: 45, paddingBottom: 15,
    },
    mobileHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    mobileLogoText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    mobileHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    mobileIconContainer: {
        width: 35, height: 35, alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, backgroundColor: '#f5f5f5',
    },
    mobileHamburgerIcon: { fontSize: 24, color: '#333', fontWeight: 'bold', transform: [{ scaleY: 0.8 }] },
    
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
    sidebarLogoText: { fontSize: 22, fontWeight: 'bold', color: '#fff',paddingTop:40  },
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

    // --- ORDER TABLE STYLES ---
    orderReportsContainer: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
        minHeight: 500, // Ensure height for the table
    },
    tableHeaderSection: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    table: {
        width: '100%',
        minWidth: 800, // Force horizontal scroll on mobile
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 5,
    },
    headerCol: {
        fontWeight: 'bold',
        color: '#666',
        fontSize: 13,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    dataCol: {
        fontSize: 14,
        color: '#333',
    },
    
    // Column Widths
    colId: { width: 60 },
    colFood: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 200 },
    colCustomer: { flex: 1.5, minWidth: 140 },
    colOrderDate: { flex: 1.2, minWidth: 110 },
    colPrice: { flex: 1, fontWeight: 'bold', minWidth: 80 },
    colStatus: { flex: 1, minWidth: 100 },
    
    foodImage: {
        width: 35,
        height: 35,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    foodText: {
        fontSize: 14,
        color: '#333',
        flexShrink: 1,
        fontWeight: '500',
    },
    
    // Status Badges
    statusPending: {
        backgroundColor: '#fff7e6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusTextPending: { color: '#fa8c16', fontSize: 12, fontWeight: '600' },
    
    statusDelivered: {
        backgroundColor: '#f6ffed',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusTextDelivered: { color: '#52c41a', fontSize: 12, fontWeight: '600' },

    statusCancelled: {
        backgroundColor: '#fff1f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusTextCancelled: { color: '#f5222d', fontSize: 12, fontWeight: '600' },

    // Copyright
    copyrightText: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginTop: 30,
        marginBottom: 10,
    }
});