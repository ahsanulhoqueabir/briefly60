export const directus = {
  url: process.env.DIRECTUS_URL!,
  token: process.env.DIRECTUS_STATIC_TOKEN!,
  generalRoleId: process.env.DIRECTUS_GENERAL_ROLE_ID!,
};

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
