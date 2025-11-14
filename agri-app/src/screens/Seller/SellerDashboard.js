import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import customFetch from '../../utils/axios';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from 'lucide-react-native';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const screenWidth = Dimensions.get('window').width;

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

    const chartData = {
        labels: analytics?.salesTrend?.map(item => item.label) || [],
        datasets: [{
            data: analytics?.salesTrend?.map(item => item.value) || [0]
        }]
    };

    return (
        <>
            <SellerTopBar navigation={navigation} title="Dashboard" />
            <View style={styles.container}>
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Stats Cards */}
                    <View style={styles.statsContainer}>
                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={() => navigation.navigate('SellerProducts')}
                        >
                            <Card style={styles.statCardInner}>
                                <Card.Content style={styles.statContent}>
                                    <Package size={24} color="#4CAF50" />
                                    <Text style={styles.statValue}>{analytics?.totalProducts || 0}</Text>
                                    <Text style={styles.statLabel}>Total Products</Text>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={() => navigation.navigate('SellerOrders')}
                        >
                            <Card style={styles.statCardInner}>
                                <Card.Content style={styles.statContent}>
                                    <ShoppingCart size={24} color="#2196F3" />
                                    <Text style={styles.statValue}>{analytics?.totalOrders || 0}</Text>
                                    <Text style={styles.statLabel}>Total Orders</Text>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <DollarSign size={24} color="#FF9800" />
                                <Text style={styles.statValue}>₹{analytics?.totalRevenue || 0}</Text>
                                <Text style={styles.statLabel}>Total Revenue</Text>
                            </Card.Content>
                        </Card>

                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={() => navigation.navigate('SellerOrders')}
                        >
                            <Card style={styles.statCardInner}>
                                <Card.Content style={styles.statContent}>
                                    <TrendingUp size={24} color="#9C27B0" />
                                    <Text style={styles.statValue}>{analytics?.pendingOrders || 0}</Text>
                                    <Text style={styles.statLabel}>Pending Orders</Text>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    </View>

                    {/* Low Stock Alert */}
                    {analytics?.lowStockProducts?.length > 0 && (
                        <Card style={styles.alertCard}>
                            <Card.Content>
                                <View style={styles.alertHeader}>
                                    <AlertCircle size={20} color="#f44336" />
                                    <Text style={styles.alertTitle}>Low Stock Alert</Text>
                                </View>
                                {analytics.lowStockProducts.map((product, index) => (
                                    <Text key={index} style={styles.alertText}>
                                        • {product.name} - Only {product.stock} left
                                    </Text>
                                ))}
                            </Card.Content>
                        </Card>
                    )}

                    {/* Sales Trend Chart */}
                    {analytics?.salesTrend?.length > 0 && (
                        <Card style={styles.chartCard}>
                            <Card.Content>
                                <Text style={styles.chartTitle}>Sales Trend (Last 7 Days)</Text>
                                <LineChart
                                    data={chartData}
                                    width={screenWidth - 60}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: '#fff',
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: { borderRadius: 16 },
                                        propsForDots: {
                                            r: '6',
                                            strokeWidth: '2',
                                            stroke: '#4CAF50'
                                        }
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            </Card.Content>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('SellerProducts')}
                        >
                            <Package size={24} color="#fff" />
                            <Text style={styles.actionText}>Manage Products</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('SellerOrders')}
                        >
                            <ShoppingCart size={24} color="#fff" />
                            <Text style={styles.actionText}>View Orders</Text>
                        </TouchableOpacity>
                    </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        marginBottom: 15,
    },
    statCardInner: {
        elevation: 2,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    alertCard: {
        margin: 15,
        backgroundColor: '#fff3e0',
        elevation: 2,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#f44336',
    },
    alertText: {
        fontSize: 14,
        color: '#666',
        marginVertical: 2,
    },
    chartCard: {
        margin: 15,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        elevation: 3,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
    },
});

export default SellerDashboard;
