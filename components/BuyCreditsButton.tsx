"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CreditPackId } from "@/lib/creditPacks";

type BuyCreditsButtonProps = {
  children?: React.ReactNode;
  className: string;
  packId: CreditPackId;
};

export default function BuyCreditsButton({
  children = "Acheter ce pack",
  className,
  packId,
}: BuyCreditsButtonProps) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = `/login?next=${encodeURIComponent("/#tarifs")}`;
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packId }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        setLoading(false);
        alert(result.error || "Impossible d’ouvrir le paiement.");
        return;
      }

      window.location.href = result.url;
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Impossible d’ouvrir le paiement. Vérifiez votre connexion puis réessayez.");
    }
  }

  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={loading}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {loading ? "Ouverture du paiement..." : children}
    </button>
  );
}
