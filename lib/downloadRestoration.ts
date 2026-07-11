"use client";

import { supabase } from "@/lib/supabase";

export async function downloadRestoration(id: number) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("Vous devez être connecté pour télécharger cette photo.");
    return;
  }

  let response: Response;

  try {
    response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);

      alert(
        result?.message ||
          result?.error ||
          "Impossible de télécharger cette photo pour le moment."
      );
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "memoire-vivante-sans-filigrane.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Impossible de télécharger cette photo. Vérifiez votre connexion puis réessayez.");
  }
}
