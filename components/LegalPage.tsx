import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

type LegalPageProps = {
  title: string;
  description: string;
  sections: Array<{
    title: string;
    text: string;
  }>;
};

export default function LegalPage({
  title,
  description,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <Link href="/" className="inline-block text-2xl font-black mb-12">
          Mémoire Vivante
        </Link>

        <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
          Informations légales
        </span>

        <h1 className="text-4xl sm:text-5xl font-black mb-6">{title}</h1>

        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          {description}
        </p>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl"
            >
              <h2 className="text-2xl font-black mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.text}</p>
            </section>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
