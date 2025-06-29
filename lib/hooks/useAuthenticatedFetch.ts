"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAuthenticatedFetch() {
  const router = useRouter();

  const authenticatedFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return null;
      }

      const res = await fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        router.push("/login");
        return null;
      }

      return res;
    },
    [router]
  );

  return authenticatedFetch;
}
