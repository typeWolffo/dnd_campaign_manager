import { treaty } from "@elysiajs/eden";
import type { App } from "../../../api/src/index";

export const apiClient = treaty<App>("http://localhost:3001", {
  fetch: {
    credentials: "include",
  },
});

export type { App } from "../../../api/src/index";
