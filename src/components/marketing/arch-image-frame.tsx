type ArchImageFrameProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "arch" | "rounded";
};

export function ArchImageFrame({
  children,
  className = "",
  variant = "arch",
}: ArchImageFrameProps) {
  return (
    <div
      className={`mk-image-frame relative ${
        variant === "arch" ? "mk-image-frame--arch" : "mk-image-frame--rounded"
      } group ${className}`}
    >
      <div className="mk-image-frame__inner">{children}</div>
      <div className="mk-image-frame__ring" aria-hidden />
    </div>
  );
}
