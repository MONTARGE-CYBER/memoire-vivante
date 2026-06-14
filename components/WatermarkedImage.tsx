type WatermarkedImageProps = {
  alt: string;
  className?: string;
  imageClassName?: string;
  src: string;
};

export default function WatermarkedImage({
  alt,
  className = "",
  imageClassName = "h-full w-full object-contain",
  src,
}: WatermarkedImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/5 ${className}`}>
      <img src={src} alt={alt} className={imageClassName} />

      <div className="pointer-events-none absolute inset-0 flex -rotate-12 items-center justify-center">
        <span className="rounded-2xl border border-white/50 bg-black/25 px-8 py-4 text-2xl sm:text-4xl font-black uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm">
          Mémoire Vivante
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-gray-700 shadow-sm">
        Aperçu gratuit filigrané
      </div>
    </div>
  );
}
