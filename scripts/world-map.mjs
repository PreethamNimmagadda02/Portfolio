// Samples the land of a world map onto a grid of square dots for the Contact
// postmark, and finds the grid cell for the city the studio is based in.
//
//   npm i --no-save svg-dotted-map && node scripts/world-map.mjs
//
// svg-dotted-map (MIT) carries a low-resolution world outline on a Mercator
// projection from 56 S to 71 N. It runs here once rather than in the browser,
// which would rebuild the whole map on every render; the site ships only the
// result, src/data/world-map.json.
//
// Each row's land is written as runs, one line per unbroken stretch, which
// the postmark dashes into dots (stroke-dasharray "0.5 0.5"): a fraction of
// the size of one shape per dot.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createMap } from "svg-dotted-map";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/data/world-map.json");

const COLS = 80;
const PLACE = { lat: 17.385, lng: 78.4867 }; // Hyderabad

// Width over height of the projected region, so a cell is square.
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const RATIO = (358 * Math.PI) / 180 / (mercY(71) - mercY(-56));
const ROWS = Math.round(COLS / RATIO);

// createMap derives its grid from the sample count (rows = sqrt(samples / ratio))
// and pads the edges by 1.25 dot radii; undo both to recover whole cells.
const RADIUS = 0.3;
const PAD = RADIUS * 1.25;
const width = COLS;
const height = COLS / RATIO;
const { points, addMarkers } = createMap({ width, height, mapSamples: ROWS * ROWS * RATIO, radius: RADIUS });
const cell = ({ x, y }) => [
  Math.round(((x - PAD) / (width - 2 * PAD)) * (COLS - 1)),
  Math.round(((y - PAD) / (height - 2 * PAD)) * (ROWS - 1)),
];

const rows = Array.from({ length: ROWS }, () => new Set());
for (const [x, y] of points.map(cell)) rows[y].add(x);

// A run over cells a..b is a line from a + 0.25 to b + 0.75 through the middle
// of the row, so its half-unit dashes land centred in each cell.
let runs = "";
rows.forEach((xs, y) => {
  const sorted = [...xs].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (sorted[i + 1] === sorted[i] + 1) i++;
    runs += `M${start + 0.25} ${y + 0.5}H${sorted[i] + 0.75}`;
  }
});

const [marker] = addMarkers([PLACE]).map(cell);
const data = { cols: COLS, rows: ROWS, place: PLACE, marker, runs };
await writeFile(OUT, JSON.stringify(data) + "\n");
console.log(`world-map: ${COLS}x${ROWS}, ${points.length} dots, marker ${marker}, ${runs.length} bytes of runs`);
