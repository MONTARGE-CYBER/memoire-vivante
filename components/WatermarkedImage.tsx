type WatermarkedImageProps = {
  alt: string;
  badgeClassName?: string;
  className?: string;
  imageClassName?: string;
  showBadge?: boolean;
  src: string;
  watermarkClassName?: string;
};

export default function WatermarkedImage({
  alt,
  badgeClassName = "bottom-3 right-3 px-3 py-1.5 text-[10px] sm:text-xs",
  className = "",
  imageClassName = "h-full w-full object-contain",
  showBadge = false,
  src,
  watermarkClassName = "px-3 py-1.5 text-[10px] sm:text-xs tracking-[0.14em]",
}: WatermarkedImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/5 ${className}`}>
      <img src={src} alt={alt} className={imageClassName} />

      <div className="pointer-events-none absolute inset-x-0 bottom-[18%] flex -rotate-6 items-center justify-center px-4">
        <span className={`rounded-2xl border border-white/50 bg-black/25 font-black uppercase text-white/80 backdrop-blur-sm ${watermarkClassName}`}>
          Mémoire Vivante
        </span>
      </div>

      {showBadge && (
        <div className={`pointer-events-none absolute rounded-full bg-white/90 font-black text-gray-700 shadow-sm ${badgeClassName}`}>
          Aperçu gratuit filigrané
        </div>
      )}
    </div>
  );
}
