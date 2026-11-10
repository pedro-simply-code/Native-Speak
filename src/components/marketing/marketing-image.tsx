import Image from "next/image";

type MarketingImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

export function MarketingImage({
  src,
  alt,
  className = "",
  priority,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  fill,
  width,
  height,
}: MarketingImageProps) {
  const baseClass = `object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] ${className}`;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={baseClass}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 800}
      priority={priority}
      sizes={sizes}
      className={baseClass}
    />
  );
}
