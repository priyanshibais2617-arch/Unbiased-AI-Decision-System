export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers);
    const hasFormBody = options.body instanceof FormData;

    if (!hasFormBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || data?.detail || "API request failed");
    }

    return data;
}
