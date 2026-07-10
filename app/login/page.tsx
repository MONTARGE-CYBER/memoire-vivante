"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchType = new URLSearchParams(window.location.search).get("type");

    if (hashParams.get("type") === "recovery" || searchType === "recovery") {
      const timeoutId = window.setTimeout(() => setRecoveryMode(true), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    async function redirectIfLoggedIn() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchType = new URLSearchParams(window.location.search).get("type");
      const isRecoveryUrl = hashParams.get("type") === "recovery" || searchType === "recovery";

      if (session && !isRecoveryUrl && !recoveryMode) {
        router.push(nextPath);
      }
    }

    redirectIfLoggedIn();
  }, [nextPath, recoveryMode, router]);

  function validateForm() {
    if (!email || !password) {
      alert("Veuillez renseigner votre email et votre mot de passe.");
      return false;
    }

    return true;
  }

  async function signUp() {
    if (!validateForm()) return;

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Compte créé !");
    router.push(nextPath);
  }

  async function signIn() {
    if (!validateForm()) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push(nextPath);
  }

  async function resetPassword() {
    if (!email) {
      alert("Veuillez renseigner votre email pour réinitialiser le mot de passe.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`,
    });

    setResetLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Un lien de réinitialisation vient d'être envoyé par email.");
  }

  async function updatePassword() {
    if (newPassword.length < 6) {
      alert("Votre nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      alert("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setResetLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Votre mot de passe a été mis à jour.");
    router.push(nextPath);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6]">
      <section className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/60">
          <Link href="/" className="text-2xl font-black block mb-8">
            Mémoire Vivante
          </Link>

          {recoveryMode ? (
            <>
              <h1 className="text-4xl font-black mb-3">
                Nouveau mot de passe
              </h1>

              <p className="text-gray-600 mb-8">
                Choisissez un nouveau mot de passe pour retrouver vos photos restaurées.
              </p>

              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200"
                />

                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200"
                />

                <button
                  onClick={updatePassword}
                  disabled={resetLoading}
                  className="w-full py-4 rounded-xl bg-purple-600 text-white font-bold disabled:opacity-60"
                >
                  {resetLoading ? "Mise à jour..." : "Mettre à jour mon mot de passe"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-black mb-3">
                Connexion
              </h1>

              <p className="text-gray-600 mb-8">
                Connectez-vous pour retrouver vos photos restaurées.
              </p>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-5 py-4 pr-14"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-black"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={resetLoading}
                  className="block text-sm font-bold text-purple-700 hover:text-purple-900 disabled:opacity-60"
                >
                  {resetLoading ? "Envoi du lien..." : "Mot de passe oublié ?"}
                </button>

                <button
                  onClick={signIn}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-purple-600 text-white font-bold disabled:opacity-60"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>

                <button
                  onClick={signUp}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gray-100 font-bold disabled:opacity-60"
                >
                  Créer un compte
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function LoginShell() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6]">
      <section className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
          <p className="mb-8 block text-2xl font-black">Mémoire Vivante</p>
          <h1 className="mb-3 text-4xl font-black">Connexion</h1>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function getSafeNextPath(value: string | null) {
  if (!value) return "/dashboard";

  try {
    const decoded = decodeURIComponent(value);

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return "/dashboard";
    }

    return decoded;
  } catch {
    return "/dashboard";
  }
}
