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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB database (local or Atlas)
- Cloudinary account (for image uploads)
- SSLCommerz merchant account (for payments)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/briefly60.git
cd briefly60
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. **Initialize the database**

```bash
npm run db:init
```

5. **Seed subscription plans**

```bash
npm run db:seed-plans
```

6. **Import sample articles** (optional)

```bash
npm run db:import-articles
```

7. **Run the development server**

```bash
npm run dev
```

8. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Script                       | Description                      |
| ---------------------------- | -------------------------------- |
| `npm run dev`                | Start development server         |
| `npm run build`              | Build for production             |
| `npm start`                  | Start production server          |
| `npm run lint`               | Run ESLint                       |
| `npm run db:init`            | Initialize database with indexes |
| `npm run db:seed-plans`      | Seed subscription plans          |
| `npm run db:import-articles` | Import articles from data source |

## 🔑 Environment Variables

### Required Variables

| Variable         | Description                | Example                               |
| ---------------- | -------------------------- | ------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string  | `mongodb://localhost:27017/briefly60` |
| `JWT_SECRET`     | Secret key for JWT signing | `your-secret-key`                     |
| `JWT_EXPIRES_IN` | JWT token expiration       | `7d`                                  |

### Optional Variables

| Variable                    | Description            | Default                 |
| --------------------------- | ---------------------- | ----------------------- |
| `CLOUDINARY_CLOUD_NAME`     | Cloudinary cloud name  | -                       |
| `CLOUDINARY_API_KEY`        | Cloudinary API key     | -                       |
| `CLOUDINARY_API_SECRET`     | Cloudinary API secret  | -                       |
| `SSLCOMMERZ_STORE_ID`       | SSLCommerz merchant ID | -                       |
| `SSLCOMMERZ_STORE_PASSWORD` | SSLCommerz password    | -                       |
| `SSLCOMMERZ_IS_LIVE`        | Production mode flag   | `false`                 |
| `NEXT_PUBLIC_APP_URL`       | Application URL        | `http://localhost:3000` |

## 🎯 Key Functionalities

### Authentication Flow

1. User registers with email/password
2. Server validates input and hashes password
3. JWT token generated and stored in HTTP-only cookie
4. Token verified on protected routes via middleware
5. Refresh token mechanism for session management

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

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** with bcrypt (10 salt rounds)
- **Input Validation** using Zod schemas
- **MongoDB Injection Prevention**
- **XSS Protection** via sanitization
- **CSRF Protection** in forms
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

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Article browsing and reading
- [ ] Bookmark creation and removal
- [ ] Subscription purchase flow
- [ ] Profile update with image upload
- [ ] Quiz completion
- [ ] Admin panel operations
- [ ] Theme switching
- [ ] Mobile responsiveness

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

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup

- Set all environment variables in hosting platform
- Enable production mode for SSLCommerz
- Configure MongoDB connection string
- Set proper CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing coding standards
- Write meaningful commit messages
- Add proper TypeScript types
- Update documentation
- Test thoroughly before PR

## 📄 License

This project is private and proprietary.

## 👥 Authors

- **Development Team** - Briefly60

## 📞 Support

For support, email support@briefly60.com or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn/ui for beautiful components
- MongoDB team for the robust database
- All contributors and testers

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
