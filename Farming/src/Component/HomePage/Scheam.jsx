import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const Scheme = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const limit = 10;
    const navigate=useNavigate();

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const url = `${import.meta.env.VITE_API_URL}/scheme?page=${page}&limit=${limit}`;
                console.log('📋 Fetching schemes from:', url);
                
                const response = await fetch(url);
                const data = await response.json();
                
                console.log('📋 Schemes response:', data);
                console.log('📋 Number of schemes:', data.data?.length);

                if (data.success) {
                    setSchemes(data.data);
                } else {
                    setError("Failed to fetch schemes");
                }
            } catch (err) {
                console.error('❌ Error fetching schemes:', err);
                setError("Error fetching schemes");
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, [page]);

    const goToscheme = (id) => () => {
        navigate(`/scheme/${id}`);
        
    }

    if (loading) return <p className="text-center text-gray-600">Loading schemes...</p>;
    if (error) return (
        <div className="text-center">
            <p className="text-red-500">{error}</p>
            <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Retry
            </button>
        </div>
    );

    console.log('📋 Rendering schemes, count:', schemes.length);
    console.log('📋 Schemes data:', schemes);

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold text-center mb-8 text-green-700">Government Schemes for Farmers</h1>
            
            {schemes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No schemes available.</p>
                    <p className="text-sm text-gray-500 mt-2">Check browser console for details</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {schemes.map((scheme, index) => (
                        <div 
                            key={scheme._id} 
                            className="bg-white border-l-4 border-green-500 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={goToscheme(scheme._id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                            Scheme #{index + 1 + (page - 1) * limit}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">{scheme.title}</h2>
                                    <p className="text-gray-600 mb-3">{scheme.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                                            </svg>
                                            {new Date(scheme.date).toDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                                            </svg>
                                            {scheme.source}
                                        </span>
                                    </div>
                                </div>
                                <svg className="w-6 h-6 text-gray-400 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center items-center gap-4 mt-8">
                {page > 1 && (
                    <button 
                        onClick={() => setPage(page - 1)} 
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        ← Previous
                    </button>
                )}
                <span className="text-gray-600 font-medium">Page {page}</span>
                <button 
                    onClick={() => setPage(page + 1)} 
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default Scheme;
