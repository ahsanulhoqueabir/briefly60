"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Eye,
  Palette,
  Globe,
  Shield,
  Save,
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Trash2,
  HardDrive,
} from "lucide-react";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { UserPreferences } from "@/types";
import { cn } from "@/lib/utils";
import SettingSection from "@/components/SettingSection";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCacheClear } from "@/hooks/use-cache-clear";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { user, updateLanguagePreference } = useAuth();
  const { clear_cache, is_clearing } = useCacheClear();
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferred_categories: ["politics", "technology"],
    language: "en",
    notification_settings: {
      email: true,
      push: false,
      trending_news: true,
      breaking_news: true,
    },
    reading_preferences: {
      font_size: "medium",
      autoplay_videos: false,
    },
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLanguageUpdating, setIsLanguageUpdating] = useState(false);

  // Initialize language from user preferences
  useEffect(() => {
    if (user?.preferences?.language) {
      setPreferences((prev) => ({
        ...prev,
        language: user.preferences!.language as "en" | "bn",
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // TODO: Implement actual save logic
    console.log("Saving preferences:", preferences);
    setIsLoading(false);
  };

  const handleLanguageChange = async (language: "bn" | "en") => {
    if (isLanguageUpdating) return;

    setIsLanguageUpdating(true);

    // Optimistically update UI
    setPreferences((prev) => ({
      ...prev,
      language,
    }));

    try {
      const result = await updateLanguagePreference(language);

      if (result.success) {
        toast.success(
          language === "bn"
            ? "ভাষা পছন্দ সফলভাবে আপডেট করা হয়েছে"
            : "Language preference updated successfully",
        );
      } else {
        throw new Error(result.error || "Failed to update language");
      }
    } catch (error) {
      // Revert on error
      setPreferences((prev) => ({
        ...prev,
        language: user?.preferences?.language === "bn" ? "bn" : "en",
      }));
      toast.error(
        language === "bn"
          ? "Failed to update language preference"
          : "ভাষা পছন্দ আপডেট করতে ব্যর্থ",
      );
      console.error("Language update error:", error);
    } finally {
      setIsLanguageUpdating(false);
    }
  };

  const updatePreferences = (
    section: keyof UserPreferences,
    key: string,
    value: boolean | string,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, boolean | string>),
        [key]: value,
      },
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(categoryId)
        ? prev.preferred_categories.filter((id) => id !== categoryId)
        : [...prev.preferred_categories, categoryId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Link href="/" className="text-blue-600 hover:text-blue-700 mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Customize your Briefly60 experience</p>
        </div>

        <div className="space-y-6">
          {/* Categories */}
          <SettingSection
            id="categories"
            title="Preferred Categories"
            description="Choose the news categories you're most interested in"
            icon={Globe}
            isActive={activeSection === "categories"}
            onToggle={setActiveSection}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the categories you want to see more often in your feed:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {NEWS_CATEGORIES.map((category) => {
                  const isSelected = preferences.preferred_categories.includes(
                    category.id,
                  );
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        isSelected
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white hover:bg-gray-50",
                      )}
                    >
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {category.name_bn}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </SettingSection>

          {/* Notifications */}
          <SettingSection
            id="notifications"
            title="Notification Preferences"
            description="Control how and when you receive notifications"
            icon={Bell}
            isActive={activeSection === "notifications"}
            onToggle={setActiveSection}
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Notification Channels
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Email notifications
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.notification_settings.email}
                      onChange={(e) =>
                        updatePreferences(
                          "notification_settings",
                          "email",
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Push notifications
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.notification_settings.push}
                      onChange={(e) =>
                        updatePreferences(
                          "notification_settings",
                          "push",
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Content Preferences
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Trending news alerts
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.notification_settings.trending_news}
                      onChange={(e) =>
                        updatePreferences(
                          "notification_settings",
                          "trending_news",
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Breaking news alerts
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.notification_settings.breaking_news}
                      onChange={(e) =>
                        updatePreferences(
                          "notification_settings",
                          "breaking_news",
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Reading Preferences */}
          <SettingSection
            id="reading"
            title="Reading Experience"
            description="Customize how articles are displayed"
            icon={Eye}
            isActive={activeSection === "reading"}
            onToggle={setActiveSection}
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Text Size</h4>
                <div className="flex space-x-3">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        updatePreferences(
                          "reading_preferences",
                          "font_size",
                          size,
                        )
                      }
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        preferences.reading_preferences.font_size === size
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      )}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">
                  Display Options
                </h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground mb-3 block">
                      Theme
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-lg border-2 transition-all",
                          theme === "light"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground",
                        )}
                      >
                        <Sun className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-lg border-2 transition-all",
                          theme === "dark"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground",
                        )}
                      >
                        <Moon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                      <button
                        onClick={() => {
                          const systemTheme = window.matchMedia(
                            "(prefers-color-scheme: dark)",
                          ).matches
                            ? "dark"
                            : "light";
                          setTheme(systemTheme);
                        }}
                        className={cn(
                          "flex items-center justify-center p-3 rounded-lg border-2 transition-all",
                          "border-border hover:border-primary/50 text-muted-foreground",
                        )}
                      >
                        <Monitor className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">System</span>
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Autoplay videos
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.reading_preferences.autoplay_videos}
                      onChange={(e) =>
                        updatePreferences(
                          "reading_preferences",
                          "autoplay_videos",
                          e.target.checked,
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Language */}
          <SettingSection
            id="language"
            title="Language & Region"
            description="Set your preferred language and regional settings"
            icon={Palette}
            isActive={activeSection === "language"}
            onToggle={setActiveSection}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Content Language
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose your preferred language for news articles. This will
                  apply to all articles across the app.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLanguageChange("bn")}
                    disabled={isLanguageUpdating}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                      preferences.language === "bn"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground",
                      isLanguageUpdating && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    বাংলা (Bengali)
                  </button>
                  <button
                    onClick={() => handleLanguageChange("en")}
                    disabled={isLanguageUpdating}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all",
                      preferences.language === "en"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground",
                      isLanguageUpdating && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    English
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {preferences.language === "bn"
                    ? "নিবন্ধগুলি বাংলায় প্রদর্শিত হবে"
                    : "Articles will be displayed in English"}
                </p>
              </div>
            </div>
          </SettingSection>

          {/* Account */}
          <SettingSection
            id="account"
            title="Account & Privacy"
            description="Manage your account settings and privacy preferences"
            icon={Shield}
            isActive={activeSection === "account"}
            onToggle={setActiveSection}
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/profile"
                  className="flex-1 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h5 className="font-medium text-gray-900">
                    Profile Information
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Update your name, email, and avatar
                  </p>
                </Link>
                <Link
                  href="/privacy"
                  className="flex-1 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h5 className="font-medium text-gray-900">
                    Privacy Settings
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Control your data and privacy
                  </p>
                </Link>
              </div>
            </div>

            {/* System & Storage */}
            <SettingSection
              id="system"
              title="System & Storage"
              description="Manage app data and cache"
              icon={HardDrive}
              isActive={activeSection === "system"}
              onToggle={setActiveSection}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Clear App Cache
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Clear cached data including service workers, local storage,
                    and browser cache. This helps resolve issues with outdated
                    content and ensures you see the latest updates.
                  </p>
                  <button
                    onClick={clear_cache}
                    disabled={is_clearing}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border-2 border-destructive/50 text-destructive rounded-lg font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    <Trash2 className="size-4" />
                    {is_clearing ? "Clearing Cache..." : "Clear Cache & Reload"}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ This will clear all cached data and reload the page
                  </p>
                </div>
              </div>
            </SettingSection>
          </SettingSection>
        </div>

        {/* Save Button */}
        {!activeSection && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={cn(
                "flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
