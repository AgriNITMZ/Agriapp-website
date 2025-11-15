import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SingleNews = () => {
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/v1/news/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    setNews(data.data);
                } else {
                    setError("News not found");
                }
            } catch (err) {
                setError("Failed to fetch news");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-10 p-6 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-lg bg-gray-200 h-64 w-full mb-6"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-10 p-8 bg-red-50 rounded-lg border border-red-200 text-center">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading News</h2>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    const formattedDate = new Date(news.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="mt-16 mx-auto my-10 bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="relative">
                <img 
                    src={news.image} 
                    alt={news.title} 
                    className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-2">
                        {news.category || news.source}
                    </div>
                    <h1 className="text-3xl font-bold text-white">{news.title}</h1>
                </div>
            </div>
            
            <div className="p-8">
                <div className="flex items-center text-gray-500 mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{formattedDate}</span>
                    
                    <span className="mx-3">•</span>
                    
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                    </svg>
                    <span>{news.source}</span>
                </div>
                
                <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">{news.description}</p>
                    
                    {news.content && (
                        <div className="mt-6 text-gray-700" 
                             dangerouslySetInnerHTML={{ __html: news.content }} />
                    )}
                </div>
                
                {news.tags && news.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {news.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SingleNews;