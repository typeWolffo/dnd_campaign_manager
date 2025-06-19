import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
});

export const { useSession, signIn, signUp, signOut, forgetPassword, resetPassword } = authClient;
