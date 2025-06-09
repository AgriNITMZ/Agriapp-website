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
                const response = await fetch(`http://localhost:4000/api/v1/scheme?page=${page}&limit=${limit}`);
                const data = await response.json();

                if (data.success) {
                    setSchemes(data.data);
                } else {
                    setError("Failed to fetch schemes");
                }
            } catch (err) {
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

    if (loading) return <p className="text-center text-gray-600">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Government Schemes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.length === 0 ? (
                    <p className="text-center col-span-full">No schemes available.</p>
                ) : (
                    schemes.map((scheme) => (
                        <div key={scheme._id} className="bg-white shadow-lg rounded-lg overflow-hidden" onClick={goToscheme(scheme._id)}>
                            <img src={scheme.image} alt={scheme.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h2 className="text-lg font-bold">{scheme.title}</h2>
                                <p className="text-gray-500 text-sm">{new Date(scheme.date).toDateString()} | {scheme.source}</p>
                                <p className="text-gray-600 mt-2">{scheme.description.slice(0, 100)}...</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-center space-x-4 mt-6">
                {page > 1 && (
                    <button onClick={() => setPage(page - 1)} className="px-4 py-2 bg-blue-500 text-white rounded">Previous</button>
                )}
                <button onClick={() => setPage(page + 1)} className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
            </div>
        </div>
    );
};

export default Scheme;
