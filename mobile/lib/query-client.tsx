import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error: unknown) => {
        const errorWithStatus = error as { status?: number };

        if (errorWithStatus?.status === 401 || errorWithStatus?.status === 403) {
          return false;
        }

        if (failureCount >= 3) return false;

        return true;
      },
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        const errorWithStatus = error as { status?: number };

        if (errorWithStatus?.status === 401 || errorWithStatus?.status === 403) {
          return false;
        }

        if (failureCount >= 2) return false;

        return true;
      },
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
