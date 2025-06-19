import { treaty } from "@elysiajs/eden";
import type { App } from "../../../api/src/index";

export const apiClient = treaty<App>(import.meta.env.VITE_API_URL, {
  fetch: {
    credentials: "include",
  },
});

export type { App } from "../../../api/src/index";
