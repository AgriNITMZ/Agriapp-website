import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const PaymentCallback = () => {
    const [status, setStatus] = useState('processing');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Get the payment_id and payment_status from URL parameters
                const params = new URLSearchParams(location.search);
                const razorpay_payment_id = params.get('razorpay_payment_id');
                const razorpay_payment_link_id = params.get('razorpay_payment_link_id');
                const razorpay_payment_link_status = params.get('razorpay_payment_link_status');
                console.log("payment_id", razorpay_payment_id);
                console.log("payment_link_id", razorpay_payment_link_id);
                console.log("payment_link_status", razorpay_payment_link_status);
                
                if (!razorpay_payment_link_id) {
                    setStatus('failed');
                    setErrorMessage('Invalid payment information');
                    toast.error('Payment verification failed');
                    return;
                }

                // Get token from localStorage
                const storedTokenData = JSON.parse(localStorage.getItem("token"));
                if (!storedTokenData || Date.now() >= storedTokenData.expires) {
                    setStatus('failed');
                    setErrorMessage('Session expired. Please login again.');
                    toast.error('Session expired');
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                // Show processing toast
                toast.loading('Verifying payment...', { id: 'payment-verification' });

                // Verify payment with backend
                const response = await axios.post(
                    'http://localhost:4000/api/v1/order/payment-verify',
                    {
                        razorpay_payment_id,
                        razorpay_payment_link_id,
                        razorpay_payment_link_status
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${storedTokenData.value}`
                        }
                    }
                );

                // Dismiss processing toast
                toast.dismiss('payment-verification');

                if (response.data.success) {
                    setStatus('success');
                    toast.success('Payment successful!');
                    // Redirect to orders page after 2 seconds
                    setTimeout(() => {
                        navigate('/product/profile/orders');
                    }, 2000);
                } else {
                    setStatus('failed');
                    setErrorMessage(response.data.message || 'Payment verification failed');
                    toast.error(response.data.message || 'Payment verification failed');
                }
            } catch (error) {
                // Dismiss processing toast
                toast.dismiss('payment-verification');

                console.error('Payment verification error:', error);
                setStatus('failed');
                const errorMsg = error.response?.data?.message || 'Payment verification failed';
                setErrorMessage(errorMsg);
                toast.error(errorMsg);

                // If it's a stock error, we might want to handle it differently
                if (errorMsg.includes('Insufficient stock')) {
                    setTimeout(() => {
                        navigate('/cart');
                    }, 3000);
                }
            }
        };

        verifyPayment();
    }, [navigate, location]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                {status === 'processing' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Verifying Payment</h2>
                        <p className="mt-2 text-gray-500">Please wait while we verify your payment...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Payment Successful!</h2>
                        <p className="mt-2 text-gray-500">Your order has been placed successfully.</p>
                        <p className="mt-2 text-sm text-gray-500">Redirecting to orders page...</p>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="text-center">
                        {errorMessage.includes('Insufficient stock') ? (
                            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
                        ) : (
                            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                        )}
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Payment Failed</h2>
                        <p className="mt-2 text-gray-500">{errorMessage}</p>
                        <div className="mt-4 space-y-2">
                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Return to Cart
                            </button>
                            <button
                                onClick={() => navigate('/profile/orders')}
                                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback; 