import Link from "next/link";

type BrandLogoProps = {
  variant?: "horizontal" | "vertical";
  href?: string;
  className?: string;
};

const logoConfig = {
  horizontal: {
    src: "/brand/logo-horizontal-nav.png",
    alt: "Mémoire Vivante",
    className: "h-12 w-[210px] sm:h-14 sm:w-[240px]",
    imageClassName: "object-cover object-center",
  },
  vertical: {
    src: "/brand/logo-vertical-cropped.png",
    alt: "Mémoire Vivante - Vos souvenirs, pour toujours",
    className: "h-60 w-56",
    imageClassName: "object-contain object-center",
  },
};

function LogoImage({ variant = "horizontal" }: Pick<BrandLogoProps, "variant">) {
  const logo = logoConfig[variant];

  return (
    <span className={`relative block overflow-hidden rounded-2xl ${logo.className}`}>
      <img
        src={logo.src}
        alt={logo.alt}
        className={`h-full w-full ${logo.imageClassName}`}
      />
    </span>
  );
}

export default function BrandLogo({
  variant = "horizontal",
  href,
  className = "",
}: BrandLogoProps) {
  const content = <LogoImage variant={variant} />;

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={`shrink-0 ${className}`} aria-label="Mémoire Vivante">
      {content}
    </Link>
  );
}
