"use client";

import Link from "next/link";
import AuthNavActions from "@/components/AuthNavActions";
import BrandLogo from "@/components/BrandLogo";

type SiteNavProps = {
  showMarketingLinks?: boolean;
};

export default function SiteNav({ showMarketingLinks = false }: SiteNavProps) {
  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!showMarketingLinks || window.location.pathname !== "/") return;

    event.preventDefault();
    window.history.replaceState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/70 bg-white/90 px-2 py-2 shadow-sm backdrop-blur-2xl sm:px-3 sm:py-3">
        <div className="mx-auto max-w-[92rem] rounded-[1.5rem] border border-white/70 bg-white/90 px-3 shadow-xl shadow-purple-950/10 backdrop-blur-2xl sm:rounded-[1.75rem] sm:px-6">
          <div className="flex items-center justify-between gap-3 py-2 sm:gap-5 sm:py-3">
            <BrandLogo
              href="/"
              onClick={handleLogoClick}
              size="compact"
            />

            <div className="hidden lg:flex items-center gap-1 rounded-full bg-slate-50/80 p-1.5 text-sm font-bold text-gray-600 xl:gap-2 xl:text-base">
              {showMarketingLinks && (
                <>
                  <a href="#fonctionnalites" className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:text-purple-700 hover:shadow-sm xl:px-4">
                    Fonctionnalités
                  </a>
                  <a href="#tarifs" className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:text-purple-700 hover:shadow-sm xl:px-4">
                    Tarifs
                  </a>
                  <a href="#faq" className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:text-purple-700 hover:shadow-sm xl:px-4">
                    FAQ
                  </a>
                </>
              )}
              <Link href="/gallery" className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:text-purple-700 hover:shadow-sm xl:px-4">
                Mes photos
              </Link>
              <Link href="/album" className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:text-purple-700 hover:shadow-sm xl:px-4">
                Mon album
              </Link>
              <Link href="/dashboard" className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:text-purple-700 hover:shadow-sm xl:px-4">
                Mon espace
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/upload"
                className="hidden whitespace-nowrap rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-4 py-3 font-bold text-white shadow-lg shadow-purple-500/25 transition hover:scale-105 sm:inline-block sm:px-5"
              >
                Restaurer
              </Link>

              <AuthNavActions />
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="mx-auto mt-1.5 flex max-w-[92rem] gap-2 overflow-x-auto rounded-[1.25rem] border border-white/70 bg-white/90 px-3 py-2 text-xs font-black text-gray-600 shadow-lg shadow-purple-950/5 backdrop-blur-2xl sm:mt-2 sm:gap-3 sm:rounded-[1.5rem] sm:px-6 sm:py-3 sm:text-sm">
            {showMarketingLinks && (
              <>
                <a href="#fonctionnalites" className="shrink-0 rounded-full bg-white px-3 py-2 sm:px-4">
                  Fonctionnalités
                </a>
                <a href="#tarifs" className="shrink-0 rounded-full bg-white px-3 py-2 sm:px-4">
                  Tarifs
                </a>
                <a href="#faq" className="shrink-0 rounded-full bg-white px-3 py-2 sm:px-4">
                  FAQ
                </a>
              </>
            )}
            <Link href="/upload" className="shrink-0 rounded-full bg-black px-3 py-2 text-white sm:px-4">
              Restaurer
            </Link>
            <Link href="/gallery" className="shrink-0 rounded-full bg-white px-3 py-2 sm:px-4">
              Mes photos
            </Link>
            <Link href="/album" className="shrink-0 rounded-full bg-purple-100 px-3 py-2 text-purple-700 sm:px-4">
              Mon album
            </Link>
            <Link href="/dashboard" className="shrink-0 rounded-full bg-white px-3 py-2 sm:px-4">
              Mon espace
            </Link>
          </div>
        </div>
      </nav>
      <div className="h-[140px] sm:h-[156px] lg:h-[112px]" />
    </>
  );
}
