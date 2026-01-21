# 📰 Briefly60 - News Aggregation Platform

A modern, full-stack news aggregation and reading platform built with Next.js 16, MongoDB, and TypeScript. Briefly60 provides users with curated news articles, personalized reading experiences, bookmarking capabilities, subscription management, and interactive quizzes.

## � Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Implementation Details](#-implementation-details)
- [Security Features](#-security-features)
- [Design System](#-design-system)
- [Development Guidelines](#-development-guidelines)
- [API Documentation](#-api-documentation)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)

## �🚀 Features

### 🔐 Authentication & Authorization

- **JWT-based authentication** with secure token management
- **Role-Based Access Control (RBAC)** with 4 levels:
  - `superadmin` - Full system access
  - `admin` - User and content management
  - `editor` - Content creation and editing
  - `user` - Standard user access
- **Password reset** with secure token expiration
- **Protected routes** and API endpoints
- **Session management** with cookie-based tokens

### 📱 User Features

- **Personalized Dashboard** with reading statistics
- **Article Discovery** with category-based filtering
- **Bookmarking System** for saving favorite articles
- **Reading History** tracking
- **Quiz System** with topic-based questions
- **Profile Management** with avatar upload
- **Subscription Management** with auto-renewal options
- **Theme Toggle** (Light/Dark mode)
- **Multi-language Support** (English/Bangla)
- **PWA Support** - Install as mobile/desktop app
- **Offline Access** - Read cached articles offline

### 📰 Content Management

- **Article Management** with rich metadata
- **Category System** (Politics, Sports, Technology, Business, etc.)
- **Featured Articles** and important news highlighting
- **News Ticker** for breaking news
- **Article Analytics** (views, reads, engagement)
- **Content Filtering** by category, date, and popularity

### 💳 Subscription System

- **Flexible Subscription Plans** (Monthly, Quarterly, Annually)
- **SSLCommerz Payment Integration**
- **Price Protection** for existing subscribers
- **Auto-renewal Management**
- **Invoice Generation** (PDF format)
- **Subscription History** and tracking
- **Admin Plan Management** with versioning

### 📊 Analytics & Insights

- **User Analytics** (active users, engagement metrics)
- **Article Performance** tracking
- **Subscription Revenue** analytics
- **Dashboard Visualizations** with Recharts

### 🛠️ Admin Panel

- **User Management** (CRUD operations, role assignment)
- **Article Management** (create, edit, publish, delete)
- **Subscription Plan Management**
- **Analytics Dashboard**
- **Content Moderation**

### 🔍 SEO & Performance

- **Server-Side Rendering** with Next.js App Router
- **Complete Meta Tags** (Open Graph, Twitter Cards)
- **Structured Data** with JSON-LD schemas
- **Dynamic Sitemap** generation
- **Robots.txt** configuration
- **Optimized Images** with Next.js Image component
- **Progressive Web App** (PWA) support
- **Service Worker** for offline functionality
- **Smart Caching** strategies
- **Security Headers** and CSP

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Date Handling**: date-fns
- **State Management**: React Context API + Zustand
- **HTTP Client**: Axios with interceptors

### Backend

- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Image Upload**: Cloudinary
- **Payment Gateway**: SSLCommerz
- **Email Service**: Nodemailer
- **PDF Generation**: jsPDF + jspdf-autotable
- **Security**: Cloudflare Turnstile (CAPTCHA)

### Development Tools

- **Package Manager**: npm/pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Database Scripts**: tsx

## 📂 Project Structure

```
briefly60/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── subscription/       # Subscription management
│   │   ├── articles/           # Article operations
│   │   ├── bookmarks/          # Bookmark management
│   │   ├── admin/              # Admin operations
│   │   └── quiz/               # Quiz functionality
│   ├── (routes)/               # Page routes
│   │   ├── dashboard/          # User dashboard
│   │   ├── discover/           # Article discovery
│   │   ├── profile/            # User profile
│   │   ├── subscription/       # Subscription management
│   │   ├── article/            # Article reading
│   │   └── settings/           # User settings
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── admin/                  # Admin-specific components
│   ├── ArticleCard.tsx         # Article display card
│   ├── AuthForm.tsx            # Authentication forms
│   ├── Navbar.tsx              # Navigation bar
│   └── ...                     # Other components
│
├── contexts/                    # React Context providers
│   ├── AuthContext.tsx         # Authentication state
│   ├── ThemeContext.tsx        # Theme management
│   └── ErrorContext.tsx        # Global error handling
│
├── hooks/                       # Custom React hooks
│   ├── use-subscription.ts     # Subscription logic
│   ├── use-profile.ts          # Profile management
│   ├── use-debounce.ts         # Debounce utility
│   └── useBookmark.ts          # Bookmark operations
│
├── lib/                         # Utility libraries
│   ├── mongodb.ts              # MongoDB connection
│   ├── constants.ts            # App constants
│   ├── role-permissions.ts     # RBAC permissions
│   ├── validation.ts           # Validation schemas
│   └── utils.ts                # Helper functions
│
├── models/                      # Mongoose schemas
│   ├── User.model.ts           # User schema
│   ├── Article.model.ts        # Article schema
│   ├── Subscription.model.ts   # Subscription schema
│   ├── Bookmark.model.ts       # Bookmark schema
│   └── Quiz.model.ts           # Quiz schema
│
├── services/                    # Business logic
│   ├── auth.services.ts        # Authentication logic
│   ├── article.service.ts      # Article operations
│   ├── subscription.services.ts # Subscription logic
│   ├── sslcommerz.services.ts  # Payment processing
│   └── ...                     # Other services
│
├── types/                       # TypeScript definitions
│   ├── auth.types.ts           # Auth types
│   ├── subscription.types.ts   # Subscription types
│   ├── news.types.ts           # Article types
│   └── ...                     # Other types
│
├── middleware/                  # API middleware
│   ├── verify-auth.ts          # JWT verification
│   └── role-permission.ts      # RBAC checks
│
└── scripts/                     # Database scripts
    ├── init-db.ts              # Database initialization
    ├── seed-subscription-plans.ts # Plan seeding
    └── import-articles.ts      # Article import
```

## 🎯 Implementation Details

### Authentication System

**Implementation:**

- JWT-based authentication with secure token management
- Tokens stored in HTTP-only cookies for security
- Middleware-based route protection using `withAuth` HOC
- Password reset with time-limited tokens (1 hour expiration)
- Email verification for password reset requests

**Key Files:**

- `middleware/verify-auth.ts` - JWT verification middleware
- `services/auth.services.ts` - Authentication business logic
- `app/api/auth/` - Auth API endpoints
- `contexts/AuthContext.tsx` - Client-side auth state management

### Role-Based Access Control (RBAC)

**Implementation:**

- 4 hierarchical user roles: superadmin > admin > editor > user
- Fine-grained permissions defined in `lib/role-permissions.ts`
- Middleware validation using `withRolePermission` HOC
- Permission checks at both API and UI levels
- Dynamic UI rendering based on user permissions

**Permissions Structure:**

```typescript
{
  user: {
    canCreate: ['bookmark', 'quiz_attempt'],
    canRead: ['articles', 'own_profile', 'own_subscription'],
    canUpdate: ['own_profile', 'own_settings'],
    canDelete: ['own_bookmark']
  },
  editor: {
    // Inherits user permissions + article management
  },
  admin: {
    // Inherits editor permissions + user management
  },
  superadmin: {
    // Full system access
  }
}
```

### Subscription Management

**Implementation:**

- Integration with SSLCommerz payment gateway
- Support for multiple payment methods (cards, mobile banking, internet banking)
- Subscription plans with versioning system (prevents price shock)
- Auto-renewal with manual toggle option
- Invoice generation with PDF download
- Payment webhook handling for IPN notifications
- Transaction status tracking (pending, completed, failed, cancelled)

**Key Features:**

- Price protection: Existing subscribers keep their plan price
- Plan upgrade/downgrade with prorated refunds
- Subscription history with detailed transaction logs
- Admin panel for plan management and versioning

**Files:**

- `services/sslcommerz.services.ts` - Payment processing
- `services/subscription.services.ts` - Subscription logic
- `models/Subscription.model.ts` - Subscription schema with status tracking
- `app/api/subscription/` - Subscription API endpoints
- `lib/invoice.ts` - PDF invoice generation

### Article Management System

**Implementation:**

- Rich article schema with metadata (views, reads, engagement)
- Category-based organization (Politics, Sports, Technology, Business, etc.)
- Featured articles system with priority sorting
- Article discovery with filtering and pagination
- Trending articles based on view count and recency
- Full-text search across title, description, and content
- Article analytics tracking (views, read count, engagement time)

**Key Features:**

- Lazy loading with infinite scroll
- Category-specific article feeds
- Article bookmarking with user collections
- Reading progress tracking
- Social sharing capabilities

**Files:**

- `models/Article.model.ts` - Article schema with analytics
- `services/article.service.ts` - Article business logic
- `hooks/useInfiniteArticles.ts` - Infinite scroll implementation
- `components/article/` - Article UI components

### Quiz System

**Implementation:**

- Article-based quizzes with multiple-choice questions
- Automatic quiz generation linked to articles
- Score calculation and performance tracking
- Leaderboard system with rankings
- Quiz history with detailed analytics
- Time tracking for quiz attempts

**Key Features:**

- 4-5 questions per article
- Immediate feedback on answers
- Personal best tracking
- Quiz statistics (accuracy, average time, total attempts)
- Article-specific leaderboards

**Files:**

- `models/Quiz.model.ts` - Quiz schema
- `services/quiz.services.ts` - Quiz logic and scoring
- `app/api/quiz/` - Quiz API endpoints
- `components/article/QuizModal.tsx` - Quiz UI

### Bookmark System

**Implementation:**

- User-specific article bookmarking
- Quick save/unsave functionality
- Bookmark collection management
- Bookmark synchronization across devices

**Files:**

- `models/Bookmark.model.ts` - Bookmark schema
- `services/bookmark.services.ts` - Bookmark operations
- `hooks/useBookmark.ts` - Client-side bookmark management

### Profile Management

**Implementation:**

- User profile with avatar upload to Cloudinary
- Profile image optimization and transformation
- User statistics (articles read, quizzes taken, bookmarks saved)
- Language preference (English/Bangla)
- Theme preference (Light/Dark/System)
- Reading preferences and notifications settings

**Files:**

- `models/User.model.ts` - User schema with profile fields
- `services/profile.services.ts` - Profile operations
- `hooks/use-profile.ts` - Profile state management
- `app/api/profile/route.ts` - Profile API endpoint

### Admin Dashboard

**Implementation:**

- Comprehensive analytics dashboard with Recharts
- User management (CRUD operations, role assignment, bulk actions)
- Article management (create, edit, publish, delete, bulk operations)
- Subscription plan management with versioning
- Real-time statistics (active users, revenue, engagement metrics)
- Category management

**Key Features:**

- Bulk operations for efficiency
- Data visualization with charts
- Search and filter capabilities
- Export functionality for reports
- Audit logs for admin actions

**Files:**

- `app/dashboard/` - Admin dashboard pages
- `components/admin/` - Admin UI components
- `app/api/dashboard/` - Admin API endpoints

### Progressive Web App (PWA)

**Implementation:**

- Service Worker for offline functionality
- App manifest for install prompts
- Cache-first strategy for articles
- Background sync for bookmarks
- Push notifications support
- Offline fallback page

**Files:**

- `public/sw.js` - Service Worker
- `public/site.webmanifest` - App manifest
- `app/offline/page.tsx` - Offline fallback

### Email System

**Implementation:**

- Nodemailer integration for transactional emails
- Email templates for various scenarios:
  - Welcome email on registration
  - Password reset instructions
  - Subscription confirmation
  - Payment receipts
  - Newsletter (optional)

**Files:**

- `services/email.services.ts` - Email sending logic
- `scripts/test-email.ts` - Email testing utility

### SEO & Performance Optimization

**Implementation:**

- Server-Side Rendering (SSR) for critical pages
- Static Site Generation (SSG) for public pages
- Dynamic sitemap generation
- Robots.txt configuration
- Open Graph and Twitter Card meta tags
- JSON-LD structured data for articles
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Font optimization with next/font

**Files:**

- `app/sitemap.ts` - Dynamic sitemap generator
- `app/robots.ts` - Robots.txt configuration
- `lib/seo.ts` - SEO utility functions

### Error Handling

**Implementation:**

- Global error boundary with user-friendly messages
- API error standardization
- Error context for state management
- Custom error pages (404, 500, global error)
- Error logging and monitoring

**Files:**

- `contexts/ErrorContext.tsx` - Error state management
- `hooks/use-error-handler.ts` - Error handling hook
- `app/error.tsx` - Error page
- `app/global-error.tsx` - Global error boundary
- `app/not-found.tsx` - 404 page

### Security Implementation

**Features:**

- JWT token validation on all protected routes
- HTTP-only cookies for token storage
- CSRF protection
- Input validation with Zod schemas
- MongoDB injection prevention
- XSS protection via sanitization
- Rate limiting on authentication endpoints
- Cloudflare Turnstile for bot protection
- Secure password reset with time-limited tokens
- Environment variable protection

**Files:**

- `middleware/verify-auth.ts` - Auth middleware
- `middleware/role-permission.ts` - RBAC middleware
- `lib/validation.ts` - Input validation schemas
- `hooks/use-turnstile.ts` - CAPTCHA integration

## 🎯 Key Functionalities

### Authentication Flow

1. User registers with email/password
2. Server validates input and hashes password
3. JWT token generated and returned in response
4. Client stores token in localStorage
5. Token included in Authorization header for protected routes
6. Middleware verifies token on each request

### Subscription Flow

1. User selects a subscription plan
2. Initiates payment through SSLCommerz
3. Payment gateway processes transaction
4. Webhook validates payment
5. Subscription created/updated in database
6. User gains premium access

### Article Reading Flow

1. User browses articles by category
2. Clicks to read full article
3. System tracks view/read analytics
4. User can bookmark, share, or quiz on article
5. Reading history updated

### Role-Based Access Control (RBAC)

- **Permissions defined** in `lib/role-permissions.ts`
- **Middleware validation** in API routes
- **4 user roles** with hierarchical permissions
- **Fine-grained control** over features and data

## 🔒 Security Features

- **JWT Authentication** with Bearer token in Authorization header
- **Token Storage** in localStorage with secure handling
- **Password Hashing** with bcrypt (10 salt rounds)
- **Input Validation** using Zod schemas
- **MongoDB Injection Prevention**
- **XSS Protection** via sanitization
- **CORS Configuration** for API security
- **Rate Limiting** on sensitive endpoints
- **Secure Password Reset** with time-limited tokens

## 📱 API Documentation

For detailed API documentation including all endpoints, request/response formats, authentication requirements, and examples, please refer to [API-Documentation.md](./API-Documentation.md).

### Quick Links

- [Authentication APIs](./API-Documentation.md#authentication-apis)
- [Article APIs](./API-Documentation.md#article-apis)
- [Profile APIs](./API-Documentation.md#profile-apis)
- [Subscription APIs](./API-Documentation.md#subscription-apis)
- [Quiz APIs](./API-Documentation.md#quiz-apis)
- [Bookmark APIs](./API-Documentation.md#bookmark-apis)
- [Admin APIs](./API-Documentation.md#admin-apis)
- [Dashboard Analytics APIs](./API-Documentation.md#dashboard-analytics-apis)

## 🔧 Environment Variables

| Variable                            | Description                  | Required           |
| ----------------------------------- | ---------------------------- | ------------------ |
| `MONGODB_URI`                       | MongoDB connection string    | Yes                |
| `JWT_SECRET`                        | Secret key for JWT signing   | Yes                |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name        | Yes                |
| `CLOUDINARY_API_KEY`                | Cloudinary API key           | Yes                |
| `CLOUDINARY_API_SECRET`             | Cloudinary API secret        | Yes                |
| `SSLCOMMERZ_STORE_ID`               | SSLCommerz store ID          | Yes (for payments) |
| `SSLCOMMERZ_STORE_PASSWORD`         | SSLCommerz store password    | Yes (for payments) |
| `SSLCOMMERZ_IS_LIVE`                | SSLCommerz mode (true/false) | Yes (for payments) |
| `EMAIL_HOST`                        | SMTP host                    | Yes (for emails)   |
| `EMAIL_PORT`                        | SMTP port                    | Yes (for emails)   |
| `EMAIL_USER`                        | SMTP user                    | Yes (for emails)   |
| `EMAIL_PASSWORD`                    | SMTP password                | Yes (for emails)   |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`    | Turnstile site key           | No                 |
| `TURNSTILE_SECRET_KEY`              | Turnstile secret key         | No                 |
| `NEXT_PUBLIC_BASE_URL`              | Application base URL         | Yes                |

## 🏢 Project Structure Details

### `/app` Directory

- Uses Next.js 16 App Router
- File-based routing system
- API routes in `/app/api`
- Page routes with layouts
- Server and client components

### `/components` Directory

- Reusable UI components
- Feature-specific component folders
- shadcn/ui components in `/ui`
- Admin components in `/admin`

### `/contexts` Directory

- React Context providers
- Global state management
- Auth, Theme, Error contexts

### `/hooks` Directory

- Custom React hooks
- Reusable logic extraction
- API integration hooks

### `/lib` Directory

- Utility functions
- Constants and configurations
- Database connections
- Helper functions

### `/models` Directory

- Mongoose schemas
- Database models
- Type definitions

### `/services` Directory

- Business logic layer
- Separated from API routes
- Reusable service functions

### `/types` Directory

- TypeScript type definitions
- Interface declarations
- Type exports

### `/middleware` Directory

- API middleware functions
- Authentication checks
- Authorization validators

## 📱 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Logout

```http
POST /api/auth/logout
```

### Article Endpoints

#### Get Articles

```http
GET /api/articles?category=technology&page=1&limit=10
```

#### Get Single Article

```http
GET /api/articles/[id]
```

### Subscription Endpoints

#### Get Plans

```http
GET /api/subscription/plans
```

#### Initialize Payment

```http
POST /api/subscription/init
Content-Type: application/json

{
  "plan_id": "monthly",
  "auto_renewal": true
}
```

#### Get User Subscription

```http
GET /api/subscription/current
Authorization: Bearer <token>
```

### Admin Endpoints

#### Create Article (Admin Only)

```http
POST /api/admin/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Article Title",
  "content": "Article content...",
  "category": "technology"
}
```

## 🎨 Design System

### Color Scheme

- **Primary**: Blue tones for main actions
- **Secondary**: Gray scale for text and backgrounds
- **Accent**: Category-specific colors
- **Success**: Green for positive actions
- **Warning**: Yellow for cautions
- **Error**: Red for errors

### Typography

- **Headings**: System fonts with proper hierarchy
- **Body Text**: Readable font sizes (16px base)
- **Code**: Monospace for technical content

### Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## 📋 Coding Standards

### File Naming

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Types**: `kebab-case.types.ts`
- **Hooks**: `use-kebab-case.ts`
- **Services**: `kebab-case.service.ts`

### Variable Naming

- **Variables**: `underscore_case`
- **Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Code Organization

- **Imports**: Group by external, internal, types
- **Components**: One component per file
- **Services**: Business logic separated from routes
- **Types**: Centralized in `/types` folder
- **Utils**: Reusable functions in `/lib`

## 🛠️ Development Guidelines

### Adding New Features

1. Define types in `/types`
2. Create service logic in `/services`
3. Build API routes in `/app/api`
4. Create UI components in `/components`
5. Add pages in `/app/(routes)`
6. Update documentation

### Database Changes

1. Update model schema in `/models`
2. Write migration script in `/scripts`
3. Test in development
4. Document changes
5. Run migration in production

### API Development

1. Use TypeScript for type safety
2. Validate inputs with Zod
3. Handle errors consistently
4. Return standard response format
5. Add authentication/authorization
6. Document endpoints

## 👥 Contributors

- **Ahsanul Haque** - Lead Developer

## 📞 Support

For support, email contact.ahsanul@gmail.com or open an issue in the repository.

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn/ui for beautiful components
- MongoDB team for the robust database
- Vercel for hosting platform
- SSLCommerz for payment gateway
- Cloudinary for image management
- All contributors and testers

---
