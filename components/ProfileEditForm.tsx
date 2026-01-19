"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { UpdateProfilePayload } from "@/types/profile.types";
import { useProfile } from "@/hooks/use-profile";

interface ProfileEditFormProps {
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    preferences?: {
      language?: string;
      notifications?: boolean;
      theme?: "light" | "dark";
    };
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSuccess,
  onCancel,
}) => {
  const { update_profile, loading: updating } = useProfile();

  const [form_data, set_form_data] = useState({
    name: user.name || "",
    image: user.image || "",
    notifications: user.preferences?.notifications ?? true,
    theme: user.preferences?.theme || "light",
    language: user.preferences?.language || "en",
  });

  const [image_preview, set_image_preview] = useState<string | null>(
    user.image || null,
  );
  const [image_base64, set_image_base64] = useState<string | null>(null);
  const [uploading_image, set_uploading_image] = useState(false);

  const handle_image_change = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const valid_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!valid_types.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
      return;
    }

    // Validate file size (max 5MB)
    const max_size = 5 * 1024 * 1024;
    if (file.size > max_size) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    try {
      set_uploading_image(true);

      // Convert to base64
      const base64_data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === "string") {
            resolve(result);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      // Set preview and base64 data
      set_image_preview(base64_data);
      set_image_base64(base64_data);

      toast.success("Image selected successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process image",
      );
      set_image_preview(user.image || null);
      set_image_base64(null);
    } finally {
      set_uploading_image(false);
    }
  };

  const handle_remove_image = () => {
    set_form_data((prev) => ({ ...prev, image: "" }));
    set_image_preview(null);
    set_image_base64(null);
  };

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form_data.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      const payload: UpdateProfilePayload = {
        name: form_data.name.trim(),
        preferences: {
          language: form_data.language,
          notifications: form_data.notifications,
          theme: form_data.theme as "light" | "dark",
        },
      };

      // If new image base64 exists, add it to payload
      if (image_base64) {
        payload.image = image_base64;
      } else if (form_data.image === "" && user.image) {
        // User wants to remove image
        payload.image = "";
      }

      // Call API via hook
      const result = await update_profile(payload);

      if (result.success) {
        toast.success("Profile updated successfully");
        onSuccess();
      }
    } catch (error) {
      // Error is already handled by the hook
      console.error("Profile update error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handle_submit} className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              {image_preview ? (
                <div className="relative">
                  <Image
                    src={image_preview}
                    alt="Profile preview"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                  {!uploading_image && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handle_remove_image}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-medium">
                  {form_data.name.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="flex-1">
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  {uploading_image ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handle_image_change}
                  disabled={uploading_image}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Max 5MB. Supported formats: JPEG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={form_data.name}
              onChange={(e) =>
                set_form_data((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Preferences */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Preferences</h3>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates and news via email
                </p>
              </div>
              <Switch
                id="notifications"
                checked={form_data.notifications}
                onCheckedChange={(checked: boolean) =>
                  set_form_data((prev) => ({ ...prev, notifications: checked }))
                }
              />
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={form_data.theme}
                onChange={(e) =>
                  set_form_data((prev) => ({
                    ...prev,
                    theme: e.target.value as "light" | "dark",
                  }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={form_data.language}
                onChange={(e) =>
                  set_form_data((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={updating || uploading_image}
              className="flex-1"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={updating || uploading_image}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
