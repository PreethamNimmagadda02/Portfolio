# Brand marks

`monogram.html` is the source of truth for the PN mark. It draws itself to
whatever square canvas it is given, so one template covers every size.

Rasterise with any headless browser at a square viewport and `deviceScaleFactor: 1`:

| Output | Size | Used as |
| --- | --- | --- |
| `public/favicon-16.png` | 16 | browser tab, small |
| `public/favicon-32.png` | 32 | browser tab, retina and bookmarks |
| `public/icon-192x192.png` | 192 | PWA manifest, iOS home screen |
| `public/icon-512x512.png` | 512 | PWA manifest, install prompts |
| `src/app/icon.png` | 512 | Next.js app icon route |

The mark carries no gold frame and is set at weight 700. Both are deliberate:
at 16 to 32 device pixels a 2px inset border and a Didone's hairlines fall
below one pixel, which is how the previous mark lost its N in the tab. The gold
lives in the OG image and on the site instead.

Both templates pin `opsz` to 22 the way the site does, rather than letting
`font-optical-sizing: auto` track it to the type size. That is the same fix
as the weight and the missing frame, applied to the strokes themselves: at
a 60vw type size `auto` selects the print master, whose hairlines are the
thinnest the family draws. Regenerate the rasters above after changing
either template, or the shipped PNGs and their source drift apart.

`og.html` in the same folder draws the 1200x630 social card.
