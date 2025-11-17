import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import customFetch from '../../utils/axios';
import { Package, ShoppingCart, DollarSign, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react-native';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const SellerDashboard = ({ navigation }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        try {
            const response = await customFetch.get('/analytics/seller-dashboard');
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchAnalytics();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <>
            <SellerTopBar navigation={navigation} title="Dashboard" showSearch={true} />
            <View style={styles.container}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Total Revenue Card */}
                    <Card style={styles.revenueCard}>
                        <Card.Content>
                            <View style={styles.revenueHeader}>
                                <DollarSign size={40} color="#4CAF50" />
                                <View style={styles.revenueInfo}>
                                    <Text style={styles.revenueLabel}>Total Revenue</Text>
                                    <Text style={styles.revenueValue}>₹{analytics?.totalRevenue || 0}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Quick Stats */}
                    <View style={styles.quickStatsContainer}>
                        <TouchableOpacity 
                            style={styles.quickStatCard}
                            onPress={() => navigation.navigate('SellerProducts')}
                        >
                            <Card style={styles.statCardInner}>
                                <Card.Content style={styles.quickStatContent}>
                                    <Package size={24} color="#4CAF50" />
                                    <Text style={styles.quickStatValue}>{analytics?.totalProducts || 0}</Text>
                                    <Text style={styles.quickStatLabel}>Products</Text>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.quickStatCard}
                            onPress={() => navigation.navigate('SellerOrders')}
                        >
                            <Card style={styles.statCardInner}>
                                <Card.Content style={styles.quickStatContent}>
                                    <ShoppingCart size={24} color="#2196F3" />
                                    <Text style={styles.quickStatValue}>{analytics?.totalOrders || 0}</Text>
                                    <Text style={styles.quickStatLabel}>Orders</Text>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    </View>

                    {/* Manage Orders Section */}
                    <Card style={styles.manageOrdersCard}>
                        <Card.Content>
                            <View style={styles.manageOrdersHeader}>
                                <ShoppingCart size={24} color="#333" />
                                <Text style={styles.manageOrdersTitle}>Manage Orders</Text>
                            </View>
                            
                            <View style={styles.orderStatusGrid}>
                                <TouchableOpacity 
                                    style={styles.orderStatusItem}
                                    onPress={() => navigation.navigate('SellerOrders')}
                                >
                                    <View style={[styles.orderStatusBadge, { backgroundColor: '#E3F2FD' }]}>
                                        <Text style={[styles.orderStatusValue, { color: '#2196F3' }]}>
                                            {analytics?.totalOrders || 0}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderStatusLabel}>Total Orders</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.orderStatusItem}
                                    onPress={() => navigation.navigate('SellerOrders', { filter: 'Pending' })}
                                >
                                    <View style={[styles.orderStatusBadge, { backgroundColor: '#FFF3E0' }]}>
                                        <Text style={[styles.orderStatusValue, { color: '#FF9800' }]}>
                                            {analytics?.pendingOrders || 0}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderStatusLabel}>Pending</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.orderStatusItem}
                                    onPress={() => navigation.navigate('SellerOrders', { filter: 'Processing' })}
                                >
                                    <View style={[styles.orderStatusBadge, { backgroundColor: '#E8F5E9' }]}>
                                        <Text style={[styles.orderStatusValue, { color: '#4CAF50' }]}>
                                            {analytics?.processingOrders || 0}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderStatusLabel}>Processing</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.orderStatusItem}
                                    onPress={() => navigation.navigate('SellerOrders', { filter: 'Shipped' })}
                                >
                                    <View style={[styles.orderStatusBadge, { backgroundColor: '#F3E5F5' }]}>
                                        <Text style={[styles.orderStatusValue, { color: '#9C27B0' }]}>
                                            {analytics?.shippedOrders || 0}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderStatusLabel}>Shipped</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.orderStatusItem}
                                    onPress={() => navigation.navigate('SellerOrders', { filter: 'Delivered' })}
                                >
                                    <View style={[styles.orderStatusBadge, { backgroundColor: '#E8F5E9' }]}>
                                        <Text style={[styles.orderStatusValue, { color: '#388E3C' }]}>
                                            {analytics?.deliveredOrders || 0}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderStatusLabel}>Delivered</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.orderStatusItem}
                                    onPress={() => navigation.navigate('SellerOrders', { filter: 'Cancelled' })}
                                >
                                    <View style={[styles.orderStatusBadge, { backgroundColor: '#FFEBEE' }]}>
                                        <Text style={[styles.orderStatusValue, { color: '#F44336' }]}>
                                            {analytics?.cancelledOrders || 0}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderStatusLabel}>Cancelled</Text>
                                </TouchableOpacity>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Low Stock Alert */}
                    {analytics?.lowStockProducts?.length > 0 && (
                        <Card style={styles.alertCard}>
                            <Card.Content>
                                <View style={styles.alertHeader}>
                                    <AlertCircle size={20} color="#f44336" />
                                    <Text style={styles.alertTitle}>Low Stock Alert</Text>
                                </View>
                                {analytics.lowStockProducts.map((product, index) => (
                                    <TouchableOpacity 
                                        key={index}
                                        style={styles.alertItem}
                                        onPress={() => navigation.navigate('SellerProducts', { lowStockOnly: true })}
                                    >
                                        <View style={styles.alertItemContent}>
                                            <Text style={styles.alertText}>
                                                • {product.name} - Size: {product.size}
                                            </Text>
                                            <View style={styles.stockBadge}>
                                                <Text style={styles.stockText}>{product.stock} left</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </Card.Content>
                        </Card>
                    )}

                    {/* Sales Analytics Card */}
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('SalesAnalytics')}
                    >
                        <Card style={styles.analyticsCard}>
                            <Card.Content>
                                <View style={styles.analyticsHeader}>
                                    <View style={styles.analyticsLeft}>
                                        <View style={styles.analyticsIconContainer}>
                                            <TrendingUp size={24} color="#4CAF50" />
                                        </View>
                                        <View>
                                            <Text style={styles.analyticsTitle}>Sales Analytics</Text>
                                            <Text style={styles.analyticsSubtitle}>View detailed sales reports</Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={24} color="#999" />
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>

                </ScrollView>
                <SellerFooterNavigation navigation={navigation} activePage="Dashboard" />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        paddingBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    revenueCard: {
        margin: 15,
        marginTop: 15,
        elevation: 4,
        backgroundColor: '#fff',
    },
    revenueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    revenueInfo: {
        marginLeft: 20,
        flex: 1,
    },
    revenueLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    revenueValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    quickStatsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    quickStatCard: {
        width: '48%',
    },
    statCardInner: {
        elevation: 2,
    },
    quickStatContent: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        color: '#333',
    },
    quickStatLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    manageOrdersCard: {
        margin: 15,
        marginTop: 0,
        elevation: 3,
    },
    manageOrdersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    manageOrdersTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',
    },
    orderStatusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    orderStatusItem: {
        width: '31%',
        alignItems: 'center',
        marginBottom: 20,
    },
    orderStatusBadge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderStatusValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    orderStatusLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    alertCard: {
        margin: 15,
        backgroundColor: '#fff3e0',
        elevation: 2,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#f44336',
    },
    alertItem: {
        marginVertical: 6,
    },
    alertItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alertText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    stockBadge: {
        backgroundColor: '#f44336',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    analyticsCard: {
        margin: 15,
        marginTop: 0,
        elevation: 2,
        backgroundColor: '#fff',
    },
    analyticsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    analyticsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    analyticsIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    analyticsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    analyticsSubtitle: {
        fontSize: 13,
        color: '#666',
    },
});

export default SellerDashboard;
