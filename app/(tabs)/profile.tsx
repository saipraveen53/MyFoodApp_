import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  Modal, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl // Import RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SvgXml } from 'react-native-svg';
import CustomNavbar from '../../components/CustomNavbar';
import { rootApi, IMAGE_BASE_URL } from '../axiosInstance';

// --- SVG Markup for Guest View ---
const LOGIN_ILLUSTRATION = `
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
    <path fill="#FCFCFC" d="M305.832 150.378c1.72.706 2.86 4.783 4.294 6.169 1.434 1.387 3.516.24 1.35-2.967m-5.816 1.139c2.166 3.203.601 4.682-1.064 3.577-.736-.488-1.682-1.938-2.498-3.362a8.826 8.826 0 0 0-6.354-4.363c-5.169-.769-14.896-.966-30.633 3.178-25.653 6.749-41.848 6.135-46.462-19.819l17.487-4.476c.201.487 3.276 13.427 3.276 13.427s47.391-5.438 54.456-5.438c7.313 0 18.748 10.086 20.152 15.469.265 1.017.307 3.539-2.544.652-.753-.761-1.438-2.686-3.566-4.354m.719 5.106c2.166 3.202.656 4.597-1.064 3.572-1.632-.967-1.888-5.182-4.357-6.997"/><path stroke="#545454" stroke-miterlimit="10" stroke-width="1.92" d="M305.832 150.378c1.72.706 2.86 4.783 4.294 6.169 1.434 1.387 3.516.24 1.35-2.967m-5.816 1.139c2.166 3.203.601 4.682-1.064 3.577-.736-.488-1.682-1.938-2.498-3.362a8.826 8.826 0 0 0-6.354-4.363c-5.169-.769-14.896-.966-30.633 3.178-25.653 6.749-41.848 6.135-46.462-19.819l17.487-4.476c.201.487 3.276 13.427 3.276 13.427s47.391-5.438 54.456-5.438c7.313 0 18.748 10.086 20.152 15.469.265 1.017.307 3.539-2.544.652-.753-.761-1.438-2.686-3.566-4.354m.719 5.106c2.166 3.202.656 4.597-1.064 3.572-1.632-.967-1.888-5.182-4.357-6.997"/><path fill="#fff" d="M324.353 136.422c3.234.807 5.236 4.95 7.28 5.253 2.153.324 3.099-1.706-.421-4.043m2.561-1.929c3.507 2.333 1.888 4.354-.134 3.547-2.023-.807-4.854-4.446-6.876-4.446m7.01.899c3.507 2.333 1.888 4.354-.134 3.547-2.023-.807-4.854-4.446-6.876-4.446m1.619 4.446c3.503 2.337 2.523 4.467.42 4.043-.942-.189-2.523-1.261-3.898-2.341a9.632 9.632 0 0 0-8.205-1.778c-5.526 1.358-15.409 5.174-29.56 15.84-23.054 17.381-39.636 23.441-55.007-.807l15.774-11.725c.421.42 6.473 8.892 6.473 8.892s47.887-21.739 55.007-24.656c7.368-3.013 23.054 2.429 26.696 7.279.685.912 1.77 3.438-2.292 1.706-1.072-.458-2.561-2.101-5.391-2.921"/><path stroke="#545454" stroke-miterlimit="10" stroke-width="1.92" d="M324.353 136.422c3.234.807 5.236 4.95 7.28 5.253 2.153.324 3.099-1.706-.421-4.043m2.561-1.929c3.507 2.333 1.888 4.354-.134 3.547-2.023-.807-4.854-4.446-6.876-4.446m7.01.899c3.507 2.333 1.888 4.354-.134 3.547-2.023-.807-4.854-4.446-6.876-4.446m1.619 4.446c3.503 2.337 2.523 4.467.42 4.043-.942-.189-2.523-1.261-3.898-2.341a9.632 9.632 0 0 0-8.205-1.778c-5.526 1.358-15.409 5.174-29.56 15.84-23.054 17.381-39.636 23.441-55.007-.807l15.774-11.725c.421.42 6.473 8.892 6.473 8.892s47.887-21.739 55.007-24.656c7.368-3.013 23.054 2.429 26.696 7.279.685.912 1.77 3.438-2.292 1.706-1.072-.458-2.561-2.101-5.391-2.921"/><path fill="#FFBC85" d="M97.242 369.85h78.873V233.638H97.242V369.85Z"/><path fill="#E6F0FF" d="M133.754 253.999a3.917 3.917 0 1 0 0-7.833 3.919 3.919 0 0 0-3.92 3.917 3.918 3.918 0 0 0 3.92 3.916ZM110.528 260.685a3.916 3.916 0 0 0 0-5.539 3.922 3.922 0 0 0-5.543 0 3.914 3.914 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0ZM128.413 277.126a3.913 3.913 0 1 0 0-7.825 3.913 3.913 0 1 0 0 7.825ZM124.061 299.117a3.916 3.916 0 0 0 0-5.539 3.922 3.922 0 0 0-5.543 0 3.914 3.914 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0ZM118.363 325.095a3.914 3.914 0 0 0 0-5.539 3.92 3.92 0 0 0-5.543 0 3.916 3.916 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0ZM132.333 344.038a3.918 3.918 0 1 0 0-7.833 3.918 3.918 0 0 0-3.92 3.916 3.919 3.919 0 0 0 3.92 3.917ZM117.084 351.268c.824-2-.131-4.289-2.132-5.113a3.921 3.921 0 0 0-5.117 2.132 3.92 3.92 0 0 0 7.249 2.981ZM145.075 318.332a3.914 3.914 0 0 0 0-5.539 3.92 3.92 0 0 0-5.543 0 3.916 3.916 0 0 0 0 5.539 3.922 3.922 0 0 0 5.543 0ZM146.219 293.86a3.918 3.918 0 0 0 3.92-3.916 3.918 3.918 0 0 0-3.92-3.917 3.917 3.917 0 1 0 0 7.833ZM167.166 284.132a3.915 3.915 0 0 0 .633-5.503 3.922 3.922 0 0 0-5.507-.633 3.915 3.915 0 0 0-.633 5.503 3.922 3.922 0 0 0 5.507.633ZM167.17 312.602a3.915 3.915 0 0 0 .633-5.503 3.922 3.922 0 0 0-5.506-.633 3.915 3.915 0 0 0-.634 5.503 3.922 3.922 0 0 0 5.507.633ZM155.122 335.848a3.914 3.914 0 1 0-3.915-3.913 3.914 3.914 0 0 0 3.915 3.913ZM165.706 352.834a3.915 3.915 0 0 0 2.792-4.784 3.92 3.92 0 0 0-7.58 1.994 3.919 3.919 0 0 0 4.788 2.79ZM153.976 267.085a3.914 3.914 0 0 0 0-5.539 3.92 3.92 0 0 0-5.543 0 3.916 3.916 0 0 0 0 5.539 3.92 3.92 0 0 0 5.543 0Z"/><path stroke="#545454" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.92" d="M158.722 54.582s-22.247 15.764-33.976-10.926c-11.729-26.69 23.601 3.303-8.125 17.175-14.719 4.85-20.392-14.145-26.46-23.845-6.069-9.7-15.775-5.627-17.39 10.116-2.052 18.751-13.243 7.77-19.244.31-6.947-8.636-19.867-9.69-27.916-2.075l-.567.554M.404 169.974c14.719-4.849 20.392 14.146 26.456 23.846 6.065 9.699 15.775 5.66 17.394-10.087 2.052-18.751 13.243-7.77 19.244-.31 6.947 8.636 19.862 9.695 27.916 2.076.189-.181.378-.362.567-.551"/><path stroke="#545454" stroke-miterlimit="10" stroke-width="2.88" d="M437 370.052H.168"/><path fill="#545454" d="M161.766 97.153c15.847 6.073 29.691 7.804 38.413-1.546l17.797-23.446c-2.022 1.223-7.267-7.678-2.022-9.703 5.244-2.026 6.472 3.231 6.472 3.231 10.934 1.618 15.371-10.506 15.371-10.506 4.853 8.49 10.513 6.871 10.513 6.871-2.149-22.021-23.046-23.345-36.587-17.604a7.105 7.105 0 0 0 1.404-4.203c0-4.24-3.784-7.678-8.495-7.678-4.71 0-8.495 3.438-8.495 7.678s3.785 7.682 8.495 7.682c.349 0 .697-.02 1.043-.063-3.507 2.614-5.673 5.775-5.492 8.956.286 4.988-5.257 4.039-5.257 4.039-15.375-1.631-15.757 9.279-15.757 9.279-1.216 8.489-6.473 8.892-6.473 8.892-9.819 2.282-13.264 7.27-14.399 11.183a5.744 5.744 0 0 0 3.469 6.938Z"/><path fill="#545454" d="M225.635 95.607c.323-.034.664 8.06.786 11.254a2.909 2.909 0 0 0 1.001 2.102c3.701 3.231 17.242 15.675 23.971 30.123a2.939 2.939 0 0 1-.967 3.589l-18.778 13.448a2.947 2.947 0 0 1-1.627.551l-52.072 1.479a2.956 2.956 0 0 1-2.315-1.054 2.944 2.944 0 0 1-.629-2.464c2.204-10.678 9.732-42.42 24.602-60.432a2.8 2.8 0 0 0 .311-.462l1.716-3.185a2.945 2.945 0 0 1 3.966-1.198c4.437 2.383 13.747 6.846 20.035 6.25Z"/><path stroke="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="4.81" d="M201.798 98.839v8.19M221.265 106.979h-8.196M200.448 119.099l5.934-5.648M219.137 117.448l-.702 8.161M228.469 117.674l7.326 3.669M232.973 132.459l8.028-1.652M228.154 142.431l4.722 6.695M206.222 95.04l7.33 3.668M188.517 122.953l5.526 6.043M202.98 128.399l8.154-.807M211.778 134.556l6.737 4.66M187.508 135.77l6.737 4.661M182.083 140.473l-.21 8.186M198.207 149.16l-8.188-.29M214.217 151.992l-4.618-6.766"/><path fill="#545454" d="M218.582 65.265c-1.19 1.68-.496 3.274 1.224 4.131a.421.421 0 1 1-.375.719c-1.766-1.206-2.447-3.182-.841-4.85h-.008ZM233.953 83.075c-2.864-.126-5.631-1.98-6.308-4.841 0-.01.003-.018.01-.024a.031.031 0 0 1 .023-.01c.009 0 .018.004.024.01.007.006.01.015.01.024.753 2.731 3.491 4.446 6.249 4.455a.21.21 0 1 1 0 .42l-.008-.034Z"/><path stroke="#545454" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.85" d="M397.158 204.536a5.457 5.457 0 0 0 5.458-5.455 5.457 5.457 0 0 0-5.458-5.455 5.457 5.457 0 0 0-5.459 5.455 5.457 5.457 0 0 0 5.459 5.455ZM30.3 19.416a5.457 5.457 0 0 0 5.459-5.455A5.457 5.457 0 0 0 30.3 8.506a5.457 5.457 0 0 0-5.458 5.455 5.457 5.457 0 0 0 5.458 5.455Z"/><path fill="#545454" d="M227.481 86.215s-5.257-.106-8.495-3.341c0 0 6.068 2.02 8.697 1.45l-.202 1.89Z"/><path fill="#FDBF8C" d="M309.016 1.26c6.205 0 12.27 1.838 17.43 5.282a31.337 31.337 0 0 1 4.762 48.234 31.393 31.393 0 0 1-34.187 6.803 31.37 31.37 0 0 1-14.082-11.543 31.342 31.342 0 0 1-5.292-17.416 31.376 31.376 0 0 1 9.199-22.154 31.418 31.418 0 0 1 22.17-9.193m0-1.26a32.65 32.65 0 0 0-18.131 5.496 32.617 32.617 0 0 0-12.02 14.636 32.585 32.585 0 0 0-1.856 18.843 32.61 32.61 0 0 0 8.932 16.697 32.645 32.645 0 0 0 35.566 7.067 32.628 32.628 0 0 0 14.645-12.013 32.589 32.589 0 0 0 3.014-30.598A32.63 32.63 0 0 0 309.016.013Z"/><path stroke="#FDBF8C" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M309.02 9.094v23.517M320.564 44.143 309.02 32.611"/><path fill="#545454" d="M311.459 32.62a2.44 2.44 0 0 1-1.505 2.259 2.445 2.445 0 0 1-3.334-1.777 2.435 2.435 0 0 1 1.038-2.508 2.444 2.444 0 0 1 3.801 2.026Z"/>
  </g>
  <defs>
    <clipPath id="a">
      <path fill="#fff" d="M0 0h437v370.657H0z"/>
    </clipPath>
  </defs>
</svg>
`;

// --- HELPER COMPONENT 1: Profile Field Card ---
const ProfileFieldCard = ({ icon, label, value, buttonText, onPress }: { icon: any, label: string, value: string, buttonText: string, onPress?: () => void }) => (
  <View style={styles.fieldCard}>
      <View style={styles.fieldLeft}>
          <View style={styles.labelRow}>
             <Ionicons name={icon} size={18} color="#ff6b35" style={styles.fieldIcon} />
             <Text style={styles.fieldLabel}>{label}</Text>
          </View>
          <Text style={styles.fieldValue}>{value}</Text>
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={styles.actionBtnText}>{buttonText}</Text>
      </TouchableOpacity>
  </View>
);

// --- HELPER COMPONENT 2: Order History Card ---
const OrderHistoryCard = ({ order }: { order: any }) => {
    const statusColor = order.orderStatus === 'DELIVERED' ? '#16a34a' : (order.orderStatus === 'CANCELLED' ? '#dc2626' : '#ff6b35');
    
    return (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <Text style={styles.orderDate}>{new Date(order.orderDate).toDateString()} {new Date(order.orderDate).toLocaleTimeString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                     <Text style={[styles.statusText, { color: statusColor }]}>{order.orderStatus}</Text>
                </View>
            </View>
            
            <View style={styles.cardDivider} />
            
            <View style={styles.orderItemsContainer}>
                {order.items.map((item: any) => (
                    <View key={item.id} style={styles.orderItemRow}>
                        <Image 
                            source={{ uri: item.menuItem.imageUrl.startsWith('http') 
                                ? item.menuItem.imageUrl 
                                : `${IMAGE_BASE_URL}${item.menuItem.imageUrl}` 
                            }}
                            style={styles.orderItemImage}
                        />
                        <View style={styles.orderItemDetails}>
                            <Text style={styles.orderItemName} numberOfLines={1}>{item.menuItem.name}</Text>
                            <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                        </View>
                        <Text style={styles.orderItemPrice}>${item.price}</Text>
                    </View>
                ))}
            </View>
            
            <View style={styles.cardDivider} />
            
            <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>${order.totalAmount}</Text>
            </View>
        </View>
    );
};

// --- HELPER COMPONENT 3: Saved Address Card ---
const SavedAddressCard = ({ address, onDelete, onSetDefault }: { address: any, onDelete: (id: number) => void, onSetDefault: (id: number) => void }) => (
    <View style={styles.addressCard}>
        <View style={styles.addrCardHeader}>
            <View style={styles.addrTypeWrapper}>
                <Ionicons name={address.default ? "home" : "location-outline"} size={18} color="#ff6b35" />
                <Text style={styles.addrTitle} numberOfLines={1}>{address.recipentName}</Text>
                {address.default && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                    </View>
                )}
            </View>
            <View style={styles.actionIcons}>
                {!address.default && (
                    <TouchableOpacity onPress={() => onSetDefault(address.id)} style={styles.setDefaultBtn}>
                        <Text style={styles.setDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => onDelete(address.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
                </TouchableOpacity>
            </View>
        </View>
        
        <Text style={styles.addrText}>
            {address.street}, {address.city}, {address.state} - {address.zipcode}, {address.country}
        </Text>
    </View>
);

// --- HELPER COMPONENT 4: Footer Accordion Menu ---
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

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Change Profile');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Name Edit State
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]); 
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipentName: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: ''
  });

  const fetchProfileData = async () => {
    try {
      const response = await rootApi.get('/user/myProfile');
      if (response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const onRefresh = async () => {
      setRefreshing(true);
      if (isAuthenticated) {
          await fetchProfileData();
          // Refresh other tabs data if needed based on active tab
          if (activeTab === 'My Order') fetchOrders();
          if (activeTab === 'Saved Address') fetchAddresses();
      }
      setRefreshing(false);
  };

  // Check Auth Status & Fetch Profile Data
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          const value = await AsyncStorage.getItem('isAuthenticated');
          const isAuth = value === 'true';
          setIsAuthenticated(isAuth);

          if (isAuth) {
             await fetchProfileData();
          } else {
            setUserData(null);
          }
        } catch (e) {
          console.error("Auth check failed", e);
        } finally {
          setIsLoading(false);
        }
      };
      init();
    }, [])
  );

  // Fetch Orders when activeTab is 'My Order'
  useEffect(() => {
    if (activeTab === 'My Order' && isAuthenticated) {
        fetchOrders();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch Addresses when activeTab is 'Saved Address'
  useEffect(() => {
    if (activeTab === 'Saved Address' && isAuthenticated) {
        fetchAddresses();
    }
  }, [activeTab, isAuthenticated]);

  const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
          const response = await rootApi.get('/order/myHistory');
          if (response.data) {
              setOrders(response.data);
          }
      } catch (error) {
          console.error("Failed to fetch orders:", error);
      } finally {
          setLoadingOrders(false);
      }
  };

  const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
          const response = await rootApi.get('address/getAllAddresess');
          if (response.data) {
              setAddresses(response.data);
          }
      } catch (error) {
          console.error("Failed to fetch addresses:", error);
      } finally {
          setLoadingAddresses(false);
      }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
       Alert.alert("Error", "Name cannot be empty");
       return;
    }

    try {
      const response = await rootApi.put('/user/updateProfile', {
        name: newName
      });

      if (response.status === 200 || response.status === 201) {
         Alert.alert("Success", "Name updated successfully");
         setEditNameModalVisible(false);
         fetchProfileData(); // Refresh profile data
      }
    } catch (error) {
      console.error("Failed to update name", error);
      Alert.alert("Error", "Failed to update name");
    }
  };

  const handleAddAddress = async () => {
    // Basic validation
    if (!newAddress.recipentName || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipcode || !newAddress.country) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await rootApi.post('address/add', newAddress);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Address added successfully");
        setModalVisible(false);
        setNewAddress({ recipentName: '', street: '', city: '', state: '', zipcode: '', country: '' }); // Reset
        fetchAddresses(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to add address", error);
      Alert.alert("Error", "Failed to add address");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await rootApi.delete(`address/delete/${id}`);
              Alert.alert("Success", "Address deleted");
              fetchAddresses(); // Refresh list
            } catch (error) {
              console.error("Failed to delete address", error);
              Alert.alert("Error", "Failed to delete address");
            }
          }
        }
      ]
    );
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
        await rootApi.put(`address/setDefault/${id}`);
        Alert.alert("Success", "Default address updated");
        fetchAddresses(); // Refresh list to show updated default status
    } catch (error) {
        console.error("Failed to set default address", error);
        Alert.alert("Error", "Failed to set default address");
    }
  };

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear(); 
              router.replace('/login');  
            } catch (error) {
              console.error("Logout failed", error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Top Navbar */}
      <CustomNavbar />
      
      <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff6b35']} tintColor="#ff6b35" />
          }
      >
        
        {/* 2. Header Section (Dark Background) */}
        <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Profile</Text>
            <View style={styles.breadcrumb}>
                <Ionicons name="home-outline" size={14} color="#ccc" />
                <Text style={styles.breadcrumbText}> Home / <Text style={styles.activeBreadcrumb}>Profile</Text></Text>
            </View>
        </View>

        {/* CONTENT STARTS HERE: Check Auth */}
        {!isLoading && (
           isAuthenticated ? (
             // --- LOGGED IN USER VIEW ---
             <>
                {/* 3. Profile Card Wrapper */}
                <View style={styles.profileCardWrapper}>
                    <View style={styles.profileCard}>
                        
                        {/* Banner & Avatar */}
                        <View style={styles.cardBanner} />
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={require('../../assets/images/p5.png')} 
                                style={styles.avatar} 
                            />
                        </View>

                        {/* User Info */}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{userData?.name || 'Loading...'}</Text>
                            <Text style={styles.userEmail}>{userData?.email || 'Loading...'}</Text>
                        </View>

                        {/* Tabs Navigation */}
                        <View style={styles.tabsContainer}>
                            {['Change Profile', 'My Order', 'Saved Address'].map((tab) => (
                                <TouchableOpacity 
                                    key={tab}
                                    style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Ionicons 
                                        name={tab === 'Change Profile' ? "person-outline" : tab === 'My Order' ? "receipt-outline" : "location-outline"} 
                                        size={18} 
                                        color={activeTab === tab ? "#ff6b35" : "#666"} 
                                    />
                                    <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>{tab}</Text>
                                    {activeTab === tab && <View style={styles.activeUnderline} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* 4. Main Content Section */}
                <View style={styles.contentSection}>
                  
                  {/* --- TAB 1: Change Profile --- */}
                  {activeTab === 'Change Profile' && (
                      <View style={styles.changeProfileContainer}>
                          <Text style={styles.sectionHeading}>Change Profile</Text>
                          
                          <ProfileFieldCard 
                            icon="person" 
                            label="Name :" 
                            value={userData?.name || 'Loading...'} 
                            buttonText="Edit" 
                            onPress={() => {
                                setNewName(userData?.name || '');
                                setEditNameModalVisible(true);
                            }}
                          />
                          <ProfileFieldCard 
                            icon="mail" 
                            label="Email :" 
                            value={userData?.email || 'Loading...'} 
                            buttonText="Change" 
                          />
                          <ProfileFieldCard 
                            icon="call" 
                            label="Phone Number :" 
                            value={userData?.phone || 'Not provided'} 
                            buttonText="Change" 
                          />
                          
                          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                              <Ionicons name="log-out-outline" size={20} color="#fff" style={{marginRight: 8}} />
                              <Text style={styles.logoutButtonText}>Log Out</Text>
                          </TouchableOpacity>
                      </View>
                  )}

                  {/* --- TAB 2: My Order --- */}
                  {activeTab === 'My Order' && (
                      <View style={styles.ordersContainer}>
                          <Text style={styles.sectionHeading}>My Orders</Text>
                          {loadingOrders ? (
                              <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 20 }} />
                          ) : (
                              orders.length > 0 ? (
                                  orders.map((order) => (
                                      <OrderHistoryCard key={order.id} order={order} />
                                  ))
                              ) : (
                                  <View style={styles.placeholderContainer}>
                                      <Text style={styles.placeholderText}>No orders found.</Text>
                                  </View>
                              )
                          )}
                      </View>
                  )}

                  {/* --- TAB 3: Saved Address --- */}
                  {activeTab === 'Saved Address' && (
                      <View style={styles.ordersContainer}>
                          <View style={styles.addressHeaderRow}>
                            <Text style={styles.sectionHeading}>Saved Addresses</Text>
                            <TouchableOpacity 
                              style={styles.addNewBtn} 
                              onPress={() => setModalVisible(true)}
                            >
                              <Text style={styles.addNewBtnText}>+ Add New</Text>
                            </TouchableOpacity>
                          </View>

                          {loadingAddresses ? (
                              <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 20 }} />
                          ) : (
                              addresses.length > 0 ? (
                                  addresses.map((addr) => (
                                      <SavedAddressCard 
                                          key={addr.id} 
                                          address={addr} 
                                          onDelete={handleDeleteAddress} 
                                          onSetDefault={handleSetDefaultAddress}
                                      />
                                  ))
                              ) : (
                                  <View style={styles.placeholderContainer}>
                                      <Text style={styles.placeholderText}>No saved addresses found.</Text>
                                  </View>
                              )
                          )}
                      </View>
                  )}

                </View>
             </>
           ) : (
             // --- GUEST USER VIEW ---
             <View style={styles.guestContent}>
                {/* Guest Card / Container */}
                <View style={styles.guestCard}>
                    <View style={styles.illustrationContainer}>
                      <SvgXml xml={LOGIN_ILLUSTRATION} width="100%" height={250} />
                    </View>

                    <View style={styles.bottomSection}>
                      <Text style={styles.bottomTitle}>Login Required</Text>
                      <Text style={styles.bottomDesc}>
                        Please log in to access your profile, manage orders, and save addresses.
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
             </View>
           )
        )}

        {/* 5. Footer Section */}
        <View style={styles.footerContainer}>
            
            {/* Brand & Description */}
            <View style={styles.footerBrandSection}>
                <Text style={styles.footerLogoText}>ZOMO<Text style={styles.footerLogoDot}>.</Text></Text>
                <Text style={styles.footerDesc}>
                    Welcome to our online order website! Here, you can browse our wide selection of products and place orders from the comfort of your own home.
                </Text>
                
                {/* Social Icons */}
                <View style={styles.socialRow}>
                    {['logo-facebook', 'logo-twitter', 'logo-linkedin', 'logo-instagram', 'logo-youtube'].map((icon, index) => (
                        <TouchableOpacity key={index} style={styles.socialIconBtn}>
                            <Ionicons name={icon as any} size={14} color="#fff" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Accordion Menus */}
            <View style={styles.footerLinksContainer}>
                <FooterAccordion title="Company" />
                <FooterAccordion title="Account" />
                <FooterAccordion title="Useful links" />
                <FooterAccordion title="Top Brands" />
            </View>

            {/* Copyright & Payment Icons Section */}
            <View style={styles.copyrightSection}>
                <View style={styles.divider} />
                
                <Text style={styles.copyrightText}>@ Copyright 2024 ZOMO. All rights Reserved.</Text>
                
                <Image 
                    source={require('../../assets/images/footer-card.png')} 
                    style={styles.paymentImage}
                    resizeMode="contain"
                />
            </View>

        </View>

      </ScrollView>

      {/* --- ADD ADDRESS MODAL --- */}
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

      {/* --- EDIT NAME MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editNameModalVisible}
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Update Name</Text>
               <TouchableOpacity onPress={() => setEditNameModalVisible(false)}>
                 <Ionicons name="close" size={24} color="#333" />
               </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
               <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="Enter your name"
                    value={newName}
                    onChangeText={setNewName}
                  />
               </View>

               <TouchableOpacity style={styles.saveAddrBtn} onPress={handleUpdateName}>
                  <Text style={styles.saveAddrBtnText}>Update</Text>
               </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#191919', 
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // --- Header Styles ---
  headerSection: {
    backgroundColor: '#191919',
    paddingVertical: 40,
    alignItems: 'center',
    paddingBottom: 90, 
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  breadcrumbText: {
    color: '#ccc',
    fontSize: 14,
  },
  activeBreadcrumb: {
    color: '#ff6b35',
    fontWeight: '600',
  },

  // --- Profile Card Styles ---
  profileCardWrapper: {
    alignItems: 'center',
    marginTop: -50, 
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBanner: {
    height: 110,
    backgroundColor: '#ffcaaa',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginTop: -55,
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 70,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#eee', 
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },

  // --- Tab Styles ---
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 10,
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: 13,
    color: '#ff6b35',
    fontWeight: 'bold',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff6b35',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // --- Content Section Styles ---
  contentSection: {
    paddingHorizontal: 20,
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  changeProfileContainer: {
    gap: 15,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  
  // Field Card Styles
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  fieldLeft: {
    flex: 1,
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldIcon: {
    width: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  fieldValue: {
    fontSize: 14,
    color: '#666',
    paddingLeft: 28,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff6b35',
    backgroundColor: '#fff',
  },
  actionBtnText: {
    color: '#ff6b35',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Logout Button Style
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4d4d', 
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Placeholder
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },

  // --- Orders Styles ---
  ordersContainer: {
    gap: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  orderItemsContainer: {
    gap: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  orderItemQty: {
    fontSize: 12,
    color: '#777',
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  // --- Address Styles ---
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addNewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff6b35',
    borderRadius: 20,
  },
  addNewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addressCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#eee',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
      marginBottom: 10,
  },
  addrCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
  },
  addrTypeWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  addrTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      flexShrink: 1,
  },
  defaultBadge: {
      backgroundColor: '#e6f4ea',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
  },
  defaultText: {
      color: '#1e8e3e',
      fontSize: 10,
      fontWeight: '600',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Fallback gap
    marginLeft: 10,
  },
  setDefaultBtn: {
    borderWidth: 1,
    borderColor: '#ff6b35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10, // Ensuring spacing on Android
  },
  setDefaultText: {
    fontSize: 10,
    color: '#ff6b35',
    fontWeight: '600',
  },
  addrText: {
      fontSize: 14,
      color: '#555',
      lineHeight: 20,
  },

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

  // --- GUEST CONTENT STYLES ---
  guestContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: -50, 
    marginBottom: 30,
  },
  guestCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  illustrationContainer: { 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 30 
  },
  bottomSection: { 
    alignItems: 'center', 
    width: '100%', 
    maxWidth: 400,
    paddingHorizontal: 20
  },
  bottomTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 10 
  },
  bottomDesc: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    lineHeight: 20, 
    marginBottom: 30, 
  },
  authButtonsRow: { 
    flexDirection: 'row', 
    gap: 20 
  },
  outlineButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    borderWidth: 1, 
    borderColor: '#ff6b35', 
    backgroundColor: '#fff', 
    minWidth: 120, 
    alignItems: 'center' 
  },
  outlineButtonText: { 
    color: '#ff6b35', 
    fontWeight: 'bold', 
    fontSize: 14 
  },

  // --- Footer Styles ---
  footerContainer: {
    backgroundColor: '#212121',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 20,
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
  
  // Accordion Styles
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

  // --- Copyright Section Styles ---
  copyrightSection: {
    paddingTop: 20,
    gap: 15,
  },
  divider: {
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