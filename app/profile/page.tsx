"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserIcon, Mail, Calendar, Edit } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProfileEditForm } from "@/components/ProfileEditForm";

const ProfilePage: React.FC = () => {
  const { user, loading, refreshUser } = useAuth();
  const [is_editing, set_is_editing] = useState(false);

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
            Please log in to access your profile.
          </p>
        </div>
      </div>
    );
  }

  const getUserInitials = (name: string | undefined) => {
    if (!name) return "U";
    const initial = name.charAt(0).toUpperCase();
    return initial || "U";
  };

  const handle_edit_success = async () => {
    set_is_editing(false);
    // Refresh user data after successful update
    if (refreshUser) {
      await refreshUser();
    }
  };

  // Show edit form if editing
  if (is_editing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileEditForm
          user={user}
          onSuccess={handle_edit_success}
          onCancel={() => set_is_editing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your account information.
          </p>
        </div>
        <Button onClick={() => set_is_editing(true)} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Profile Information Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.first_name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-medium">
                {getUserInitials(user.first_name)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold">{user.first_name}</h2>
              <p className="text-muted-foreground">Welcome to Briefly60!</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{user.first_name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email Address</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Account Type</p>
                <p className="text-muted-foreground capitalize">
                  {user.plan} Account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl font-bold ">0</p>
              <p className="text-sm ">Articles Read</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl font-bold ">0</p>
              <p className="text-sm ">Bookmarks</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <p className="text-2xl font-bold ">0</p>
              <p className="text-sm ">Shares</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Subscription Plan</p>
              <p className="text-muted-foreground capitalize">
                {user.plan} Plan
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Subscriptions</p>
              <p className="text-muted-foreground">
                {user.subscriptions?.length || 0} subscription(s)
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Account Status</p>
              <p className="text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
