import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import customFetch from '../../utils/axios';
import { TrendingUp, DollarSign, ShoppingBag } from 'lucide-react-native';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const screenWidth = Dimensions.get('window').width;
const SalesAnalytics = ({ navigation }) => {
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
                <Text>Loading Analytics...</Text>
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
            <SellerTopBar navigation={navigation} title="Sales Analytics" />
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Revenue Summary */}
                    <Card style={styles.revenueCard}>
                        <Card.Content>
                            <View style={styles.revenueHeader}>
                                <DollarSign size={32} color="#4CAF50" />
                                <View style={styles.revenueInfo}>
                                    <Text style={styles.revenueLabel}>Total Revenue</Text>
                                    <Text style={styles.revenueValue}>₹{analytics?.totalRevenue || 0}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Sales Stats */}
                    <View style={styles.statsContainer}>
                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <ShoppingBag size={24} color="#2196F3" />
                                <Text style={styles.statValue}>{analytics?.deliveredOrders || 0}</Text>
                                <Text style={styles.statLabel}>Completed Sales</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <TrendingUp size={24} color="#FF9800" />
                                <Text style={styles.statValue}>
                                    ₹{analytics?.totalRevenue && analytics?.deliveredOrders 
                                        ? Math.round(analytics.totalRevenue / analytics.deliveredOrders) 
                                        : 0}
                                </Text>
                                <Text style={styles.statLabel}>Avg Order Value</Text>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Sales Trend Line Chart */}
                    {analytics?.salesTrend?.length > 0 && (
                        <Card style={styles.chartCard}>
                            <Card.Content>
                                <View style={styles.chartHeader}>
                                    <TrendingUp size={20} color="#4CAF50" />
                                    <Text style={styles.chartTitle}>Sales Trend (Last 7 Days)</Text>
                                </View>
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
                                            r: '5',
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

                    {/* Sales Bar Chart */}
                    {analytics?.salesTrend?.length > 0 && (
                        <Card style={styles.chartCard}>
                            <Card.Content>
                                <View style={styles.chartHeader}>
                                    <DollarSign size={20} color="#2196F3" />
                                    <Text style={styles.chartTitle}>Daily Sales Comparison</Text>
                                </View>
                                <BarChart
                                    data={chartData}
                                    width={screenWidth - 60}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: '#fff',
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: { borderRadius: 16 },
                                    }}
                                    style={styles.chart}
                                    showValuesOnTopOfBars
                                />
                            </Card.Content>
                        </Card>
                    )}
                    <View style={{ height: 80 }} />
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
    revenueCard: {
        margin: 15,
        elevation: 3,
        backgroundColor: '#E8F5E9',
    },
    revenueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    revenueInfo: {
        marginLeft: 15,
        flex: 1,
    },
    revenueLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    revenueValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statCard: {
        width: '48%',
        elevation: 2,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 15,
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
        textAlign: 'center',
    },
    chartCard: {
        margin: 15,
        marginTop: 0,
        elevation: 3,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

export default SalesAnalytics;
