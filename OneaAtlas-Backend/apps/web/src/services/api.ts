
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    // Client-side: use window.Clerk to retrieve the JWT
    try {
      token = await (window as any).Clerk?.session?.getToken() || null;
    } catch (err) {
      console.error("[apiFetch] Failed to retrieve token from window.Clerk client-side:", err);
    }
  }

  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
  const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = `${API_URL}${cleanEndpoint}`;

  // Temporary debug logs as requested
  console.log("API_URL =", API_URL);
  console.log("endpoint =", cleanEndpoint);
  console.log("targetUrl =", targetUrl);
  console.log("Token existence =", token ? `Yes (length: ${token.length})` : "No");
  console.log("Fetch options =", JSON.stringify({
    method: options.method || "GET",
    hasHeaders: !!options.headers,
    credentials: "include",
  }));

  const response = await fetch(targetUrl, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    let errorBody = "";
    try {
      errorBody = await response.text();
    } catch {}
    console.error(`[apiFetch] API returned ${response.status}: ${errorBody}`);
    throw new Error(`API error: ${response.status} - ${errorBody || response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Backward compatibility alias for apiRequest
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return apiFetch<T>(endpoint, options);
}