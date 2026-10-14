import copy from "./copy.json";

/**
 * The words on the site. copy.json is the one file the text editor
 * (edit.redhawkfab.com) rewrites and commits, so any phrase the owner can change
 * belongs there — not hardcoded in a component.
 *
 *   <p className="lede" {...text("hero.lede")} />
 *
 * puts the words on the element and tags it `data-edit="hero.lede"`, which is
 * how the editor finds it. Keep each tagged element to that one phrase: the
 * editor reads its textContent back.
 */
export { copy };
export type Copy = typeof copy;

type Leaves<T, P extends string> = T extends string
  ? P
  : T extends readonly (infer U)[]
    ? Leaves<U, `${P}.${number}`>
    : { [K in keyof T & string]: Leaves<T[K], P extends "" ? K : `${P}.${K}`> }[keyof T & string];

/** Every editable phrase, e.g. "hero.lede" or "capabilities.items.2.name". */
export type CopyPath = Leaves<Copy, "">;

/** Paths with eyebrow / title / titleAccent / lede under them — what SectionHead renders. */
export type HeadPath = CopyPath extends infer P ? (P extends `${infer H}.titleAccent` ? H : never) : never;

/** The string at a dotted path, or undefined if there isn't one. */
export function readPath(root: unknown, path: string): string | undefined {
  let node: unknown = root;
  for (const part of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

export function text(path: CopyPath) {
  return { "data-edit": path, children: readPath(copy, path) ?? "" };
}
