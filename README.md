# Tanaka 🏠

**Smart Pangisha** is a comprehensive property management web application designed to streamline property, tenant, and lease management for property owners and managers. Built with modern React technologies, it offers a responsive, mobile-first interface with powerful management capabilities.

## 🌟 Features

### 🏢 Property Management
- **Property Portfolio**: View and manage all properties in a unified dashboard
- **Property Details**: Comprehensive property information with tabbed interface
- **Units Management**: Organize and track individual units within properties
- **Mobile-Responsive Cards**: Card-based mobile view for better UX on small screens

### 👥 Tenant Management
- **Tenant Directory**: Complete tenant database with search and filtering
- **Tenant Profiles**: Detailed tenant information and contact management
- **Tenant Status Tracking**: Monitor active, inactive, and pending tenants
- **Advanced Search**: Search tenants by name, email, or phone

### 📋 Lease Management
- **Lease Tracking**: Monitor active, terminated, and draft leases
- **Lease Details**: Comprehensive lease information and terms
- **Lease Operations**: Create, renew, and terminate leases
- **Advanced Filtering**: Filter by status (active, terminated, draft)
- **Smart Search**: Search leases by tenant or property name

### 💰 Payment Management
- **Payment Tracking**: Monitor rent payments and outstanding amounts
- **Payment History**: Complete payment records and transaction history
- **Outstanding Management**: Track and manage overdue payments
- **Mobile-Optimized**: Card-based payment views for mobile devices

### 📊 Dashboard & Analytics
- **Overview Dashboard**: Key metrics and performance indicators
- **Financial Insights**: Income tracking and financial summaries
- **Occupancy Rates**: Real-time occupancy statistics
- **Outstanding Payments**: Quick view of pending payments

### 🔐 Authentication & Security
- **Secure Login**: JWT-based authentication system
- **Password Recovery**: Forgot password with OTP verification
- **User Registration**: New user account creation
- **Profile Management**: User profile and settings management

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - Modern React with latest features
- **React Router DOM 7.6.0** - Client-side routing
- **React Bootstrap 2.10.10** - UI components and responsive design
- **Bootstrap 5.3.6** - CSS framework for styling
- **Axios 1.9.0** - HTTP client for API communication

### State Management
- **Redux Toolkit 2.8.2** - State management
- **React Redux 9.2.0** - React bindings for Redux

### Styling & UI
- **Custom CSS** - Tailored styling for each component
- **Bootstrap Icons** - Comprehensive icon set
- **Responsive Design** - Mobile-first approach
- **Custom Color Scheme** - Consistent branding (#CC5B4B theme)

### Development & Testing
- **React Scripts 5.0.1** - Build and development tools
- **Testing Library** - Comprehensive testing suite
- **ESLint** - Code quality and consistency

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API server running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/athumani1245/sp.git
   cd sp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_BASE=your_backend_api_url
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   The app will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

- **`npm start`** - Runs the development server
- **`npm build`** - Creates production build
- **`npm test`** - Runs the test suite
- **`npm run eject`** - Ejects from Create React App (one-way operation)

## 📁 Project Structure

```
src/
├── components/           # Reusable components
│   ├── Layout.jsx       # Main layout wrapper
│   ├── forms/           # Form components
│   ├── layout/          # Header and navigation
│   └── snippets/        # Dashboard widgets
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard pages
│   └── entity/         # Entity detail pages
├── services/           # API service layers
│   ├── authService.js  # Authentication
│   ├── propertyService.js
│   ├── tenantService.js
│   ├── leaseService.js
│   └── paymentService.js
├── assets/
│   └── styles/         # Component-specific CSS
└── utils/              # Utility functions
```

## 🎨 Design Features

### Mobile-First Responsive Design
- **Breakpoint Optimization**: Optimized for all screen sizes
- **Card-Based Mobile UI**: Properties, tenants, and payments display as cards on mobile
- **Touch-Friendly**: Large touch targets and intuitive navigation
- **Responsive Tables**: Tables adapt to mobile screens

### User Experience
- **Consistent Navigation**: Unified header and sidebar navigation
- **Search & Filtering**: Advanced search capabilities across all entities
- **Pagination**: Efficient data loading with pagination
- **Loading States**: User feedback during API calls
- **Error Handling**: Comprehensive error management

### Visual Design
- **Custom Color Scheme**: Professional branding with #CC5B4B accent
- **Clean Typography**: Readable fonts and consistent sizing
- **Intuitive Icons**: Bootstrap Icons throughout the interface
- **Modern UI Elements**: Contemporary design patterns

## 🔗 API Integration

The application integrates with a backend API for:
- User authentication and authorization
- Property, tenant, and lease CRUD operations
- Payment processing and tracking
- File uploads and document management

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build creates optimized files in the `build/` folder ready for deployment.

### Deployment Options
- **Netlify**: Connect your repository for automatic deployments
- **Vercel**: Deploy with zero configuration
- **AWS S3 + CloudFront**: For scalable static hosting
- **Traditional Web Servers**: Deploy build files to any web server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👤 Author

**Athumani** - [@athumani1245](https://github.com/athumani1245)

---

**Tanaka** - Making property management smart and efficient! 🏠✨
