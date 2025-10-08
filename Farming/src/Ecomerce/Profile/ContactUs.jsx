import React, { useState } from 'react';
import ProfileLayout from './Profile';
import { 
    MessageCircle, 
    Mail, 
    Phone, 
    Clock, 
    Send, 
    MapPin, 
    User,
    MessageSquare,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ContactUs = () => {
    const user = useSelector((state) => state.profile.user);
    const [formData, setFormData] = useState({
        name: user?.Name || '',
        email: user?.email || '',
        subject: '',
        message: '',
        category: 'general'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject.trim() || !formData.message.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // In a real app, make API call to submit feedback
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
            toast.success('Your message has been sent successfully!');
            setFormData(prev => ({
                ...prev,
                subject: '',
                message: ''
            }));
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const contactMethods = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email Support",
            description: "Get help via email",
            contact: "preciagri.mz@gmail.com",
            availability: "24/7 Response"
        },
        {
            icon: <Phone className="w-6 h-6" />,
            title: "Customer Care",
            description: "Speak with our team",
            contact: "+91 98765 43210",
            availability: "Mon-Sat, 9 AM - 6 PM"
        },
        {
            icon: <MessageCircle className="w-6 h-6" />,
            title: "Live Chat",
            description: "Chat with support",
            contact: "Available on website",
            availability: "Mon-Fri, 10 AM - 5 PM"
        }
    ];

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'order', label: 'Order Related' },
        { value: 'product', label: 'Product Information' },
        { value: 'technical', label: 'Technical Support' },
        { value: 'billing', label: 'Billing & Payment' },
        { value: 'feedback', label: 'Feedback & Suggestions' }
    ];

    return (
        <ProfileLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Contact Us
                    </h1>
                    <p className="text-gray-600">
                        We're here to help! Get in touch with our support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Methods */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
                            <div className="space-y-4">
                                {contactMethods.map((method, index) => (
                                    <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-mizoram-300 transition-colors duration-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-mizoram-100 rounded-lg text-mizoram-600">
                                                {method.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{method.title}</h3>
                                                <p className="text-sm text-gray-600 mb-1">{method.description}</p>
                                                <p className="text-sm font-medium text-mizoram-600">{method.contact}</p>
                                                <div className="flex items-center mt-2">
                                                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                                                    <span className="text-xs text-gray-500">{method.availability}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Office Location */}
                        <div className="bg-gradient-to-br from-mizoram-50 to-mizoram-100 rounded-xl p-6 border border-mizoram-200">
                            <div className="flex items-center space-x-3 mb-4">
                                <MapPin className="w-5 h-5 text-mizoram-600" />
                                <h3 className="font-semibold text-gray-900">Our Office</h3>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p>PRECI AGRI Headquarters</p>
                                <p>123 Agriculture Street</p>
                                <p>Green Valley, State 123456</p>
                                <p>India</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-mizoram-600" />
                                    Send us a Message
                                </h2>
                                <p className="text-gray-600 mt-1">Fill out the form below and we'll get back to you soon.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="w-4 h-4 inline mr-1" />
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                    >
                                        {categories.map((category) => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200"
                                        placeholder="Brief description of your inquiry"
                                        required
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mizoram-500 focus:border-mizoram-500 transition-colors duration-200 resize-none"
                                        placeholder="Please provide details about your inquiry..."
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        <span>We typically respond within 24 hours</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center space-x-2 bg-mizoram-600 text-white px-6 py-3 rounded-xl hover:bg-mizoram-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        <span>{loading ? 'Sending...' : 'Send Message'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium text-gray-900">How long does shipping take?</p>
                                    <p className="text-gray-600">Standard delivery takes 3-5 business days, express delivery takes 1-2 days.</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">What payment methods do you accept?</p>
                                    <p className="text-gray-600">We accept all major credit cards, debit cards, UPI, and net banking.</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Can I return or exchange products?</p>
                                    <p className="text-gray-600">Yes, we offer 30-day returns for most products. Check our return policy for details.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
};

export default ContactUs;