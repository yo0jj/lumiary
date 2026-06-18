import { createClient } from "./supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

async function authFetch(path: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export const api = {
  post: (path: string, body: unknown) =>
    authFetch(path, { method: "POST", body: JSON.stringify(body) }),
  get: (path: string) => authFetch(path),
  patch: (path: string, body: unknown) =>
    authFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
};
