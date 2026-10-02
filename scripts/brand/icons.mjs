// Renders the app icons from the live Emblem component, so the icon and the
// letterhead mark are one drawing.
//
//   npm run build && npx serve out -l 3002 &
//   node scripts/brand/icons.mjs [http://localhost:3002]
//
// Needs Playwright with a Chromium build (npx playwright install chromium if
// it is not already on the machine). The favicons (16 and 32) stay the bare
// bold PN from monogram.html: at tab sizes a ring and an italic Didone fall
// below a device pixel and read as noise.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const url = process.argv[2] ?? "http://localhost:3002/";

const OUTPUTS = [
  { size: 512, files: ["public/icon-512x512.png", "src/app/icon.png"] },
  { size: 192, files: ["public/icon-192x192.png"] },
];

const browser = await chromium.launch();
for (const { size, files } of OUTPUTS) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Lift the drawn emblem out of the letterhead onto a bare obsidian plate.
  await page.evaluate(() => {
    const mark = document.querySelector("header a[href='#home'] .in-view");
    const plate = document.createElement("div");
    plate.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:var(--color-obsidian-0)";
    const holder = document.createElement("div");
    holder.style.cssText = "width:74%;height:74%";
    holder.appendChild(mark.cloneNode(true));
    holder.firstElementChild.style.cssText = "width:100%;height:100%";
    plate.appendChild(holder);
    document.body.appendChild(plate);
  });
  await page.waitForTimeout(2200); // the ring's draw transition
  for (const file of files) await page.screenshot({ path: path.join(root, file) });
  console.log(`${size}px -> ${files.join(", ")}`);
  await page.close();
}
await browser.close();
