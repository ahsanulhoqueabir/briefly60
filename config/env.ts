export const placeholderImage =
  process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE ||
  "https://placehold.co/600x400/1d777b/cf4040";

export const jwtSecret = {
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN || "2592000",
};

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
};

export const baseurl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const mongodb = process.env.MONGODB_URI!;

export const sslcommerzConfig = {
  storeId: process.env.SSLCOMMERZ_STORE_ID!,
  storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD!,
  isLive: process.env.SSLCOMMERZ_IS_LIVE === "true",
  successUrl: `${baseurl}/api/subscription/sslcommerz/success`,
  failUrl: `${baseurl}/api/subscription/sslcommerz/fail`,
  cancelUrl: `${baseurl}/api/subscription/sslcommerz/cancel`,
  ipnUrl: `${baseurl}/api/subscription/sslcommerz/ipn`,
};

export const turnstileConfig = {
  siteKey: process.env.TURNSTILE_SITE_KEY!,
  secretKey: process.env.TURNSTILE_SECRET_KEY!,
};
