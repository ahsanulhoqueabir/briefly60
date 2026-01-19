export interface UpdateProfilePayload {
  name?: string;
  image?: string;
  preferences?: {
    language?: string;
    notifications?: boolean;
    theme?: "light" | "dark";
  };
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    email: string;
    name: string;
    image?: string;
    rbac: string;
    preferences?: {
      language?: string;
      notifications?: boolean;
      theme?: "light" | "dark";
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  url?: string;
}
