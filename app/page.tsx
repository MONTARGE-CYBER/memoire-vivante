"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export default function Home() {
  return (
  
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      {/* BACKGROUND PREMIUM */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">

  <div className="absolute top-0 left-[-10%] w-[700px] h-[700px] bg-purple-300/20 rounded-full blur-3xl" />

  <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-3xl" />

  <div className="absolute bottom-0 left-[20%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl" />

</div>
  {/* NAVBAR */}
  <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-2xl shadow-sm">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold">
        Mémoire Vivante
      </Link>

      <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
        <a href="#fonctionnalites">Fonctionnalités</a>
        <a href="#tarifs">Tarifs</a>
        <Link href="/gallery">Galerie</Link>
      </div>

      <Link
        href="/upload"
        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition duration-300"
      >
        Restaurer une photo
      </Link>
    </div>
  </nav>
    
  {/* HERO PREMIUM */}
<section className="relative">
  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-white to-pink-200/50" />

  <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-purple-300/30 blur-3xl rounded-full" />

  <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">

    {/* TEXTE HERO */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="inline-flex items-center gap-2 bg-white shadow-sm rounded-full px-4 py-2 mb-8">
        <span className="w-3 h-3 bg-green-400 rounded-full" />

        <span className="text-sm font-semibold text-gray-600">
          Restauration photo par intelligence artificielle
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8">
        Redonnez vie à vos{" "}
        <span className="text-purple-600">
          souvenirs
        </span>
      </h1>

      <p className="text-2xl font-bold text-gray-900 mb-6">
        Restaurez les souvenirs de votre famille et créez un album photo prêt à imprimer et à transmettre aux générations futures.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10 text-gray-700 font-medium">
        <p>✨ Restauration haute qualité</p>
        <p>🎨 Colorisation intelligente</p>
        <p>📚 Création d’albums souvenirs</p>
        <p>🖨️ Photos prêtes à imprimer</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/upload"
          className="px-8 py-5 rounded-2xl bg-purple-600 text-white font-bold text-lg shadow-xl shadow-purple-300 hover:bg-purple-700 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          Restaurer mes photos maintenant
        </Link>

        <Link
          href="/gallery"
          className="px-8 py-5 rounded-2xl bg-white border border-gray-200 font-bold text-lg shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          Voir la galerie
        </Link>
      </div>
    </motion.div>

    {/* SLIDER */}
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute -inset-4 bg-purple-500 rounded-[2rem] blur-xl opacity-20" />

      <div className="relative bg-purple-600 p-2 rounded-[2rem] shadow-2xl">
        <BeforeAfterSlider
          before="https://replicate.delivery/mgxm/b033ff07-1d2e-4768-a137-6c16b5ed4bed/d_1.png"
          after="https://replicate.delivery/xezq/VjZzUS8uxOobNpyJzFebvWiuUa3Bzs60RQOexLVQIOuewckpA/tmpio8e0bce.png"
        />
      </div>
    </motion.div>

  </div>
</section>

  {/* STATS */}
<section className="max-w-7xl mx-auto px-6 py-10">
  <div className="grid md:grid-cols-3 gap-6">
    <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
      <p className="text-5xl font-black text-purple-600 mb-2">
        1 min
      </p>
      <p className="text-gray-600 font-medium">
        pour envoyer une photo
      </p>
    </div>

    <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
      <p className="text-5xl font-black text-purple-600 mb-2">
        IA
      </p>
      <p className="text-gray-600 font-medium">
        restauration automatique
      </p>
    </div>

    <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
      <p className="text-5xl font-black text-purple-600 mb-2">
        HD
      </p>
      <p className="text-gray-600 font-medium">
        export prêt à imprimer
      </p>
    </div>
  </div>
</section>
{/* ALBUMS */}
<motion.section
 className="relative z-10 max-w-7xl mx-auto px-6 py-24"
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 1.1 }}
>
  <div className="grid lg:grid-cols-2 gap-16 items-center">

    {/* TEXTE */}
    <div>
      <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
        Albums souvenirs
      </span>

      <h2 className="text-5xl font-black mb-6 leading-tight">
        De la photo ancienne à l’album familial
      </h2>

      <p className="text-xl text-gray-600 mb-10 leading-relaxed">
        Préservez les souvenirs de votre famille dans des albums élégants,
        restaurés par intelligence artificielle et prêts à être imprimés.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 text-gray-700 font-medium">

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
          ✨ Restauration intelligente
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
          📚 Organisation des souvenirs
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
          🖨️ Album prêt à imprimer
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
          ❤️ Transmission familiale
        </div>

      </div>
    </div>

    {/* IMAGE MOCKUP */}
    <div className="relative">
      <div className="absolute -inset-4 bg-purple-500/20 blur-3xl rounded-[2rem]" />

      <img
        src="/examples/album-mockup.png"
        alt="Album souvenir"
        className="relative rounded-[2rem] shadow-2xl"
      />
    </div>

  </div>

</motion.section>
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
              2. L’IA les restaure
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
{/* TÉMOIGNAGES */}
<motion.section
  className="relative z-10 max-w-7xl mx-auto px-6 py-24"
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 1.1 }}
  >
    <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
      Souvenirs restaurés
    </span>

    <h2 className="text-5xl font-black mb-6">
      Ils redonnent vie à leur histoire familiale
    </h2>

    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
      Mémoire Vivante aide les familles à préserver leurs photos anciennes
      et à les transformer en souvenirs durables.
    </p>
  

  <div className="grid md:grid-cols-3 gap-8">
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <p className="text-gray-700 mb-6">
        “J’ai pu restaurer une photo de mariage de mes grands-parents. Le résultat est émouvant.”
      </p>
      <p className="font-bold">Claire M.</p>
      <p className="text-sm text-gray-500">Album familial</p>
    </div>

    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <p className="text-gray-700 mb-6">
        “Les photos étaient abîmées depuis des années. L’IA leur a donné une vraie seconde vie.”
      </p>
      <p className="font-bold">Jean P.</p>
      <p className="text-sm text-gray-500">Restauration photo</p>
    </div>

    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <p className="text-gray-700 mb-6">
        “L’idée de pouvoir ensuite créer un album imprimé est exactement ce que je cherchais.”
      </p>
      <p className="font-bold">Sophie L.</p>
      <p className="text-sm text-gray-500">Souvenirs famille</p>
    </div>
  </div>
</motion.section>
      {/* TARIFS */}
<motion.section
  className="relative z-10 max-w-7xl mx-auto px-6 py-24"
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 1.1 }}
>
  <div className="max-w-3xl mb-16">
    <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
      Tarifs
    </span>

    <h2 className="text-5xl font-black mb-6">
      Choisissez votre formule
    </h2>

    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
      Commencez gratuitement et restaurez les souvenirs les plus précieux de votre famille.
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-8">

    {/* CARD 1 */}
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <h3 className="text-2xl font-bold mb-4">
        Découverte
      </h3>

      <p className="text-5xl font-black mb-6">
        9€
      </p>

      <p className="text-gray-600 mb-8">
        5 photos restaurées
      </p>

      <button className="w-full py-4 rounded-xl bg-gray-100 font-semibold">
        Commencer
      </button>
    </div>

    {/* CARD PREMIUM */}
    <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-[2rem] p-8 shadow-2xl scale-105 transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(168,85,247,0.4)]">
      <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-bold mb-6">
        Le plus populaire
      </div>

      <h3 className="text-2xl font-bold mb-4">
        Famille
      </h3>

      <p className="text-5xl font-black mb-6">
        29€
      </p>

      <p className="text-purple-100 mb-8">
        20 photos restaurées + galerie premium
      </p>

      <button className="w-full py-4 rounded-xl bg-white text-purple-700 font-bold">
        Restaurer maintenant
      </button>
    </div>

    {/* CARD 3 */}
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <h3 className="text-2xl font-bold mb-4">
        Album Premium
      </h3>

      <p className="text-5xl font-black mb-6">
        59€
      </p>

      <p className="text-gray-600 mb-8">
        Album photo imprimable haute qualité
      </p>

      <button className="w-full py-4 rounded-xl bg-gray-100 font-semibold">
        Créer un album
      </button>
    </div>

  </div>
</motion.section>
{/* FAQ */}
<section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
 <div className="max-w-3xl mb-16">
    <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
      Questions fréquentes
    </span>

    <h2 className="text-5xl font-black">
      Tout savoir avant de restaurer vos photos
    </h2>
  </div>

  <div className="space-y-6">
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-3">
        Mes photos sont-elles conservées ?
      </h3>
      <p className="text-gray-600">
        Vos photos sont stockées pour vous permettre de les retrouver dans votre galerie. Vous pourrez ensuite gérer leur suppression.
      </p>
    </div>

    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-3">
        Est-ce que l’IA colorise les photos ?
      </h3>
      <p className="text-gray-600">
        Oui, l’IA peut améliorer les couleurs, nettoyer l’image et restaurer les détails abîmés.
      </p>
    </div>

    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-3">
        Puis-je créer un album imprimable ?
      </h3>
      <p className="text-gray-600">
        Oui, la création d’albums souvenirs prêts à imprimer fait partie de la feuille de route de Mémoire Vivante.
      </p>
    </div>
  </div>
</section>
      {/* CTA FINAL */}
      <section className="py-24 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Vos souvenirs méritent une seconde vie
        </h2>

        <Link
          href="/upload"
          className="inline-block px-10 py-5 bg-black text-white rounded-xl text-lg"
        >
          Commencer maintenant
        </Link>
      </section>
      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/40 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-bold text-xl">Mémoire Vivante</p>

          <p className="text-gray-600 text-sm">
            Restaurez, transmettez et imprimez vos souvenirs familiaux.
          </p>

          <p className="text-gray-400 text-sm">
            © 2026 Mémoire Vivante
          </p>
        </div>
      </footer>
    </main>
);
}