import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-black">
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="inline-block px-4 py-2 rounded-full bg-stone-200 text-sm mb-8">
          Restauration & colorisation de photos anciennes par IA
        </p>

        <h1 className="text-6xl font-bold mb-6">
          Redonnez vie à vos souvenirs
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Restaurez vos anciennes photos, colorisez-les et créez un album
          souvenir prêt à imprimer.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/upload"
            className="px-8 py-4 rounded-xl bg-black text-white font-semibold"
          >
            Restaurer une photo
          </Link>

          <Link
            href="/gallery"
            className="px-8 py-4 rounded-xl bg-white border border-gray-300 font-semibold"
          >
            Voir la galerie
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Exemple avant / après
        </h2>

        <BeforeAfterSlider

  before="https://replicate.delivery/xezq/VjZzUS8uxOobNpyJzFebvWiuUa3Bzs60RQOexLVQIOuewckpA/tmpio8e0bce.png"
  after="https://replicate.delivery/mgxm/b033ff07-1d2e-4768-a137-6c16b5ed4bed/d_1.png"
/>
        /
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Comment ça fonctionne ?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <h3 className="text-2xl font-bold mb-3">1. Envoyez</h3>
            <p className="text-gray-600">
              Sélectionnez une ancienne photo depuis votre ordinateur.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <h3 className="text-2xl font-bold mb-3">2. L’IA restaure</h3>
            <p className="text-gray-600">
              La photo est améliorée, restaurée et préparée en haute qualité.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <h3 className="text-2xl font-bold mb-3">3. Téléchargez</h3>
            <p className="text-gray-600">
              Retrouvez vos photos restaurées dans votre galerie.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
  