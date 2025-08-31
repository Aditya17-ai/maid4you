# Maid4You - Professional Household Services Platform

A modern, full-stack web application for connecting customers with professional household service providers (maids) for services like housekeeping, deep cleaning, cooking, and more.

## 🚀 Features

### Core Features
- **Location-based Search**: Find maids near you using GPS and Google Maps integration
- **Real-time Chat**: Communicate with service providers through built-in messaging
- **Secure Payments**: Stripe integration for safe transactions and automatic payouts
- **AI-Powered Recommendations**: Smart maid suggestions based on preferences and history
- **Background Verification**: Comprehensive background checks for all service providers
- **Multi-service Support**: Housekeeping, deep cleaning, cooking, laundry, babysitting, elderly care, pet care, and gardening

### Advanced Technology Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with serverless functions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth (Google, Facebook) and credentials
- **Real-time**: Socket.io for live chat and booking updates
- **Payments**: Stripe with Connect for marketplace payments
- **Maps**: Google Maps API for location services
- **AI**: OpenAI integration for smart recommendations
- **Deployment**: Vercel with CI/CD pipeline

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Maps API key
- Stripe account
- OpenAI API key (optional, for AI features)

### Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for NextAuth.js
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `OPENAI_API_KEY`: OpenAI API key (optional)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up the database**:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

3. **Run the development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📱 Application Structure

### User Roles
- **Customer**: Book services, manage bookings, leave reviews
- **Maid**: Manage profile, accept bookings, receive payments
- **Admin**: Platform management and oversight

### Key Pages
- `/` - Landing page with service showcase
- `/search` - Find and browse available maids
- `/dashboard/customer` - Customer booking management
- `/dashboard/maid` - Maid service management
- `/booking/[id]` - Individual booking details and chat
- `/auth/signin` - Authentication page

### API Endpoints
- `/api/auth/[...nextauth]` - Authentication
- `/api/maids/search` - Location-based maid search
- `/api/bookings` - Booking management
- `/api/payments/*` - Payment processing
- `/api/recommendations` - AI-powered recommendations
- `/api/geocode` - Address geocoding
- `/api/webhooks/stripe` - Stripe webhook handler

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

**MaidService** - Making household services accessible, reliable, and convenient for everyone.
