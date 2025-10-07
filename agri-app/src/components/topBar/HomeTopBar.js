// frontend/components/TopBar.js
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { useNotificationCount } from './useNotificationCount'; // ADD THIS LINE

const TopBar = ({ navigation }) => {
    const { cartSize } = useContext(CartContext);
    const { notificationCount } = useNotificationCount(); // ADD THIS LINE
    
    return (
        <View style={styles.topBar}>
            {/* Drawer Button */}
            <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>
            
            {/* App Title: PreciAgri with two colors */}
            <Text style={styles.appTitle}>
                <Text style={{ color: '#4A90E2' }}>Preci</Text>
                <Text style={{ color: '#4CAF50' }}>Agri</Text>
            </Text>
            
            {/* Action Icons */}
            <View style={styles.icons}>
                <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => navigation.navigate('Shop', { focusInput: true })}>
                    <Ionicons name="search" size={28} color="#333" />
                </TouchableOpacity>
                
                {/* Notification Icon with Badge */}
                <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => navigation.navigate('Notification')}>
                    <View>
                        <Ionicons name="notifications" size={28} color="#333" />
                        {notificationCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => navigation.navigate('Wishlist')}>
                    <Ionicons name="heart" size={28} color="#333" />
                </TouchableOpacity>
                
                {/* Cart Icon with Badge */}
                <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => navigation.navigate('Cart')}>
                    <View>
                        <Ionicons name="cart" size={28} color="#333" />
                        {cartSize() > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartSize()}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TopBar;

const styles = {
    topBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#FFFFFF',
    },
    appTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        flexDirection: 'row',
        marginLeft: -40,
    },
    icons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        right: -3,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 10,
        minWidth: 16,              // CHANGED from width: 16
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        paddingHorizontal: 3,      // ADDED for 2-digit numbers
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
};