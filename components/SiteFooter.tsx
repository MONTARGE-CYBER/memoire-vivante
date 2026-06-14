import Link from "next/link";

const quickLinks = [
  { label: "Restaurer une photo", href: "/upload" },
  { label: "Mes photos", href: "/gallery" },
  { label: "Créer un album", href: "/album" },
  { label: "Tableau de bord", href: "/dashboard" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
  { label: "Politique relative aux cookies", href: "/politique-cookies" },
];

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/40 bg-white/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-[1.1fr_0.8fr_1fr]">
        <div>
          <p className="text-2xl font-black mb-4">Mémoire Vivante</p>
          <p className="text-gray-600 leading-relaxed">
            Restaurez vos photos anciennes et préparez un album souvenir à
            offrir à vos proches.
          </p>
          <p className="text-gray-400 text-sm mt-6">© 2026 Mémoire Vivante</p>
        </div>

        <div>
          <h2 className="font-black mb-4">Liens rapides</h2>
          <div className="grid gap-3 text-gray-600 font-semibold">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-black">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-black mb-4">Restez informé</h2>
          <form className="space-y-3">
            <input
              type="email"
              placeholder="Saisissez votre adresse e-mail"
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-purple-400"
            />
            <button
              type="button"
              className="w-full rounded-2xl bg-black px-5 py-4 font-bold text-white"
            >
              S&apos;abonner à la newsletter
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-white/60 pt-6 text-sm font-semibold text-gray-500">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-black">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
