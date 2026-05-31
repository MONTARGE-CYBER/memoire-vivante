import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* HERO */}
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

          <button className="px-8 py-4 rounded-xl border border-gray-300 bg-white">
            Voir un exemple
          </button>
        </div>
      </section>

      {/* AVANT / APRÈS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Avant / Après
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="aspect-[4/3] bg-gray-200 rounded-2xl flex items-center justify-center">
              Photo ancienne
            </div>

            <p className="mt-4 text-center text-gray-500">
              Avant restauration
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center">
              Photo restaurée
            </div>

            <p className="mt-4 text-center text-gray-500">
              Après restauration IA
            </p>
          </div>
        </div>
      </section>

      {/* PROCESSUS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Comment ça fonctionne ?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-4xl mb-4">📤</div>
            <h3 className="font-bold text-xl mb-3">
              1. Déposez vos photos
            </h3>
            <p className="text-gray-600">
              Téléchargez vos photos anciennes en quelques secondes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-bold text-xl mb-3">
              2. L'IA les restaure
            </h3>
            <p className="text-gray-600">
              Suppression des rayures, amélioration HD et colorisation.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-bold text-xl mb-3">
              3. Créez votre album
            </h3>
            <p className="text-gray-600">
              Organisez vos souvenirs dans un album prêt à imprimer.
            </p>
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Tarifs
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Découverte</h3>
            <p className="text-5xl font-bold mb-6">9€</p>
            <p>5 photos restaurées</p>
          </div>

          <div className="bg-black text-white rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-4">Famille</h3>
            <p className="text-5xl font-bold mb-6">29€</p>
            <p>20 photos restaurées</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Album Premium</h3>
            <p className="text-5xl font-bold mb-6">59€</p>
            <p>Album photo complet</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Vos souvenirs méritent une seconde vie
        </h2>

        <button className="px-10 py-5 bg-black text-white rounded-xl text-lg">
          Commencer maintenant
        </button>
      </section>
    </main>
  );
}