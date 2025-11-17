import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || import.meta.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || import.meta.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || import.meta.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS with public key
if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

export const sendEmail = async (formData) => {
    try {
        // Validate environment variables
        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
            throw new Error('EmailJS configuration is missing. Please check your environment variables.');
        }

        /*
        EMAILJS TEMPLATE VARIABLES USED:
        - {{Full Name}} - Sender's full name
        - {{Email Address}} - Sender's email address
        - {{subject}} - Message subject
        - {{Phone Number}} - Sender's phone number (or N/A)
        - {{message}} - Message content
        */



        // Template parameters matching your exact EmailJS template variable names
        const templateParams = {
            // Exact matches for your EmailJS template variables
            'Full Name': formData.name,
            'Email Address': formData.email,
            'subject': formData.subject,
            'Phone Number': formData.phone || 'N/A',
            'message': formData.message,

            // Additional standard variables for compatibility
            from_name: formData.name,
            from_email: formData.email,
            to_email: 'preciagri.mz@gmail.com',
            reply_to: formData.email,

            // Metadata
            timestamp: new Date().toLocaleString()
        };



        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        if (response.status === 200) {
            return {
                success: true,
                message: 'Email sent successfully!'
            };
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('EmailJS Error:', error);
        return {
            success: false,
            message: error.message || 'Failed to send email. Please try again.'
        };
    }
};

// Validate EmailJS configuration
export const validateEmailJSConfig = () => {
    const missingVars = [];

    if (!EMAILJS_SERVICE_ID) missingVars.push('VITE_EMAILJS_SERVICE_ID');
    if (!EMAILJS_TEMPLATE_ID) missingVars.push('VITE_EMAILJS_TEMPLATE_ID');
    if (!EMAILJS_PUBLIC_KEY) missingVars.push('VITE_EMAILJS_PUBLIC_KEY');

    if (missingVars.length > 0) {
        console.warn('Missing EmailJS environment variables:', missingVars);
        return false;
    }

    return true;
};

// Test function to verify all form fields are being captured
export const testEmailData = (formData) => {
    console.log('=== EMAIL DATA TEST ===');
    console.log('Full Name:', formData.name);
    console.log('Email Address:', formData.email);
    console.log('Phone Number:', formData.phone || 'N/A');
    console.log('Subject:', formData.subject);
    console.log('Message:', formData.message);
    console.log('======================');

    return {
        hasName: !!formData.name,
        hasEmail: !!formData.email,
        hasPhone: !!formData.phone,
        hasSubject: !!formData.subject,
        hasMessage: !!formData.message
    };
};