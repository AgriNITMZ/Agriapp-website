import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import customFetch from '../../utils/axios';
import { Package, ShoppingCart, AlertCircle, TrendingUp, ChevronRight, BarChart3 } from 'lucide-react-native';
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
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
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
                    <View style={styles.revenueCard}>
                        <View style={styles.revenueGradient}>
                            <View style={styles.revenueContent}>
                                <View style={styles.revenueTopSection}>
                                    <View style={styles.revenueIconContainer}>
                                        <BarChart3 size={32} color="#fff" strokeWidth={2.5} />
                                    </View>
                                    <View style={styles.revenueBadge}>
                                        <Text style={styles.revenueBadgeText}>Cumulative Revenue Generated</Text>
                                    </View>
                                </View>
                                <View style={styles.revenueBottomSection}>
                                    <Text style={styles.revenueValue}>₹{analytics?.totalRevenue || 0}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

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
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    revenueCard: {
        margin: 16,
        marginTop: 16,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        overflow: 'hidden',
    },
    revenueGradient: {
        backgroundColor: '#2E7D32',
        borderRadius: 20,
    },
    revenueContent: {
        padding: 24,
    },
    revenueTopSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    revenueIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    revenueBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    revenueBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    revenueBottomSection: {
        alignItems: 'flex-start',
    },
    revenueLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    revenueValue: {
        fontSize: 42,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    revenueSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.75)',
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    quickStatsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    quickStatCard: {
        width: '48%',
    },
    statCardInner: {
        elevation: 4,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    quickStatContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    quickStatValue: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 12,
        color: '#1A1A1A',
    },
    quickStatLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 6,
        textAlign: 'center',
        fontWeight: '500',
    },
    manageOrdersCard: {
        margin: 16,
        marginTop: 0,
        elevation: 4,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    manageOrdersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    manageOrdersTitle: {
        fontSize: 19,
        fontWeight: '700',
        marginLeft: 12,
        color: '#1A1A1A',
    },
    orderStatusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    orderStatusItem: {
        width: '31%',
        alignItems: 'center',
        marginBottom: 24,
    },
    orderStatusBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    orderStatusValue: {
        fontSize: 26,
        fontWeight: '700',
    },
    orderStatusLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
    alertCard: {
        margin: 16,
        backgroundColor: '#FFF4E6',
        elevation: 3,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    alertTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginLeft: 10,
        color: '#DC2626',
    },
    alertItem: {
        marginVertical: 8,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
    },
    alertItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    alertText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
        fontWeight: '500',
    },
    stockBadge: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    stockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    analyticsCard: {
        margin: 16,
        marginTop: 0,
        elevation: 4,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    analyticsTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    analyticsSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
});

export default SellerDashboard;
