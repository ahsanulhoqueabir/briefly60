# 📡 Briefly60 API Documentation

Complete API reference for Briefly60 News Aggregation Platform. This document covers all available endpoints, request/response formats, authentication requirements, and usage examples.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Authentication APIs](#authentication-apis)
- [Profile APIs](#profile-apis)
- [Article APIs](#article-apis)
- [Bookmark APIs](#bookmark-apis)
- [Quiz APIs](#quiz-apis)
- [Subscription APIs](#subscription-apis)
- [Admin APIs](#admin-apis)
- [Dashboard Analytics APIs](#dashboard-analytics-apis)

---

## Base URL

```
Development: http://localhost:3000
Production: https://briefly60.vercel.app
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

### Header Format

```http
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

Tokens are obtained through the login endpoint and should be stored securely on the client side.

## Response Format

All API responses follow a standard format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

## Error Handling

### HTTP Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource not found          |
| 409  | Conflict - Resource already exists      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error    |

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- Admin endpoints: 200 requests per minute

---

# Authentication APIs

## Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "language": "en" // optional: "en" or "bn"
}
```

**Validation Rules:**

- Name: 2-50 characters
- Email: Valid email format, unique
- Password: Minimum 8 characters, at least one uppercase, one lowercase, one number

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "language": "en"
  }
}
```

**Error Responses:**

- 400: Invalid input data
- 409: Email already registered

---

## Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://res.cloudinary.com/...",
    "subscription_status": "active"
  }
}
```

**Error Responses:**

- 400: Invalid credentials
- 401: Email or password incorrect
- 429: Too many login attempts

---

## Get Current User

Get authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://res.cloudinary.com/...",
    "language": "en",
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

## Forgot Password

Request password reset email.

**Endpoint:** `POST /api/auth/forgot-password`

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Error Responses:**

- 404: User not found
- 429: Too many reset requests

---

## Reset Password

Reset password using token from email.

**Endpoint:** `POST /api/auth/reset-password`

**Authentication:** Not required

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**

- 400: Invalid or expired token
- 400: Invalid password format

---

## Update Language Preference

Update user's language preference.

**Endpoint:** `POST /api/auth/language-preference`

**Authentication:** Required

**Request Body:**

```json
{
  "language": "bn" // "en" or "bn"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Language preference updated",
  "language": "bn"
}
```

---

# Profile APIs

## Get User Profile

Get detailed user profile information.

**Endpoint:** `GET /api/profile`

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://res.cloudinary.com/...",
    "language": "en",
    "theme": "dark",
    "bio": "Tech enthusiast and news reader",
    "reading_stats": {
      "articles_read": 145,
      "total_reading_time": 12500,
      "favorite_categories": ["Technology", "Science"]
    },
    "quiz_stats": {
      "quizzes_taken": 67,
      "average_score": 85.5,
      "total_points": 5735
    },
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

---

## Update Profile

Update user profile information.

**Endpoint:** `PUT /api/profile`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "John Doe Updated",
  "bio": "Updated bio text",
  "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // Base64 image (optional)
  "theme": "dark", // "light", "dark", or "system"
  "language": "en"
}
```

**Note:** Avatar can be provided as base64-encoded image data. The system will automatically upload to Cloudinary.

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe Updated",
    "bio": "Updated bio text",
    "avatar": "https://res.cloudinary.com/...",
    "theme": "dark",
    "language": "en"
  }
}
```

---

# Article APIs

## Get Articles

Retrieve paginated list of articles with optional filters.

**Endpoint:** `GET /api/articles`

**Authentication:** Optional (required for personalized results)

**Query Parameters:**

| Parameter | Type    | Default     | Description                                                    |
| --------- | ------- | ----------- | -------------------------------------------------------------- |
| page      | number  | 1           | Page number                                                    |
| limit     | number  | 10          | Items per page (max 50)                                        |
| category  | string  | -           | Filter by category                                             |
| featured  | boolean | -           | Filter featured articles                                       |
| sort      | string  | "date_desc" | Sort order: "date_desc", "date_asc", "views_desc", "title_asc" |

**Example Request:**

```http
GET /api/articles?page=1&limit=20&category=technology&sort=date_desc
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "article_id",
        "title": "Breaking News: AI Breakthrough",
        "description": "Scientists achieve major milestone...",
        "content": "Full article content...",
        "category": "Technology",
        "author": "Jane Smith",
        "published_date": "2026-01-20T08:00:00Z",
        "image_url": "https://example.com/image.jpg",
        "is_featured": true,
        "is_important": false,
        "views": 1523,
        "read_count": 892,
        "tags": ["AI", "Science", "Innovation"]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_articles": 200,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

## Get Article by ID

Retrieve single article with full details.

**Endpoint:** `GET /api/articles/[id]`

**Authentication:** Optional

**Response (200):**

```json
{
  "success": true,
  "article": {
    "id": "article_id",
    "title": "Breaking News: AI Breakthrough",
    "description": "Scientists achieve major milestone...",
    "content": "Full detailed article content with rich formatting...",
    "category": "Technology",
    "author": "Jane Smith",
    "published_date": "2026-01-20T08:00:00Z",
    "image_url": "https://example.com/image.jpg",
    "is_featured": true,
    "is_important": false,
    "views": 1523,
    "read_count": 892,
    "engagement_time": 245,
    "tags": ["AI", "Science", "Innovation"],
    "related_articles": [
      {
        "id": "related_id",
        "title": "Related Article",
        "image_url": "https://example.com/related.jpg"
      }
    ]
  }
}
```

**Error Responses:**

- 404: Article not found

---

## Search Articles

Full-text search across articles.

**Endpoint:** `GET /api/articles/search`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| q         | string | Yes      | Search query                   |
| page      | number | No       | Page number (default: 1)       |
| limit     | number | No       | Results per page (default: 20) |
| category  | string | No       | Filter by category             |

**Example Request:**

```http
GET /api/articles/search?q=artificial+intelligence&category=technology&page=1
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "article_id",
        "title": "AI Revolution in Healthcare",
        "description": "How AI is transforming medical diagnosis...",
        "category": "Technology",
        "published_date": "2026-01-19T10:00:00Z",
        "image_url": "https://example.com/image.jpg",
        "relevance_score": 0.95
      }
    ],
    "total_results": 45,
    "query": "artificial intelligence",
    "pagination": {
      "current_page": 1,
      "total_pages": 3
    }
  }
}
```

---

## Get Featured Articles

Retrieve featured articles.

**Endpoint:** `GET /api/articles/featured`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| limit     | number | 5       | Number of articles (max 20) |

**Response (200):**

```json
{
  "success": true,
  "articles": [
    {
      "id": "article_id",
      "title": "Featured Article Title",
      "description": "Article description...",
      "category": "Politics",
      "image_url": "https://example.com/image.jpg",
      "published_date": "2026-01-20T08:00:00Z",
      "is_featured": true
    }
  ]
}
```

---

## Get Trending Articles

Retrieve trending articles based on views and recency.

**Endpoint:** `GET /api/articles/trending`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| limit     | number | 10      | Number of articles (max 50) |
| timeframe | string | "24h"   | "24h", "7d", "30d"          |

**Response (200):**

```json
{
  "success": true,
  "articles": [
    {
      "id": "article_id",
      "title": "Trending Article",
      "views": 5234,
      "trending_score": 95.7,
      "category": "Sports",
      "image_url": "https://example.com/image.jpg"
    }
  ]
}
```

---

## Discover Articles

Personalized article recommendations (requires authentication).

**Endpoint:** `GET /api/articles/discover`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| page      | number | 1       | Page number    |
| limit     | number | 20      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "recommendations": [
    {
      "id": "article_id",
      "title": "Recommended Article",
      "description": "Based on your reading history...",
      "category": "Technology",
      "match_score": 0.89,
      "reasons": ["Similar to articles you've read", "Popular in Technology"]
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5
  }
}
```

---

## Get Article Quiz

Get quiz questions for a specific article.

**Endpoint:** `GET /api/articles/[id]/quiz`

**Authentication:** Optional

**Response (200):**

```json
{
  "success": true,
  "quiz": {
    "article_id": "article_id",
    "article_title": "Article Title",
    "questions": [
      {
        "id": "question_id",
        "question_text": "What is the main topic?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer_index": 2
      }
    ],
    "total_questions": 5,
    "time_limit": 300
  }
}
```

---

# Bookmark APIs

## Get User Bookmarks

Retrieve all bookmarks for authenticated user.

**Endpoint:** `GET /api/bookmarks`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type   | Default     | Description    |
| --------- | ------ | ----------- | -------------- |
| page      | number | 1           | Page number    |
| limit     | number | 20          | Items per page |
| sort      | string | "date_desc" | Sort order     |

**Response (200):**

```json
{
  "success": true,
  "bookmarks": [
    {
      "id": "bookmark_id",
      "article": {
        "id": "article_id",
        "title": "Bookmarked Article",
        "description": "Article description...",
        "category": "Technology",
        "image_url": "https://example.com/image.jpg"
      },
      "bookmarked_at": "2026-01-18T14:30:00Z"
    }
  ],
  "total": 35,
  "pagination": {
    "current_page": 1,
    "total_pages": 2
  }
}
```

---

## Create Bookmark

Bookmark an article.

**Endpoint:** `POST /api/bookmarks`

**Authentication:** Required

**Request Body:**

```json
{
  "article_id": "article_id"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Article bookmarked successfully",
  "bookmark": {
    "id": "bookmark_id",
    "article_id": "article_id",
    "bookmarked_at": "2026-01-21T10:00:00Z"
  }
}
```

**Error Responses:**

- 400: Article ID required
- 404: Article not found
- 409: Article already bookmarked

---

## Delete Bookmark

Remove a bookmark.

**Endpoint:** `DELETE /api/bookmarks/[id]`

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```

**Error Responses:**

- 404: Bookmark not found
- 403: Unauthorized to delete this bookmark

---

# Quiz APIs

## Submit Quiz Attempt

Submit quiz answers and get results.

**Endpoint:** `POST /api/quiz`

**Authentication:** Required

**Request Body:**

```json
{
  "article_id": "article_id",
  "answers": [2, 0, 3, 1, 2], // Array of selected option indices
  "time_taken": 245 // Time in seconds
}
```

**Response (201):**

```json
{
  "success": true,
  "result": {
    "quiz_id": "quiz_id",
    "article_id": "article_id",
    "score": 4,
    "total_questions": 5,
    "percentage": 80,
    "time_taken": 245,
    "correct_answers": [2, 0, 3, 1, 2],
    "user_answers": [2, 0, 3, 0, 2],
    "is_personal_best": true,
    "points_earned": 40
  }
}
```

---

## Get Quiz History

Retrieve user's quiz attempt history.

**Endpoint:** `GET /api/quiz/history`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| page      | number | 1       | Page number    |
| limit     | number | 20      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "history": [
    {
      "id": "quiz_id",
      "article": {
        "id": "article_id",
        "title": "Article Title",
        "category": "Technology"
      },
      "score": 4,
      "total_questions": 5,
      "percentage": 80,
      "time_taken": 245,
      "attempted_at": "2026-01-20T15:30:00Z"
    }
  ],
  "total": 67,
  "pagination": {
    "current_page": 1,
    "total_pages": 4
  }
}
```

---

## Get Quiz Statistics

Get user's overall quiz performance statistics.

**Endpoint:** `GET /api/quiz/stats`

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "stats": {
    "total_quizzes": 67,
    "total_questions_answered": 335,
    "correct_answers": 287,
    "accuracy": 85.67,
    "average_score": 4.28,
    "average_time": 238,
    "total_points": 2870,
    "best_category": "Technology",
    "improvement_trend": "increasing",
    "recent_performance": [
      {
        "date": "2026-01-20",
        "quizzes": 3,
        "average_score": 4.33
      }
    ]
  }
}
```

---

## Get Quiz Leaderboard

Get leaderboard for a specific article's quiz.

**Endpoint:** `GET /api/quiz/leaderboard/[article_id]`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type   | Default | Description                     |
| --------- | ------ | ------- | ------------------------------- |
| limit     | number | 10      | Number of entries (max 100)     |
| timeframe | string | "all"   | "all", "today", "week", "month" |

**Response (200):**

```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "user_id",
        "name": "Top Scorer",
        "avatar": "https://res.cloudinary.com/..."
      },
      "score": 5,
      "time_taken": 180,
      "attempted_at": "2026-01-20T12:00:00Z"
    }
  ],
  "user_rank": 15,
  "total_participants": 234
}
```

---

## Get Quiz by Article

Get quiz questions for a specific article.

**Endpoint:** `GET /api/quiz/article/[article_id]`

**Authentication:** Optional

**Response (200):**

```json
{
  "success": true,
  "quiz": {
    "article_id": "article_id",
    "questions": [
      {
        "question_text": "What is the main topic?",
        "options": ["Option A", "Option B", "Option C", "Option D"]
      }
    ],
    "total_questions": 5,
    "time_limit": 300
  }
}
```

---

# Subscription APIs

## Get Subscription Plans

Retrieve all available subscription plans.

**Endpoint:** `GET /api/subscription/plans`

**Authentication:** Not required

**Response (200):**

```json
{
  "success": true,
  "plans": [
    {
      "id": "plan_id",
      "name": "Monthly Premium",
      "duration": "monthly",
      "price": 299,
      "currency": "BDT",
      "features": [
        "Unlimited article access",
        "Ad-free experience",
        "Offline reading",
        "Priority support"
      ],
      "is_popular": false,
      "discount_percentage": 0,
      "version": 1
    },
    {
      "id": "plan_id_2",
      "name": "Yearly Premium",
      "duration": "yearly",
      "price": 2999,
      "currency": "BDT",
      "features": [
        "All monthly features",
        "20% discount",
        "Early access to new features"
      ],
      "is_popular": true,
      "discount_percentage": 20,
      "version": 1
    }
  ]
}
```

---

## Get Current Subscription

Get user's current subscription status.

**Endpoint:** `GET /api/subscription/status`

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "subscription": {
    "id": "subscription_id",
    "plan": {
      "name": "Monthly Premium",
      "duration": "monthly",
      "price": 299
    },
    "status": "active",
    "start_date": "2026-01-01T00:00:00Z",
    "end_date": "2026-02-01T00:00:00Z",
    "auto_renewal": true,
    "days_remaining": 11,
    "is_trial": false,
    "payment_method": "card"
  }
}
```

**Possible Status Values:**

- `active` - Subscription is active
- `expired` - Subscription has expired
- `cancelled` - Subscription cancelled
- `pending` - Payment pending

---

## Initialize Payment

Initialize subscription payment with SSLCommerz.

**Endpoint:** `POST /api/subscription/init`

**Authentication:** Required

**Request Body:**

```json
{
  "plan_id": "plan_id",
  "auto_renewal": true,
  "payment_method": "card" // "card", "mobile_banking", "internet_banking"
}
```

**Response (200):**

```json
{
  "success": true,
  "payment_url": "https://securepay.sslcommerz.com/gwprocess/...",
  "session_key": "session_key",
  "transaction_id": "TXN123456"
}
```

**Note:** Redirect user to `payment_url` to complete payment.

---

## Get Subscription History

Get user's subscription transaction history.

**Endpoint:** `GET /api/subscription/history`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| page      | number | 1       | Page number    |
| limit     | number | 10      | Items per page |

**Response (200):**

```json
{
  "success": true,
  "history": [
    {
      "id": "transaction_id",
      "plan_name": "Monthly Premium",
      "amount": 299,
      "currency": "BDT",
      "status": "completed",
      "payment_method": "card",
      "transaction_date": "2026-01-01T10:00:00Z",
      "invoice_url": "/api/subscription/invoice/transaction_id"
    }
  ],
  "total": 12,
  "pagination": {
    "current_page": 1,
    "total_pages": 2
  }
}
```

---

## Cancel Auto-Renewal

Cancel automatic subscription renewal.

**Endpoint:** `POST /api/subscription/cancel-renewal`

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Auto-renewal cancelled successfully",
  "subscription": {
    "id": "subscription_id",
    "auto_renewal": false,
    "end_date": "2026-02-01T00:00:00Z"
  }
}
```

---

## SSLCommerz Webhooks

### Payment Success

**Endpoint:** `POST /api/subscription/sslcommerz/success`

Handles successful payment callback from SSLCommerz.

### Payment Failure

**Endpoint:** `POST /api/subscription/sslcommerz/fail`

Handles failed payment callback from SSLCommerz.

### Payment Cancellation

**Endpoint:** `POST /api/subscription/sslcommerz/cancel`

Handles cancelled payment callback from SSLCommerz.

### IPN (Instant Payment Notification)

**Endpoint:** `POST /api/subscription/sslcommerz/ipn`

Handles instant payment notifications from SSLCommerz.

---

# Admin APIs

All admin endpoints require authentication with `admin` or `superadmin` role.

## Subscription Plan Management

### Get All Plans (Admin)

**Endpoint:** `GET /api/admin/subscription-plans`

**Authentication:** Required (Admin/Superadmin)

**Response (200):**

```json
{
  "success": true,
  "plans": [
    {
      "id": "plan_id",
      "name": "Monthly Premium",
      "duration": "monthly",
      "price": 299,
      "version": 2,
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "active_subscriptions": 1250
    }
  ]
}
```

---

### Create Subscription Plan

**Endpoint:** `POST /api/admin/subscription-plans`

**Authentication:** Required (Superadmin)

**Request Body:**

```json
{
  "name": "Quarterly Premium",
  "duration": "quarterly",
  "price": 799,
  "currency": "BDT",
  "features": ["All premium features", "15% discount"],
  "description": "Best value for 3 months",
  "is_popular": false
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Plan created successfully",
  "plan": {
    "id": "new_plan_id",
    "name": "Quarterly Premium",
    "price": 799,
    "version": 1
  }
}
```

---

### Update Subscription Plan

**Endpoint:** `PATCH /api/admin/subscription-plans/[id]`

**Authentication:** Required (Superadmin)

**Request Body:**

```json
{
  "price": 849,
  "features": ["Updated feature list"],
  "is_popular": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Plan updated successfully (new version created)",
  "plan": {
    "id": "plan_id",
    "version": 2,
    "price": 849
  }
}
```

**Note:** Updates create new versions to protect existing subscribers' pricing.

---

### Delete Subscription Plan

**Endpoint:** `DELETE /api/admin/subscription-plans/[id]`

**Authentication:** Required (Superadmin)

**Response (200):**

```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

**Error Responses:**

- 409: Cannot delete plan with active subscriptions

---

# Dashboard Analytics APIs

All dashboard endpoints require authentication with appropriate role permissions.

## Get Dashboard Statistics

**Endpoint:** `GET /api/dashboard/stats`

**Authentication:** Required (Admin/Superadmin)

**Response (200):**

```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 15234,
      "active_today": 1523,
      "new_this_week": 234,
      "growth_rate": 12.5
    },
    "articles": {
      "total": 5678,
      "published_this_week": 45,
      "total_views": 234567,
      "average_engagement": 245
    },
    "subscriptions": {
      "active": 3456,
      "revenue_this_month": 125000,
      "conversion_rate": 22.7,
      "churn_rate": 3.2
    },
    "engagement": {
      "quizzes_taken": 8900,
      "bookmarks_created": 12345,
      "average_session_time": 892
    }
  }
}
```

---

## Get Analytics Data

**Endpoint:** `GET /api/dashboard/analytics`

**Authentication:** Required (Admin/Superadmin)

**Query Parameters:**

| Parameter   | Type   | Default  | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| metric      | string | Required | "users", "revenue", "engagement", "articles" |
| timeframe   | string | "30d"    | "7d", "30d", "90d", "1y"                     |
| granularity | string | "day"    | "hour", "day", "week", "month"               |

**Response (200):**

```json
{
  "success": true,
  "metric": "users",
  "timeframe": "30d",
  "data": [
    {
      "date": "2026-01-01",
      "value": 145,
      "label": "Active Users"
    },
    {
      "date": "2026-01-02",
      "value": 167,
      "label": "Active Users"
    }
  ],
  "summary": {
    "total": 4523,
    "average": 150.77,
    "trend": "increasing",
    "change_percentage": 15.3
  }
}
```

---

## Get User Management Data

**Endpoint:** `GET /api/dashboard/users`

**Authentication:** Required (Admin/Superadmin)

**Query Parameters:**

| Parameter | Type   | Default | Description          |
| --------- | ------ | ------- | -------------------- |
| page      | number | 1       | Page number          |
| limit     | number | 20      | Items per page       |
| role      | string | -       | Filter by role       |
| status    | string | -       | Filter by status     |
| search    | string | -       | Search by name/email |

**Response (200):**

```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "subscription_status": "active",
      "last_login": "2026-01-20T10:30:00Z",
      "articles_read": 145,
      "quizzes_taken": 67,
      "created_at": "2025-12-15T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 762,
    "total_users": 15234
  }
}
```

---

## Update User Role

**Endpoint:** `PATCH /api/dashboard/users/[id]`

**Authentication:** Required (Admin/Superadmin)

**Request Body:**

```json
{
  "role": "editor",
  "is_active": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "role": "editor"
  }
}
```

---

## Bulk User Operations

**Endpoint:** `POST /api/dashboard/users/bulk`

**Authentication:** Required (Admin/Superadmin)

**Request Body:**

```json
{
  "action": "deactivate", // "activate", "deactivate", "delete"
  "user_ids": ["user_id_1", "user_id_2", "user_id_3"]
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Bulk operation completed",
  "processed": 3,
  "failed": 0
}
```

---

## Get Article Management Data

**Endpoint:** `GET /api/dashboard/articles`

**Authentication:** Required (Editor/Admin/Superadmin)

**Query Parameters:**

| Parameter | Type   | Default | Description        |
| --------- | ------ | ------- | ------------------ |
| page      | number | 1       | Page number        |
| limit     | number | 20      | Items per page     |
| category  | string | -       | Filter by category |
| status    | string | -       | Filter by status   |
| search    | string | -       | Search by title    |

**Response (200):**

```json
{
  "success": true,
  "articles": [
    {
      "id": "article_id",
      "title": "Article Title",
      "category": "Technology",
      "author": "Editor Name",
      "status": "published",
      "views": 1523,
      "read_count": 892,
      "published_date": "2026-01-20T08:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 284,
    "total_articles": 5678
  }
}
```

---

## Create Article (Admin)

**Endpoint:** `POST /api/dashboard/articles`

**Authentication:** Required (Editor/Admin/Superadmin)

**Request Body:**

```json
{
  "title": "New Article Title",
  "description": "Article description...",
  "content": "Full article content...",
  "category": "Technology",
  "author": "Author Name",
  "image_url": "https://example.com/image.jpg",
  "tags": ["AI", "Innovation"],
  "is_featured": false,
  "is_important": false,
  "published_date": "2026-01-21T10:00:00Z"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Article created successfully",
  "article": {
    "id": "new_article_id",
    "title": "New Article Title",
    "status": "published"
  }
}
```

---

## Update Article (Admin)

**Endpoint:** `PUT /api/dashboard/articles/[id]`

**Authentication:** Required (Editor/Admin/Superadmin)

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "is_featured": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Article updated successfully",
  "article": {
    "id": "article_id",
    "title": "Updated Title"
  }
}
```

---

## Delete Article (Admin)

**Endpoint:** `DELETE /api/dashboard/articles/[id]`

**Authentication:** Required (Admin/Superadmin)

**Response (200):**

```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

---

## Bulk Article Operations

**Endpoint:** `POST /api/dashboard/articles/bulk`

**Authentication:** Required (Admin/Superadmin)

**Request Body:**

```json
{
  "action": "feature", // "feature", "unfeature", "delete", "publish", "unpublish"
  "article_ids": ["article_id_1", "article_id_2"]
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Bulk operation completed",
  "processed": 2,
  "failed": 0
}
```

---

## Get Categories

**Endpoint:** `GET /api/dashboard/categories`

**Authentication:** Required (Admin/Superadmin)

**Response (200):**

```json
{
  "success": true,
  "categories": [
    {
      "id": "category_id",
      "name": "Technology",
      "slug": "technology",
      "article_count": 1234,
      "is_active": true
    }
  ]
}
```

---

## Testing & Development

### Test Endpoints

For testing purposes in development environment:

```bash
# Test Email Configuration
npm run test:email

# Test Database Connection
curl http://localhost:3000/api/health
```

---

## Postman Collection

A Postman collection with all endpoints and example requests is available in the `/docs` directory.

Import `Briefly60-API-Collection.json` into Postman for quick testing.

---

## API Versioning

Current API Version: **v1**

All endpoints are prefixed with `/api/` (v1 is default).

Future versions will use `/api/v2/` prefix.

---

## Support & Issues

For API support or to report issues:

- Email: contact.ahsanul@gmail.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/briefly60/issues)

---

## Changelog

### Version 1.0.0 (January 2026)

- Initial API release
- Authentication system
- Article management
- Subscription system with SSLCommerz
- Quiz functionality
- Bookmark system
- Admin dashboard APIs
- Analytics endpoints

---

Made with ❤️ by Briefly60 Team
