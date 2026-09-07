"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/data/site";

function todayIndex() {
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: SITE.timeZone }).format(new Date());
  const k = SITE.hours.findIndex((h) => h.day === day);
  return k === -1 ? new Date().getDay() : k;
}

/** The week, with today picked out — computed client-side so it is always right. */
export function Hours() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(todayIndex()), []);
  const week = [...SITE.hours.slice(1), SITE.hours[0]];
  return (
    <ul className="divide-y divide-steel-700 text-[0.9375rem]">
      {week.map((h) => {
        const isToday = SITE.hours.indexOf(h) === today;
        return (
          <li key={h.day} className={`flex items-center justify-between py-2 ${isToday ? "text-chrome" : "text-steel-400"}`}>
            <span className="flex items-center gap-2 font-medium">
              {isToday && <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />}
              {h.day}
              {isToday && <span className="label !text-[0.625rem] text-red">today</span>}
            </span>
            <span className="tabular-nums">{h.open ? `${h.open} – ${h.close}` : "Closed"}</span>
          </li>
        );
      })}
    </ul>
  );
}
