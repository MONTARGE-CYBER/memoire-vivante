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

  const response = await fetch("/api/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    if (response.status === 402) {
      alert("Le téléchargement sans filigrane sera disponible avec les crédits.");
      return;
    }

    alert("Erreur lors du téléchargement.");
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "memoire-vivante-hd.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
