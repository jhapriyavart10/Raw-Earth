# E-Commerce Platform

A modern, full-featured e-commerce application built with Next.js 14, React 18, and TypeScript. This platform provides a seamless shopping experience with integrated payment processing, inventory management, and customer authentication.

## Overview

This is a production-ready e-commerce platform that leverages modern web technologies to deliver a fast, scalable, and user-friendly shopping experience. The application integrates with Shopify for product and inventory management, Stripe for payment processing, and Google OAuth for user authentication.

## Key Features

### Core E-Commerce Features
- **Product Catalog**: Browse and search products with detailed information
- **Shopping Cart**: Add/remove items, manage quantities with persistent cart storage
- **Checkout Process**: Streamlined multi-step checkout experience
- **Order Management**: Track orders and view order history
- **Product Reviews**: Customer reviews and ratings system

### User Features
- **Authentication**: 
  - Email/password registration and login
  - Google OAuth integration
  - Secure session management
- **User Profiles**: Manage account details, addresses, and payment methods
- **Saved Addresses**: Store multiple delivery addresses
- **Payment Methods**: Save credit/debit cards for faster checkout
- **Subscriptions**: Manage recurring orders and subscriptions

### Additional Features
- **AI Chatbot**: Integrated chatbot for customer support
- **Search Functionality**: Product search with filters
- **Newsletter**: Email marketing integration with Klaviyo
- **Discount Management**: Apply and manage discount codes
- **Gift Management**: Gift card functionality
- **Responsive Design**: Fully responsive mobile-first design

## Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR/SSG capabilities
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend & APIs
- **Next.js API Routes** - Serverless backend functions
- **Shopify Storefront API** - Product and inventory management
- **Google OAuth 2.0** - Social authentication
- **Stripe** - Payment processing
- **Klaviyo** - Email marketing platform

## Environment Variables

The application requires the following environment variables (stored in `.env.local`):

### Server-Only (Sensitive)
```
SHOPIFY_STORE_DOMAIN=your_store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
SHOPIFY_API_VERSION=2024-01
KLAVIYO_API_KEY=your_key
```

### Public (Client-Safe)
```
NEXT_PUBLIC_API_URL=/api/shopify
USE_MOCK_DATA=false
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
REDIRECT_URI=http://localhost:3000/api/auth/google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_public_client_id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/google
NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY=your_key
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Shopify store with Storefront API access
- Google OAuth credentials
- Stripe account (for payments)
- Klaviyo account (for email marketing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd E-commerce
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env.local` file in the root directory
   - Add all required environment variables (see Environment Variables section)

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Core Functionality

### Authentication & Authorization
- OAuth and email-based authentication
- Protected API routes and pages
- Secure token management
- Session handling for authenticated users

### Shopping Experience
- Product discovery and search
- Real-time cart management with context API
- Secure checkout process with multiple payment options
- Order tracking and history
- Customer reviews and ratings

### Admin & Management
- Customer account management
- Address and payment method management
- Subscription management
- Order history and tracking

### Integrations
- **Shopify**: Product catalog, inventory, and order management
- **Google OAuth**: Seamless social login
- **Stripe**: Secure payment processing
- **Klaviyo**: Email marketing and customer engagement

## Architecture

### State Management
- React Context API for cart state management
- Server-side session management for authentication

### API Design
- RESTful API routes using Next.js API Routes
- Shopify GraphQL integration for product queries and mutations
- Secure backend-to-backend communication

### Performance
- Server-side rendering and static generation
- Image optimization
- Code splitting and lazy loading
- CSS optimization with Tailwind CSS

## Security Features

- Environment variable isolation (sensitive data server-only)
- Secure OAuth implementation
- Protected API routes
- CORS and request validation
- Secure payment handling
- Password encryption for user accounts

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Future Enhancements

Potential features for future development:
- Advanced product filtering and faceted search
- Wishlist functionality
- Product recommendations
- Social media integration
- Analytics and reporting dashboard
- Multi-language support
- Enhanced inventory management

## License

This project is proprietary and confidential.

## Support

For questions or issues, please contact the development team.
