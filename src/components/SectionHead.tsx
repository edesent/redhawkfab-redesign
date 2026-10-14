import { text, type CopyPath, type HeadPath } from "@/content";

/**
 * `edit="capabilities"` reads eyebrow / title / titleAccent / lede from
 * copy.json, so the owner can change them on the edit site. Passing one of
 * those props instead (area pages build their wording per town) wins.
 */
export function SectionHead({
  edit,
  eyebrow,
  title,
  lede,
  align = "left",
  light = false,
}: {
  edit?: HeadPath;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
}) {
  const at = (k: string) => text(`${edit}.${k}` as CopyPath);
  return (
    <div className={`reveal ${align === "center" ? "mx-auto text-center" : ""} max-w-[900px]`}>
      <p className={`eyebrow ${align === "center" ? "[&::before]:hidden" : ""}`}>
        {eyebrow ?? (edit && <span {...at("eyebrow")} />)}
      </p>
      <h2 className={`display display-lg mt-5 ${light ? "text-ink" : ""}`}>
        {title ?? (edit && <><span {...at("title")} /> <span className="chrome" {...at("titleAccent")} /></>)}
      </h2>
      {lede ? (
        <p className="lede mt-6 max-w-[62ch]">{lede}</p>
      ) : (
        edit && <p className="lede mt-6 max-w-[62ch]" {...at("lede")} />
      )}
      <div className={`rule mt-8 ${align === "center" ? "mx-auto max-w-[240px] [&::before]:left-1/2 [&::before]:-translate-x-1/2" : ""}`} aria-hidden="true" />
    </div>
  );
}
