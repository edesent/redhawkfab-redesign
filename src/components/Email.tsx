"use client";

import { useEffect, useState } from "react";

/**
 * Renders the address only after mount, so the assembled string never sits in
 * the HTML for harvesters. Reads and looks exactly like a plain mailto link.
 */
export function Email({ user, domain, className }: { user: string; domain: string; className?: string }) {
  const [addr, setAddr] = useState<string | null>(null);
  useEffect(() => setAddr(`${user}@${domain}`), [user, domain]);
  if (!addr) return <span className={className} aria-hidden="true">{" "}</span>;
  return (
    <a href={`mailto:${addr}`} className={className}>
      {addr}
    </a>
  );
}
