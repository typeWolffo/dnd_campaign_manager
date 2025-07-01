import { Api } from "./Api";

export const ApiClient = new Api({
  baseURL: import.meta.env.VITE_API_URL,
  secure: true,
  withCredentials: true,
});
