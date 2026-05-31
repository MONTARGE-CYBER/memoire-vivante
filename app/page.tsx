export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6">
          Mémoire Vivante
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Restauration et colorisation de photos anciennes par IA
        </p>

        <button className="px-6 py-3 rounded-xl bg-black text-white">
          Restaurer une photo
        </button>
      </div>
    </main>
  );
}