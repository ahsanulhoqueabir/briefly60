import { useState } from "react";
import axios from "axios";
import {
  UpdateProfilePayload,
  ProfileUpdateResponse,
} from "@/types/profile.types";
import { toast } from "sonner";

export const useProfile = () => {
  const [loading, set_loading] = useState(false);

  const update_profile = async (
    payload: UpdateProfilePayload,
  ): Promise<ProfileUpdateResponse> => {
    try {
      set_loading(true);
      const response = await axios.put<ProfileUpdateResponse>(
        "/api/profile",
        payload,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to update profile";
        toast.error(message);
        throw new Error(message);
      }
      toast.error("Failed to update profile");
      throw error;
    } finally {
      set_loading(false);
    }
  };

  const get_profile = async () => {
    try {
      set_loading(true);
      const response = await axios.get("/api/profile");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to fetch profile";
        toast.error(message);
        throw new Error(message);
      }
      toast.error("Failed to fetch profile");
      throw error;
    } finally {
      set_loading(false);
    }
  };

  return {
    update_profile,
    get_profile,
    loading,
  };
};
