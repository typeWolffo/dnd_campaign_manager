import { signUp } from "../lib/auth-client";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useForm } from "react-hook-form";
import {
  type SignUpFormData,
  validateEmail,
  validatePassword,
  validateRequired,
} from "../lib/schemas";
import { useState } from "react";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    if (!validateRequired(data.name)) {
      setFieldError("name", { message: "Name is required" });
      return;
    }
    if (!validateEmail(data.email)) {
      setFieldError("email", { message: "Please enter a valid email address" });
      return;
    }
    if (!validatePassword(data.password)) {
      setFieldError("password", { message: "Password must be at least 6 characters" });
      return;
    }
    setIsLoading(true);
    setSubmitError("");

    try {
      await signUp.email(data, {
        onSuccess: () => {
          navigate("/dashboard");
        },
        onError: error => {
          console.error("Sign up error:", error);
          setSubmitError("Failed to create account");
        },
      });
    } catch (err) {
      console.error("Sign up failed:", err);
      setSubmitError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Join D&D Campaign Manager to start your adventure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {submitError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                {...register("name")}
                autoComplete="name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/sign-in" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
