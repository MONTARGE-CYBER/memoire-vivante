"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BackToTopButton from "@/components/BackToTopButton";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import BuyCreditsButton from "@/components/BuyCreditsButton";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { creditPacks } from "@/lib/creditPacks";

const steps = [
  {
    title: "Déposez une photo ancienne",
    text: "Ajoutez un portrait, une photo de famille ou un souvenir abîmé depuis votre espace sécurisé.",
  },
  {
    title: "L’IA restaure l’image",
    text: "La photo est nettoyée, améliorée et préparée pour votre galerie, vos albums ou vos calendriers.",
  },
  {
    title: "Retrouvez-la dans votre galerie",
    text: "Chaque restauration est enregistrée dans votre compte, avec suppression possible et export dans vos créations.",
  },
];

const benefits = [
  "Galerie privée par utilisateur",
  "Exports album et calendrier",
  "Suppression des restaurations",
  "Album personnalisé",
];

const faqs = [
  {
    question: "Mes photos sont-elles visibles par les autres utilisateurs ?",
    answer:
      "Non. La galerie affiche uniquement les restaurations liées à votre compte. Chaque utilisateur retrouve ses propres photos, albums et crédits dans son espace sécurisé.",
  },
  {
    question: "Quelle est la précision de la colorisation par IA ?",
    answer:
      "La colorisation par IA propose une interprétation réaliste à partir du contexte de l’image, des visages, des vêtements et de l’époque supposée. Elle peut donner un rendu très naturel, mais elle ne garantit pas toujours les couleurs historiques exactes.",
  },
  {
    question: "Puis-je restaurer des photos abîmées ou rayées ?",
    answer:
      "Oui. L’outil est pensé pour améliorer les photos anciennes, atténuer les rayures, nettoyer certains défauts et renforcer les détails. Le résultat dépend toutefois de la qualité du fichier de départ et du niveau de dégradation.",
  },
  {
    question: "Est-il possible de tester gratuitement la restauration d’une photo ?",
    answer:
      "Oui. Vous pouvez tester le rendu avec des photos proposées ou importer votre propre image. L’aperçu gratuit affiche un filigrane ; la version sans filigrane se débloque avec les crédits.",
  },
  {
    question: "Puis-je télécharger mes restaurations ?",
    answer:
      "Oui. Les photos débloquées avec des crédits peuvent être téléchargées sans filigrane et utilisées dans vos albums ou calendriers.",
  },
  {
    question: "Que débloquent les crédits ?",
    answer:
      "Un crédit débloque une photo restaurée sans filigrane. Le pack Découverte couvre quelques photos ou un calendrier 3 photos ; le pack Album famille débloque 25 photos pour préparer un album carré.",
  },
  {
    question: "Puis-je acheter plus de crédits ensuite ?",
    answer:
      "Oui. Vous pouvez acheter des crédits depuis les packs proposés, puis les utiliser pour débloquer vos photos restaurées sans filigrane.",
  },
  {
    question: "Les albums imprimables sont-ils déjà disponibles ?",
    answer:
      "Oui. Vous pouvez préparer un album carré ou un calendrier familial, puis exporter un pack PNG ou un PDF à importer chez un imprimeur.",
  },
];

const testimonials = [
  {
    quote:
      "J’ai pu restaurer une photo de mariage de mes grands-parents. Le résultat donne vraiment envie d’en faire un album à offrir.",
    name: "Claire M.",
    context: "Album familial",
  },
  {
    quote:
      "Les photos étaient abîmées depuis des années. Les voir plus nettes et réunies dans une galerie change complètement la valeur du souvenir.",
    name: "Jean P.",
    context: "Restauration photo",
  },
  {
    quote:
      "L’idée de préparer un album souvenir avec des photos restaurées est exactement le cadeau que je cherchais pour ma famille.",
    name: "Sophie L.",
    context: "Cadeau souvenir",
  },
];

function CalendarHomePreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-purple-500/20 blur-3xl" />
      <img
        src="/examples/calendar-classique-familial.png"
        alt="Exemple de calendrier familial personnalisé"
        className="relative w-full rounded-[2rem] shadow-2xl"
      />
    </div>
  );
}

export default function Home() {
  return (
    <main
      id="top"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-10%] w-[700px] h-[700px] bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-[20%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <SiteNav showMarketingLinks />

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 via-white to-pink-200/50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white shadow-sm rounded-full px-4 py-2 mb-8">
              <span className="w-3 h-3 bg-green-400 rounded-full" />
              <span className="text-sm font-semibold text-gray-600">
                Album souvenir avec photos restaurées par IA
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-8">
              Créez un album souvenir à offrir à vos proches
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Restaurez vos anciennes photos de famille, rassemblez-les dans
              une galerie privée et préparez un cadeau rempli d’histoire.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-10 text-gray-700 font-semibold">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/upload"
                className="px-8 py-5 rounded-2xl bg-purple-600 text-white font-bold text-lg shadow-xl shadow-purple-300 hover:bg-purple-700 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                Restaurer une photo
              </Link>

              <Link
                href="/dashboard"
                className="px-8 py-5 rounded-2xl bg-white border border-gray-200 font-bold text-lg shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Ouvrir mon espace
              </Link>
            </div>
          </motion.div>

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

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-[2rem] p-6 xl:p-8 text-center shadow-sm border border-gray-100">
            <p className="text-3xl xl:text-4xl font-black text-purple-600 mb-2">IA</p>
            <p className="text-gray-600 font-medium">restauration automatique</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 xl:p-8 text-center shadow-sm border border-gray-100">
            <p className="text-3xl xl:text-4xl font-black text-purple-600 mb-2">PNG/PDF</p>
            <p className="text-gray-600 font-medium">exports prêts à imprimer</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 xl:p-8 text-center shadow-sm border border-gray-100">
            <p className="text-3xl xl:text-4xl font-black text-purple-600 mb-2">GALERIE</p>
            <p className="text-gray-600 font-medium">photos sauvegardées</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 xl:p-8 text-center shadow-sm border border-gray-100">
            <p className="text-3xl xl:text-4xl font-black text-purple-600 mb-2">COMPTE</p>
            <p className="text-gray-600 font-medium">accès sécurisé</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 xl:p-8 text-center shadow-sm border border-gray-100">
            <p className="text-3xl xl:text-4xl font-black text-purple-600 mb-2">ALBUM</p>
            <p className="text-gray-600 font-medium">personnalisé</p>
          </div>
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24"
      >
        <div className="max-w-3xl mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Fonctionnement
          </span>

          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Un parcours simple, pensé pour les familles
          </h2>

          <p className="text-xl text-gray-600">
            Mémoire Vivante se concentre sur l’essentiel : restaurer, conserver
            et retrouver vos photos sans complexité technique.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100"
            >
              <p className="text-sm font-black text-purple-600 mb-5">
                Étape {index + 1}
              </p>
              <h3 className="font-bold text-2xl mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
              Albums souvenirs
            </span>

            <h2 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              Préparez les bases d’un album familial imprimable
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Les restaurations sont déjà centralisées dans votre compte. La
              prochaine étape produit sera de transformer une sélection en album
              prêt à imprimer.
            </p>

            <Link
              href="/gallery"
              className="inline-block px-7 py-4 rounded-2xl bg-black text-white font-bold"
            >
              Voir ma galerie
            </Link>
          </div>

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

      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <CalendarHomePreview />
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
              Calendriers familiaux
            </span>

            <h2 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              Offrez une année entière de souvenirs restaurés
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transformez vos photos anciennes en calendrier personnalisé :
              une photo restaurée par mois, une légende souvenir et les dates
              importantes de la famille.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {["12 mois personnalisés", "Photos restaurées", "Pack prêt à imprimer"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/album"
              className="inline-block px-7 py-4 rounded-2xl bg-black text-white font-bold"
            >
              Créer mon calendrier
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        <div className="max-w-3xl mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Témoignages
          </span>

          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Des souvenirs qui retrouvent leur place
          </h2>

          <p className="text-xl text-gray-600">
            Mémoire Vivante aide à transformer des photos anciennes en cadeau
            familial prêt à transmettre.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <p className="text-gray-700 mb-6 leading-relaxed">
                “{testimonial.quote}”
              </p>
              <p className="font-black">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.context}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="tarifs"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        <div className="max-w-3xl mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Tarifs
          </span>

          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Des packs simples pour vos projets souvenir
          </h2>

          <p className="text-xl text-gray-600">
            1 crédit débloque 1 photo restaurée sans filigrane. Le pack
            Découverte couvre un calendrier portrait ou paysage, tandis que le
            pack Album famille correspond au volume d’un album carré 24 pages.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {creditPacks.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.featured
                  ? "bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-[2rem] p-8 shadow-2xl transition duration-300 hover:-translate-y-2"
                  : "bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              }
            >
              {plan.featured && (
                <div className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  Le plus adapté aux familles
                </div>
              )}

              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <p className="text-5xl font-black mb-6">{plan.price}</p>
              <p className={plan.featured ? "text-purple-100 mb-4" : "text-gray-600 mb-4"}>
                {plan.description}
              </p>
              <p className={plan.featured ? "font-bold mb-8" : "font-bold text-gray-900 mb-8"}>
                {plan.credits} crédits · jusqu’à {plan.credits} photos sans filigrane
              </p>

              <BuyCreditsButton
                packId={plan.id}
                className={
                  plan.featured
                    ? "block w-full text-center py-4 rounded-xl bg-white text-purple-700 font-bold"
                    : "block w-full text-center py-4 rounded-xl bg-gray-100 font-semibold"
                }
              >
                Acheter ce pack
              </BuyCreditsButton>
            </div>
          ))}
        </div>
      </motion.section>

      <section
        id="faq"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24"
      >
        <div className="max-w-3xl mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Questions fréquentes
          </span>

          <h2 className="text-4xl sm:text-5xl font-black">
            Tout savoir avant de restaurer vos photos
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-4 sm:px-6 py-20 text-center">
        <h2 className="text-4xl sm:text-5xl font-black mb-6">
          Commencez par restaurer une première photo
        </h2>

        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-8">
          Le meilleur test reste un vrai souvenir : envoyez une image ancienne
          et retrouvez-la ensuite dans votre galerie privée.
        </p>

        <Link
          href="/upload"
          className="inline-block px-10 py-5 bg-black text-white rounded-2xl text-lg font-bold"
        >
          Restaurer une photo
        </Link>
      </section>

      <SiteFooter />
      <BackToTopButton />
    </main>
  );
}
