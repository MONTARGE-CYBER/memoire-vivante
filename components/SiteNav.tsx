"use client";

import Link from "next/link";
import AuthNavActions from "@/components/AuthNavActions";

type SiteNavProps = {
  showMarketingLinks?: boolean;
};

export default function SiteNav({ showMarketingLinks = false }: SiteNavProps) {
  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-xl sm:text-2xl font-black">
            Mémoire Vivante
          </Link>

          <div className="hidden lg:flex items-center gap-6 font-semibold text-gray-600">
            {showMarketingLinks && (
              <>
                <a href="#fonctionnalites">Fonctionnalités</a>
                <a href="#tarifs">Tarifs</a>
                <a href="#faq">FAQ</a>
              </>
            )}
            <Link href="/gallery">Mes photos</Link>
            <Link href="/album">Mon album</Link>
            <Link href="/dashboard">Tableau de bord</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/upload"
              className="hidden sm:inline-block px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg transition hover:scale-105"
            >
              Restaurer
            </Link>

            <AuthNavActions />
          </div>
        </div>

        <div className="lg:hidden border-t border-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-3 overflow-x-auto text-sm font-black text-gray-600">
            <Link href="/upload" className="shrink-0 rounded-full bg-black px-4 py-2 text-white">
              Restaurer
            </Link>
            <Link href="/gallery" className="shrink-0 rounded-full bg-white px-4 py-2">
              Mes photos
            </Link>
            <Link href="/album" className="shrink-0 rounded-full bg-purple-100 px-4 py-2 text-purple-700">
              Mon album
            </Link>
            <Link href="/dashboard" className="shrink-0 rounded-full bg-white px-4 py-2">
              Tableau de bord
            </Link>
          </div>
        </div>
      </nav>
      <div className="h-[126px] lg:h-[73px]" />
    </>
  );
}
