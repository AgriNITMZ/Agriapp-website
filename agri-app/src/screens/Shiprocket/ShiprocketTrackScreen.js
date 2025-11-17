import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';
import { getUserFromLocalStorage } from '../../utils/localStorage';

const ShiprocketTrackScreen = ({ navigation, route }) => {
  const { shipmentId } = route.params;
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTracking();
  }, [shipmentId]);

  const fetchTracking = async (showToast = false) => {
    try {
      setRefreshing(true);
      const user = await getUserFromLocalStorage();
      if (!user || !user.token) {
        Toast.show({ type: 'error', text1: 'Please log in to track shipment' });
        navigation.goBack();
        return;
      }

      const response = await axios.get(`${API_URL}/shiprocket/track/${shipmentId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (response.data.success) {
        setTracking(response.data.tracking);
        if (showToast) {
          Toast.show({ type: 'success', text1: 'Tracking information updated' });
        }
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Failed to load tracking information',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchTracking(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!tracking) {
    return (
      <View style={styles.errorContainer}>
        <Package size={64} color="#d1d5db" />
        <Text style={styles.errorTitle}>Tracking Not Available</Text>
        <Text style={styles.errorSubtitle}>
          Unable to load tracking information for this shipment
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('ShiprocketOrders')}
        >
          <Text style={styles.backButtonText}>Back to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trackingData = tracking.tracking_data || tracking;
  const shipmentTrack = trackingData?.shipment_track?.[0] || trackingData;
  const currentStatus = shipmentTrack?.current_status || trackingData?.current_status || 'In Transit';
  const trackingHistory =
    shipmentTrack?.shipment_track_activities || trackingData?.shipment_track_activities || [];
  const courierName = shipmentTrack?.courier_name || trackingData?.courier_name || 'Courier';
  const awbCode = shipmentTrack?.awb_code || trackingData?.awb_code || shipmentId;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Track Shipment</Text>
          <Text style={styles.headerSubtitle}>Shipment ID: {shipmentId}</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing} style={styles.refreshButton}>
          <RefreshCw size={24} color={refreshing ? '#9ca3af' : '#16a34a'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Current Status */}
        <View style={styles.currentStatusCard}>
          <View style={styles.statusIconContainer}>
            <Truck size={32} color="#fff" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text style={styles.statusValue}>{currentStatus}</Text>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipment Details</Text>
          <View style={styles.detailRow}>
            <Truck size={20} color="#6b7280" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Courier</Text>
              <Text style={styles.detailValue}>{courierName}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Package size={20} color="#6b7280" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>AWB/Tracking Number</Text>
              <Text style={styles.detailValue}>{awbCode}</Text>
            </View>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking History</Text>

          {trackingHistory.length > 0 ? (
            <View style={styles.timeline}>
              {trackingHistory.map((activity, index) => (
                <View key={index} style={styles.timelineItem}>
                  {/* Timeline Dot */}
                  <View style={styles.timelineDotContainer}>
                    <View
                      style={[
                        styles.timelineDot,
                        index === 0 && styles.timelineDotActive,
                      ]}
                    >
                      {index === 0 ? (
                        <CheckCircle size={20} color="#fff" />
                      ) : (
                        <Package size={16} color="#fff" />
                      )}
                    </View>
                    {index < trackingHistory.length - 1 && <View style={styles.timelineLine} />}
                  </View>

                  {/* Activity Details */}
                  <View style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text
                        style={[
                          styles.activityTitle,
                          index === 0 && styles.activityTitleActive,
                        ]}
                      >
                        {activity.activity || activity.status || 'Status Update'}
                      </Text>
                      <View style={styles.activityDate}>
                        <Calendar size={14} color="#6b7280" />
                        <Text style={styles.activityDateText}>
                          {formatDateTime(activity.date || activity.timestamp)}
                        </Text>
                      </View>
                    </View>

                    {activity.location && (
                      <View style={styles.activityLocation}>
                        <MapPin size={14} color="#6b7280" />
                        <Text style={styles.activityLocationText}>{activity.location}</Text>
                      </View>
                    )}

                    {activity.sr_status_label && (
                      <Text style={styles.activityStatus}>Status: {activity.sr_status_label}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noHistoryContainer}>
              <Package size={48} color="#d1d5db" />
              <Text style={styles.noHistoryText}>No tracking history available yet</Text>
              <Text style={styles.noHistorySubtext}>Check back later for updates</Text>
            </View>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            <Text style={styles.helpTextBold}>Need help?</Text> If you have any questions about
            your shipment, please contact customer support.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backIconButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  refreshButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  currentStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDotContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotActive: {
    backgroundColor: '#16a34a',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 4,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  activityHeader: {
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activityTitleActive: {
    color: '#16a34a',
  },
  activityDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityDateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  activityLocationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
  noHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noHistoryText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  noHistorySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  helpSection: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  helpText: {
    fontSize: 14,
    color: '#1e40af',
  },
  helpTextBold: {
    fontWeight: '600',
  },
});

export default ShiprocketTrackScreen;
