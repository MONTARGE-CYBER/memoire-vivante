"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  credits: number;
  transactions: CreditTransaction[];
  latestAlbum: {
    albumType: string;
    title: string;
    updatedAt: string;
  } | null;
  email: string;
  restorationsCount: number;
};

type CreditTransaction = {
  amount: number;
  created_at: string;
  description: string | null;
  id: string;
  restoration_id: number | null;
  type: "purchase" | "unlock" | "admin_adjustment";
};

function formatTransactionLabel(transaction: CreditTransaction) {
  if (transaction.type === "purchase") return "Achat de crédits";
  if (transaction.type === "unlock") return "Photo débloquée sans filigrane";
  return "Ajustement de crédits";
}

function formatTransactionDetail(transaction: CreditTransaction) {
  if (transaction.type === "purchase") {
    return "Pack ajouté après paiement Stripe.";
  }

  if (transaction.type === "unlock" && transaction.restoration_id) {
    return `Restauration #${transaction.restoration_id}`;
  }

  return transaction.description || "Mouvement de crédits";
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<"cancelled" | "success" | null>(null);
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
        router.push(`/login?next=${encodeURIComponent("/dashboard")}`);
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

      const { data: creditBalance, error: creditError } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditError) {
        console.warn("Credit balance unavailable", creditError);
      }

      const { data: transactions, error: transactionsError } = await supabase
        .from("credit_transactions")
        .select("id, amount, type, restoration_id, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (transactionsError) {
        console.warn("Credit transactions unavailable", transactionsError);
      }

      setStats({
        credits: creditBalance?.balance ?? 0,
        email: user.email ?? "Compte utilisateur",
        latestAlbum: latestAlbum
          ? {
              albumType: latestAlbum.album_type,
              title: latestAlbum.title,
              updatedAt: latestAlbum.updated_at,
            }
          : null,
        restorationsCount: count ?? 0,
        transactions: (transactions || []) as CreditTransaction[],
      });
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");

    if (checkout === "success" || checkout === "cancelled") {
      // The checkout query param only exists in the browser after Stripe redirects back.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckoutStatus(checkout);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <SiteNav />

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Compte utilisateur
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

        {checkoutStatus && (
          <div
            className={`mb-8 rounded-[1.5rem] border p-5 shadow-sm ${
              checkoutStatus === "success"
                ? "border-green-100 bg-green-50 text-green-800"
                : "border-amber-100 bg-amber-50 text-amber-800"
            }`}
          >
            <p className="font-black">
              {checkoutStatus === "success"
                ? "Paiement confirmé"
                : "Paiement annulé"}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {checkoutStatus === "success"
                ? "Vos crédits ont été ajoutés à votre solde."
                : "Aucun crédit n’a été ajouté. Vous pouvez relancer un achat quand vous le souhaitez."}
            </p>
            {checkoutStatus === "success" && (
              <Link
                href="/gallery?filter=watermarked"
                className="mt-4 inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
              >
                Débloquer mes photos
              </Link>
            )}
          </div>
        )}

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
              Importez une photo ancienne, enregistrez-la dans votre galerie, puis utilisez-la dans vos albums et calendriers.
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
            <p className="text-3xl font-black text-purple-600">
              {loading ? "..." : stats?.credits}
            </p>
            <p className="mt-3 text-sm font-semibold text-gray-500">
              crédit(s) disponible(s) pour débloquer des photos sans filigrane.
            </p>
            <Link
              href={stats && stats.credits > 0 ? "/gallery?filter=watermarked" : "/#tarifs"}
              className="mt-5 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              {stats && stats.credits > 0 ? "Débloquer mes photos" : "Voir les packs"}
            </Link>
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

        <div className="bg-white/85 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-sm border border-white/60">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700 mb-4">
                Historique
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">
                Mouvements de crédits
              </h2>
            </div>
            <Link
              href="/#tarifs"
              className="rounded-xl bg-purple-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              Acheter des crédits
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-600">Chargement de l’historique...</p>
          ) : stats?.transactions.length ? (
            <div className="divide-y divide-gray-100">
              {stats.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-black">
                      {formatTransactionLabel(transaction)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-500">
                      {formatTransactionDetail(transaction)} ·{" "}
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(transaction.created_at))}
                    </p>
                  </div>
                  <p
                    className={`rounded-full px-4 py-2 text-center text-sm font-black ${
                      transaction.amount > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount} crédit(s)
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-purple-100 bg-purple-50/50 p-6 text-sm font-semibold text-gray-600">
              Aucun mouvement de crédits pour le moment.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
