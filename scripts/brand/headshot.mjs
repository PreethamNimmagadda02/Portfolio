// Derives the hero portrait set from the master in this folder.
//
//   node scripts/brand/headshot.mjs
//
// The master (864 x 1184) is the largest copy of the photograph on record.
// Every size served on the site is cut from it here, so nothing is ever
// resized from an already compressed derivative again: that is what left the
// previous set soft (a 504px copy at heavy compression, and a 187px copy
// stretched to fill a 384px plate on standard displays).
//
// Resizing is Lanczos with a light unsharp mask to restore the edge contrast
// downsampling takes out. Nothing generative touches the image.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const master = path.join(here, "headshot-master.jpeg");
const out = (name) => path.join(here, "..", "..", "public", name);

const WIDTHS = [
  { width: 864, name: "ai-headshot.webp" },
  { width: 480, name: "ai-headshot-md.webp" },
  { width: 240, name: "ai-headshot-sm.webp" },
];

for (const { width, name } of WIDTHS) {
  let img = sharp(master);
  if (width < 864) img = img.resize({ width, kernel: "lanczos3" }).sharpen({ sigma: 0.6, m1: 0.6, m2: 1.2 });
  const info = await img.webp({ quality: 88, smartSubsample: true, effort: 6 }).toFile(out(name));
  console.log(name, info.width, "x", info.height, Math.round(info.size / 1024) + " KB");
}

// The JPEG is the fallback for browsers without WebP and the image the
// structured data points to, so it is the full master, re-encoded progressive.
const jpeg = await sharp(master).jpeg({ quality: 88, progressive: true, mozjpeg: true }).toFile(out("ai-headshot.jpeg"));
console.log("ai-headshot.jpeg", jpeg.width, "x", jpeg.height, Math.round(jpeg.size / 1024) + " KB");
