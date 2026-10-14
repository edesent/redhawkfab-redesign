"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { isEditHost } from "./hosts";

// Its own chunk: visitors to the public site never download the editor.
const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), { ssr: false });

const noop = () => () => {};

/** Renders the text editor on edit.redhawkfab.com, nothing anywhere else. */
export function EditGate() {
  const on = useSyncExternalStore(noop, () => isEditHost(window.location.host), () => false);
  return on ? <Editor /> : null;
}
