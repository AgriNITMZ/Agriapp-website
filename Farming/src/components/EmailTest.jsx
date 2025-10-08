import React, { useState } from 'react';
import { sendEmail, validateEmailJSConfig } from '../services/emailService';
import toast from 'react-hot-toast';

const EmailTest = () => {
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testEmailConfiguration = async () => {
        setLoading(true);
        setTestResult(null);

        try {
            // First, validate configuration
            const isConfigValid = validateEmailJSConfig();
            if (!isConfigValid) {
                setTestResult({
                    success: false,
                    message: 'EmailJS configuration is missing or incomplete'
                });
                return;
            }

            // Test with sample data
            const testData = {
                name: 'Test User',
                email: 'test@example.com',
                subject: 'EmailJS Test Message',
                message: 'This is a test message to verify EmailJS integration is working correctly.',
                category: 'test'
            };

            const result = await sendEmail(testData);
            setTestResult(result);

            if (result.success) {
                toast.success('Test email sent successfully!');
            } else {
                toast.error('Test email failed: ' + result.message);
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: error.message
            });
            toast.error('Test failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkConfiguration = () => {
        const config = {
            serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
            templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        };

        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Configuration:</h3>
                <ul className="text-sm space-y-1">
                    <li>Service ID: {config.serviceId ? '✅ Set' : '❌ Missing'}</li>
                    <li>Template ID: {config.templateId ? '✅ Set' : '❌ Missing'}</li>
                    <li>Public Key: {config.publicKey ? '✅ Set' : '❌ Missing'}</li>
                </ul>
            </div>
        );
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">EmailJS Test</h2>
            
            {checkConfiguration()}
            
            <button
                onClick={testEmailConfiguration}
                disabled={loading}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Email Configuration'}
            </button>

            {testResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                    testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                    <h3 className="font-semibold">
                        {testResult.success ? '✅ Success' : '❌ Failed'}
                    </h3>
                    <p className="text-sm mt-1">{testResult.message}</p>
                </div>
            )}

            <div className="mt-6 text-sm text-gray-600">
                <h3 className="font-semibold mb-2">Setup Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Create EmailJS account</li>
                    <li>Set up Gmail service</li>
                    <li>Create email template</li>
                    <li>Add credentials to .env file</li>
                    <li>Restart development server</li>
                </ol>
            </div>
        </div>
    );
};

export default EmailTest;