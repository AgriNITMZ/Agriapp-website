# PreciAgri - Agricultural Marketplace Platform

A comprehensive full-stack agricultural marketplace platform with web, mobile, and backend services. This platform connects farmers, buyers, and sellers, providing features like product marketplace, news & schemes, weather updates, analytics, and integrated shipping solutions.

## 🌾 Project Overview

PreciAgri is a multi-platform agricultural ecosystem consisting of:
- **Web Application** (React + Vite)
- **Mobile Application** (React Native + Expo)
- **Backend API** (Node.js + Express + MongoDB)

## 📁 Project Structure

```
.
├── Farming/              # Web Application (React + Vite)
├── agri-app/            # Mobile Application (React Native + Expo)
└── agri_backend/        # Backend API (Node.js + Express)
```

## ✨ Key Features

### 🛒 E-Commerce
- Product listing and search
- Shopping cart and wishlist
- Multi-seller support
- Product reviews and ratings
- Order management
- Payment integration (Razorpay)
- Shipping integration (Shiprocket)

### 📱 Mobile & Web
- Responsive design
- Real-time notifications (Socket.io)
- Multi-language support
- Location-based services
- Image upload and management

### 📊 Analytics & Insights
- Sales analytics dashboard
- Seller performance metrics
- Order tracking and management
- Revenue reports

### 📰 Information Services
- Agricultural news scraping
- Government schemes updates
- Weather information
- Farming tips and techniques

### 👥 User Management
- Multi-role authentication (Buyer, Seller, Admin)
- Profile management
- Address management
- Password reset with OTP verification

### 🤖 AI Features
- Chatbot integration
- Text translation (Google Cloud Translate)
- AI-powered recommendations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Expo CLI (for mobile app)
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd agri_backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file with the following:
```env
PORT=4000
DATABASE_URL=your_mongodb_connection_string

# Cloudinary
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret
FOLDER_NAME=PreciAgri

# JWT
JWT_SECRET=your_jwt_secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Razorpay
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

# Shiprocket
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_API_BASE=https://apiv2.shiprocket.in/v1/external

# Google Cloud
GOOGLE_API_KEY=your_google_api_key
GCLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json

# CORS
CORS_ORIGIN=http://localhost:5173
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The backend will run on `http://localhost:4000`

### Web Application Setup

1. Navigate to web directory:
```bash
cd Farming
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file:
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_RAZORPAY_KEY_ID=your_razorpay_key
ESLINT_NO_DEV_ERRORS=true
```

4. Start development server:
```bash
npm run dev
```

The web app will run on `http://localhost:5173`

5. Build for production:
```bash
npm run build
```

### Mobile Application Setup

1. Navigate to mobile app directory:
```bash
cd agri-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file with your API endpoints and keys.

4. Start Expo development server:
```bash
npm start
```

5. Run on specific platform:
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **File Upload**: Cloudinary, express-fileupload
- **Payment**: Razorpay
- **Shipping**: Shiprocket API
- **Email**: Nodemailer
- **Web Scraping**: Cheerio
- **Real-time**: Socket.io
- **Scheduling**: node-cron
- **AI/ML**: Google Generative AI, Google Cloud Translate

### Web Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Charts**: Recharts
- **UI Components**: Lucide React
- **Notifications**: React Hot Toast
- **Real-time**: Socket.io Client

### Mobile Frontend
- **Framework**: React Native 0.76
- **Platform**: Expo 52
- **Navigation**: React Navigation v6
- **UI Library**: React Native Paper, Native Base
- **State Management**: Context API
- **HTTP Client**: Axios
- **Payment**: React Native Razorpay
- **Maps**: Expo Location
- **Icons**: Lucide React Native, Vector Icons

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/sendotp` - Send OTP
- `POST /api/v1/auth/changepassword` - Change password

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (Seller)
- `PUT /api/v1/products/:id` - Update product (Seller)
- `DELETE /api/v1/products/:id` - Delete product (Seller)

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id` - Update order status

### Cart & Wishlist
- `POST /api/v1/cart` - Add to cart
- `GET /api/v1/cart` - Get cart items
- `POST /api/v1/wishlist` - Add to wishlist
- `GET /api/v1/wishlist` - Get wishlist items

### Analytics
- `GET /api/v1/analytics/sales` - Sales analytics
- `GET /api/v1/analytics/revenue` - Revenue reports
- `GET /api/v1/analytics/products` - Product performance

### Shiprocket
- `POST /api/v1/shiprocket/create-order` - Create shipment
- `GET /api/v1/shiprocket/track/:id` - Track shipment
- `GET /api/v1/shiprocket/orders` - Get all shipments

### News & Schemes
- `GET /api/v1/news` - Get agricultural news
- `GET /api/v1/schemes` - Get government schemes

## 🔐 User Roles

1. **Buyer**: Browse products, place orders, track shipments
2. **Seller**: List products, manage inventory, view analytics
3. **Admin**: Manage users, products, and platform content

## 🎨 Features by Module

### Web Application
- Home page with banners and categories
- Product catalog with filters
- Product detail pages
- Shopping cart and checkout
- User profile and order history
- Seller dashboard with analytics
- Admin panel
- News and schemes section
- Contact and about pages

### Mobile Application
- Onboarding screens
- Authentication flows
- Product browsing
- Cart and wishlist
- Order tracking
- Weather updates
- Farming tips
- Push notifications
- Location services

### Backend Services
- RESTful API
- JWT authentication
- File upload to Cloudinary
- Payment processing
- Order management
- Automated news scraping
- Email notifications
- Real-time updates via WebSocket

## 📦 Database Models

- **Users**: User accounts and profiles
- **Products**: Product listings
- **Orders**: Order information
- **Cart**: Shopping cart items
- **Wishlist**: Saved products
- **Address**: User addresses
- **Category**: Product categories
- **Reviews**: Product ratings and reviews
- **News**: Agricultural news articles
- **Schemes**: Government schemes
- **Notifications**: User notifications
- **ShiprocketOrder**: Shipping information

## 🔄 Automated Tasks

The backend includes cron jobs for:
- Scraping agricultural news
- Scraping government schemes
- Cleaning expired sessions
- Sending scheduled notifications

## 🧪 Testing

```bash
# Backend
cd agri_backend
npm test

# Web
cd Farming
npm run lint

# Mobile
cd agri-app
# Run tests through Expo
```

## 📱 Mobile App Build

### Android
```bash
cd agri-app
npx expo build:android
```

### iOS
```bash
cd agri-app
npx expo build:ios
```

## 🚢 Deployment

### Backend
- Deploy to services like Heroku, AWS, DigitalOcean
- Ensure MongoDB is accessible
- Set all environment variables
- Configure CORS for production domains

### Web Application
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static hosting
- Update API URL in environment variables

### Mobile Application
- Build APK/IPA using Expo EAS Build
- Submit to Google Play Store / Apple App Store
- Configure app.json with proper credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

PreciAgri Development Team

## 📞 Support

For support, email preciagri.mz@gmail.com

## 🙏 Acknowledgments

- React Native community
- Expo team
- MongoDB
- Cloudinary
- Razorpay
- Shiprocket
- Google Cloud Platform

---

**Note**: Remember to replace all placeholder credentials and API keys with your actual values. Never commit sensitive information to version control.
