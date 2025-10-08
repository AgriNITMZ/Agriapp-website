# EmailJS Setup Guide for Contact Forms

## Overview
This guide explains how to configure EmailJS to enable email sending functionality in the Contact Us forms.

## Prerequisites
1. EmailJS account (free at https://www.emailjs.com/)
2. Gmail account (preciagri.mz@gmail.com)

## EmailJS Configuration Steps

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" as the service
4. Connect your Gmail account (preciagri.mz@gmail.com)
5. Note down the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Use this template content:

```html
Subject: New Contact Form Message - {{subject}}

From: {{from_name}} ({{from_email}})
Category: {{category}}
Phone: {{phone}}

Message:
{{message}}

---
This message was sent from the PERCI AGRI contact form.
Reply to: {{reply_to}}
```

4. Set template variables:
   - `from_name` - Sender's name
   - `from_email` - Sender's email
   - `to_email` - Recipient email (preciagri.mz@gmail.com)
   - `subject` - Message subject
   - `message` - Message content
   - `category` - Message category
   - `phone` - Sender's phone (optional)
   - `reply_to` - Reply-to email

5. Note down the **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Find your **Public Key** (e.g., `user_abcdef123456`)

### Step 5: Configure Environment Variables
Add these variables to your `.env` file in the `Agriapp-website/Farming/` directory:

```env
# EmailJS Configuration
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Replace the placeholder values with your actual EmailJS credentials:**
- `your_service_id_here` → Your Gmail service ID
- `your_template_id_here` → Your email template ID  
- `your_public_key_here` → Your EmailJS public key

## Example Configuration

```env
# EmailJS Configuration
REACT_APP_EMAILJS_SERVICE_ID=service_abc123
REACT_APP_EMAILJS_TEMPLATE_ID=template_xyz789
REACT_APP_EMAILJS_PUBLIC_KEY=user_abcdef123456
```

## Testing the Setup

### 1. Start the Development Server
```bash
cd Agriapp-website/Farming
npm start
```

### 2. Test Contact Forms
1. Navigate to the Contact page (`/contact`)
2. Fill out the contact form
3. Click "Send Message"
4. Check for success/error messages
5. Verify email delivery to preciagri.mz@gmail.com

### 3. Test Profile Contact Form
1. Navigate to Profile → Contact Us (`/product/profile/contact-us`)
2. Fill out the form
3. Test email sending functionality

## Features Implemented

### ✅ Email Sending
- Both contact forms now send emails via EmailJS
- Emails are delivered to `preciagri.mz@gmail.com`
- Professional email templates with all form data

### ✅ Form Validation
- Required field validation
- Email format validation
- User-friendly error messages

### ✅ User Experience
- Loading states during email sending
- Success/error toast notifications
- Form reset after successful submission
- Disabled submit button during sending

### ✅ Error Handling
- EmailJS configuration validation
- Network error handling
- Graceful fallback messages

### ✅ Security
- Environment variables for sensitive data
- No hardcoded credentials in code
- Secure EmailJS integration

## Contact Form Locations

### 1. Main Contact Page
- **Path**: `/contact`
- **Component**: `src/Component/HomePage/Contact.js`
- **Features**: Full contact form with phone field

### 2. Profile Contact Us
- **Path**: `/product/profile/contact-us`
- **Component**: `src/Ecomerce/Profile/ContactUs.jsx`
- **Features**: Category-based contact form

## Map Integration

### Google Maps Embed
- Shows NIT Mizoram location
- Address: National Institute of Technology Mizoram, Chaltlang Road, Aizawl, Mizoram, India
- Interactive map with zoom and navigation controls

## Troubleshooting

### Common Issues

#### 1. "Email service is not configured" Error
- **Cause**: Missing or incorrect environment variables
- **Solution**: Check `.env` file and ensure all three variables are set correctly

#### 2. "Failed to send email" Error
- **Cause**: Invalid EmailJS credentials or network issues
- **Solution**: Verify EmailJS service, template, and public key are correct

#### 3. Emails Not Received
- **Cause**: Gmail service not properly connected or template issues
- **Solution**: Check EmailJS dashboard for service status and test template

#### 4. Environment Variables Not Loading
- **Cause**: `.env` file not in correct location or missing `REACT_APP_` prefix
- **Solution**: Ensure `.env` is in `Agriapp-website/Farming/` and restart development server

### Debug Steps
1. Check browser console for error messages
2. Verify environment variables are loaded: `console.log(process.env.REACT_APP_EMAILJS_SERVICE_ID)`
3. Test EmailJS credentials in their dashboard
4. Check network tab for failed API requests

## Security Notes

### Environment Variables
- Never commit actual credentials to version control
- Use placeholder values in committed `.env` files
- Each developer should have their own `.env.local` file

### EmailJS Limits
- Free tier: 200 emails/month
- Rate limiting: 1 email per second
- Consider upgrading for production use

## Files Modified

### New Files Created:
- `src/services/emailService.js` - EmailJS integration service
- `.env` - Environment variables (with placeholders)
- `EMAILJS_SETUP_GUIDE.md` - This setup guide

### Modified Files:
- `src/Component/HomePage/Contact.js` - Added EmailJS integration
- `src/Ecomerce/Profile/ContactUs.jsx` - Added EmailJS integration
- `package.json` - Added @emailjs/browser dependency

## Production Deployment

### Environment Variables
Set these environment variables in your production environment:
- `REACT_APP_EMAILJS_SERVICE_ID`
- `REACT_APP_EMAILJS_TEMPLATE_ID`
- `REACT_APP_EMAILJS_PUBLIC_KEY`

### Build Process
The environment variables will be embedded in the build during `npm run build`.

## Support

For issues with EmailJS integration:
1. Check EmailJS documentation: https://www.emailjs.com/docs/
2. Verify account limits and usage
3. Test credentials in EmailJS dashboard
4. Check browser console for detailed error messages

The email functionality is now fully integrated and ready for use!