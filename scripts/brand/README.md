# Brand marks

The house mark is the `Emblem` in `src/components/ui/BrandMark.tsx`: PN in
foil italic inside a double gold ring with four lozenges, the small sibling of
the About seal. The letterhead shows it as a lockup with the name in spaced
Didone capitals. The app icons are rendered from that same component by
`icons.mjs`:

| Output | Size | Used as |
| --- | --- | --- |
| `public/icon-512x512.png` | 512 | web app manifest |
| `public/icon-192x192.png` | 192 | web app manifest, iOS home screen |

Run `node scripts/brand/icons.mjs` against a served build after changing the
emblem.

## Favicons

`monogram.html` remains the source for the two favicons only. It draws itself
to whatever square canvas it is given, so one template covers every size.

Rasterise with any headless browser at a square viewport and `deviceScaleFactor: 1`:

| Output | Size | Used as |
| --- | --- | --- |
| `public/favicon-16.png` | 16 | browser tab, small |
| `public/favicon-32.png` | 32 | browser tab, retina and bookmarks |

At tab sizes the ring and an italic Didone fall below a device pixel, so the
favicons stay the bare bold upright PN.

The mark is set at weight 700 and carries no frame, both deliberately. At 16
to 32 device pixels a Didone's hairlines fall below one pixel, which is how an
earlier weight 400 mark lost its N in the tab; and at those sizes an inset rule
is the same order of magnitude as the letters, so it crowds the mark rather
than framing it.

Both templates pin `opsz` to 22 the way the site does, rather than letting
`font-optical-sizing: auto` track it to the type size. That is the same fix
as the weight, applied to the strokes themselves: at a 60vw type size `auto`
selects the print master, whose hairlines are the thinnest the family draws.
Regenerate the rasters above after changing either template, or the shipped
PNGs and their source drift apart.

## Rasterising

Chrome's headless CLI clamps the layout viewport to roughly 500px, so a
`--window-size` below that lays the page out at 500 and then crops the
screenshot to the size you asked for. Render the favicons with a browser that
honours small viewports, such as Playwright, at each size directly.

`og.html` in the same folder draws the 1200x630 social card.

## Portrait

`headshot-master.jpeg` (864 x 1184) is the largest copy of the hero photograph
on record, recovered from the repository's history. `headshot.mjs` cuts every
served size from it:

| Output | Width | Used as |
| --- | --- | --- |
| `public/ai-headshot.webp` | 864 | hero plate, high density screens |
| `public/ai-headshot-md.webp` | 480 | hero plate, standard screens and phones |
| `public/ai-headshot-sm.webp` | 240 | phone plate on standard screens |
| `public/ai-headshot.jpeg` | 864 | fallback without WebP, structured data |

Run `node scripts/brand/headshot.mjs` after replacing the master. Never resize
from one of the outputs: each pass through a lossy encoder costs detail, which
is how the previous set went soft. A new master should be at least 1000px wide
so the 2x plate is drawn from more pixels than it shows.
