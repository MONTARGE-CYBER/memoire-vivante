"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  latestAlbum: {
    albumType: string;
    title: string;
    updatedAt: string;
  } | null;
  email: string;
  restorationsCount: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const latestAlbumDate = stats?.latestAlbum
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(stats.latestAlbum.updatedAt))
    : "";

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { count, error } = await supabase
        .from("restorations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
      }

      const { data: latestAlbum, error: albumError } = await supabase
        .from("albums")
        .select("album_type, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (albumError) {
        console.warn(albumError);
      }

      setStats({
        email: user.email ?? "Compte utilisateur",
        latestAlbum: latestAlbum
          ? {
              albumType: latestAlbum.album_type,
              title: latestAlbum.title,
              updatedAt: latestAlbum.updated_at,
            }
          : null,
        restorationsCount: count ?? 0,
      });
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <SiteNav />

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Tableau de bord
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6">
            Mon espace
          </h1>

          <p className="text-xl text-gray-600">
            {loading
              ? "Chargement du compte..."
              : stats?.email}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <Link
            href="/upload"
            className="bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl transition hover:-translate-y-1"
          >
            <p className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-black mb-6">
              Action principale
            </p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Restaurer une photo
            </h2>
            <p className="text-white/80 text-lg">
              Importez une photo ancienne et ajoutez-la à votre futur album souvenir.
            </p>
          </Link>

          <Link
            href="/gallery"
            className="bg-white/85 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-sm border border-white/60 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700 mb-6">
              Galerie privée
            </p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Mes photos
            </h2>
            <p className="text-gray-600 text-lg">
              Retrouvez vos photos restaurées, utilisez-les dans vos albums ou supprimez-les.
            </p>
          </Link>
        </div>

        <div className="mb-10">
          <Link
            href="/album"
            className="block bg-white/85 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-sm border border-white/60 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700 mb-6">
              Albums
            </p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              {stats?.latestAlbum ? "Reprendre mon album" : "Créer un album"}
            </h2>
            <p className="text-gray-600 text-lg">
              {stats?.latestAlbum
                ? `Dernier album sauvegardé : ${stats.latestAlbum.title}.`
                : "Sélectionnez vos photos restaurées et préparez une maquette."}
            </p>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white/60">
            <p className="text-sm font-semibold text-gray-500 mb-3">
              Restaurations
            </p>
            <p className="text-5xl font-black text-purple-600">
              {loading ? "..." : stats?.restorationsCount}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white/60">
            <p className="text-sm font-semibold text-gray-500 mb-3">
              Crédits
            </p>
            <p className="text-5xl font-black text-purple-600">
              —
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white/60">
            <p className="text-sm font-semibold text-gray-500 mb-3">
              Album
            </p>
            <p className="text-4xl font-black text-purple-600">
              {loading ? "..." : stats?.latestAlbum ? "1" : "0"}
            </p>
            <p className="mt-3 text-sm font-semibold text-gray-500">
              {stats?.latestAlbum
                ? `Dernier : ${stats.latestAlbum.title} · ${latestAlbumDate}`
                : "Aucun album sauvegardé"}
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
