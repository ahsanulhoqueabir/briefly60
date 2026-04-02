# 📰 Briefly60 - News Aggregation Platform 

A modern, full-stack news aggregation and reading platform built with Next.js 16, MongoDB, and TypeScript. Briefly60 provides users with curated news articles, personalized reading experiences, bookmarking capabilities, subscription management, and interactive quizzes.

## 🚀 Features

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

### Backend

- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Image Upload**: Cloudinary
- **Payment Gateway**: SSLCommerz
- **PDF Generation**: jsPDF

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

## 👥 Authors

- **Development Team** - Briefly60

## 📞 Support

For support, email contact.ahsanul@gmail.com or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn/ui for beautiful components
- MongoDB team for the robust database
- All contributors and testers

---
