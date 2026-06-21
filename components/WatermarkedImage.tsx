type WatermarkedImageProps = {
  alt: string;
  badgeClassName?: string;
  className?: string;
  imageClassName?: string;
  src: string;
  watermarkClassName?: string;
};

export default function WatermarkedImage({
  alt,
  badgeClassName = "bottom-4 right-4 px-4 py-2 text-xs",
  className = "",
  imageClassName = "h-full w-full object-contain",
  src,
  watermarkClassName = "px-4 py-2 text-xs sm:text-sm tracking-[0.16em]",
}: WatermarkedImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/5 ${className}`}>
      <img src={src} alt={alt} className={imageClassName} />

      <div className="pointer-events-none absolute inset-0 flex -rotate-12 items-center justify-center">
        <span className={`rounded-2xl border border-white/50 bg-black/25 font-black uppercase text-white/80 backdrop-blur-sm ${watermarkClassName}`}>
          Mémoire Vivante
        </span>
      </div>

      <div className={`pointer-events-none absolute rounded-full bg-white/90 font-black text-gray-700 shadow-sm ${badgeClassName}`}>
        Aperçu gratuit filigrané
      </div>
    </div>
  );
}
