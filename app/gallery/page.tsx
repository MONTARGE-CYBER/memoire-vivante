import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

export default async function GalleryPage() {
  const { data } = await supabase
    .from("restorations")
    .select("*")
    .order("id", { ascending: false });

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4ecff] via-white to-[#ffeaf6] text-black">
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Mémoire Vivante
          </Link>

          <Link
            href="/upload"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-lg"
          >
            Restaurer une photo
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold mb-6">
            Galerie
          </span>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            Vos restaurations avant / après
          </h1>

          <p className="text-xl text-gray-600">
            Retrouvez ici les photos restaurées par IA et comparez-les avec
            leurs versions originales.
          </p>
        </div>

        {!data || data.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 border border-gray-100 shadow-sm">
            <p className="text-gray-600 mb-6">
              Aucune restauration pour le moment.
            </p>

            <Link
              href="/upload"
              className="inline-block px-6 py-4 rounded-2xl bg-purple-600 text-white font-bold"
            >
              Restaurer ma première photo
            </Link>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
            {data.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-8 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/60 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Restauration #{item.id}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Photo restaurée par intelligence artificielle
                    </p>
                  </div>
                </div>

                <BeforeAfterSlider
                  before={item.original_url}
                  after={item.restored_url}
                />

                <div className="mt-6 flex gap-3">
                  <button
  className="flex-1 text-center px-5 py-4 rounded-xl bg-black text-white font-semibold opacity-70 cursor-default"
>
  Image HD bientôt disponible
</button>

                  <Link
                    href="/upload"
                    className="flex-1 text-center px-5 py-4 rounded-xl bg-purple-100 text-purple-700 font-semibold"
                  >
                    Restaurer une autre
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}