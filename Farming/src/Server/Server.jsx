import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from "react-redux";

const Server = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedSensor, setSelectedSensor] = useState('sensor_201');
    const [loading, setLoading] = useState(false);
    const [sensorOptions, setSensorOptions] = useState([]); // To store sensor names

    // Access user data from Redux store
    const user = useSelector((state) => state.profile.user);
    console.log("User data in Server component:", user);

    // Get API URLs from environment
    const apiUrl = import.meta.env.VITE_API_URL || 'https://agriapp-backend-a1zy.onrender.com/api/v1';
    
    console.log("API URL:", apiUrl);

    // Fetch sensor names from the backend (via proxy)
    const fetchSensorNames = async () => {
        console.log("Fetching sensor names from:", `${apiUrl}/sensor/sensor-ids`);
        try {
            const response = await fetch(`${apiUrl}/sensor/sensor-ids`);
            console.log("Sensor IDs Response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("Sensor IDs Result:", result);
            
            if (result?.sensor_ids && Array.isArray(result.sensor_ids)) {
                setSensorOptions(result.sensor_ids);
                // Set first sensor as default if available
                if (result.sensor_ids.length > 0 && !selectedSensor) {
                    setSelectedSensor(result.sensor_ids[0]);
                }
            } else {
                console.error("Invalid sensor_ids format:", result);
            }
        } catch (error) {
            console.error('Error fetching sensor names:', error);
            alert(`Failed to fetch sensor names: ${error.message}`);
        }
    };

    console.log("sensor name",sensorOptions);
    // Fetch sensor data from the backend (via proxy)
    const fetchData = async (page, sensor) => {
        console.log("Fetching sensor data for:", sensor, "page:", page);
        setLoading(true);
        try {
            const url = `${apiUrl}/sensor/sensor-data?table=${sensor}&limit=20&page=${page}`;
            console.log("Fetching from URL:", url);
            
            const response = await fetch(url);
            console.log("Sensor Data Response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("Sensor Data Result:", result);
            
            if (result?.data && Array.isArray(result.data)) {
                setData(result.data);
                setCurrentPage(result.current_page || page);
                setTotalPages(result.total_pages || 1);
            } else {
                console.error("Invalid data format:", result);
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error);
            alert(`Failed to fetch sensor data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSensorNames(); // Fetch sensor names on component mount
        fetchData(currentPage, selectedSensor); // Fetch initial sensor data
    }, [currentPage, selectedSensor]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleSensorChange = (e) => {
        setSelectedSensor(e.target.value);
        setCurrentPage(1); // Reset to first page when changing sensor
    };
    console.log("sensorOptions",sensorOptions)
    console.log("data",data)

    return (
        <div className="bg-green-50 min-h-screen p-4 pt-24">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-green-800 mb-4">Admin Dashboard</h1>
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Download PDF
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Download CSV
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Delete Sensor
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Logout
                    </button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        View Sensor Graphs
                    </button>
                </div>
                {/* Sensor selection */}
                <div className="flex justify-center mb-6">
                    {sensorOptions && sensorOptions.length > 0 ? (
                        <select
                            value={selectedSensor}
                            onChange={handleSensorChange}
                            className="border border-gray-300 rounded px-3 py-2 mx-2"
                        >
                            {sensorOptions.map((sensor, index) => (
                                <option key={index} value={sensor}>
                                    {sensor}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="text-red-600 bg-red-50 px-4 py-2 rounded border border-red-300">
                            No sensors available. Please check your XAMPP server connection.
                        </div>
                    )}
                </div>
                {/* Data table */}
                <div className="overflow-x-auto">
                    <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="py-3 px-4 text-center">ID</th>
                                <th className="py-3 px-4 text-center">Soil Moisture</th>
                                <th className="py-3 px-4 text-center">Soil Temp</th>
                                <th className="py-3 px-4 text-center">Soil Conductivity</th>
                                <th className="py-3 px-4 text-center">Temperature</th>
                                <th className="py-3 px-4 text-center">Humidity</th>
                                <th className="py-3 px-4 text-center">Raindrop</th>
                                <th className="py-3 px-4 text-center">Atm Light</th>
                                <th className="py-3 px-4 text-center">Soil Nitrogen</th>
                                <th className="py-3 px-4 text-center">Soil Phosphorus</th>
                                <th className="py-3 px-4 text-center">Soil Potassium</th>
                                <th className="py-3 px-4 text-center">Soil pH</th>
                                <th className="py-3 px-4 text-center">Timestamp</th>
                                <th className="py-3 px-4 text-center">Loc0</th>
                                <th className="py-3 px-4 text-center">Loc1</th>
                                <th className="py-3 px-4 text-center">Loc2</th>
                                <th className="py-3 px-4 text-center">Loc3</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="17" className="py-10 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : data && data.length > 0 ? (
                                data.map((row) => (
                                    <tr key={row.id} className="hover:bg-green-50">
                                        <td className="py-3 px-4 text-center">{row.id}</td>
                                        <td className="py-3 px-4 text-center">{row.soil_moisture}</td>
                                        <td className="py-3 px-4 text-center">{row.soil_temp}</td>
                                        <td className="py-3 px-4 text-center">{row.soil_conductivity}</td>
                                        <td className="py-3 px-4 text-center">{row.temperature}</td>
                                        <td className="py-3 px-4 text-center">{row.humidity}</td>
                                        <td className="py-3 px-4 text-center">{row.raindrop}</td>
                                        <td className="py-3 px-4 text-center">{row.atm_light}</td>
                                        <td className="py-3 px-4 text-center">{row.soil_nitrogen}</td>
                                        <td className="py-3 px-4 text-center">{row.soil_phosphorus}</td>
                                        <td className="py-3 px-4 text-center">{row.soil_potassium}</td>
                                        <td className="py-3 px-4 text-center">{row.soil_ph}</td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">{row.timestamp}</td>
                                        <td className="py-3 px-4 text-center">{row.loc0}</td>
                                        <td className="py-3 px-4 text-center">{row.loc1}</td>
                                        <td className="py-3 px-4 text-center">{row.loc2}</td>
                                        <td className="py-3 px-4 text-center">{row.loc3}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="17" className="py-10 text-center text-gray-500">
                                        No sensor data available. Please check your XAMPP server.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`flex items-center px-4 py-2 border rounded ${
                                currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center px-4 py-2 border rounded ${
                                currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Server;
