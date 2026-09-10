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

The mark is set at weight 700 at every size, and carries the gold plate frame
only from 64px up. Both are deliberate. At 16 to 32 device pixels a Didone's
hairlines fall below one pixel, which is how an earlier weight 400 mark lost
its N in the tab; and at those sizes an inset rule is the same order of
magnitude as the letters, so it crowds the mark rather than framing it. The
frame therefore lives behind a `@media (min-width: 64px)` guard in the
template: the two favicons are the bare mark, the two PWA icons and the app
icon route carry the frame in `hairline-gold`, the same rule as the OG card.

Both templates pin `opsz` to 22 the way the site does, rather than letting
`font-optical-sizing: auto` track it to the type size. That is the same fix
as the weight, applied to the strokes themselves: at a 60vw type size `auto`
selects the print master, whose hairlines are the thinnest the family draws.
Regenerate the rasters above after changing either template, or the shipped
PNGs and their source drift apart.

## Rasterising

Chrome's headless mode clamps the layout viewport to roughly 500px, so a
`--window-size` below that lays the page out at 500 and then crops the
screenshot to the size you asked for. The 192 icon came out as a corner of the
frame the first time for exactly this reason. Render at 512, which is above the
floor, and downscale:

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --screenshot=/tmp/mono-512.png --window-size=512,512 \
  "file://$PWD/scripts/brand/monogram.html"

cp /tmp/mono-512.png public/icon-512x512.png
cp /tmp/mono-512.png src/app/icon.png
sips -Z 192 /tmp/mono-512.png --out public/icon-192x192.png
```

A browser that honours small viewports, such as Playwright, can render each
size directly and will pick up the frame guard on its own. Note that the two
favicons are not in the loop above: they are the unframed drawing, so leave
them alone unless the letters themselves change.

`og.html` in the same folder draws the 1200x630 social card.
