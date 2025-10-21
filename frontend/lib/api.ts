import { useUserStore } from "../store/useUserStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = useUserStore.getState().user?.token;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
};
