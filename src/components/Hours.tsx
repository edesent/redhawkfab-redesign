"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/data/site";

const Chevron = ({ up }: { up: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="16"
    height="16"
    aria-hidden="true"
    className={`ml-1 inline-block text-body ${up ? "rotate-180" : ""}`}
  >
    <path fillRule="evenodd" d="M19.544 7.236a.773.773 0 0 1-.031 1.06l-7.883 7.743-7.42-7.742a.773.773 0 0 1 0-1.061.699.699 0 0 1 1.017 0l6.433 6.713 6.868-6.745a.698.698 0 0 1 1.016.032" />
  </svg>
);

function todayIndex() {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: SITE.timeZone }).format(new Date());
  const k = SITE.hours.findIndex((h) => h.day === day);
  return k === -1 ? new Date().getDay() : k;
}

/** Their "Open today 06:00 am – 05:30 pm ⌄" row that unfolds into the week. */
export function Hours() {
  const [today, setToday] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => setToday(todayIndex()), []);

  const range = (h: (typeof SITE.hours)[number]) => (h.open ? `${h.open} – ${h.close}` : "Closed");

  if (today === null) return <div className="min-h-[31px]" aria-hidden="true" />;

  if (!open) {
    const t = SITE.hours[today];
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className="flex min-h-[31px] items-start gap-[6px] pt-[1px] text-left"
      >
        <span className="copy">{t.open ? "Open today" : "Closed today"}</span>
        {t.open && <span className="text-coal">{range(t)}</span>}
        <Chevron up={false} />
      </button>
    );
  }

  return (
    <ul className="copy" aria-label="Hours of operation">
      {[...SITE.hours.slice(1), SITE.hours[0]].map((h) => {
        const k = SITE.hours.indexOf(h);
        const isToday = k === today;
        return (
          <li key={h.day} className={`grid h-[26px] grid-cols-[41px_auto_auto] items-center ${isToday ? "font-bold" : ""}`}>
            <span>{h.day}</span>
            <span className={isToday ? "text-coal" : ""}>{range(h)}</span>
            {isToday && (
              <button type="button" onClick={() => setOpen(false)} aria-expanded aria-label="Collapse hours" className="inline-flex">
                <Chevron up />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
