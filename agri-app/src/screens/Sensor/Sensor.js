import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
    Alert,
    StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import { API_BASE } from '@env';

const SensorDropdownScreen = ({ navigation }) => {
    const [sensorIds, setSensorIds] = useState([]);
    const [selectedSensor, setSelectedSensor] = useState('');
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSensorIds();
    }, []);

    useEffect(() => {
        if (selectedSensor) {
            fetchSensorData();
        }
    }, [selectedSensor, currentPage]);

    const fetchSensorIds = async () => {
        setLoading(true);
        try {
            const apiUrl = API_BASE || 'https://agriapp-backend-a1zy.onrender.com/api/v1';
            const response = await fetch(`${apiUrl}/sensor/sensor-ids`);
            const json = await response.json();

            if (json.sensor_ids && json.sensor_ids.length > 0) {
                setSensorIds(json.sensor_ids);
                if (!selectedSensor) {
                    setSelectedSensor(json.sensor_ids[0]);
                }
            } else {
                Alert.alert('No Sensors Found', 'No sensor IDs available from the server');
            }
        } catch (error) {
            console.error('Error fetching sensor IDs:', error);
            Alert.alert('Connection Error', 'Unable to connect to sensor server. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchSensorData = async () => {
        if (!selectedSensor) return;

        setDataLoading(true);
        try {
            const apiUrl = API_BASE || 'https://agriapp-backend-a1zy.onrender.com/api/v1';
            const response = await fetch(
                `${apiUrl}/sensor/sensor-data?table=${selectedSensor}&limit=20&page=${currentPage}`
            );
            const json = await response.json();

            if (json.data && json.data.length > 0) {
                setSensorData(json.data);
                setTotalPages(json.total_pages || 0);
                setCurrentPage(json.current_page || 1);
            } else {
                setSensorData([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error);
            Alert.alert('Connection Error', 'Unable to fetch sensor data. Please check your connection.');
            setSensorData([]);
        } finally {
            setDataLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSensorIds();
        if (selectedSensor) {
            fetchSensorData();
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.dataItem}>
            <Text style={styles.dataItemHeader}>Record ID: {item.id}</Text>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Soil Moisture (V):</Text>
                <Text style={styles.dataValue}>{item.soil_moisture || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Soil Temp (°C):</Text>
                <Text style={styles.dataValue}>{item.soil_temp || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Soil Conductivity (µS/cm):</Text>
                <Text style={styles.dataValue}>{item.soil_conductivity || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Temperature (°C):</Text>
                <Text style={styles.dataValue}>{item.temperature || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Humidity (%):</Text>
                <Text style={styles.dataValue}>{item.humidity || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Raindrop H (V):</Text>
                <Text style={styles.dataValue}>{item.raindrop || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Atmospheric Light (lux):</Text>
                <Text style={styles.dataValue}>{item.atm_light || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Nitrogen (kg/ha):</Text>
                <Text style={styles.dataValue}>{item.soil_nitrogen || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Phosphorus (kg/ha):</Text>
                <Text style={styles.dataValue}>{item.soil_phosphorus || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Potassium (kg/ha):</Text>
                <Text style={styles.dataValue}>{item.soil_potassium || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Soil pH:</Text>
                <Text style={styles.dataValue}>{item.soil_ph || 'N/A'}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Sensor Time:</Text>
                <Text style={styles.dataValue}>{item.timestamp || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Receive Time:</Text>
                <Text style={styles.dataValue}>{item.received_at || 'N/A'}</Text>
            </View>
            
            <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Location:</Text>
                <Text style={styles.dataValue}>{item.loc0}, {item.loc1}, {item.loc2}, {item.loc3}</Text>
            </View>
        </View>
    );

    const renderDropdown = () => (
        <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Select Sensor:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedSensor}
                    onValueChange={(itemValue) => {
                        setSelectedSensor(itemValue);
                        setCurrentPage(1);
                    }}
                    style={styles.picker}
                    enabled={!loading}
                >
                    {sensorIds.map((id) => (
                        <Picker.Item key={id} label={id} value={id} />
                    ))}
                </Picker>
            </View>
        </View>
    );

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            <TouchableOpacity
                onPress={goToPrevPage}
                disabled={currentPage <= 1}
                style={[styles.paginationButton, currentPage <= 1 && styles.disabledButton]}
            >
                <Text style={styles.paginationButtonText}>Previous</Text>
            </TouchableOpacity>

            <Text style={styles.paginationText}>
                Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
                onPress={goToNextPage}
                disabled={currentPage >= totalPages}
                style={[styles.paginationButton, currentPage >= totalPages && styles.disabledButton]}
            >
                <Text style={styles.paginationButtonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <CustomTopBar navigation={navigation} title="Farm Sensor Dashboard" />
            <StatusBar backgroundColor="#1e5631" barStyle="light-content" />

            {loading ? (
                <ActivityIndicator size="large" color="#4caf50" />
            ) : (
                renderDropdown()
            )}

            {selectedSensor && (
                <>
                    <View style={styles.sensorTitleContainer}>
                        <Text style={styles.dataTitle}>Data for {selectedSensor}</Text>
                    </View>

                    {dataLoading ? (
                        <ActivityIndicator size="large" color="#4caf50" />
                    ) : (
                        <>
                            <FlatList
                                data={sensorData}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.listContainer}
                                ListEmptyComponent={<Text style={styles.emptyText}>No data available</Text>}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#4caf50", "#1e5631"]}
                                    />
                                }
                            />

                            {sensorData.length > 0 && renderPagination()}
                        </>
                    )}
                </>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 26,
        backgroundColor: '#f5f5f5',
    },
    dropdownContainer: {
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    dropdownLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
        color: '#333',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    sensorTitleContainer: {
        marginVertical: 12,
        paddingHorizontal: 16,
    },
    dataTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e5631',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    dataItem: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    dataItemHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1e5631',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    dataLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        fontWeight: '500',
    },
    dataValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        textAlign: 'right',
        fontWeight: '400',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    paginationButton: {
        backgroundColor: '#1e5631',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    paginationButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    paginationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 20,
    },
});

export default SensorDropdownScreen;
