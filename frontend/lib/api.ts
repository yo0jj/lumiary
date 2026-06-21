import { createClient } from "./supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

async function authFetch(path: string, options: RequestInit = {}) {
  const supabase = createClient();

  // getSession()은 만료 시 null 반환 → refreshSession으로 갱신 후 재시도
  let { data } = await supabase.auth.getSession();
  if (!data.session) {
    const refreshed = await supabase.auth.refreshSession();
    data = refreshed.data as typeof data;
  }
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
