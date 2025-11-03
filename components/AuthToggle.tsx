"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function AuthToggle() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (e) {
        console.warn("auth.getUser error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user && typeof window !== "undefined") {
          localStorage.setItem("userId", session.user.id);
        }
        if (!session && typeof window !== "undefined") {
          localStorage.removeItem("userId");
        }
      }
    );

    return () => {
      mounted = false;
      try {
        listener?.subscription.unsubscribe();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    if (typeof window !== "undefined") localStorage.removeItem("userId");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        <Button variant="outline">...</Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSignOut}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link href="/login">
        <Button variant="outline">Login</Button>
      </Link>
      <Link href="/signup">
        <Button>Sign Up</Button>
      </Link>
    </div>
  );
}
