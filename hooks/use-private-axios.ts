import { LocalStorageService } from "@/services/localstorage.services";
import axios, { AxiosInstance } from "axios";
import { useMemo } from "react";

export default function usePrivateAxios(): AxiosInstance {
  let token = null;
  if (typeof window !== "undefined") {
    token = LocalStorageService.getAuthToken();
  }

  return useMemo(() => {
    const instance = axios.create();
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return instance;
  }, [token]);
}
