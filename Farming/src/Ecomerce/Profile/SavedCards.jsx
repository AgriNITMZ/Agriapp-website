import React, { useState, useEffect } from 'react';
import ProfileLayout from './Profile';
import { 
    CreditCard, 
    Plus, 
    Trash2, 
    Edit3, 
    Shield, 
    AlertCircle, 
    Eye, 
    EyeOff,
    Calendar,
    Lock
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const SavedCards = () => {
    const user = useSelector((state) => state.profile.user);
    const [cards, setCards] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [visibleCardNumbers, setVisibleCardNumbers] = useState({});
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        nickname: ''
    });

    // Mock data for demonstration
    useEffect(() => {
        setCards([
            {
                id: '1',
                cardNumber: '4532123456789012',
                cardholderName: 'JOHN DOE',
                expiryMonth: '12',
                expiryYear: '2026',
                cardType: 'visa',
                nickname: 'Primary Card',
                isDefault: true,
                addedDate: '2024-01-15'
            },
            {
                id: '2',
                cardNumber: '5555444433332222',
                cardholderName: 'JOHN DOE',
                expiryMonth: '08',
                expiryYear: '2025',
                cardType: 'mastercard',
                nickname: 'Business Card',
                isDefault: false,
                addedDate: '2024-02-20'
            }
        ]);
    }, []);

    const maskCardNumber = (cardNumber) => {
        return `**** **** **** ${cardNumber.slice(-4)}`;
    };

    const getCardType = (cardNumber) => {
        const firstDigit = cardNumber.charAt(0);
        if (firstDigit === '4') return 'visa';
        if (firstDigit === '5') return 'mastercard';
        if (firstDigit === '3') return 'amex';
        return 'unknown';
    };

    const getCardTypeColor = (cardType) => {
        switch (cardType) {
            case 'visa':
                return 'from-blue-500 to-blue-600';
            case 'mastercard':
                return 'from-red-500 to-red-600';
            case 'amex':
                return 'from-green-500 to-green-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const toggleCardVisibility = (cardId) => {
        setVisibleCardNumbers(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!formData.cardNumber || !formData.cardholderName || !formData.expiryMonth || !formData.expiryYear) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // In a real app, make API call to add card
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
            
            const newCard = {
                id: Date.now().toString(),
                ...formData,
                cardType: getCardType(formData.cardNumber),
                isDefault: cards.length === 0,
                addedDate: new Date().toISOString().split('T')[0]
            };
            
            setCards(prev => [...prev, newCard]);
            toast.success('Card added successfully!');
            setFormData({
                cardNumber: '',
                cardholderName: '',
                expiryMonth: '',
                expiryYear: '',
                nickname: ''
            });
            setShowAddModal(false);
        } catch (error) {
            toast.error('Failed to add card');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                // In a real app, make API call to delete card
                setCards(prev => prev.filter(card => card.id !== cardId));
                toast.success('Card deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete card');
            }
        }
    };

    const handleSetDefault = async (cardId) => {
        try {
            // In a real app, make API call to set default card
            setCards(prev => prev.map(card => ({
                ...card,
                isDefault: card.id === cardId
            })));
            toast.success('Default card updated!');
        } catch (error) {
            toast.error('Failed to update default card');
        }
    };

    return (
        <ProfileLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Saved Cards
                        </h1>
                        <p className="text-gray-600">
                            Manage your saved payment cards for faster checkout
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mt-4 sm:mt-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Card</span>
                    </button>
                </div>

                {/* Cards Grid */}
                {cards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className="relative group"
                            >
                                {/* Card */}
                                <div className={`bg-gradient-to-br ${getCardTypeColor(card.cardType)} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden`}>
                                    {/* Default Badge */}
                                    {card.isDefault && (
                                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                            <span className="text-xs font-medium">DEFAULT</span>
                                        </div>
                                    )}

                                    {/* Card Type */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="text-sm font-medium uppercase tracking-wide">
                                            {card.cardType}
                                        </div>
                                        <CreditCard className="w-6 h-6" />
                                    </div>

                                    {/* Card Number */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-lg tracking-wider">
                                                {visibleCardNumbers[card.id] 
                                                    ? card.cardNumber.replace(/(.{4})/g, '$1 ').trim()
                                                    : maskCardNumber(card.cardNumber)
                                                }
                                            </span>
                                            <button
                                                onClick={() => toggleCardVisibility(card.id)}
                                                className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
                                            >
                                                {visibleCardNumbers[card.id] ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cardholder Name and Expiry */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs opacity-80 mb-1">CARDHOLDER NAME</p>
                                            <p className="font-medium text-sm">{card.cardholderName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs opacity-80 mb-1">EXPIRES</p>
                                            <p className="font-medium text-sm">{card.expiryMonth}/{card.expiryYear}</p>
                                        </div>
                                    </div>

                                    {/* Nickname */}
                                    {card.nickname && (
                                        <div className="mt-3 pt-3 border-t border-white/20">
                                            <p className="text-xs opacity-80">{card.nickname}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Card Actions */}
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        {!card.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(card.id)}
                                                className="text-xs text-mizoram-600 hover:text-mizoram-700 font-medium"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved cards</h3>
                        <p className="text-gray-600 mb-6">Add your first payment card for faster checkout</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 shadow-lg mx-auto"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Card</span>
                        </button>
                    </div>
                )}

                {/* Add Card Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Add New Card</h3>
                                        <p className="text-gray-600 mt-1">Enter your card details</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    >
                                        <Plus className="w-5 h-5 rotate-45 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddCard} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200 font-mono"
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="16"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cardholder Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="cardholderName"
                                            value={formData.cardholderName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                            placeholder="JOHN DOE"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiry Month *
                                            </label>
                                            <select
                                                name="expiryMonth"
                                                value={formData.expiryMonth}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                required
                                            >
                                                <option value="">Month</option>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expiry Year *
                                            </label>
                                            <select
                                                name="expiryYear"
                                                value={formData.expiryYear}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                                required
                                            >
                                                <option value="">Year</option>
                                                {Array.from({ length: 10 }, (_, i) => (
                                                    <option key={i} value={new Date().getFullYear() + i}>
                                                        {new Date().getFullYear() + i}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Nickname (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="nickname"
                                            value={formData.nickname}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                            placeholder="e.g., Primary Card, Business Card"
                                        />
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4 flex items-start space-x-3">
                                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Security Notice</h4>
                                            <p className="text-sm text-blue-700">
                                                Your card information is encrypted and stored securely. We never store CVV numbers.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-4 py-3 bg-mizoram-600 text-white rounded-xl hover:bg-mizoram-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {loading && (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            )}
                                            <span>{loading ? 'Adding...' : 'Add Card'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Information */}
                <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start space-x-3">
                        <Lock className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Security & Privacy</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• All card information is encrypted using industry-standard security</li>
                                <li>• We never store your CVV or PIN numbers</li>
                                <li>• You can delete saved cards at any time</li>
                                <li>• Cards are only used for purchases you authorize</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
};

export default SavedCards;
