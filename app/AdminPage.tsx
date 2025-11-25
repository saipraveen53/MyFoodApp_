import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import { Image } from 'expo-image';
// 1. Added IMAGE_BASE_URL import
import { rootApi, IMAGE_BASE_URL } from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import axios from 'axios'; 

// Get screen dimensions and define drawer width
const screenWidth = Dimensions.get('window').width; 
const DRAWER_WIDTH = 250; 

// --- PAGINATION CONSTANTS ---
const INITIAL_ROWS = 8; 
const ROWS_PER_PAGE = 8; 

// --- STATIC DATA DEFINITIONS ---
const PIZZA_IMAGE = require('../assets/images/pizza.jpg');
const CHICKEN_IMAGE =require('../assets/images/chicken.jpg');
const BURGER_IMAGE = 'https://picsum.photos/id/1060/100/100'; 
const FRIES_IMAGE = require('../assets/images/fries.jpg');
const BORITTO_IMAGE = 'https://picsum.photos/id/111/100/100'; 
const TACO_IMAGE = 'https://picsum.photos/id/115/100/100'; 
const BIRYANI_IMAGE = require('../assets/images/biryani.jpg');
const SHAKES_IMAGE = require('../assets/images/shakes.jpg');
const DESERTS_IMAGE = require('../assets/images/desert.jpg');
const BAKERIES_IMAGE = require('../assets/images/bakeries.jpg');
const DEFAULT_IMAGE = 'https://picsum.photos/id/100/100/100';

const TRENDING_PIZZA_IMAGE = require('../assets/images/trendPizza.jpg');
const TRENDING_BURGER_IMAGE = require('../assets/images/trendBurger.jpg');
const TRENDING_WINGS_IMAGE = require('../assets/images/trendWings.jpg');
const TRENDING_NACHOS_IMAGE = require('../assets/images/trendNachos.jpg');

const SPECIAL_DISH_IMAGE = require('../assets/images/cheeseburger.jpg');

const todaysSpecialData = {
    title: 'Spicy Burger with Extra Cheese',
    price: '$10.53',
    image: SPECIAL_DISH_IMAGE, 
};

const IMAGE_MAP: any = {
    'Pizza': PIZZA_IMAGE,
    'Biryani': BIRYANI_IMAGE,
    'snacks': FRIES_IMAGE,
    'Shakes': SHAKES_IMAGE,
    'Deserts': DESERTS_IMAGE,
    'Bakeries': BAKERIES_IMAGE,
    'Chicken': CHICKEN_IMAGE,
    'Burger': BURGER_IMAGE,
    'Fries': FRIES_IMAGE,
    'Boritto': BORITTO_IMAGE,
    'Taco': TACO_IMAGE,
};

const analyticsData = [
    { title: 'Total Sale', value: '$254.90', trendColor: '#ff3b30', isBigCard: true },
    { title: 'Total Profit', value: '$25,450', trendColor: '#34c759', isBigCard: false },
    { title: 'Customer rate', value: '5.12%', trendColor: '#ff3b30', isBigCard: false },
    { title: 'New Orders', value: '1,234', trendColor: '#007AFF', isBigCard: false },
];

const sidebarItems = [
    { icon: '🏠', label: 'Dashboard', route: '/AdminPage', active: true },
    { icon: '📦', label: 'Product', route: '/ProductPage' },
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

const CategoryItem = ({ name, image, isActive, onPress }: any) => (
    <TouchableOpacity 
        style={[styles.categoryItem, isActive && styles.categoryItemActive]}
        onPress={() => onPress(name)}
    >
        <Image source={image} style={styles.categoryImage} contentFit="cover" />
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{name}</Text>
    </TouchableOpacity>
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

const TotalSaleCard = ({ title, value, trendColor }: any) => (
    <View style={styles.totalSaleCard}>
        <View style={styles.totalSaleHeader}>
            <Text style={styles.analyticsTitle}>{title}</Text>
            <Text style={styles.totalSaleValue}>{value}</Text>
        </View>
        <View style={[styles.trendLineFull, { backgroundColor: trendColor }]} />
    </View>
);

const SmallAnalyticsCard = ({ title, value, trendColor }: any) => (
    <View style={styles.analyticsCardSmall}>
        <Text style={styles.analyticsTitle}>{title}</Text>
        <Text style={styles.analyticsValueSmall}>{value}</Text>
        <View style={[styles.trendLineSmall, { backgroundColor: trendColor }]} />
    </View>
);

const SalesFiguresChart = () => (
    <View style={styles.salesChartContainer}>
        <Text style={styles.sectionTitle}>Sales Figures</Text>
        <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>[Line Chart Placeholder]</Text>
        </View>
    </View>
);

const TodaysSpecialCard = () => (
    <View style={styles.specialCard}>
        <Text style={styles.sectionTitle}>Today's Special Dish</Text>
        
        <View style={styles.specialImageWrapper}>
            <Image
                source={todaysSpecialData.image}
                style={styles.specialImage}
                contentFit="cover"
            />
        </View>

        <Text style={styles.specialTitle}>{todaysSpecialData.title}</Text>
        <View style={styles.specialFooter}>
            <Text style={styles.specialPrice}>{todaysSpecialData.price}</Text>
            <View style={styles.specialLikes}>
                <Text style={{ fontSize: 16 }}>❤️</Text>
            </View>
        </View>
    </View>
);

const OfferCard = ({ title, offerDetail, image, isDarkMode, offerData, onEdit, onDelete }: any) => (
    <View style={[styles.offerCardItem, isDarkMode && darkStyles.sectionContainer]}>
        <View style={styles.specialImageWrapper}>
            <Image
                source={{ uri: image }}
                style={styles.specialImage}
                contentFit="cover"
            />
        </View>

        <Text style={[styles.specialTitle, isDarkMode && darkStyles.textPrimary]}>{title}</Text>
        <View style={styles.specialFooter}>
            <Text style={[styles.specialPrice, styles.offerDetailText]}>{offerDetail}</Text>
            
            <View style={styles.offerActionButtons}>
                <TouchableOpacity style={styles.editOfferButton} onPress={() => onEdit(offerData)}>
                    <Text style={styles.offerActionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.deleteOfferButton} 
                    onPress={() => onDelete(offerData.id)}
                >
                    <Text style={styles.offerActionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>

        </View>
    </View>
);

const OffersScrollSection = ({ offers, isLoading, isDarkMode, isWeb, onAddOffer, onEditOffer, onDeleteOffer }: any) => (
    <View 
        style={[
            styles.offersCardWrapper, 
            isDarkMode && darkStyles.sectionContainer, 
            isWeb && styles.offersWebWrapper
        ]}
    >
        <View style={[styles.sectionHeader, styles.offersHeaderPadding]}>
            <Text style={[styles.sectionTitle, {marginBottom: 0}, isDarkMode && darkStyles.textPrimary]}>Current Offers</Text>
            <TouchableOpacity style={styles.addOfferButton} onPress={onAddOffer}>
                <Text style={styles.addOfferButtonText}>+ Add New Offer</Text>
            </TouchableOpacity>
        </View>

        {isLoading && (
            <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FF9500" />
                <Text style={{ color: isDarkMode ? '#aaa' : '#999', marginTop: 10 }}>Fetching latest offers...</Text>
            </View>
        )}
        
        {!isLoading && offers.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: isDarkMode ? '#aaa' : '#999' }}>No current offers found.</Text>
            </View>
        )}
        
        {!isLoading && offers.length > 0 && (
            <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.offersScrollContent}
            >
                {offers.map((offer: any) => (
                    <OfferCard
                        key={offer.id}
                        title={offer.title}
                        offerDetail={offer.description}
                        image={offer.imageUrl}      
                        isDarkMode={isDarkMode}
                        offerData={offer}
                        onEdit={onEditOffer}
                        onDelete={onDeleteOffer}
                    />
                ))}
            </ScrollView>
        )}
    </View>
);


const OrderReportsTable = ({ orders, totalCount, visibleCount, onShowMore, isLoading, isDarkMode }: any) => {
    return (
        <View style={[styles.orderReportsContainer, isDarkMode && darkStyles.orderReportsContainer]}>
            <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textPrimary]}>Order Reports</Text>
            
            {isLoading && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FF9500" />
                    <Text style={{ color: isDarkMode ? '#aaa' : '#999', marginTop: 10 }}>Loading orders...</Text>
                </View>
            )}
            
            {!isLoading && orders.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: isDarkMode ? '#aaa' : '#999' }}>No orders found.</Text>
                    <Text style={{ color: isDarkMode ? '#aaa' : '#999', fontSize: 12, marginTop: 5 }}>
                        (Note: API requires Admin/Manager role.)
                    </Text>
                </View>
            )}

            {totalCount > 0 && (
                <ScrollView 
                    horizontal={Platform.OS !== 'web'} 
                    showsHorizontalScrollIndicator={false}
                >
                    <View style={styles.table}> 
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary]} />
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colFood]}>Food</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colCustomer]}>Customer</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colOrderDate]}>Order Date</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colPrice]}>Price</Text>
                            <Text style={[styles.headerCol, isDarkMode && darkStyles.textSecondary, styles.colStatus]}>Status</Text>
                        </View>
                        
                        {orders.map((item: any) => (
                            <View key={item.id} style={[styles.tableRow, isDarkMode && darkStyles.tableRow]}>
                                <View style={[styles.dataCol, styles.colCheckbox]}>
                                    <View style={[styles.checkbox, isDarkMode && darkStyles.checkbox]} />
                                </View>
                                <View style={[styles.dataCol, styles.colFood]}>
                                    <Image 
                                        source={{ uri: item.image }}
                                        style={styles.foodImage} 
                                        contentFit="cover" 
                                    />
                                    <Text style={[styles.foodText, isDarkMode && darkStyles.textPrimary]}>{item.food}</Text>
                                </View>
                                <Text style={[styles.dataCol, styles.colCustomer, isDarkMode && darkStyles.textPrimary]}>{item.customer}</Text>
                                <Text style={[styles.dataCol, styles.colOrderDate, isDarkMode && darkStyles.textPrimary]}>{item.date}</Text>
                                <Text style={[styles.dataCol, styles.colPrice, isDarkMode && darkStyles.textPrimary]}>{item.price}</Text>
                                <View style={[styles.dataCol, styles.colStatus]}>
                                    <Text style={item.status === 'Pending' ? styles.statusPending : styles.statusCompleted}>
                                        {item.status.substring(0, 10)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
            
            {!isLoading && orders.length > 0 && visibleCount < totalCount && (
                <TouchableOpacity style={[styles.showMoreButton, isDarkMode && darkStyles.showMoreButton]} onPress={onShowMore}>
                    <Text style={[styles.showMoreButtonText, isDarkMode && darkStyles.textPrimary]}>Show More ({totalCount - visibleCount} remaining)</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const TrendingCard = ({ name, price, description, sales, rating, tag, image, isDarkMode }: any) => (
    <View style={[styles.trendingCard, isDarkMode && darkStyles.trendingCard]}>
        <Image source={image} style={styles.trendingImage} contentFit="cover" /> 
        <View style={styles.trendingDetails}>
            <View style={styles.trendingTitleRow}>
                <Text style={[styles.trendingCardTitle, isDarkMode && darkStyles.textPrimary]}>{name}</Text>
                <Text style={styles.trendingCardPrice}>{price}</Text>
            </View>
            <Text style={[styles.trendingCardDescription, isDarkMode && darkStyles.textSecondary]}>{description}</Text>
            
            <View style={styles.trendingInfoRow}>
                <Text style={[styles.trendingSalesText, isDarkMode && darkStyles.textPrimary]}>{sales}</Text>
                <View style={styles.trendingRating}>
                    <Text style={styles.trendingRatingIcon}>⭐</Text>
                    <Text style={[styles.trendingRatingText, isDarkMode && darkStyles.textPrimary]}>{rating}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.trendingTag}>
                <Text style={styles.trendingTagIcon}>🌟</Text>
                <Text style={styles.trendingTagText}>{tag}</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const TrendingOrdersSection = ({ isWeb, isDarkMode }: any) => {
    const trendingOrdersData = [
        { id: 1, name: 'Poultry Palace', price: '$20.00', description: 'Healthy Foods are nutrient-Dense Foods', sales: '200 Sale', rating: '4.5', tag: 'Top Of Them Month', image: TRENDING_PIZZA_IMAGE },
        { id: 2, name: 'Wing Mastern', price: '$30.00', description: 'Nutrient-dense with healthy choices', sales: '200 Sale', rating: '4.5', tag: 'Top Of Them Week', image: TRENDING_BURGER_IMAGE },
        { id: 3, name: 'Burger Barn', price: '$20.00', description: 'offering numerous health benefits prevention.', sales: '200 Sale', rating: '4.5', tag: 'Top Of Them Year', image: TRENDING_WINGS_IMAGE },
        { id: 4, name: 'Poultry Palace', price: '$15.00', description: 'Healthy Foods are nutrient-Dense Foods', sales: '200 Sale', rating: '4.5', tag: 'Top Of Them Year', image: TRENDING_NACHOS_IMAGE },
    ];
    
    return (
        <View style={isWeb ? styles.trendingSectionContainerWeb : [styles.trendingSectionContainerMobile, isDarkMode && darkStyles.containerMobileBackground]}>
            <View style={styles.trendingHeader}>
                <Text style={[styles.trendingSectionTitle, !isWeb && styles.mobileSectionTitlePadding, isDarkMode && darkStyles.textPrimary]}>Trending orders</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllButtonText}>View All ></Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingCardScroll}
            >
                {trendingOrdersData.map(item => (
                    <TrendingCard key={item.id} {...item} isDarkMode={isDarkMode} />
                ))}
            </ScrollView>
        </View>
    );
};

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
                        Food that's you loved! 🔥
                    </Text>
                    <Text style={[styles.headerSubtitle, isDarkMode && darkStyles.textSecondary]}>
                        Delight your taste with our most famous food!!
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

// ... existing imports and code

// 🚩 MODIFIED: Converted to block function to use router hook
const SidebarContent = ({ isDarkMode }: any) => {
    // 1. Initialize the router hook
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
                        // 2. Dynamic Navigation Logic
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
                        {/* Only show arrow if a route     is defined */}
                        {item.route && <Text style={styles.sidebarItemArrow}>&gt;</Text>}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </>
    );
};

// ... rest of the file (Sidebar, OfferModal, AdminPage, styles)

const Sidebar = ({ isDarkMode }: any) => (
    <View style={styles.sidebar}>
        <SidebarContent isDarkMode={isDarkMode} />
    </View>
);

const OfferModal = ({ isVisible, onClose, onSave, offerData, isDarkMode }: any) => {
    const isEditMode = !!offerData;
    
    const [title, setTitle] = useState(offerData?.title || '');
    const [description, setDescription] = useState(offerData?.description || '');
    const [imageUri, setImageUri] = useState(offerData?.imageUrl || null); 
    const [imageFile, setImageFile] = useState<any>(null);

    useEffect(() => {
        if (offerData) {
            setTitle(offerData.title || '');
            setDescription(offerData.description || '');
            setImageUri(offerData.imageUrl || null);
            setImageFile(null); 
        } else {
            setTitle('');
            setDescription('');
            setImageUri(null);
            setImageFile(null);
        }
    }, [offerData]);

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
            aspect: [16, 9],
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
        if (!title.trim() || !description.trim() || !imageUri) {
            Alert.alert("Error", "All fields (Title, Description, and an Image) must be filled.");
            return;
        }
        onSave(offerData?.id, title, description, imageUri, imageFile);
    };
    
    const handleClose = () => {
        onClose();
    };

    return (
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && darkStyles.modalContent]}>
                <Text style={[styles.modalTitle, isDarkMode && darkStyles.textPrimary]}>
                    {isEditMode ? 'Edit Existing Offer' : 'Add New Offer'}
                </Text>

                <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Offer Title</Text>
                        <TextInput
                            style={[styles.modalInput, isDarkMode && darkStyles.modalInput]}
                            placeholder="e.g., 50% Off All Pizzas"
                            placeholderTextColor={isDarkMode ? '#555' : '#aaa'}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Offer Image</Text>
                        <TouchableOpacity 
                            style={[styles.imagePickerButton, imageUri && styles.imagePickerActive]} 
                            onPress={pickImage}
                        >
                            <Text style={styles.imagePickerButtonText}>
                                {imageUri ? '✅ Image Selected (Change)' : '🖼️ Pick Image from Library'}
                            </Text>
                        </TouchableOpacity>
                        {imageUri && (
                             <Image 
                                source={{ uri: imageUri }}
                                style={styles.imagePreview}
                                contentFit="cover"
                            />
                        )}
                    </View>


                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, isDarkMode && darkStyles.textSecondary]}>Description</Text>
                        <TextInput
                            style={[styles.modalInput, styles.modalDescriptionInput, isDarkMode && darkStyles.modalInput]}
                            placeholder="Detailed terms of the offer"
                            placeholderTextColor={isDarkMode ? '#555' : '#aaa'}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </ScrollView>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={handleClose}>
                        <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
                        <Text style={styles.modalSaveButtonText}>{isEditMode ? 'Save Changes' : 'Save Offer'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default function AdminPage() {
    const isWeb = Platform.OS === 'web';
    const firstAnalyticsItem = analyticsData[0]; 
    const remainingAnalyticsItems = analyticsData.slice(1);
    const router = useRouter();
    
    // 🚩 1. AUTHENTICATION STATES
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const [activeCategory, setActiveCategory] = useState('Pizza');
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalOfferData, setModalOfferData] = useState(null); 

    const [offers, setOffers] = useState<any[]>([]);
    const [isLoadingOffers, setIsLoadingOffers] = useState(false);

    // 🚩 2. AUTH CHECK EFFECT (Executes first)
    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                const rolesString = await AsyncStorage.getItem('roles');
                console.log("AdminPage: Checked Roles:", rolesString);

                if (rolesString && (rolesString.includes('ROLE_ADMIN') || rolesString.includes('ADMIN'))) {
                    setIsAuthorized(true);
                } else {
                    // If not admin, redirect immediately
                    Alert.alert("Access Denied", "You are not authorized to view this page.");
                    router.replace('/(tabs)'); 
                }
            } catch (error) {
                console.error("Auth Check Failed", error);
                router.replace('/login');
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAdminRole();
    }, []);


    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const handleCategoryPress = (categoryName: any) => {
        setActiveCategory(categoryName);
    };
    
    const handleAddOffer = () => {
        setModalOfferData(null); 
        setIsModalVisible(true);
    };

    const handleEditOffer = (offer: any) => {
        setModalOfferData(offer); 
        setIsModalVisible(true);
    };

    const handleModalClose = useCallback(() => {
        setIsModalVisible(false);
        setModalOfferData(null); 
    }, []);

    const handleDeleteOffer = async (id: any) => {
        const performDelete = async () => {
            try {
                await rootApi.delete(`/offer/deleteOffer/${id}`);
                setOffers(prevOffers => prevOffers.filter(offer => offer.id !== id));
                if (Platform.OS !== 'web') {
                    Alert.alert("Success", "Offer deleted successfully");
                }
            } catch (error) {
                console.error("Delete Error:", error);
                Alert.alert("Error", "Failed to delete offer. Please try again.");
            }
        };

        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to delete this offer?");
            if (confirmed) {
                await performDelete();
            }
        } else {
            Alert.alert(
                "Delete Offer",
                "Are you sure you want to delete this offer? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Delete", 
                        style: "destructive", 
                        onPress: performDelete 
                    },
                ]
            );
        }
    };

   const handleSaveOrUpdateOffer = async (id: any, title: any, description: any, imageUri: any, imageFile: any) => {
        const isUpdate = !!id;
        
        // 1. Check if image is new
        const isImageNew = Platform.OS === 'web' 
            ? !!imageFile 
            : (imageUri && !imageUri.startsWith('http'));

        setIsModalVisible(false);
        setModalOfferData(null);

        const action = isUpdate ? 'Update' : 'Save';
        const method = isUpdate ? 'put' : 'post';
        const BACKEND_FILE_KEY = isUpdate ? 'imageUrl' : 'image';

        // 🚩 FIX 1: Do NOT add title/description to URL params (Prevents duplicates)
        const queryParams = new URLSearchParams();
        if (isUpdate) {
            queryParams.append('active', 'true');
        }

        const queryString = queryParams.toString();
        const queryPart = queryString ? `?${queryString}` : '';

        let endpoint;
        if (isUpdate) {
            endpoint = `/offer/updateOffer/${id}${queryPart}`;
        } else {
            endpoint = `/offer/addOffer${queryPart}`;
        }

        console.log(`Sending ${action} request to: ${endpoint}`);

        // 🚩 FIX 2: Always put title/description in FormData (Ensures updates work)
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        // 3. Append Image ONLY if it is new
        if (isImageNew) {
            if (Platform.OS === 'web' && imageFile) {
                formData.append(BACKEND_FILE_KEY, imageFile);
            } else if (imageUri) {
                const uriParts = imageUri.split('.');
                const fileExtension = uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase() : 'jpg';
                
                // @ts-ignore
                formData.append(BACKEND_FILE_KEY, {
                    uri: imageUri,
                    name: imageUri.split('/').pop() || `upload.${fileExtension}`,
                    type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
                });
            }
        }

        try {
            // 4. Send Request (Content-Type: undefined lets the browser handle boundaries)
            const response = await rootApi[method](endpoint, formData, {
                headers: {
                    'Content-Type': undefined, 
                },
                transformRequest: (data, headers) => {
                    return data; 
                },
            });

            // 5. Handle Success
            const savedOffer = {
                ...modalOfferData,
                id: response.data?.id || id || Date.now().toString(),
                title: response.data?.title || title,
                description: response.data?.description || description,
                imageUrl: response.data?.imageUrl || imageUri,
            };

            Alert.alert("Success", `Offer ${action}d successfully!`);

            setOffers(prevOffers => {
                if (isUpdate) {
                    const index = prevOffers.findIndex(o => o.id === id);
                    if (index !== -1) {
                        const newOffers = [...prevOffers];
                        newOffers[index] = savedOffer;
                        return newOffers;
                    }
                }
                return [savedOffer, ...prevOffers];
            });

        } catch (error: any) {
            console.error(`Failed to ${action} offer:`, error);
            if (error.response?.status === 403) {
                 Alert.alert("Authorization Failed", "Server rejected the request.");
            } else {
                const errorMessage = error.response?.data?.message || error.message || "Server Error";
                Alert.alert("Error", errorMessage);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('roles'); 
            // Also remove userToken to be safe since login.tsx sets it
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('isAuthenticated');

            console.log("User logged out. Tokens cleared.");
            Alert.alert("Logged Out", "Logged out successfully! Redirecting to login...");
            
            router.replace("/login"); 
            
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const fallbackMenuCategories = [
        { name: 'Pizza', image: PIZZA_IMAGE, active: true },
        { name: 'Chicken', image: CHICKEN_IMAGE, active: false },
        { name: 'Burger', image: BURGER_IMAGE, active: false },
        { name: 'Fries', image: FRIES_IMAGE, active: false },
        { name: 'Boritto', image: BORITTO_IMAGE, active: false },
        { name: 'Taco', image: TACO_IMAGE, active: false },
    ];

    const [visibleOrdersCount, setVisibleOrdersCount] = useState(INITIAL_ROWS);
    const [categories, setCategories] = useState(fallbackMenuCategories);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [ordersData, setOrdersData] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    // 2. UPDATED API FETCH (CATEGORIES)
    useEffect(() => {
        // Only fetch if authorized
        if (!isAuthorized) return;

        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const response = await rootApi.get('/categories/all');
                
                const mappedCategories = response.data.map((item: any) => {
                    // Default fallback
                    let imageSrc = IMAGE_MAP[item.name] || DEFAULT_IMAGE;
                    
                    // Use backend image if available
                    if (item.imageUrl) {
                         // Handle relative vs absolute URLs
                         imageSrc = item.imageUrl.startsWith('http') 
                            ? item.imageUrl 
                            : `${IMAGE_BASE_URL}/${item.imageUrl}`;
                    }
                    
                    return {
                        name: item.name,
                        image: imageSrc,
                    };
                });
                
                setCategories(mappedCategories.length > 0 ? mappedCategories : fallbackMenuCategories);
                if (mappedCategories.length > 0 && activeCategory === 'Pizza') {
                    setActiveCategory(mappedCategories[0].name);
                }
                
            } catch (error) {
                console.error("Failed to fetch categories. Using fallback data:", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        
        fetchCategories();
    }, [isAuthorized]); 

    // API FETCH (ORDERS)
    useEffect(() => {
        if (!isAuthorized) return;

        const fetchOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const response = await rootApi.get('/order/allOrders');
                
                const mappedOrders = response.data.map((order: any) => {
                    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                    const rawStatus = order.orderStatus?.toLowerCase() || 'Unknown';
                    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

                    return {
                        id: order.id,
                        food: firstItem?.menuItem?.name || 'N/A',
                        customer: order.user?.name || 'Unknown',
                        date: formatDate(order.orderDate),
                        price: formatPrice(order.totalAmount),
                        status: status,
                        image: firstItem?.menuItem?.imageUrl || 'https://picsum.photos/50',
                    };
                });
                
                setOrdersData(mappedOrders.reverse()); 
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                setOrdersData([]);
            } finally {
                setIsLoadingOrders(false);
            }
        };
        
        fetchOrders();
    }, [isAuthorized]);
    
    // API FETCH (OFFERS)
    useEffect(() => {
        if (!isAuthorized) return;

        const fetchOffers = async () => {
            setIsLoadingOffers(true);
            try {
               let response = await rootApi.get(`/offer/getActiveOffers`)
                if (Array.isArray(response.data)) {
                    setOffers(response.data);
                } else if (response.data && response.data.id) {
                    setOffers([response.data]);
                } else {
                    setOffers([]);
                }
            } catch (error) {
                console.error("Failed to fetch offers from API:", error);
                setOffers([]); 
            } finally {
                setIsLoadingOffers(false);
            }
        };
        
        fetchOffers();
    }, [isAuthorized]);


    const handleShowMore = () => {
        setVisibleOrdersCount(prevCount => prevCount + ROWS_PER_PAGE);
    };

    const ordersToShow = ordersData.slice(0, visibleOrdersCount);
    const totalOrderCount = ordersData.length;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current; 

    const toggleDrawer = () => {
        const newState = !isDrawerOpen;
        setIsDrawerOpen(newState);
        
        Animated.timing(drawerAnim, {
            toValue: newState ? 0 : -DRAWER_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // 🚩 3. RENDER LOADING OR NULL IF NOT AUTHORIZED
    if (isCheckingAuth) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#FF9500" />
            </View>
        );
    }

    if (!isAuthorized) {
        return null; // Render nothing while redirecting
    }

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

                    {isWeb ? (
                        // === WEB ONLY LAYOUT ===
                        <>
                            <View style={styles.dashboardGridWeb}>
                                <View style={styles.welcomeCardContainer}>
                                    <ImageBackground
                                        source={require('../assets/images/background.jpg')} 
                                        style={styles.welcomeCardBackground} 
                                        resizeMode="cover" 
                                        imageStyle={styles.welcomeCardImageStyle} 
                                    >
                                        <View style={styles.welcomeCardContentOverlay}>
                                            <View style={styles.discountBadgeContainer}>
                                                <Text style={styles.discountBadgeText}>25% OFF</Text>
                                            </View>
                                            <View style={styles.welcomeCardContent}>
                                                <Text style={styles.welcomeSubtitle}>Exclusive weekend discounts</Text>
                                                <Text style={styles.welcomeTitle}>Welcome To Zomo</Text>
                                                <TouchableOpacity style={styles.checkMenuButton}>
                                                    <Text style={styles.checkMenuButtonText}>Check Menu</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>
                                
                                <View style={styles.dynamicContentContainerWeb}>
                                    
                                    {/* --- Menu Categories Section --- */}
                                    <View style={[styles.sectionContainer, isDarkMode && darkStyles.sectionContainer]}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textPrimary]}>Menu category</Text>
                                            <View style={styles.navArrows}>
                                                <Text style={[styles.arrow, isDarkMode && darkStyles.textSecondary]}>&lt;</Text>
                                                <Text style={[styles.arrow, isDarkMode && darkStyles.textSecondary]}>&gt;</Text>
                                            </View>
                                        </View>
                                        
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollMobile}>
                                            {categories.map((item: any, index: any) => (
                                                <CategoryItem 
                                                    key={index} 
                                                    name={item.name} 
                                                    image={item.image} 
                                                    isActive={item.name === activeCategory}
                                                    onPress={handleCategoryPress}
                                                />
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* --- Analytics Cards Section (Web: 3 in a row) --- */}
                                    <View style={styles.analyticsSectionContainerWeb}>
                                        <View style={styles.analyticsGridWeb}>
                                            {analyticsData.slice(0, 3).map((data, index) => (
                                                <SmallAnalyticsCard key={index} {...data} />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={styles.reportsAndSpecialsContainerWeb}>
                                <OrderReportsTable 
                                    orders={ordersToShow} 
                                    totalCount={totalOrderCount} 
                                    visibleCount={visibleOrdersCount}
                                    onShowMore={handleShowMore} 
                                    isLoading={isLoadingOrders} 
                                    isDarkMode={isDarkMode}
                                />

                                <View style={styles.salesAndSpecialColumn}>
                                    <SalesFiguresChart />
                                    <TodaysSpecialCard />
                                </View>
                            </View>
                            
                            <OffersScrollSection 
                                offers={offers} 
                                isLoading={isLoadingOffers} 
                                isDarkMode={isDarkMode} 
                                isWeb={isWeb} 
                                onAddOffer={handleAddOffer} 
                                onEditOffer={handleEditOffer} 
                                onDeleteOffer={handleDeleteOffer}
                            />

                            <TrendingOrdersSection isWeb={isWeb} isDarkMode={isDarkMode} />

                            <Text style={[styles.copyrightTextWeb, isDarkMode && darkStyles.textSecondary]}>
                                Copyright 2024 ©Zomo template by pixelstrap
                            </Text>
                        </>
                    ) : (
                        // === MOBILE ONLY LAYOUT ===
                        <View style={styles.dashboardGridMobile}>
                            
                            <View style={styles.welcomeCardContainer}>
                                <ImageBackground
                                    source={require("../assets/images/background.jpg")} 
                                    style={styles.welcomeCardBackground} 
                                    resizeMode="cover" 
                                    imageStyle={styles.welcomeCardImageStyle} 
                                >
                                    <View style={styles.welcomeCardContentOverlay}>
                                        <View style={styles.discountBadgeContainer}>
                                            <Text style={styles.discountBadgeText}>25% OFF</Text>
                                        </View>
                                        <View style={styles.welcomeCardContent}>
                                            <Text style={styles.welcomeSubtitle}>Exclusive weekend discounts</Text>
                                            <Text style={styles.welcomeTitle}>Welcome To Zomo</Text>
                                            <TouchableOpacity style={styles.checkMenuButton}>
                                                <Text style={styles.checkMenuButtonText}>Check Menu</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ImageBackground>
                            </View>

                            <View style={styles.dynamicContentContainerMobile}>
                                
                                <View style={[styles.sectionContainer, isDarkMode && darkStyles.sectionContainer]}>
                                       <View style={styles.sectionHeader}>
                                            <Text style={[styles.sectionTitle, isDarkMode && darkStyles.textPrimary]}>Menu category</Text>
                                            <View style={styles.navArrows}>
                                                <Text style={[styles.arrow, isDarkMode && darkStyles.textSecondary]}>&lt;</Text>
                                                <Text style={[styles.arrow, isDarkMode && darkStyles.textSecondary]}>&gt;</Text>
                                            </View>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollMobile}>
                                            {categories.map((item: any, index: any) => (
                                                <CategoryItem 
                                                    key={index} 
                                                    name={item.name} 
                                                    image={item.image} 
                                                    isActive={item.name === activeCategory}
                                                    onPress={handleCategoryPress}
                                                />
                                            ))}
                                        </ScrollView>
                                </View>

                                <View style={styles.analyticsSectionContainerMobile}>
                                    {firstAnalyticsItem && firstAnalyticsItem.isBigCard && (
                                        <TotalSaleCard 
                                            title={firstAnalyticsItem.title} 
                                            value={firstAnalyticsItem.value} 
                                            trendColor={firstAnalyticsItem.trendColor} 
                                        />
                                    )}
                                    
                                    {remainingAnalyticsItems.length > 0 && (
                                        <View style={styles.analyticsGridMobile}>
                                            {remainingAnalyticsItems
                                                .filter(item => item.title !== 'Customer rate')
                                                .map((data, index) => (
                                                    <SmallAnalyticsCard key={index} {...data} />
                                                ))}
                                        </View>
                                    )}
                                </View>
                                
                                <View style={styles.reportsAndSpecialsContainerMobile}>
                                    <OrderReportsTable orders={ordersToShow} totalCount={totalOrderCount} visibleCount={visibleOrdersCount} onShowMore={handleShowMore} isLoading={isLoadingOrders} isDarkMode={isDarkMode} />
                                    <View style={styles.salesAndSpecialColumnMobile}>
                                        <SalesFiguresChart />
                                        <TodaysSpecialCard />
                                        <OffersScrollSection 
                                            offers={offers} 
                                            isLoading={isLoadingOffers} 
                                            isDarkMode={isDarkMode} 
                                            isWeb={isWeb} 
                                            onAddOffer={handleAddOffer} 
                                            onEditOffer={handleEditOffer} 
                                            onDeleteOffer={handleDeleteOffer}
                                        />
                                    </View>
                                </View>
                                
                                <TrendingOrdersSection isWeb={isWeb} isDarkMode={isDarkMode} />

                                <Text style={[styles.copyrightText, isDarkMode && darkStyles.textSecondary]}>
                                    Copyright 2024 ©Zomo template by pixelstrap
                                </Text>
                            </View>
                        </View>
                    )}
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
            
            <OfferModal
                isVisible={isModalVisible}
                onClose={handleModalClose}
                onSave={handleSaveOrUpdateOffer} 
                offerData={modalOfferData} 
                isDarkMode={isDarkMode}
            />
        </View>
    );
}


// 🚩 NEW: Dark Mode Styles Overrides
const DARK_BACKGROUND = '#1c1c1c';
const DARK_CARD = '#2a2a2a';
const DARK_TEXT_PRIMARY = '#ffffff';
const DARK_TEXT_SECONDARY = '#b0b0b0';

const darkStyles = StyleSheet.create({
    containerWebLayout: {
        backgroundColor: DARK_BACKGROUND,
    },
    mainContentArea: {
        backgroundColor: DARK_BACKGROUND,
    },
    scrollContentWeb: {
        backgroundColor: DARK_BACKGROUND,
    },
    mobileHeaderContainer: {
        backgroundColor: DARK_CARD,
    },
    headerCard: {
        backgroundColor: DARK_CARD,
    },
    sectionContainer: {
        backgroundColor: DARK_CARD,
    },
    trendingCard: {
        backgroundColor: DARK_CARD,
    },
    orderReportsContainer: {
        backgroundColor: DARK_CARD,
    },
    
    // Modal Overrides
    modalContent: {
        backgroundColor: DARK_CARD,
    },
    modalInput: {
        backgroundColor: '#333',
        color: DARK_TEXT_PRIMARY,
        borderColor: '#444',
    },
    
    // Text Overrides
    textPrimary: {
        color: DARK_TEXT_PRIMARY,
    },
    textSecondary: {
        color: DARK_TEXT_SECONDARY,
    },
    
    // Specific element overrides for contrast
    iconButton: {
        backgroundColor: DARK_CARD,
        borderColor: '#444',
        shadowOpacity: 0.2,
    },
    userProfile: {
        backgroundColor: DARK_CARD,
    },
    // Table overrides
    tableRow: {
        borderBottomColor: '#333',
    },
    checkbox: {
        borderColor: DARK_TEXT_SECONDARY,
    },
    showMoreButton: {
        backgroundColor: '#333',
        borderColor: '#444',
    },
    containerMobileBackground: {
        backgroundColor: DARK_BACKGROUND,
    },
});


const styles = StyleSheet.create({
    // --- General Container & Scroll Views ---
    containerMobile: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    containerWebLayout: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f0f2f5', 
    },
    mainContentArea: {
        flex: 1,
        backgroundColor: Platform.OS === 'web' ? '#f0f2f5' : 'transparent',
    },
    scrollContentWeb: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignSelf: 'center', 
        width: '100%',
        maxWidth: 1400,
    },
    scrollContentMobile: {
        paddingBottom: 20,
        backgroundColor: '#f5f5f5', 
    },
    
    // --- SEARCH BAR STYLES (NEW) ---
    searchBarContainer: { // Web Default
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#fff', 
        width: 300, 
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    searchBarContainerMobile: { // Mobile full width override
        width: '100%',
        borderRadius: 0, 
        paddingVertical: 12,
        marginBottom: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
        color: '#333',
        ...Platform.select({
            web: { outlineStyle: 'none' },
        }),
    },
    searchIconText: {
        fontSize: 18,
        color: '#999',
    },
    searchCloseButton: {
        paddingHorizontal: 5,
    },
    searchCloseText: {
        fontSize: 18,
        color: '#999',
    },
    // --- END SEARCH BAR STYLES ---

    // --- MOBILE HEADER STYLES ---
    mobileHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff', 
        marginBottom: 10,
        marginTop:10,
        zIndex: 9000,
    },
    mobileHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    mobileLogoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    mobileHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    mobileIconContainer: {
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: 8,
        backgroundColor: '#f5f5f5', 
    },
    mobileHamburgerIcon: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
        transform: [{ scaleY: 0.8 }],
    },
    mobileIconText: {
        fontSize: 16,
    },
    mobileNotificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#ff3b30',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    mobileNotificationText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#fff',
    },
    mobileProfileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 5,
    },
    // --- END MOBILE HEADER STYLES ---

    // --- DRAWER OVERLAY Style (NEW) ---
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 9990, 
    },
    // --- END DRAWER OVERLAY STYLE ---

    // --- SIDEBAR STYLES ---
    sidebar: {
        width: 250,
        backgroundColor: '#272727', 
        height: '100%',
        paddingVertical: 20,
        overflow: 'hidden',
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    sidebarLogoText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    sidebarUtilityIcon: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sidebarIconText: {
        fontSize: 20,
        color: '#fff',
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginHorizontal: 10,
        borderRadius: 8,
        marginBottom: 5,
    },
    sidebarItemActive: {
        backgroundColor: '#FF9500', 
    },
    sidebarItemIcon: {
        fontSize: 18,
        color: '#fff',
        width: 30,
        textAlign: 'center',
    },
    sidebarItemText: {
        flex: 1,
        fontSize: 15,
        color: '#bbb',
        marginLeft: 10,
        fontWeight: '600',
    },
    sidebarItemTextActive: {
        color: '#272727', 
        fontWeight: 'bold',
    },
    sidebarItemArrow: {
        fontSize: 16,
        color: '#bbb',
    },
    // --- END SIDEBAR STYLES ---

    // --- WEB HEADER STYLES ---
    headerCardWrapper: {
        marginBottom: 20,
        marginHorizontal: 0, 
        marginTop: 0, 
        paddingHorizontal: 0, 
        zIndex: 10,
    },
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 0, 
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerTitleGroup: {},
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    headerButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    iconButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        position: 'relative',
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    iconText: {
        fontSize: 18,
        color: '#333',
    },
    notificationBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff3b30',
        borderWidth: 1,
        borderColor: '#fff',
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        ...Platform.select({ web: { cursor: 'pointer' } }),
        zIndex: 100,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    profileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    profileRole: {
        fontSize: 12,
        color: '#999',
    },
    // --- END WEB HEADER STYLES ---
    
    // --- LOGOUT DROPDOWN STYLES ---
    logoutDropdown: {
        backgroundColor: '#fff',
        width: 180,
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        position: 'relative',
    },
    dropdownProfileInfo: {
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 5,
        marginTop: 5,
    },
    dropdownProfileName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
    },
    dropdownProfileRole: {
        fontSize: 12,
        color: '#999',
    },
    logoutButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#ff3b30',
        alignItems: 'center',
        marginTop: 5,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    dropdownCloseButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    dropdownCloseText: {
        fontSize: 18,
        color: '#999',
        fontWeight: 'bold',
    },
    // --- END LOGOUT DROPDOWN STYLES ---


    // --- Layout Adaptation ---
    dashboardGridWeb: {
        flexDirection: 'row',
        gap: 20,
        paddingHorizontal: 20, 
    },
    dashboardGridMobile: {},
    welcomeCardContainer: Platform.select({
        web: {
            width: 300,
            flexShrink: 0,
        },
        default: {
            paddingHorizontal: 15,
            marginBottom: 20,
        },
    }),
    dynamicContentContainerWeb: {
        flex: 1,
        minWidth: 500,
    },
    dynamicContentContainerMobile: {},
    
    // --- ImageBackground Card Styles ---
    welcomeCardBackground: {
        height: 350,
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
    },
    welcomeCardImageStyle: {
        borderRadius: 15,
    },
    welcomeCardContentOverlay: {
        flex: 1,
        backgroundColor: 'rgba(254, 243, 229, )', 
        padding: 20,
        position: 'relative',
    },
    welcomeCardContent: {
        flex: 1,
        justifyContent: 'flex-end',
        marginTop: 180,
        alignItems:'center'
    },
    discountBadgeContainer: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#ff3b30',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 10,
    },
    discountBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    
    welcomeSubtitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        fontWeight: '600',
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#d48806', 
        marginBottom: 25,
    },
    checkMenuButton: {
        backgroundColor: '#ff9500', 
        paddingVertical: 12,
        paddingHorizontal:20,
        borderRadius: 8,
        alignItems: 'center',
        ...Platform.select({
            web: { cursor: 'pointer' }
        }),
    },
    checkMenuButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // --- Menu Categories Section ---
    sectionContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        paddingTop: 25, 
        paddingBottom: 25,
        paddingLeft: 15,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
        ...Platform.select({
            default: { marginHorizontal: 15 },
        }),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingRight: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    navArrows: {
        flexDirection: 'row',
        gap: 5,
    },
    arrow: {
        fontSize: 16,
        color: '#888',
        fontWeight: 'bold',
        padding: 3,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 5,
    },
    categoryScrollMobile: {
        gap: 15,
        paddingRight: 30,
    },
    categoryItem: {
        width: 90,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1, 
        borderColor: '#f9f9f9',
    },
    categoryItemActive: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        borderColor: '#FF9500',
    },
    categoryImage: {
        width: 55,
        height: 55,
        borderRadius: 30,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    categoryTextActive: {
        color: '#FF9500',
        fontWeight: 'bold',
    },

    // --- Analytics Section ---
    analyticsSectionContainerWeb: {
        marginHorizontal: 0, 
        marginBottom: 20,
    },
    analyticsSectionContainerMobile: {
        ...Platform.select({
            default: { marginHorizontal: 15, marginBottom: 20 },
        }),
    },
    totalSaleCard: {
        backgroundColor: '#fff',
        padding: 15,
        paddingBottom: 0,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
        marginBottom: 20,
        overflow: 'hidden',
    },
    totalSaleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
    },
    totalSaleValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    trendLineFull: {
        height: 70,
        borderRadius: 20,
        opacity: 0.7,
        width: '100%',
        marginBottom:20,
    },
    analyticsGridWeb: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'space-between',
        width: '100%',
    },
    analyticsGridMobile: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    analyticsCardSmall: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        ...Platform.select({
            web: { flex: 1, marginBottom: 0 },
            default: { width: '48%', marginBottom: 10 },
        }),
    },
    analyticsTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    analyticsValueSmall: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    trendLineSmall: {
        height: 40,
        borderRadius: 7,
        opacity: 0.5,
        width: '100%',
    },

    // --- Reports and Specials Layout ---
    reportsAndSpecialsContainerMobile: {
        flexDirection: 'column', 
        gap: 20,
        marginBottom: 20,
        ...Platform.select({
            default: { marginHorizontal: 15 },
        }),
    },
    salesAndSpecialColumnMobile: {
        flexDirection: 'column',
        gap: 20,
    },
    reportsAndSpecialsContainerWeb: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 20, 
    },
    salesAndSpecialColumn: {
        width: 350,
        flexShrink: 0,
        gap: 20,
    },
    
    // --- Sales Figures Chart Styles ---
    salesChartContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    chartPlaceholder: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
    },
    placeholderText: {
        color: '#ccc',
        fontSize: 14,
    },

    // --- Today's Special Card Styles ---
    specialCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    specialImageWrapper: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 15,
    },
    specialImage: {
        width: '100%',
        height: '100%',
    },
    specialTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    specialFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    specialPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF9500',
    },
    specialLikes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    specialLikesText: {
        fontSize: 14,
        color: '#999',
    },
    
    // 🚩 NEW/MODIFIED: Offer Card Styles
    offersCardWrapper: {
        // This acts as the single large card container for the scrolling offers
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
        paddingVertical: 15, // Padding for top/bottom inside the card
        overflow: 'hidden', // Ensures scroll view stays inside borders
        ...Platform.select({
            default: { marginHorizontal: 15 },
        }),
    },
    offersWebWrapper: {
        // This applies the horizontal padding needed for the Web Layout grid
        paddingHorizontal: 20, 
        marginBottom: 20,
        marginHorizontal: 0, // Override mobile margin in web wrapper
        
    },
    offerCardItem: {
        // Individual Card in the scroll view
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 0, // Reset individual card margin
        width: 300, // Fixed width for horizontal scroll
        flexShrink: 0,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    offersScrollContent: {
        paddingHorizontal: 15, // Initial padding left
        paddingRight: 30, // Extra padding right to see the end of the last card
        gap: 15,
    },
    offersHeaderPadding: { // New style to apply padding to the header container
        paddingHorizontal: 15, 
        marginBottom: 10, // Separates header from scroll content
    },
    // 🎯 MODIFIED: Added flexShrink to ensure price text yields space
    offerDetailText: {
        color: '#34c759', // Green color for offer text
        fontSize: 18,
        fontWeight: 'bold',
        flexShrink: 1, // Allow text to shrink if necessary
        marginRight: 10, // Small margin to separate from buttons
    },
    
    // 🚩 NEW: Single Add Offer Button Styles
    addOfferButton: {
        backgroundColor: '#FF9500', // Orange color
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    addOfferButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // 🚩 MODIFIED: Offer Action Buttons Styles (Optimized for mobile fit)
    offerActionButtons: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        flexShrink: 0, // Crucial: Ensures the button group doesn't shrink
    },
    editOfferButton: {
        backgroundColor: '#007AFF', // Blue for Edit
        paddingVertical: 5, // Reduced padding
        paddingHorizontal: 10, // Reduced padding
        borderRadius: 8,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    deleteOfferButton: {
        backgroundColor: '#FF3B30', // Red for Delete
        paddingVertical: 5, // Reduced padding
        paddingHorizontal: 10, // Reduced padding
        borderRadius: 8,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    offerActionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12, // Reduced font size for better fit
    },
    
    // --- NEW MODAL STYLES ---
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10001, 
        elevation: 100, // <--- ADD THIS for Android
    },
    modalContent: {
        width: Platform.OS === 'web' ? 450 : '90%',
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
    // 🚩 NEW IMAGE PICKER STYLES
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
        borderColor: '#34c759', // Green border when image is selected
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
    // --- END NEW MODAL STYLES ---

    // --- Order Reports Table Styles ---
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
    },
    table: {
        width: '100%',
        minWidth: 750,
        alignSelf: 'flex-start',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f9f9f9',
    },
    dataCol: {
        fontSize: 14,
        color: '#333',
        justifyContent: 'center',
        alignSelf: 'stretch',
        justifyContent: 'center',
        paddingRight: 5, 
    },
    colCheckbox: { width: 30, alignItems: 'flex-start' },
    colFood: { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 180 },
    colCustomer: { flex: 1.8, minWidth: 120 },
    colOrderDate: { flex: 1.2, minWidth: 100 },
    colPrice: { flex: 1, fontWeight: 'bold', minWidth: 80 },
    colStatus: { flex: 1, minWidth: 80 },
    
    foodImage: {
        width: 30,
        height: 30,
        borderRadius: 5,
    },
    foodText: {
        fontSize: 14,
        color: '#333',
        flexShrink: 1,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: '#ccc',
    },
    statusPending: {
        backgroundColor: '#ffdbd8',
        color: '#ff3b30',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    statusCompleted: {
        backgroundColor: '#d8f0e4',
        color: '#34c759',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    showMoreButton: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    showMoreButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    
    // --- Trending Orders Section Styles ---
    trendingSectionContainerWeb: {
        marginBottom: 20,
        paddingHorizontal: 20, 
        backgroundColor: '#f0f2f5',
    },
    trendingSectionContainerMobile: {
        marginBottom: 20,
        paddingHorizontal: 0, 
        backgroundColor: '#f5f5f5',
    },
    trendingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: Platform.OS === 'web' ? 0 : 15,
    },
    trendingSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    mobileSectionTitlePadding: {
         paddingHorizontal: 15,
    },
    viewAllButton: {
        backgroundColor: '#FF9500', 
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    viewAllButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    trendingCardScroll: {
        paddingHorizontal: Platform.OS === 'web' ? 0 : 15,
        gap: 20,
    },
    trendingCard: {
        width: 250, 
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 5,
    },
    trendingImage: {
        width: '100%',
        height: 150,
    },
    trendingDetails: {
        padding: 15,
    },
    trendingTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    trendingCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flexShrink: 1,
        marginRight: 10,
    },
    trendingCardPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF9500',
    },
    trendingCardDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    trendingInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    trendingSalesText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    trendingRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    trendingRatingIcon: {
        fontSize: 12,
    },
    trendingRatingText: {
        fontSize: 14,
        color: '#333',
    },
    trendingTag: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
    },
    trendingTagIcon: {
        fontSize: 12,
    },
    trendingTagText: {
        fontSize: 12,
        color: '#FF9500',
        fontWeight: 'bold',
    },

    // --- Copyright ---
    copyrightText: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    copyrightTextWeb: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginTop: 15,
        marginBottom: 10,
        paddingHorizontal: 20,
    }
});