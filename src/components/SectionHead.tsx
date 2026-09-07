export function SectionHead({
  eyebrow,
  title,
  lede,
  align = "left",
  light = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={`reveal ${align === "center" ? "mx-auto text-center" : ""} max-w-[900px]`}>
      <p className={`eyebrow ${align === "center" ? "[&::before]:hidden" : ""}`}>{eyebrow}</p>
      <h2 className={`display display-lg mt-5 ${light ? "text-ink" : ""}`}>{title}</h2>
      {lede && <p className="lede mt-6 max-w-[62ch]">{lede}</p>}
      <div className={`rule mt-8 ${align === "center" ? "mx-auto max-w-[240px] [&::before]:left-1/2 [&::before]:-translate-x-1/2" : ""}`} aria-hidden="true" />
    </div>
  );
}
