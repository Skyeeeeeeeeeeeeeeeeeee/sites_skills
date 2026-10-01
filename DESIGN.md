---
name: Каретный
description: Night dispatch. The visitor sets the minute the car is at the door; car, price and the evening follow that time.
colors:
  lacquer: "#0d0e10"
  night: "#131518"
  asphalt: "#1c1f23"
  asphalt-2: "#24282d"
  line: "#2a2e33"
  line-strong: "#3a3f45"
  ivory: "#ece7df"
  ivory-2: "#c9c4bb"
  ivory-hover: "#fffaf2"
  muted: "#8d8a84"
  muted-2: "#5b5953"
  placeholder: "#8a877f"
  sodium: "#f2a541"
  sodium-ink: "#1a1206"
  error: "#ff9a8a"
typography:
  timedial:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(5rem, 1.5rem + 11vw, 11.5rem)"
    fontWeight: 300
    lineHeight: 0.9
    letterSpacing: "-0.06em"
  display:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(2.4rem, 1.2rem + 4.4vw, 5.6rem)"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  h2:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(1.6rem, 1.1rem + 2.4vw, 3.6rem)"
    fontWeight: 300
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  h3:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "clamp(1.3rem, 1.1rem + 0.7vw, 1.8rem)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Unbounded, Arial Black, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    letterSpacing: "0.16em"
  body:
    fontFamily: "Golos Text, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Golos Text, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.05rem, 1rem + 0.3vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Golos Text, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
rounded:
  none: "0px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  section: "clamp(96px, 12vw, 176px)"
  container: "1360px"
  header: "72px"
  bar: "72px"
components:
  button-primary:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.lacquer}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 26px"
  button-primary-hover:
    backgroundColor: "{colors.ivory-hover}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "0 26px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    size: "48px"
  input:
    backgroundColor: "{colors.night}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    height: "52px"
    padding: "12px 16px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ivory-2}"
    rounded: "{rounded.none}"
    height: "46px"
  panel:
    backgroundColor: "{colors.asphalt}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    padding: "28px"
  bar:
    backgroundColor: "{colors.night}"
    textColor: "{colors.ivory}"
    height: "72px"
---

# Design System: Каретный

## Overview

Moscow at night, seen from the kerb. The page is lacquer-black asphalt; the only colour is the sodium of a streetlight, and it is spent on one thing: the time. The first viewport is a full-bleed photograph of the chosen car at a door, and over it a giant time, «Экипаж подан к 22:30», that the visitor changes with plus and minus, arrow keys or a vertical drag. Everything else answers to that time: the car switcher and price beside it, the prose timeline further down («В 21:00 вы оставляете заявку… в 22:30 вы садитесь»), the mobile bar.

The world is dark only, by design: the brief is a night service and every photograph is graded to night. Contrast is held at WCAG AA throughout.

## Colors

### Primary
- **Sodium** `#f2a541`: light, never paint. Used for the time numerals, the timeline times, active and selected states (inset underline), the top edge of order panels, focus rings, caret and text selection. Text placed on sodium uses `sodium-ink` `#1a1206`.

### Neutral
- **Lacquer** `#0d0e10` page ground; **Night** `#131518` inputs, image wells, the mobile bar; **Asphalt** `#1c1f23` order panels; **Asphalt 2** `#24282d` selected segment.
- **Ivory** `#ece7df` headings and primary text and the primary button; **Ivory 2** `#c9c4bb` body; **Muted** `#8d8a84` secondary (5.5:1 on lacquer, 4.8:1 on asphalt).
- **Line** `#2a2e33` hairlines; **Line strong** `#3a3f45` control borders.
- **Error** `#ff9a8a` on a 8% error tint, with a 1px full border.

### Named Rules
- **Sodium is light.** It colours numerals, thin edges and states. It never fills a button, a card or a section.
- **One night.** Every raster is graded the same way (upper frame darkened, cool shadows, warm highlights, plates blurred). A photograph that still reads as daylight is cropped or replaced, never shipped as is.

## Typography

### Hierarchy
- **Time dial** (Unbounded 300, up to 11.5rem, -0.06em): the pickup time in the first viewport only. It is a control, not a headline, which is why it exceeds the 6rem display ceiling.
- **Display** (Unbounded 300, up to 5.6rem): page titles («Гараж», «Заявка на подачу», car names).
- **H2 / H3** (Unbounded 300): section titles, prices on the «two ways» block, panel totals, the evening timeline prose.
- **Wordmark** (Unbounded 500, uppercase, 0.16em tracking): «КАРЕТНЫЙ» only.
- **Body / UI** (Golos Text 400-600, 16px / 1.6): reading text, labels, buttons, prices in lists.

### Named Rules
- **Light weight, wide face.** Unbounded is only ever set at 300 (500 for the wordmark). Emphasis comes from size and sodium, not weight or italic.
- **No eyebrows.** Section titles stand alone; categories are given by position, not small uppercase labels.

## Layout

12-column container at 1360px, fluid gutter `clamp(16px, 4vw, 56px)`, sections spaced `clamp(96px, 12vw, 176px)`. The home page runs as a night drive: full-bleed scene, a horizontal scroll-snap row of garage boxes (3:4), the evening as one paragraph of large prose, two ways (with driver / self-drive) split by a hairline, a full-bleed garage photograph, questions as a two-column definition list, and a giant phone number as the close. The garage page alternates 7/5 and 5/7 column lots. Below 980px the scene photo stacks above the controls; below 900px the header collapses to a menu and a fixed bottom bar carries the current car, time, total, a call button and «Забронировать». The bar tucks away while the page's own primary action is on screen.

## Elevation & Depth

No shadows. Depth comes from photography under dark gradients and from two surface steps (lacquer to asphalt). Order panels are lifted by a 2px sodium top edge, not by a shadow.

## Shapes

All corners are square (0px), including buttons, inputs, chips, panels and the bar. Controls are bordered rectangles; selection is shown by a sodium inset underline or border, not a fill change.

## Components

### Buttons
Primary: ivory fill, lacquer text, 52px, arrow icon nudges 3px on hover. Line: transparent with a line-strong border that turns ivory on hover. Icon buttons are 48-52px squares. One primary action per viewport; «Забронировать» is the only booking label.

### Chips
Bordered rectangles 44-48px tall; checked state is a sodium border (and inset underline on day and filter chips).

### Cards / Containers
There are no cards. Cars are shown as photographic boxes (home row, 3:4) and lots (garage, 7/5 grid) with the name and prices set over a bottom gradient. Order and summary panels are asphalt blocks with a sodium top edge.

### Inputs / Fields
Night fill, line-strong border, label above, hint and error below, sodium focus border plus 1px ring, sodium caret. Errors link to fields with `aria-describedby` and are summarised at the top of the form.

### Navigation
72px header: wordmark, «Гараж», «Условия», phone, a line button «Забронировать» (hidden on the home scene, where the scene's own button leads). Transparent over the home photograph, lacquer with a hairline elsewhere.

### Time dial (signature)
`role="spinbutton"` with plus/minus buttons, arrow and page keys, and vertical drag for mouse and pen. Digits roll up or down on change; the scene crossfades when the car changes. Earliest pickup is now + 90 minutes, rounded to the quarter hour; the dial never goes earlier. Night hours (00:00-06:00) add 20% with a driver and say so under the dial.

## Do's and Don'ts

### Do:
- Do derive every time on the page from the chosen pickup time.
- Do keep sodium to numerals, thin edges, states and focus.
- Do grade every new photograph with the same night recipe and blur plates before it ships (see assets/cars/SOURCES.md).
- Do keep all eight cars visible and label self-drive-only cars instead of hiding them.

### Don't:
- Don't add shadows, rounded corners or filled cards.
- Don't use sodium as a button or section fill, or add a second accent colour.
- Don't add eyebrows, section numbers, testimonial cards or a CTA band.
- Don't ship a daylight photograph, a visible licence plate, or a photo of a model that is not in the fleet.
