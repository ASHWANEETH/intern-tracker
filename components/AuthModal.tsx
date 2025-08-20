"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function AuthModal() {
  const supabase = createClient();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // For Forgot Password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignup() {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone || null,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      router.push("/dashboard");
      setOpen(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (data.user) {
      router.push("/dashboard");
      setOpen(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      forgotEmail,
      {
        redirectTo: "https://intern-tracker.vercel.app/reset-pass",
      }
    );

    setForgotLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setForgotMessage(
        "If this email is registered, a password reset link has been sent."
      );
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSignup) {
      handleSignup();
    } else {
      handleLogin();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Login / Signup</Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-sm max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showForgotPassword
              ? "Reset Password"
              : isSignup
              ? "Signup"
              : "Login"}
          </DialogTitle>
        </DialogHeader>

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="*Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              autoComplete="email"
            />

            {error && <p className="text-sm ml-2 text-red-500">{error} !</p>}
            {forgotMessage && (
              <>
                <p className="text-sm ml-2 text-green-600">{forgotMessage}</p>
                <p className="text-sm ml-2 text-red-600">
                  Not Found ? Check Spam Folder !
                </p>
              </>
            )}

            <Button type="submit" disabled={forgotLoading}>
              {forgotLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <button
                type="button"
                className="text-blue-600 underline hover:text-blue-800"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError(null);
                  setForgotMessage(null);
                }}
              >
                Go back to {isSignup ? "Signup" : "Login"}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {isSignup && (
              <>
                <Input
                  type="text"
                  placeholder="*Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <small className="mt-1 ml-2 text-xs text-gray-500">
                  Verification mail will be sent to this email to verify.
                </small>
              </>
            )}

            <Input
              type="email"
              placeholder="*Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="*Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {isSignup && (
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="*Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}

            {error && <p className="text-sm ml-2 text-red-500">{error} !</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
            </Button>

            {!isSignup && (
              <div className="mt-4 flex flex-col items-center gap-2 text-sm text-center">
                <button
                  type="button"
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError(null);
                  }}
                >
                  Forgot password?
                </button>

                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 underline hover:text-blue-800"
                    onClick={() => {
                      setIsSignup(true);
                      setError(null);
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            )}
          </form>
        )}

        {/** Signup toggle for when in signup mode */}
        {!showForgotPassword && isSignup && (
          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-600 underline hover:text-blue-800"
              onClick={() => {
                setIsSignup(false);
                setError(null);
              }}
            >
              Log In
            </button>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
