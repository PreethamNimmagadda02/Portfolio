import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";

/* ------------------------------------------------------------------------
   The type system, in one file.

   Nothing else in the codebase names a typeface. Consumers reach the faces
   through the --font-display, --font-sans and --font-mono tokens in
   globals.css and the utilities those tokens generate, so the cut behind a
   token can be replaced here without touching a component.
   ------------------------------------------------------------------------ */

/* Display face. Bodoni Moda is the strongest freely licensed Didone that
   ships a real optical-size axis. The variable name is the contract: a
   licensed cut (next/font/local) can replace this export alone, then drop
   --display-opsz from globals.css and re-point the Bodoni names in the
   --font-display fallback stack. */
const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display-cut",
  display: "swap",
});

/* Body and UI face. */
const body = Geist({
  subsets: ["latin"],
  variable: "--font-sans-cut",
  display: "swap",
});

/* Numerals, periods, tags, counts and the eyebrows. */
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-cut",
  display: "swap",
});

/** Every face variable, for the single className that publishes them. */
export const fontVariables = `${display.variable} ${body.variable} ${mono.variable}`;
