"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import WatermarkedImage from "@/components/WatermarkedImage";

type Restoration = {
  id: number;
  original_url: string;
  restored_url: string;
  user_id: string | null;
};

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Restoration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        router.push("/login");
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

      setItems(data || []);
      setLoading(false);
    }

    loadGallery();
  }, [router]);

  async function deleteRestoration(id: number) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Vous devez être connecté.");
      return;
    }

    const confirmed = confirm(
      "Supprimer définitivement cette restauration ?"
    );

    if (!confirmed) return;

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
      alert("Erreur lors de la suppression.");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <SiteNav />

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Galerie privée
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6">
            Vos restaurations
          </h1>

          <p className="text-xl text-gray-600">
            Retrouvez uniquement les photos restaurées avec votre compte.
          </p>
        </div>

        <div className="mb-10 grid gap-4 rounded-[2rem] border border-purple-100 bg-white/85 p-6 shadow-sm backdrop-blur-xl md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-purple-600">
              Crédits photo
            </p>
            <h2 className="text-2xl font-black">
              Débloquez vos photos sans filigrane
            </h2>
            <p className="mt-2 text-gray-600">
              1 crédit = 1 photo restaurée sans filigrane. Vous pourrez acheter
              des crédits supplémentaires si vous souhaitez préparer plus de
              photos pour un album ou un calendrier.
            </p>
          </div>

          <Link
            href="/#tarifs"
            className="rounded-2xl bg-purple-600 px-6 py-4 text-center font-bold text-white transition hover:-translate-y-0.5"
          >
            Voir les packs
          </Link>
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
          <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-8 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">
                    Restauration #{item.id}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Photo restaurée par intelligence artificielle
                  </p>
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
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                          Après
                        </span>
                      </div>
                      <WatermarkedImage
                        src={item.restored_url}
                        alt={`Photo restaurée ${item.id} avec filigrane`}
                        className="h-64"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/album"
                    className="text-center px-5 py-4 rounded-xl bg-purple-600 text-white font-semibold"
                  >
                    Utiliser dans un album
                  </Link>

                  <button
                    disabled
                    className="text-center px-5 py-4 rounded-xl bg-black text-white font-semibold opacity-50"
                  >
                    Sans filigrane avec crédits
                  </button>

                  <Link
                    href="/upload"
                    className="text-center px-5 py-4 rounded-xl bg-purple-100 text-purple-700 font-semibold"
                  >
                    Restaurer une autre
                  </Link>

                  <button
                    onClick={() => deleteRestoration(item.id)}
                    className="text-center px-5 py-4 rounded-xl bg-red-100 text-red-700 font-semibold transition hover:scale-105"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
