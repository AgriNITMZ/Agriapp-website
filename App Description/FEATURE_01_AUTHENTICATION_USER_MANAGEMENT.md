# Feature Description: Authentication & User Management

## Feature Overview
This feature provides a complete authentication and user management system with OTP-based email verification, JWT token authentication, role-based access control (User, Seller, Admin), password reset functionality, profile management, and address management. The system supports secure user registration, login, and session management across the mobile application.

---

## Architecture Components

### Backend Components
1. **Models** (Data Layer)
   - Users
   - OTP
   - Profile
   - Address

2. **Controllers** (Business Logic Layer)
   - Auth Controller
   - Address Controller
   - Reset Password Controller

3. **Middleware** (Security Layer)
   - JWT Authentication
   - Role-Based Authorization

4. **Routes** (API Endpoints Layer)
   - User Routes

5. **Utils** (Helper Services)
   - Mail Sender
   - Email Templates

### Frontend Components (Mobile App)
1. **Screens** (UI Layer)
   - Login Screen
   - Sign Up Screen
   - OTP Verification Screen
   - Reset Password Screen
   - Set New Password Screen
   - Profile Management Screen
   - Address Management Screens

2. **Utils** (Helper Functions)
   - Auth Service
   - Local Storage
   - Token Expiration Checker

3. **Helpers** (Validators)
   - Email Validator
   - Password Validator
   - Name Validator
   - Role Validator
   - Mobile Validator

---

## Detailed Component Analysis

### 1. DATABASE MODELS

#### 1.1 User Model (`agri_backend/models/Users.js`)
**Purpose**: Core user account information and relationships

**Schema Fields**:
- `Name` (String, required, trim): User's full name
- `email` (String, required, unique, trim, lowercase): User's email address
- `password` (String, required): Hashed password (bcrypt)
- `active` (Boolean, default: true): Account active status
- `accountType` (String, default: 'User', required): User role (User/Seller/Admin)
- `additionalDetails` (ObjectId, ref: 'Profile'): Link to profile details
- `token` (String): Current JWT token
- `image` (String, required): Profile image URL (auto-generated from DiceBear API)
- `products` (Array of ObjectId, ref: 'Product'): Seller's products
- `orders` (Array of ObjectId, ref: 'Order'): User's orders
- `cartId` (Array of ObjectId, ref: 'Product'): Cart items
- `address` (Array of ObjectId, ref: 'Addresses'): Saved addresses
- `createdAt` (Date, default: Date.now()): Account creation timestamp

**Relationships**:
- One-to-One with Profile (additionalDetails)
- One-to-Many with Products (for sellers)
- One-to-Many with Orders
- One-to-Many with Addresses


#### 1.2 OTP Model (`agri_backend/models/Otp.js`)
**Purpose**: Temporary storage for email verification OTPs

**Schema Fields**:
- `email` (String, required): Email address for OTP
- `otp` (String, required): 6-digit OTP code
- `createdAt` (Date, default: Date.now(), expires: 300): Auto-delete after 5 minutes

**Middleware**:
- **Pre-save Hook**: Automatically sends verification email before saving OTP to database
  - Calls `sendVerificationmail(email, otp)`
  - Uses `mailSender` utility with email template
  - Logs success/failure

**Auto-Expiration**: MongoDB TTL index automatically deletes documents after 5 minutes

#### 1.3 Profile Model (`agri_backend/models/Profile.js`)
**Purpose**: Extended user profile information

**Schema Fields**:
- `firstName` (String, trim): User's first name
- `lastName` (String, trim): User's last name
- `gender` (String): Gender
- `dateofBirth` (Date): Date of birth
- `about` (String, trim): Bio/about section
- `contactNo` (Number, trim): Contact phone number

**Note**: All fields are optional to allow gradual profile completion

#### 1.4 Address Model (`agri_backend/models/Address.js`)
**Purpose**: Delivery address storage for orders

**Schema Fields**:
- `userId` (ObjectId, ref: 'Users'): Owner of address
- `Name` (String, required): Recipient name
- `streetAddress` (String, required): Street address
- `city` (String, required): City
- `state` (String, required): State
- `zipCode` (String, required): PIN code
- `user` (ObjectId, ref: 'Users'): Duplicate user reference (legacy)
- `mobile` (String): Contact mobile number

**Validation Requirements** (for Shiprocket):
- Mobile: Minimum 10 digits
- ZIP code: Exactly 6 digits
- All text fields: Non-empty

---

### 2. CONTROLLERS (Business Logic)

#### 2.1 Auth Controller (`agri_backend/controller/Auth.js`)

**Function: `SendOtp(req, res)`**
- **Route**: POST `/api/v1/auth/sendotp`
- **Authentication**: Not required
- **Purpose**: Generates and sends OTP for email verification

**Request Body**:
- `email` (String, required): Email address

**Processing Flow**:
1. Extract email from request body
2. Check if user already exists with this email
3. If exists: Return error "This email is already registered"
4. Generate 6-digit numeric OTP using `otp-generator`
   - No uppercase alphabets
   - No lowercase alphabets
   - No special characters
5. Create OTP document in database
   - Pre-save hook automatically sends email
6. Return success with OTP (for development/testing)

**Response**:
```json
{
  "success": true,
  "message": "OTP Sent Successfully",
  "otp": "123456"
}
```

**Error Handling**:
- 400: Email already registered
- 500: Error while sending OTP


**Function: `SignUp(req, res)`**
- **Route**: POST `/api/v1/auth/signup`
- **Authentication**: Not required
- **Purpose**: Registers new user after OTP verification

**Request Body**:
- `Name` (String, required): Full name
- `email` (String, required): Email address
- `password` (String, required): Password
- `confirmPassword` (String, required): Password confirmation
- `otp` (String, required): 6-digit OTP
- `accountType` (String, required): User role (User/Seller)

**Processing Flow**:
1. **Validation**:
   - Check all required fields present
   - Verify password matches confirmPassword
   - Check if user already exists
2. **OTP Verification**:
   - Find most recent OTP for email (sorted by createdAt descending)
   - Validate OTP exists
   - Compare provided OTP with stored OTP
3. **Password Hashing**:
   - Hash password using bcrypt with salt rounds = 10
4. **Profile Creation**:
   - Create empty Profile document with null values
   - Get profile ID for user reference
5. **User Creation**:
   - Create User document with:
     - Name, email, hashed password, accountType
     - Profile reference
     - Auto-generated avatar from DiceBear API using initials
6. **Cart Creation**:
   - Create empty Cart for user
   - Link cart ID to user document
7. **JWT Token Generation**:
   - Create payload with email, id, accountType
   - Sign token with JWT_SECRET
   - Set expiry to 24 hours
8. **Token Storage**:
   - Save token to user document
   - Remove password from response object
9. **Cookie Setup**:
   - Set httpOnly cookie with token
   - Expiry: 3 days
10. **Response**: Return success with user and token

**Response**:
```json
{
  "success": true,
  "message": "User is register successfully",
  "user": { /* user object without password */ },
  "token": "jwt_token_here"
}
```

**Error Handling**:
- 403: Missing required fields
- 400: Passwords don't match, User already exists, OTP not found, Invalid OTP
- 500: Internal server error


**Function: `Login(req, res)`**
- **Route**: POST `/api/v1/auth/login`
- **Authentication**: Not required
- **Purpose**: Authenticates user and returns JWT token

**Request Body**:
- `email` (String, required)
- `password` (String, required)

**Processing Flow**:
1. Validate email and password provided
2. Find user by email with populated additionalDetails
3. If user not found: Return error "No account found with this email"
4. **NOTE**: Password validation is currently COMMENTED OUT for development
5. Generate JWT token with payload (email, id, accountType)
6. Save token to user document
7. Remove password from response
8. Set httpOnly cookie with 3-day expiry
9. Return success with user and token

**Response**:
```json
{
  "success": true,
  "token": "jwt_token",
  "user": { /* user object */ },
  "message": "Logged in successfully!"
}
```

**Error Handling**:
- 403: Missing fields, No account found
- 401: Incorrect password (when enabled)

**Function: `getUserById(req, res)`**
- **Route**: GET `/api/v1/auth/getuserbyid/:userId`
- **Authentication**: Required
- **Purpose**: Retrieves user by ID

**Function: `getUserByToken(req, res)`**
- **Route**: GET `/api/v1/auth/getuserbytoken`
- **Authentication**: Required (via header)
- **Purpose**: Retrieves current user from JWT token

**Function: `getUserProfile(req, res)`**
- **Route**: GET `/api/v1/auth/getuserprofile`
- **Authentication**: Required
- **Purpose**: Gets user profile with selected fields only

**Function: `updateProfile(req, res)`**
- **Route**: PUT `/api/v1/auth/updateProfile`
- **Authentication**: Required
- **Purpose**: Updates user profile information

**Request Body**:
- `Name`, `firstName`, `lastName`, `gender`, `contactNo`, `dateofBirth`, `about`

**Processing Flow**:
1. Extract userId from authenticated request
2. Find user with populated profile
3. Update user Name (from firstName + lastName or Name field)
4. Create or update Profile document
5. Save changes
6. Return updated user without password/token

**Function: `getUserProfileDetails(req, res)`**
- **Route**: GET `/api/v1/auth/getProfileDetails`
- **Authentication**: Required
- **Purpose**: Gets complete profile details

---

#### 2.2 Address Controller (`agri_backend/controller/Address.js`)

**Function: `createAddress(req, res)`**
- **Route**: POST `/api/v1/auth/addaddress`
- **Authentication**: Required
- **Purpose**: Creates new delivery address

**Request Body**:
- `Name`, `streetAddress`, `city`, `state`, `zipCode`, `mobile`

**Processing Flow**:
1. Extract userId from auth
2. Create new Address document
3. Find user and add address ID to user.address array
4. Save both documents
5. Return success message

**Function: `getAllAddresses(req, res)`**
- **Route**: GET `/api/v1/auth/getaddress`
- **Authentication**: Required
- **Purpose**: Gets all addresses for user

**Function: `editAddress(req, res)`**
- **Route**: PUT `/api/v1/auth/editaddress/:id`
- **Authentication**: Required
- **Purpose**: Updates existing address

**Function: `deleteAddress(req, res)`**
- **Route**: DELETE `/api/v1/auth/deleteaddress/:id`
- **Authentication**: Required (User role)
- **Purpose**: Deletes address

**Processing Flow**:
1. Find and delete address by ID
2. Remove address ID from user.address array
3. Save user document
4. Return success

**Function: `updateAddress(req, res)`**
- **Route**: PUT `/api/v1/auth/updateaddress/:editingAddressId`
- **Authentication**: Required (User role)
- **Purpose**: Updates address with validation

**Processing Flow**:
1. Verify address belongs to user
2. Update address fields
3. Return updated address

---

#### 2.3 Reset Password Controller (`agri_backend/controller/ResetPassword.js`)

**Function: `resetPasswordToken(req, res)`**
- **Route**: POST `/api/v1/auth/resetpasswordtoken`
- **Authentication**: Not required
- **Purpose**: Generates password reset token and sends email

**Request Body**:
- `email` (String, required)

**Processing Flow**:
1. Find user by email
2. If not found: Return error
3. Generate random 20-byte hex token using crypto
4. Update user with token and expiry (1 hour)
5. Create reset URL with token
6. Send email with reset link
7. Return success message

**Function: `resetPassword(req, res)`**
- **Route**: POST `/api/v1/auth/resetpassword`
- **Authentication**: Not required (uses token)
- **Purpose**: Resets password using token

**Request Body**:
- `password`, `confirmPassword`, `token`

**Processing Flow**:
1. Validate passwords match
2. Find user by token
3. Check token not expired
4. Hash new password (bcrypt, 10 rounds)
5. Update user password
6. Return success

---

### 3. MIDDLEWARE

#### 3.1 Authentication Middleware (`agri_backend/middleware/auth.js`)

**Function: `auth(req, res, next)`**
- **Purpose**: Verifies JWT token and attaches user to request

**Token Sources** (in order of priority):
1. Request body (`req.body.token`)
2. Cookies (`req.cookies.token`)
3. Authorization header (`Bearer token`)

**Processing**:
1. Extract token from sources
2. If no token: Return 401 Unauthorized
3. Verify token with JWT_SECRET
4. Decode payload and attach to `req.user`
5. Call next() to proceed

**Function: `isUser(req, res, next)`**
- **Purpose**: Checks if user has 'User' role
- **Usage**: Protects user-only routes

**Function: `isSeller(req, res, next)`**
- **Purpose**: Checks if user has 'Seller' role
- **Usage**: Protects seller-only routes

**Function: `isAdmin(req, res, next)`**
- **Purpose**: Checks if user has 'Admin' role
- **Usage**: Protects admin-only routes

---

### 4. ROUTES

#### 4.1 User Routes (`agri_backend/routes/User.js`)

**Authentication Routes**:
```
POST   /api/v1/auth/sendotp                    - Send OTP
POST   /api/v1/auth/signup                     - Register user
POST   /api/v1/auth/login                      - Login
```

**Profile Routes** (auth required):
```
GET    /api/v1/auth/getuserbyid/:userId        - Get user by ID
GET    /api/v1/auth/getuserbytoken             - Get current user
GET    /api/v1/auth/getuserprofile             - Get user profile
PUT    /api/v1/auth/updateProfile              - Update profile
GET    /api/v1/auth/getProfileDetails          - Get profile details
```

**Address Routes** (auth required):
```
POST   /api/v1/auth/addaddress                 - Create address
GET    /api/v1/auth/getaddress                 - Get all addresses
PUT    /api/v1/auth/editaddress/:id            - Edit address
DELETE /api/v1/auth/deleteaddress/:id          - Delete address (User only)
PUT    /api/v1/auth/updateaddress/:id          - Update address (User only)
```

**Password Reset Routes**:
```
POST   /api/v1/auth/resetpasswordtoken         - Request reset token
POST   /api/v1/auth/resetpassword              - Reset password
```

---


## FRONTEND IMPLEMENTATION (Mobile App)

### 5. AUTHENTICATION SCREENS

#### 5.1 Login Screen (`agri-app/src/screens/auth/LoginScreen.js`)

**Purpose**: User login interface

**State Management**:
- `email`: { value, error }
- `password`: { value, error }

**Function: `onLoginPressed()`**
**Processing Flow**:
1. Validate email and password using validators
2. If validation fails: Display errors and return
3. POST to `/auth/login` with credentials
4. On success:
   - Extract user data (id, name, email, accountType, token)
   - Save to AsyncStorage via `addUserToLocalStorage()`
   - Show success toast
   - Wait 800ms for storage completion
   - For Sellers: App.js will auto-switch to SellerNavigator
   - For Users: Navigate to HomePage
5. On error: Show error toast

**UI Components**:
- Background with logo
- Email input (email keyboard, no autocapitalize)
- Password input (secure entry)
- Forgot password link
- Login button
- Sign up navigation link

**Navigation**:
- Forgot Password → ResetPasswordScreen
- Sign Up → SignUpScreen
- Success → HomePage (User) or SellerNavigator (Seller)

---

#### 5.2 Sign Up Screen (`agri-app/src/screens/auth/SignUpScreen.js`)

**Purpose**: New user registration

**State Management**:
- `name`: { value, error }
- `email`: { value, error }
- `password`: { value, error }
- `confirmPassword`: { value, error }
- `role`: { value, error }
- `loading`: Boolean

**Role Options**:
- User
- Seller

**Function: `onSignUpPressed()`**
**Processing Flow**:
1. Set loading true
2. Validate all inputs:
   - Name validator
   - Email validator
   - Password validator
   - Confirm password match
   - Role validator
3. If validation fails: Display errors and return
4. POST to `/auth/sendotp` with email
5. On success:
   - Show success toast
   - Navigate to VerifyEmailonRegister with userData
6. On error: Show error toast
7. Set loading false

**UI Components**:
- Role dropdown (User/Seller)
- Name input
- Email input
- Password input (secure)
- Confirm password input (secure)
- Send OTP button (with loading indicator)
- Login navigation link

**Validation**:
- All fields required
- Passwords must match
- Email format validation
- Password strength validation

---

#### 5.3 OTP Verification Screen (`agri-app/src/screens/auth/VerifyEmailonRegister.js`)

**Purpose**: Email verification via OTP

**Props**:
- `route.params.userData`: User registration data

**State Management**:
- `otp`: String (6 digits)
- `isButtonEnabled`: Boolean
- `resendTimer`: Number (30 seconds countdown)

**useEffect Hooks**:
1. **OTP Length Check**: Enables button when OTP is 6 digits
2. **Resend Timer**: Countdown from 30 seconds

**Function: `handleOtpChange(text)`**
- Validates numeric input only
- Max length: 6 digits

**Function: `handleContinue()`**
**Processing Flow**:
1. Validate OTP is 6 digits
2. Add OTP to userData
3. POST to `/auth/signup` with complete userData
4. On success:
   - Show success toast
   - Extract user data
   - Save to AsyncStorage
   - Wait 500ms
   - Reset navigation to StartScreen
   - StartScreen will redirect based on accountType
5. On error: Show error toast

**Function: `handleResend()`**
**Processing Flow**:
1. POST to `/auth/sendotp` with email
2. Clear OTP input
3. Reset timer to 30 seconds
4. Show success toast

**UI Components**:
- OTP input (numeric keyboard, max 6 digits)
- Continue button (enabled when OTP complete)
- Resend OTP link (disabled during countdown)
- Timer display

---

#### 5.4 Reset Password Screen (`agri-app/src/screens/auth/ResetPasswordScreen.js`)

**Purpose**: Request password reset

**State Management**:
- `email`: { value, error }

**Function: `sendResetPasswordEmail()`**
**Processing Flow**:
1. Validate email
2. POST to `/auth/forgot-password` with email
3. On success:
   - Show success alert
   - Navigate to VerifyEmail with email
4. On error: Show error alert

**UI Components**:
- Email input
- Send OTP button
- Description text

---

#### 5.5 Set New Password Screen (`agri-app/src/screens/auth/SetNewPassword.js`)

**Purpose**: Set new password after verification

**Props**:
- `route.params.email`: User's email

**State Management**:
- `newPassword`: String
- `confirmPassword`: String

**Function: `handleResetPassword()`**
**Processing Flow**:
1. Validate both fields filled
2. Validate passwords match
3. POST to `/auth/reset-password` with email and passwords
4. On success:
   - Show success alert
   - Navigate to LoginScreen
5. On error: Show error alert

**UI Components**:
- New password input (secure)
- Confirm password input (secure)
- Reset password button

---

### 6. UTILITY SERVICES

#### 6.1 Auth Service (`agri-app/src/utils/authService.js`)

**Function: `checkAuthStatus()`**
- **Purpose**: Checks if user is authenticated with valid token
- **Returns**: { isAuthenticated, user, accountType }
- **Processing**:
  1. Get user from AsyncStorage
  2. Check token exists
  3. Validate token not expired
  4. If expired: Clean up and return false
  5. Return auth status

**Function: `logoutUser()`**
- **Purpose**: Logs out user and clears data
- **Processing**:
  1. Remove user from AsyncStorage
  2. Log success
  3. Return true/false

**Function: `isUserSeller()`**
- **Purpose**: Checks if user is seller
- **Returns**: Boolean

**Function: `isUserBuyer()`**
- **Purpose**: Checks if user is buyer/regular user
- **Returns**: Boolean

---

#### 6.2 Local Storage (`agri-app/src/utils/localStorage.js`)

**Function: `addUserToLocalStorage(user)`**
- **Purpose**: Saves user object to AsyncStorage
- **Parameters**: user object
- **Storage Key**: 'user'
- **Format**: JSON string

**Function: `removeUserFromLocalStorage()`**
- **Purpose**: Removes user from AsyncStorage
- **Logs**: Success message

**Function: `getUserFromLocalStorage()`**
- **Purpose**: Retrieves user from AsyncStorage
- **Returns**: User object or null
- **Error Handling**: Returns null on error

---

#### 6.3 Token Expiration Checker (`agri-app/src/utils/checkTokenExpiration.js`)

**Purpose**: Validates JWT token expiration

**Processing**:
1. Get user from AsyncStorage
2. Extract token
3. Decode JWT token
4. Check expiration timestamp
5. Return true if valid, false if expired

---

### 7. VALIDATORS

#### 7.1 Email Validator (`agri-app/src/helpers/emailValidator.js`)
- Validates email format using regex
- Returns error message or empty string

#### 7.2 Password Validator (`agri-app/src/helpers/passwordValidator.js`)
- Checks minimum length
- Returns error message or empty string

#### 7.3 Name Validator (`agri-app/src/helpers/nameValidator.js`)
- Validates name not empty
- Returns error message or empty string

#### 7.4 Role Validator (`agri-app/src/helpers/roleValidator.js`)
- Validates role selected
- Returns error message or empty string

#### 7.5 Mobile Validator (`agri-app/src/helpers/mobileValidator.js`)
- Validates mobile number format
- Checks minimum length
- Returns error message or empty string

---

## DATA FLOW DIAGRAMS

### Registration Flow
```
User (Mobile App)
    ↓ [Enter details, select role]
SignUpScreen
    ↓ [Validate inputs]
    ↓ [POST /auth/sendotp]
Auth.SendOtp()
    ↓ [Generate OTP]
    ↓ [Create OTP document]
OTP Model Pre-save Hook
    ↓ [Send email]
Mail Sender
    ↓ [Email sent]
Response to App
    ↓ [Navigate to OTP screen]
VerifyEmailonRegister
    ↓ [Enter OTP]
    ↓ [POST /auth/signup]
Auth.SignUp()
    ↓ [Verify OTP]
    ↓ [Hash password]
    ↓ [Create Profile]
    ↓ [Create User]
    ↓ [Create Cart]
    ↓ [Generate JWT]
Database
    ↓ [Save all documents]
Response with Token
    ↓ [Save to AsyncStorage]
Navigate to StartScreen
    ↓ [Auto-redirect based on role]
HomePage or SellerNavigator
```

### Login Flow
```
User (Mobile App)
    ↓ [Enter credentials]
LoginScreen
    ↓ [Validate inputs]
    ↓ [POST /auth/login]
Auth.Login()
    ↓ [Find user by email]
    ↓ [Verify password (disabled)]
    ↓ [Generate JWT]
    ↓ [Save token to user]
Database
    ↓ [Update user document]
Response with Token
    ↓ [Save to AsyncStorage]
    ↓ [Wait 800ms]
App.js Interval Check
    ↓ [Detect user in storage]
    ↓ [Check accountType]
Switch Navigator
    ↓ [Seller → SellerNavigator]
    ↓ [User → HomePage]
```

### Password Reset Flow
```
User (Mobile App)
    ↓ [Enter email]
ResetPasswordScreen
    ↓ [POST /auth/resetpasswordtoken]
ResetPassword.resetPasswordToken()
    ↓ [Find user]
    ↓ [Generate crypto token]
    ↓ [Update user with token + expiry]
    ↓ [Send email with reset link]
Database
    ↓ [Save token]
Email Sent
    ↓ [User clicks link]
SetNewPassword Screen
    ↓ [Enter new passwords]
    ↓ [POST /auth/resetpassword]
ResetPassword.resetPassword()
    ↓ [Verify token]
    ↓ [Check not expired]
    ↓ [Hash new password]
    ↓ [Update user]
Database
    ↓ [Save new password]
Navigate to LoginScreen
```

---

## KEY FEATURES & CAPABILITIES

### 1. OTP-Based Email Verification
- 6-digit numeric OTP
- Auto-expiration after 5 minutes
- Automatic email sending via pre-save hook
- Resend functionality with 30-second cooldown

### 2. JWT Authentication
- Token-based authentication
- 24-hour token expiry
- Token stored in user document
- Multiple token sources (body, cookie, header)

### 3. Role-Based Access Control
- Three roles: User, Seller, Admin
- Middleware for role checking
- Protected routes per role
- Auto-navigation based on role

### 4. Password Security
- bcrypt hashing with 10 salt rounds
- Password confirmation validation
- Secure password reset with token expiry
- Password validation (currently disabled for dev)

### 5. Profile Management
- Extended profile with additional details
- Gradual profile completion
- Auto-generated avatars (DiceBear API)
- Profile update functionality

### 6. Address Management
- Multiple address support
- CRUD operations
- Address validation for shipping
- User-address relationship

### 7. Session Management
- AsyncStorage for persistent login
- Token expiration checking
- Auto-logout on token expiry
- Auth status checking

### 8. User Experience
- Form validation with error messages
- Loading indicators
- Toast notifications
- Smooth navigation flows
- Role-based UI switching

---

## BUSINESS RULES

### Registration
1. Email must be unique
2. OTP must be verified within 5 minutes
3. Password and confirm password must match
4. Role must be selected (User or Seller)
5. Cart automatically created for new users
6. Profile automatically created with null values

### Login
1. Email must exist in system
2. Password validation currently disabled (development)
3. Token generated on successful login
4. Token saved to both user document and AsyncStorage
5. Navigation based on accountType

### OTP
1. 6-digit numeric only
2. Auto-expires after 5 minutes
3. Email sent automatically on creation
4. Can be resent after 30-second cooldown
5. Most recent OTP used for verification

### Password Reset
1. Reset token valid for 1 hour
2. Token is random 20-byte hex string
3. Email must exist in system
4. New password must match confirmation
5. Token invalidated after use

### Address
1. User can have multiple addresses
2. Address must belong to user for edit/delete
3. Shiprocket orders require strict validation:
   - Mobile: 10+ digits
   - ZIP: exactly 6 digits
   - All fields non-empty

### Roles
1. User: Can browse, shop, order
2. Seller: User permissions + product management
3. Admin: Seller permissions + platform management
4. Role set during registration, cannot be changed

---

## SECURITY FEATURES

### 1. Password Security
- bcrypt hashing (10 rounds)
- No plain text storage
- Secure password reset flow
- Password removed from API responses

### 2. Token Security
- JWT with secret key
- 24-hour expiration
- httpOnly cookies
- Token verification on protected routes

### 3. Email Verification
- OTP-based verification
- Time-limited OTPs (5 minutes)
- Prevents fake registrations

### 4. Authorization
- Role-based middleware
- Route protection
- User ownership verification (addresses, orders)

### 5. Input Validation
- Frontend validators
- Backend validation
- SQL injection prevention (Mongoose)
- XSS prevention

---

## ERROR HANDLING

### Frontend
- Form validation errors displayed inline
- Toast notifications for API errors
- Loading states during async operations
- Graceful error recovery

### Backend
- Async error handler wrapper
- Specific error messages
- HTTP status codes
- Error logging to console

### Common Errors
- 400: Bad request (validation failures)
- 401: Unauthorized (no/invalid token)
- 403: Forbidden (wrong role)
- 404: Not found (user/address)
- 500: Internal server error

---

## TESTING CONSIDERATIONS

### Unit Tests
- Validator functions
- Password hashing
- JWT generation/verification
- OTP generation

### Integration Tests
- Registration flow
- Login flow
- Password reset flow
- Address CRUD operations

### E2E Tests
- Complete registration journey
- Login and navigation
- Profile update
- Address management

---

## PERFORMANCE OPTIMIZATIONS

### 1. Database
- Indexed email field (unique)
- TTL index on OTP collection
- Populated queries only when needed

### 2. Frontend
- AsyncStorage for persistent auth
- Token expiration checking
- Minimal re-renders with state management

### 3. Security
- Password hashing done once
- Token reuse for 24 hours
- Cookie-based session management

---

## FUTURE ENHANCEMENTS

1. **Two-Factor Authentication**: SMS or authenticator app
2. **Social Login**: Google, Facebook integration
3. **Password Strength Meter**: Real-time feedback
4. **Email Verification Link**: Alternative to OTP
5. **Session Management**: Multiple device support
6. **Account Deletion**: GDPR compliance
7. **Profile Picture Upload**: Custom avatars
8. **Email Preferences**: Notification settings
9. **Login History**: Security audit trail
10. **Biometric Auth**: Fingerprint/Face ID

---

## ENVIRONMENT VARIABLES

```env
# JWT
JWT_SECRET=your_jwt_secret_key

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password

# Frontend
REACT_APP_BASE_URL=http://localhost:4000
```

---

## CONCLUSION

The Authentication & User Management feature provides a comprehensive, secure, and user-friendly system for user registration, login, and profile management. It supports role-based access control, OTP-based email verification, JWT authentication, and complete address management. The system is designed with security best practices, proper error handling, and a smooth user experience across the mobile application.
