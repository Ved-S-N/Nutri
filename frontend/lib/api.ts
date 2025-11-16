import { useUserStore } from "../store/useUserStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/";

/**
 * apiFetch - a universal fetch wrapper that automatically attaches
 * the JWT token from Zustand and safely handles JSON + errors.
 */
export const apiFetch = async (
  path: string,
  options: RequestInit & { isFormData?: boolean } = {}
) => {
  const token = useUserStore.getState().user?.token;

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    // Try parsing JSON safely
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      // ✅ Handle unauthorized errors gracefully
      if (response.status === 401) {
        console.warn("⚠️ Unauthorized — logging out user");
        useUserStore.getState().logout();
      }

      const message =
        data?.message ||
        data?.error ||
        `API error (${response.status}): ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error("❌ API Fetch Error:", err);
    throw err;
  }
};
// import { useUserStore } from "../store/useUserStore";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/";

// export const apiFetch = async (path: string, options: any = {}) => {
//   const token = useUserStore.getState().user?.token;

//   const isFormData = options.body instanceof FormData;

//   // Build headers safely
//   const headers: any = {
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...options.headers,
//   };

//   // ⛔ Do NOT set Content-Type when sending FormData
//   if (!isFormData) {
//     headers["Content-Type"] = "application/json";
//   }

//   try {
//     const response = await fetch(`${API_URL}${path}`, {
//       ...options,
//       headers,
//       body: isFormData ? options.body : JSON.stringify(options.body),
//     });

//     // Safely try JSON
//     const text = await response.text();
//     let data = null;

//     try {
//       data = JSON.parse(text);
//     } catch (err) {
//       console.warn("⚠️ Non-JSON response:", text);
//     }

//     // Error handling
//     if (!response.ok) {
//       if (response.status === 401) {
//         console.warn("⚠️ Unauthorized — logging out user");
//         useUserStore.getState().logout();
//       }

//       throw new Error(
//         data?.message ||
//           data?.error ||
//           `API Error (${response.status}): ${response.statusText}`
//       );
//     }

//     return data;
//   } catch (err) {
//     console.error("❌ API Fetch Error:", err);
//     throw err;
//   }
// };
