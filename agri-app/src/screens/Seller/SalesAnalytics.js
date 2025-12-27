import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import customFetch from '../../utils/axios';
import { TrendingUp, BarChart3, RefreshCw, Package } from 'lucide-react-native';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const screenWidth = Dimensions.get('window').width;

const TIME_PERIODS = [
    { label: 'Last 7 Days', value: '7days', chartLabel: 'Last 7 Days' },
    { label: 'Last 30 Days', value: '30days', chartLabel: 'Last 30 Days' },
    { label: 'Last 6 Months', value: '6months', chartLabel: 'Last 6 Months' },
    { label: 'Last Year', value: '1year', chartLabel: 'Last Year' },
    { label: 'Overall', value: 'overall', chartLabel: 'Last 7 Days' }
];

const SalesAnalytics = ({ navigation }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('overall');

    const fetchAnalytics = async (period = selectedPeriod) => {
        try {
            const response = await customFetch.get(`/analytics/seller-dashboard?period=${period}`);
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

    useEffect(() => {
        if (!loading) {
            fetchAnalytics(selectedPeriod);
        }
    }, [selectedPeriod]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Analytics...</Text>
            </View>
        );
    }

    const chartData = {
        labels: analytics?.salesTrend?.map(item => item.label) || [],
        datasets: [{
            data: analytics?.salesTrend?.map(item => item.value) || [0]
        }]
    };

    // Get chart title based on selected period
    const getChartTitle = () => {
        const period = TIME_PERIODS.find(p => p.value === selectedPeriod);
        return period ? period.chartLabel : 'Last 7 Days';
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
                    {/* Time Period Selector and Refresh Button */}
                    <View style={styles.controlsContainer}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            style={styles.periodSelector}
                        >
                            {TIME_PERIODS.map((period) => (
                                <TouchableOpacity
                                    key={period.value}
                                    style={[
                                        styles.periodButton,
                                        selectedPeriod === period.value && styles.periodButtonActive
                                    ]}
                                    onPress={() => setSelectedPeriod(period.value)}
                                >
                                    <Text style={[
                                        styles.periodButtonText,
                                        selectedPeriod === period.value && styles.periodButtonTextActive
                                    ]}>
                                        {period.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity 
                            style={styles.refreshButton}
                            onPress={onRefresh}
                        >
                            <RefreshCw size={20} color="#2E7D32" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats Cards Row */}
                    <View style={styles.statsGrid}>
                        {/* Total Sales Card */}
                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <View style={styles.statIconContainer}>
                                    <Package size={24} color="#2196F3" />
                                </View>
                                <Text style={styles.statValue}>{analytics?.totalOrders || 0}</Text>
                                <Text style={styles.statLabel}>Total Sales</Text>
                            </Card.Content>
                        </Card>

                        {/* Total Revenue Card */}
                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <View style={styles.statIconContainer}>
                                    <BarChart3 size={24} color="#4CAF50" />
                                </View>
                                <Text style={styles.statValue}>₹{analytics?.totalRevenue || 0}</Text>
                                <Text style={styles.statLabel}>Total Revenue</Text>
                            </Card.Content>
                        </Card>

                        {/* Avg Order Value Card */}
                        <Card style={styles.statCard}>
                            <Card.Content style={styles.statContent}>
                                <View style={styles.statIconContainer}>
                                    <TrendingUp size={24} color="#FF9800" />
                                </View>
                                <Text style={styles.statValue}>
                                    ₹{analytics?.totalRevenue && analytics?.totalOrders 
                                        ? Math.round(analytics.totalRevenue / analytics.totalOrders) 
                                        : 0}
                                </Text>
                                <Text style={styles.statLabel}>Avg Order Value</Text>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Sales Trend Line Chart */}
                    <Card style={styles.chartCard}>
                        <Card.Content>
                            <View style={styles.chartHeader}>
                                <TrendingUp size={20} color="#4CAF50" />
                                <Text style={styles.chartTitle}>Sales Trend ({getChartTitle()})</Text>
                            </View>
                            {analytics?.salesTrend?.length > 0 ? (
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
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>No sales data for this period</Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Sales Bar Chart */}
                    <Card style={styles.chartCard}>
                        <Card.Content>
                            <View style={styles.chartHeader}>
                                <BarChart3 size={20} color="#2196F3" />
                                <Text style={styles.chartTitle}>Sales Comparison ({getChartTitle()})</Text>
                            </View>
                            {analytics?.salesTrend?.length > 0 ? (
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
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Text style={styles.noDataText}>No sales data for this period</Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>
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
        backgroundColor: '#F8F9FA',
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
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    periodSelector: {
        flex: 1,
    },
    periodButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    periodButtonActive: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    periodButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    periodButtonTextActive: {
        color: '#fff',
    },
    refreshButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        width: '31.5%',
        elevation: 4,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 12,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
        color: '#1A1A1A',
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '600',
    },
    chartCard: {
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
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginLeft: 10,
        color: '#1A1A1A',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    noDataContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
});

export default SalesAnalytics;
