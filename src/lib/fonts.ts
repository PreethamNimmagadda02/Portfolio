import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";

/* ------------------------------------------------------------------------
   The type system, in one file.

   Nothing else in the codebase names a typeface. Consumers reach the faces
   through the --font-display, --font-sans and --font-mono tokens in
   globals.css and the utilities those tokens generate, so the cut behind a
   token can be replaced here without touching a component.
   ------------------------------------------------------------------------ */

/* Display face.

   Bodoni Moda is the strongest freely licensed Didone that ships a real
   optical-size axis, which is why it is the cut in use. To move to a licensed
   one (Canela, Domaine Display, Saol, Tiempos Headline), drop the woff2 files
   under public/fonts/display/ and replace this export with:

     import localFont from "next/font/local";

     export const display = localFont({
       src: [
         { path: "../../public/fonts/display/Display-Regular.woff2", weight: "400", style: "normal" },
         { path: "../../public/fonts/display/Display-Italic.woff2", weight: "400", style: "italic" },
         { path: "../../public/fonts/display/Display-Medium.woff2", weight: "500", style: "normal" },
       ],
       variable: "--font-display-cut",
       display: "swap",
     });

   The variable name is the contract, so that is the whole migration. Two
   follow-ups belong with it: a licensed family that ships separate display and
   text masters wants --display-opsz removed from globals.css so its own
   masters are chosen again, and the Bodoni-specific names in the --font-display
   fallback stack should be re-pointed at whatever the new face degrades to. */
export const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display-cut",
  display: "swap",
});

/* Body and UI face. */
export const body = Geist({
  subsets: ["latin"],
  variable: "--font-sans-cut",
  display: "swap",
});

/* Numerals, periods, tags, counts and the three eyebrows. */
export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-cut",
  display: "swap",
});

/** Every face variable, for the single className that publishes them. */
export const fontVariables = `${display.variable} ${body.variable} ${mono.variable}`;
