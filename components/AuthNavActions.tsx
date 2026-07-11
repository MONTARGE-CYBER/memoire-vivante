"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthNavActions() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setEmail(session?.user.email ?? null);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-2xl bg-black px-4 py-2.5 text-sm font-semibold text-white sm:px-5 sm:py-3 sm:text-base"
      >
        Connexion
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:block max-w-[220px] truncate rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-gray-600">
        {email}
      </span>

      <button
        onClick={signOut}
        className="rounded-2xl bg-black px-4 py-2.5 text-sm font-semibold text-white sm:px-5 sm:py-3 sm:text-base"
      >
        Déconnexion
      </button>
    </div>
  );
}
