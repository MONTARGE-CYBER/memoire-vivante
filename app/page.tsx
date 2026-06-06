import Link from "next/link";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <span className="inline-block px-4 py-2 rounded-full bg-stone-200 text-sm font-medium">
          Restauration et colorisation de photos anciennes par IA
        </span>

        <h1 className="text-5xl md:text-7xl font-bold mt-8 mb-6">
          Redonnez vie à vos souvenirs
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Réparez, colorisez et organisez vos photos anciennes dans un album
          prêt à imprimer en quelques minutes.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/upload"
            className="px-8 py-4 rounded-xl bg-black text-white font-semibold"
          >
            Restaurer mes photos
          </Link>

          <Link
            href="/gallery"
            className="px-8 py-4 rounded-xl border border-gray-300 bg-white"
          >
            Voir la galerie
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Avant / Après
        </h2>

        <BeforeAfterSlider
          before="https://replicate.delivery/mgxm/b033ff07-1d2e-4768-a137-6c16b5ed4bed/d_1.png"
          after="https://replicate.delivery/xezq/VjZzUS8uxOobNpyJzFebvWiuUa3Bzs60RQOexLVQIOuewckpA/tmpio8e0bce.png"
        />
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Comment ça fonctionne ?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-4xl mb-4">📤</div>
            <h3 className="font-bold text-xl mb-3">1. Déposez vos photos</h3>
            <p className="text-gray-600">
              Téléchargez vos photos anciennes en quelques secondes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-bold text-xl mb-3">2. L'IA les restaure</h3>
            <p className="text-gray-600">
              Suppression des rayures, amélioration HD et colorisation.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-bold text-xl mb-3">3. Créez votre album</h3>
            <p className="text-gray-600">
              Organisez vos souvenirs dans un album prêt à imprimer.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}