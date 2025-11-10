"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const PreferencesPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">
            Authentication Required
          </h1>
          <p className="text-muted-foreground">
            Please log in to access your preferences.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground mt-2">
          Customize your reading experience and notification settings.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Reading Preferences</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Reading preferences will be available soon. You&apos;ll be able to
              customize:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Preferred categories</li>
              <li>Language preferences</li>
              <li>Font size and theme</li>
              <li>Autoplay settings</li>
            </ul>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Notification settings will be available soon. You&apos;ll be able
              to configure:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Email notifications</li>
              <li>Push notifications</li>
              <li>Breaking news alerts</li>
              <li>Trending news updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
