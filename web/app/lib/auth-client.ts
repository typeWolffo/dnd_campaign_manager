import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001", // API server URL via HTTPS proxy
});

export const { useSession, signIn, signUp, signOut, forgetPassword, resetPassword } = authClient;
