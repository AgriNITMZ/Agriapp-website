import React, { useState, useEffect } from 'react';
import ProfileLayout from './Profile';
import { 
    Star, 
    ThumbsUp, 
    MessageSquare, 
    Calendar, 
    Package, 
    Edit3, 
    Trash2,
    Filter,
    Search,
    Image as ImageIcon
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const MyReviewsRatings = () => {
    const user = useSelector((state) => state.profile.user);
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock data for demonstration
    useEffect(() => {
        setReviews([
            {
                id: '1',
                productId: 'prod1',
                productName: 'Organic Tomato Seeds',
                productImage: '/api/placeholder/80/80',
                rating: 5,
                title: 'Excellent quality seeds!',
                comment: 'These seeds have an amazing germination rate. Almost 95% of the seeds sprouted within a week. The tomatoes are growing healthy and strong. Highly recommended for organic farming.',
                date: '2024-03-15',
                verified: true,
                helpful: 12,
                images: ['/api/placeholder/100/100', '/api/placeholder/100/100'],
                orderDate: '2024-02-28'
            },
            {
                id: '2',
                productId: 'prod2',
                productName: 'NPK Fertilizer 20-20-20',
                productImage: '/api/placeholder/80/80',
                rating: 4,
                title: 'Good fertilizer, fast results',
                comment: 'Noticed improvement in plant growth within 2 weeks of application. Easy to use and dissolves well in water. Only giving 4 stars because the packaging could be better.',
                date: '2024-03-10',
                verified: true,
                helpful: 8,
                images: [],
                orderDate: '2024-02-20'
            },
            {
                id: '3',
                productId: 'prod3',
                productName: 'Garden Sprayer 5L',
                productImage: '/api/placeholder/80/80',
                rating: 3,
                title: 'Average quality',
                comment: 'The sprayer works fine but the nozzle gets clogged frequently. Build quality is okay for the price point.',
                date: '2024-03-05',
                verified: true,
                helpful: 3,
                images: [],
                orderDate: '2024-02-15'
            }
        ]);
    }, []);

    const filteredReviews = reviews.filter(review => {
        const matchesFilter = filter === 'all' || review.rating === parseInt(filter);
        const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            review.comment.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const renderStars = (rating, size = 'w-4 h-4') => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${size} ${
                            star <= rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                setReviews(prev => prev.filter(review => review.id !== reviewId));
                toast.success('Review deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete review');
            }
        }
    };

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            distribution[review.rating]++;
        });
        return distribution;
    };

    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const ratingDistribution = getRatingDistribution();
    const averageRating = getAverageRating();

    return (
        <ProfileLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header - Fixed spacing to prevent overlap */}
                <div className="mb-8 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                My Reviews & Ratings
                            </h1>
                            <p className="text-gray-600">
                                Manage your product reviews and see how they help other customers
                            </p>
                        </div>
                        
                        {/* Stats */}
                        <div className="mt-4 sm:mt-0 flex items-center space-x-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-mizoram-600">{reviews.length}</div>
                                <div className="text-sm text-gray-600">Reviews</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-mizoram-600">{averageRating}</div>
                                <div className="text-sm text-gray-600">Avg Rating</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500"
                        />
                    </div>

                    {/* Rating Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {['all', '5', '4', '3', '2', '1'].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setFilter(rating)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        filter === rating
                                            ? 'bg-white text-mizoram-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {rating === 'all' ? 'All' : `${rating}★`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1 w-12">
                                    <span className="text-sm font-medium">{rating}</span>
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-mizoram-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: reviews.length > 0 
                                                ? `${(ratingDistribution[rating] / reviews.length) * 100}%` 
                                                : '0%'
                                        }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-8">
                                    {ratingDistribution[rating]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                {filteredReviews.length > 0 ? (
                    <div className="space-y-6">
                        {filteredReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    {/* Review Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start space-x-4">
                                            <img
                                                src={review.productImage}
                                                alt={review.productName}
                                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {review.productName}
                                                </h3>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    {renderStars(review.rating)}
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(review.date).toLocaleDateString()}
                                                    </span>
                                                    {review.verified && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                            Verified Purchase
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Package className="w-3 h-3 mr-1" />
                                                    <span>Ordered on {new Date(review.orderDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toast.info('Edit functionality coming soon!')}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Review Content */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900">{review.title}</h4>
                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                        
                                        {/* Review Images */}
                                        {review.images.length > 0 && (
                                            <div className="flex space-x-2">
                                                {review.images.map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`Review image ${index + 1}`}
                                                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Stats */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>{review.helpful} people found this helpful</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Review ID: #{review.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm || filter !== 'all' ? 'No reviews found' : 'No reviews yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || filter !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Start shopping and leave reviews to help other customers!'
                            }
                        </p>
                        {(searchTerm || filter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilter('all');
                                }}
                                className="text-mizoram-600 hover:text-mizoram-700 font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Review Guidelines</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Share your honest experience with the product</li>
                                <li>• Include photos to help other customers</li>
                                <li>• Focus on product quality, delivery, and packaging</li>
                                <li>• Reviews help improve our service and product selection</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
};

export default MyReviewsRatings;
