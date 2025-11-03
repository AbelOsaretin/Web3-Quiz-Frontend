"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!name) return setError("Please enter your name");
    if (!email) return setError("Please enter your email");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setLoading(true);

    try {
      // request sign up — Supabase will send a verification email if configured
      // we include a redirect URL so that after email confirmation the user returns to /profile
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/profile`
          : undefined;
      const { data, error: signUpError } = await supabase.auth.signUp(
        { email, password },
        { emailRedirectTo: redirectTo } as any
      );

      if (signUpError) {
        console.error("signUpError:", signUpError);
        setError(signUpError.message ?? "Failed to sign up");
        return;
      }

      // attempt to persist user info to Web3_Quiz_User_Data
      // prefer the Supabase user id if available, otherwise store the email as User_ID
      const userId = (data as any)?.user?.id ?? email;

      try {
        const { error: insertErr } = await supabase
          .from("Web3_Quiz_User_Data")
          .insert([
            {
              User_ID: userId,
              Name: name,
              Email: email,
            },
          ]);

        if (insertErr) {
          console.error("Insert user data error:", insertErr);
          // don't treat this as fatal — user auth was created; surface a message
        }
      } catch (e) {
        console.error("Insert user data unexpected error:", e);
      }

      // persist userId locally for compatibility with existing flows
      if (typeof window !== "undefined")
        localStorage.setItem("userId", String(userId));

      // inform user to verify email
      setMessage(
        "Signup successful — please check your email and follow the verification link. After verifying, return here or you'll be redirected automatically."
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Unexpected error signing up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CRYPTO BRAINZ</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Sign up and verify your email to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="p-3 rounded bg-red-50 text-red-600">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="p-3 rounded bg-green-50 text-green-700">
                    {message}
                  </div>
                )}

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Signing up..." : "Sign up"}
                  </Button>
                </div>
                <div className="mt-2">
                  <div className="text-center text-sm text-muted-foreground mb-2">
                    or
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setError(null);
                      setLoading(true);
                      try {
                        const redirectTo =
                          typeof window !== "undefined"
                            ? `${window.location.origin}/profile`
                            : undefined;
                        const { data, error } =
                          await supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: { redirectTo } as any,
                          });
                        if (error) {
                          console.error("OAuth error:", error);
                          setError(error.message ?? "OAuth sign-in failed");
                        }
                        // on success, Supabase will redirect the browser to the OAuth consent flow
                      } catch (e) {
                        console.error(e);
                        setError("Failed to start OAuth flow");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full"
                  >
                    Continue with Google
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-primary">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
