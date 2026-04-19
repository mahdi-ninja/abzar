"use client";

import { useServerInsertedHTML } from "next/navigation";

const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem("abzar:theme");var d=document.documentElement;d.classList.remove("light","dark");if(t==="dark")d.classList.add("dark");else if(t==="light")d.classList.add("light");else if(window.matchMedia("(prefers-color-scheme:dark)").matches)d.classList.add("dark");else d.classList.add("light")}catch(e){}})()`;

export function ThemeScript() {
  useServerInsertedHTML(() => (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{
        __html: THEME_BOOTSTRAP,
      }}
    />
  ));

  return null;
}
