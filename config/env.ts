export const directus = {
  url: process.env.DIRECTUS_URL!,
  staticToken: process.env.DIRECTUS_STATIC_TOKEN!,
};

export const placeholderImage =
  process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE ||
  "https://placehold.co/600x400/1d777b/cf4040";
