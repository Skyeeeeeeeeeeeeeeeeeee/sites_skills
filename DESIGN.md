---
name: Каретный
description: Night street. Eight garage boxes on Каретный Ряд; scrolling walks past them, each door rolls up, and the dock picks up the car in front of you.
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
  blue-hour: "#101a2e"
  blue-hour-2: "#16233d"
  blue-ink: "#b9c2d6"
  blue-muted: "#98a3bb"
  blue-dim: "#56617a"
  tint-wraith: "#8fb4e8"
  tint-dawn: "#e8743b"
  tint-m760li: "#5b8cff"
  tint-panamera: "#ff4d4d"
  tint-g63: "#aebbc8"
  tint-range-rover: "#c9915e"
  tint-huracan: "#ff3b47"
  tint-911-gt3: "#5fd4c2"
  self-drive: "#6fa8ff"
typography:
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

Moscow at night, seen from the kerb of one street. The site is built as a row of eight garage boxes on Каретный Ряд, one car per box. On the home page vertical scroll walks the visitor sideways along the street: the nearest box's door rolls up on arrival, its ceiling light comes on and the car comes up out of the dark; every box passed opens the same way. A dock fixed to the bottom of the screen "picks up" whichever car is in front of you and carries its name, day, pickup time, mode, total and «Забронировать». The garage page is the floor plan of the same boxes, the car page is one box opening, and booking shows the chosen car standing in its open box.

The world is dark only, by design: the brief is a night service and every photograph is graded to night. Contrast is held at WCAG AA throughout.

## Colors

### Primary
- **Sodium** `#f2a541`: light, never paint. Used for the time numerals, the timeline times, active and selected states (inset underline), the top edge of order panels, focus rings, caret and text selection. Text placed on sodium uses `sodium-ink` `#1a1206`.

### Neutral
- **Lacquer** `#0d0e10` page ground; **Night** `#131518` inputs, image wells, the mobile bar; **Asphalt** `#1c1f23` order panels; **Asphalt 2** `#24282d` selected segment.
- **Ivory** `#ece7df` headings and primary text and the primary button; **Ivory 2** `#c9c4bb` body; **Muted** `#8d8a84` secondary (5.5:1 on lacquer, 4.8:1 on asphalt).
- **Line** `#2a2e33` hairlines; **Line strong** `#3a3f45` control borders.
- **Error** `#ff9a8a` on a 8% error tint, with a 1px full border.

### Car lights (secondary, per car)
Each car carries its own light colour taken from one of its details (`tint` in data.js): Wraith starlight `#8fb4e8`, Dawn mandarin leather `#e8743b`, M760Li laser headlights `#5b8cff`, Panamera light bar `#ff4d4d`, G 63 platinum `#aebbc8`, Range Rover tan leather `#c9915e`, Huracán red rims `#ff3b47`, 911 GT3 `#5fd4c2`. Set as `--tint` (a registered `@property`, so it transitions), it spills from the ceiling of the car's garage box, edges the order panel and the dock, and appears as a small dot with its name («Кожа Mandarin»). It never colours text.

### Blue hour
`#101a2e` to `#16233d` band behind the evening timeline, with its own text ramp (`#b9c2d6`, `#98a3bb`, dim `#56617a` for not-yet-lit times). Self-drive is marked with `#6fa8ff`, driver with sodium.

### Named Rules
- **Sodium is light.** It colours numerals, thin edges and states. It never fills a button, a card or a section.
- **One grade.** Every raster gets the same treatment: upper frame darkened, neutral whites, saturation 0.82, plates replaced by a soft smudge. The night itself comes from the CSS shade and the car's light, not from muddy pixels.

## Typography

### Hierarchy
- **Dock time** (Unbounded 300, sodium): the pickup time in the dock, the one numeral set in sodium on every page.
- **Display** (Unbounded 300, up to 5.6rem): page titles («Гараж», «Заявка на подачу», car names).
- **H2 / H3** (Unbounded 300): section titles, prices on the «two ways» block, panel totals, the evening timeline prose.
- **Wordmark** (Unbounded 500, uppercase, 0.16em tracking): «КАРЕТНЫЙ» only.
- **Body / UI** (Golos Text 400-600, 16px / 1.6): reading text, labels, buttons, prices in lists.

### Named Rules
- **Light weight, wide face.** Unbounded is only ever set at 300 (500 for the wordmark). Emphasis comes from size and sodium, not weight or italic.
- **No eyebrows.** Section titles stand alone; categories are given by position, not small uppercase labels.

## Layout

12-column container at 1360px, fluid gutter `clamp(16px, 4vw, 56px)`, sections spaced `clamp(96px, 12vw, 176px)`.

- **Home (street):** a tall section with a sticky viewport; its track (intro h1 «Восемь боксов на Каретном Ряду», eight boxes, a closing «Нужна другая машина?») translates horizontally from the section's scroll progress. Streetlamps, a kerb line and a progress hairline sit under the boxes. Below the street: the evening as one paragraph of prose, two ways (with driver / self-drive), questions as a definition list and the phone number as the close. At 900px and below, or with reduced motion, the street becomes a vertical stack of boxes (`.street--stack`).
- **Garage (floor plan):** boxes in a 4 / 2 / 1 column grid, numbered in order, doors opening with a stagger when the floor scrolls in.
- **Car:** the car's box full width with its door rolling up, then a passport (specs as a hairline list), features and the neighbouring boxes.
- **Booking:** 5/7 split; the left column is the chosen car in its open box (sticky) with the summary, the right is the form. On mobile the box becomes a 16:9 strip above the form and the summary is carried by the dock.
- **Dock:** fixed to the bottom on home, car and booking pages. 88px desktop, 128px mobile. It tucks away (translateY 110%) while the page's own submit button is on screen.

## Elevation & Depth

No shadows. Depth comes from photography under dark gradients and from two surface steps (lacquer to asphalt). Order panels are lifted by a 2px sodium top edge, not by a shadow.

## Shapes

All corners are square (0px), including buttons, inputs, chips, panels and the bar. Controls are bordered rectangles; selection is shown by a sodium inset underline or border, not a fill change.

## Components

### Buttons
Primary: ivory fill, lacquer text, 52px, arrow icon nudges 3px on hover. Line: transparent with a line-strong border that turns ivory on hover. Icon buttons are 48-52px squares. One primary action per viewport; «Забронировать» is the only booking label.

### Chips
Bordered rectangles 44-48px tall. One selected state for every choice control (segmented switch, day, chip, filter): asphalt-2 fill, ivory text and a 2px sodium inset underline.

### Cards / Containers
There are no cards. The one container is the **garage box** (`.gbox`): a photograph inside a dark bay with a ceiling light strip and the car's tint spilling from above, a grooved door panel in front, the box number, a handle, and the name, price and light colour set over the bottom shade. Everything is driven by one custom property, `--open` (0 to 1): door translateY, ceiling light, photo brightness and scale, body opacity. The fleet floor uses the same box without the ceiling strip (`.carbox`). Order and summary panels are asphalt blocks with a sodium top edge.

### Inputs / Fields
Night fill, line-strong border, label above, hint and error below, sodium focus border and 1px outline, sodium caret. Date and time fields open their native picker from the whole field. Checkboxes are custom 22px squares with a sodium tick; textareas do not show a resize grip. Errors link to fields with `aria-describedby` and are summarised at the top of the form.

### Navigation
72px header: wordmark, «Гараж», «Условия», phone. No header CTA: the dock carries the booking action. Transparent over the street on the home page, lacquer with a hairline elsewhere.

### Motion
- **Arrival:** on load the nearest box's door rolls up (translateY -101%, 1.05 s), the ceiling strip lights, then the car comes up from brightness 0.15 and scale 1.08 to rest.
- **Walking the street:** the track pans with scroll in a rAF loop that runs only while the street is on screen (no window scroll listener); each box opens once when it crosses the centre, and the dock switches to the box nearest the centre, cross-fading `--tint` (registered `@property`) on its edge and dot.
- **Floor plan:** doors open with an 80 ms stagger by index when the floor enters the viewport.
- **Evening:** the five times light from dim blue to sodium one after another when the paragraph is read.
- **Request number:** arrives as a split-flap board.
- **Primary button:** a faint sodium headlight sweep on hover.
- **Dock tuck:** 0.35 s translateY when the page's own submit is visible.
- Reduced motion: every box is open (`--open: 1`), doors are hidden, the street is a vertical stack; only colour and opacity change.

### Dock (signature)
Car name with its light dot, a day select, pickup time with minus/plus in 15-minute steps, with/without driver, the total for the minimum hours and «Забронировать» linking to booking with the selection. Earliest pickup is now + 90 minutes, rounded to the quarter hour; night hours (00:00-06:00) add 20% with a driver. Self-drive-only cars lock the mode. On booking the dock becomes a summary bar with «Отправить заявку» bound to the form.

## Do's and Don'ts

### Do:
- Do derive every time on the page from the chosen pickup time.
- Do keep sodium to numerals, thin edges, states and focus.
- Do grade every new photograph with the same night recipe and blur plates before it ships (see assets/cars/SOURCES.md).
- Do keep all eight cars visible and label self-drive-only cars instead of hiding them.

### Don't:
- Don't add shadows, glows, rounded corners or filled cards; light lines stay 1px.
- Don't use sodium as a button or section fill, or add a second accent colour.
- Don't add eyebrows, section numbers, testimonial cards or a CTA band.
- Don't ship a daylight photograph, a visible licence plate, or a photo of a model that is not in the fleet.
