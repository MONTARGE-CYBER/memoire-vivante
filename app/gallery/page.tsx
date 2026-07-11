"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import WatermarkedImage from "@/components/WatermarkedImage";
import BuyCreditsButton from "@/components/BuyCreditsButton";
import { downloadRestoration } from "@/lib/downloadRestoration";

type Restoration = {
  id: number;
  original_url: string;
  restored_url: string;
  user_id: string | null;
  unlocked_at: string | null;
};

type GalleryFilter = "all" | "unlocked" | "watermarked";

const galleryFilters: { id: GalleryFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "unlocked", label: "Débloquées" },
  { id: "watermarked", label: "Filigranées" },
];

function getGalleryFilterFromUrl() {
  if (typeof window === "undefined") return "all";

  const filter = new URLSearchParams(window.location.search).get("filter");

  if (filter === "unlocked" || filter === "watermarked") {
    return filter;
  }

  return "all";
}

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Restoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const unlockedCount = items.filter((item) => item.unlocked_at).length;
  const watermarkedCount = items.length - unlockedCount;
  const filteredItems = items.filter((item) => {
    if (filter === "unlocked") return Boolean(item.unlocked_at);
    if (filter === "watermarked") return !item.unlocked_at;
    return true;
  });
  const availableCredits = credits ?? 0;

  useEffect(() => {
    const filterTimeoutId = window.setTimeout(() => {
      setFilter(getGalleryFilterFromUrl());
    }, 0);

    async function loadGallery() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        const nextPath = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      const { data, error } = await supabase
        .from("restorations")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) {
        console.error(error);
      }

      const { data: creditBalance, error: creditError } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditError) {
        console.warn("Credit balance unavailable", creditError);
      }

      setCredits(creditBalance?.balance ?? 0);
      setItems(data || []);
      setLoading(false);
    }

    loadGallery();

    return () => window.clearTimeout(filterTimeoutId);
  }, [router]);

  function changeFilter(nextFilter: GalleryFilter) {
    setFilter(nextFilter);

    const url = new URL(window.location.href);

    if (nextFilter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", nextFilter);
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }

  async function deleteRestoration(id: number) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Connectez-vous pour supprimer cette photo.");
      return;
    }

    const confirmed = confirm(
      "Supprimer définitivement cette restauration ?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/delete-restoration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error(result);
        alert(result.error || "Impossible de supprimer cette photo pour le moment.");
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer cette photo. Vérifiez votre connexion puis réessayez.");
    }
  }

  async function unlockRestoration(id: number) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Connectez-vous pour débloquer cette photo.");
      return;
    }

    setUnlockingId(id);

    try {
      const response = await fetch("/api/unlock-restoration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.error || "Impossible de débloquer cette photo.");
        return;
      }

      setCredits(result.creditsRemaining);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, unlocked_at: result.unlockedAt }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Impossible de débloquer cette photo. Vérifiez votre connexion puis réessayez.");
    } finally {
      setUnlockingId(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <SiteNav />

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mb-10">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Galerie privée
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6">
            Vos restaurations
          </h1>

          <p className="text-xl text-gray-600">
            Retrouvez vos restaurations, débloquez les photos prêtes à imprimer
            et envoyez-les vers vos albums ou calendriers.
          </p>
        </div>

        <div className="mb-6 grid gap-4 rounded-[2rem] border border-purple-100 bg-white/85 p-6 shadow-sm backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-purple-600">
              Crédits photo
            </p>
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <p className="text-5xl font-black text-purple-700">
                {credits === null ? "..." : credits}
              </p>
              <div>
                <h2 className="text-2xl font-black">
                  {availableCredits > 0
                    ? "Crédits disponibles"
                    : "Aucun crédit disponible"}
                </h2>
                <p className="mt-2 text-gray-600">
                  1 crédit débloque 1 photo restaurée sans filigrane pour le
                  téléchargement, l’album et le calendrier.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/#tarifs"
            className="rounded-2xl bg-purple-600 px-6 py-4 text-center font-bold text-white transition hover:-translate-y-0.5"
          >
            Acheter des crédits
          </Link>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm border border-white/60">
            <p className="text-sm font-bold text-gray-500">Total</p>
            <p className="mt-1 text-3xl font-black text-gray-950">{items.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm border border-white/60">
            <p className="text-sm font-bold text-gray-500">Débloquées</p>
            <p className="mt-1 text-3xl font-black text-purple-700">{unlockedCount}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/80 p-5 shadow-sm border border-white/60">
            <p className="text-sm font-bold text-gray-500">À débloquer</p>
            <p className="mt-1 text-3xl font-black text-gray-950">{watermarkedCount}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Chargement...</p>
        ) : items.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 border border-gray-100 shadow-sm">
            <p className="text-gray-600 mb-6">
              Aucune restauration trouvée pour ce compte.
            </p>

            <Link
              href="/upload"
              className="inline-block px-6 py-4 rounded-2xl bg-purple-600 text-white font-bold"
            >
              Restaurer ma première photo
            </Link>
          </div>
        ) : (
          <>
          <div className="mb-8 flex flex-wrap gap-3">
            {galleryFilters.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => changeFilter(option.id)}
                className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                  filter === option.id
                    ? "bg-black text-white shadow-lg"
                    : "bg-white/85 text-gray-600 shadow-sm hover:-translate-y-0.5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-sm">
              <p className="text-lg font-black">Aucune photo dans ce filtre.</p>
              <p className="mt-2 text-gray-600">
                Changez de filtre ou restaurez une nouvelle photo pour enrichir votre galerie.
              </p>
            </div>
          ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {filteredItems.map((item) => {
              const isUnlocked = Boolean(item.unlocked_at);

              return (
              <div
                key={item.id}
                className="bg-white/85 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 shadow-sm border border-white/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                  <h2 className="text-2xl font-black">
                    Restauration #{item.id}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {isUnlocked
                      ? "Photo prête pour téléchargement, album et calendrier."
                      : "Aperçu filigrané à débloquer avec 1 crédit."}
                  </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-black ${
                      isUnlocked
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isUnlocked ? "Sans filigrane" : "Filigranée"}
                  </span>
                </div>

                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-black">Original</p>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-500">
                          Avant
                        </span>
                      </div>
                      <img
                        src={item.original_url}
                        alt={`Photo originale ${item.id}`}
                        className="h-64 w-full rounded-xl object-contain bg-black/5"
                      />
                    </div>

                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-black">Restaurée</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${
                          isUnlocked
                            ? "bg-purple-100 text-purple-700"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {isUnlocked ? "Débloquée" : "Filigranée"}
                        </span>
                      </div>
                      {isUnlocked ? (
                        <img
                          src={item.restored_url}
                          alt={`Photo restaurée ${item.id}`}
                          className="h-64 w-full rounded-2xl bg-black/5 object-contain"
                        />
                      ) : (
                        <WatermarkedImage
                          src={item.restored_url}
                          alt={`Photo restaurée ${item.id} avec filigrane`}
                          className="h-64"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {!isUnlocked && availableCredits <= 0 && (
                  <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    Votre solde est à 0. Achetez des crédits pour retirer le filigrane.
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {isUnlocked ? (
                    <>
                      <button
                        onClick={() => downloadRestoration(item.id)}
                        className="text-center px-5 py-4 rounded-xl bg-black text-white font-bold transition hover:-translate-y-0.5"
                      >
                        Télécharger
                      </button>
                      <Link
                        href="/album"
                        className="text-center px-5 py-4 rounded-xl bg-purple-600 text-white font-bold transition hover:-translate-y-0.5"
                      >
                        Utiliser dans un album
                      </Link>
                    </>
                  ) : availableCredits > 0 ? (
                    <>
                      <button
                        onClick={() => unlockRestoration(item.id)}
                        disabled={unlockingId === item.id}
                        className="text-center px-5 py-4 rounded-xl bg-black text-white font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {unlockingId === item.id
                          ? "Déblocage..."
                          : "Débloquer avec 1 crédit"}
                      </button>
                      <Link
                        href="/#tarifs"
                        className="text-center px-5 py-4 rounded-xl bg-purple-100 text-purple-700 font-bold"
                      >
                        Voir les packs
                      </Link>
                    </>
                  ) : (
                    <>
                      <BuyCreditsButton
                        packId="discovery"
                        className="text-center px-5 py-4 rounded-xl bg-black text-white font-bold transition hover:-translate-y-0.5"
                      >
                        Acheter 5 crédits
                      </BuyCreditsButton>
                      <Link
                        href="/#tarifs"
                        className="text-center px-5 py-4 rounded-xl bg-purple-100 text-purple-700 font-bold"
                      >
                        Voir tous les packs
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => deleteRestoration(item.id)}
                    className="text-center px-5 py-4 rounded-xl bg-red-50 text-red-700 font-bold transition hover:-translate-y-0.5 sm:col-span-2"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
            })}
          </div>
          )}
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
