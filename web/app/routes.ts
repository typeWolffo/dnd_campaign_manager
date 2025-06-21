import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/sign-in", "routes/sign-in.tsx"),
  route("/sign-up", "routes/sign-up.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/rooms/:roomId", "routes/room-details.tsx"),
  route("/faq", "routes/faq.tsx"),
] satisfies RouteConfig;
