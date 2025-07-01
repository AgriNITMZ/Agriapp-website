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
            const response = await fetch('http://59.93.129.199:8090/apis/get_sensor_ids.php');
            const json = await response.json();

            if (json.status === 'success' && json.sensor_ids) {
                setSensorIds(json.sensor_ids);
                if (json.sensor_ids.length > 0 && !selectedSensor) {
                    setSelectedSensor(json.sensor_ids[0]);
                }
            } else {
                Alert.alert('Error', 'Failed to get sensor IDs');
            }
        } catch (error) {
            console.error('Error fetching sensor IDs:', error);
            Alert.alert('Error', 'Network request failed');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchSensorData = async () => {
        if (!selectedSensor) return;

        setDataLoading(true);
        try {
            const response = await fetch(
                `http://59.93.129.199:8090/apis/get_sensor_data_pagination.php?table=${selectedSensor}&limit=20&page=${currentPage}`
            );
            const json = await response.json();

            if (json.data) {
                setSensorData(json.data);
                setTotalPages(json.total_pages || 0);
                setCurrentPage(json.current_page || 1);
            } else {
                Alert.alert('Error', 'Failed to fetch sensor data');
                setSensorData([]);
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error);
            Alert.alert('Error', 'Network request failed');
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
                <Text style={styles.dataField}>Soil Moisture: {item.soil_moisture}</Text>
                <Text style={styles.dataField}>Soil Temp: {item.soil_temp}</Text>
            </View>
            <View style={styles.dataRow}>
                <Text style={styles.dataField}>Soil Conductivity: {item.soil_conductivity}</Text>
                <Text style={styles.dataField}>Temperature: {item.temperature}</Text>
            </View>
            <View style={styles.dataRow}>
                <Text style={styles.dataField}>Humidity: {item.humidity}</Text>
                <Text style={styles.dataField}>Raindrop: {item.raindrop}</Text>
            </View>
            <View style={styles.dataRow}>
                <Text style={styles.dataField}>Atm Light: {item.atm_light}</Text>
                <Text style={styles.dataField}>Soil pH: {item.soil_ph}</Text>
            </View>
            <View style={styles.dataRow}>
                <Text style={styles.dataField}>Soil Nitrogen: {item.soil_nitrogen}</Text>
                <Text style={styles.dataField}>Soil Phosphorus: {item.soil_phosphorus}</Text>
            </View>
            <View style={styles.dataRow}>
                <Text style={styles.dataField}>Soil Potassium: {item.soil_potassium}</Text>
            </View>
            <View style={styles.dataRow}>
                <Text style={styles.dataField}>Location: {item.loc0}, {item.loc1}, {item.loc2}, {item.loc3}</Text>
            </View>
            <Text style={styles.dataTimestamp}>Timestamp: {item.timestamp}</Text>
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
    },
    dropdownLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    sensorTitleContainer: {
        marginVertical: 12,
    },
    dataTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 16,
    },
    dataItem: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    dataItemHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    dataField: {
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
    dataTimestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
        fontStyle: 'italic',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        marginTop: 4,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 1,
    },
    paginationButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    paginationButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    paginationText: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 20,
    },
});

export default SensorDropdownScreen;
