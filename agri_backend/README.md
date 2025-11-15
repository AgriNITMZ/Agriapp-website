# preciAgri_backend

## Environment Variables

This application requires the following environment variables to be configured in the `.env` file:

### Server Configuration
- `PORT` - Server port (default: 4000)
- `DATABASE_URL` - MongoDB connection string

### Authentication & Security
- `JWT_SECRET` - Secret key for JWT token generation

### Cloudinary (Image Storage)
- `CLOUD_NAME` - Cloudinary cloud name
- `API_KEY` - Cloudinary API key
- `API_SECRET` - Cloudinary API secret
- `FOLDER_NAME` - Cloudinary folder name for uploads

### Email Configuration
- `MAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- `MAIL_USER` - Email address for sending emails
- `MAIL_PASS` - Email password or app-specific password

### Payment Gateway (Razorpay)
- `RAZORPAY_KEY` - Razorpay API key ID
- `RAZORPAY_SECRET` - Razorpay API secret

### Shiprocket Integration
- `SHIPROCKET_EMAIL` - Shiprocket account email
- `SHIPROCKET_PASSWORD` - Shiprocket account password
- `SHIPROCKET_API_URL` - Shiprocket API base URL (https://apiv2.shiprocket.in/v1/external)

### Twilio (SMS)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio authentication token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

### Google Cloud
- `GCLOUD_PROJECT_ID` - Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud credentials JSON file
- `GOOGLE_API_KEY` - Google API key

### CORS
- `CORS_ORIGIN` - Allowed CORS origin (e.g., http://localhost:3000)

## Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all required environment variables in the `.env` file

3. For Shiprocket integration:
   - Sign up for a Shiprocket account at https://www.shiprocket.in/
   - Add your Shiprocket email and password to the `.env` file
   - The Shiprocket API URL is pre-configured to the production endpoint

4. For Razorpay integration:
   - Ensure `RAZORPAY_KEY` and `RAZORPAY_SECRET` are configured
   - These are used for both the legacy checkout and Shiprocket checkout systems

5. Install dependencies and start the server:
   ```bash
   npm install
   npm start
   ```
