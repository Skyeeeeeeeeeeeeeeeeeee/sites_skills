---
name: Каретный
description: Premium car rental with and without a chauffeur, framed as a carriage call slip.
colors:
  paper: "#fbfbfa"
  surface: "#ffffff"
  surface-2: "#f3f3f1"
  line: "#eaeaea"
  line-strong: "#d9d9d6"
  ink: "#111111"
  ink-2: "#2f3437"
  muted: "#65645f"
  placeholder: "#6f6e69"
  cobalt: "#2440b3"
  cobalt-soft: "#e8ecfa"
  error: "#9f2f2d"
  error-soft: "#fdebec"
  ok: "#346538"
  ok-soft: "#edf3ec"
  dark-paper: "#121315"
  dark-surface: "#18191c"
  dark-surface-2: "#1f2024"
  dark-line: "#2a2b30"
  dark-line-strong: "#3a3b41"
  dark-ink: "#eeeeec"
  dark-ink-2: "#d6d6d3"
  dark-muted: "#a3a29d"
  dark-placeholder: "#8d8c87"
  dark-cobalt: "#8ea2ff"
  dark-cobalt-ink: "#0e1330"
  dark-cobalt-soft: "#1d2340"
typography:
  display:
    fontFamily: "Old Standard, Times New Roman, serif"
    fontSize: "clamp(2.6rem, 1.4rem + 4.2vw, 5.4rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  h2:
    fontFamily: "Old Standard, Times New Roman, serif"
    fontSize: "clamp(2rem, 1.3rem + 2.4vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Old Standard, Times New Roman, serif"
    fontSize: "clamp(1.5rem, 1.2rem + 0.9vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: "Onest, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Onest, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
  slip-data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
rounded:
  inner: "4px"
  control: "6px"
  card: "8px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  section: "clamp(88px, 11vw, 160px)"
  container: "1320px"
  nav: "68px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 22px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 22px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    height: "34px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "46px"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
  slip:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    width: "360px"
---

# Design System: Каретный

## Overview

The house rents cars the way a doorman calls a carriage. Every surface is a sheet of warm-white paper ruled in hairlines; the one object with weight is the **call slip** («талон подачи»), a perforated ticket the visitor fills in. Data on the slip is typed in mono like a dispatcher's form, headings are set in Old Standard (late 19th-century Russian book type, the era of the coach-makers on Karetny Ryad), and the interface around it stays quiet in Onest.

Light by default, with a full dark token set under `prefers-color-scheme: dark`. Color is scarce: ink black carries actions, cobalt ink appears only where something is stamped, focused or selected.

## Colors

### Primary
- **Cobalt stamp ink** `#2440b3` (dark: `#8ea2ff`): the «ПРИНЯТО» stamp, focus rings, caret, text selection, check icons, the one tinted requirement tile. Never a button fill, never a section background.

### Neutral
- **Paper** `#fbfbfa` page ground; **Surface** `#ffffff` cards and slip; **Surface 2** `#f3f3f1` image wells and segmented tracks.
- **Ink** `#111111` headings and primary buttons; **Ink 2** `#2f3437` body; **Muted** `#65645f` secondary text (5.9:1 on paper).
- **Line** `#eaeaea` every hairline; **Line strong** `#d9d9d6` control borders and perforation.

### Named Rules
- **One Ink Rule.** Cobalt is ink on paper, not paint: it marks, it never fills an area larger than a tag or a tile.
- **Semantic pastels only.** `error-soft` / `ok-soft` appear only on error summaries and the success mark.

## Typography

### Hierarchy
- **Display** (Old Standard 400, up to 5.4rem, -0.025em): page titles and the hero line. Roman, no italic emphasis.
- **H2 / H3** (Old Standard): section titles, car names, service names, spec values.
- **Body / UI** (Onest 400-600, 16px / 1.6): paragraphs, nav, buttons, labels.
- **Slip data** (JetBrains Mono): prices, times, slip numbers, phone numbers. Mono is for measured values only.

### Named Rules
- **Measured values in mono.** Any price, time or number a client could dispute is set in JetBrains Mono with tabular figures.

## Layout

12-column container at 1320px with a fluid gutter; sections breathe at `clamp(88px, 11vw, 160px)`. Every section uses a different layout family: split hero with overlapping slip, 8+4 bento of cars, horizontal timeline, typographic service index, image/quote split, scroll-snap reviews, accordion, bordered closing panel. Everything collapses to one column under 860px (980px for hero and bento), and the slip moves under the photo with a 48px overlap.

## Elevation & Depth

Flat by default: hairline borders separate. Only two things lift: the slip (it sits on top of the photo) and a hovered car card.

### Shadow Vocabulary
- `--shadow-lift`: `0 1px 2px rgb(17 17 17 / .04), 0 6px 16px rgb(17 17 17 / .06)`.

## Shapes

Controls 6px (4px for the thumb inside a segmented control), cards and slip 8px, chips and tags full pill, round icon buttons for the car-card arrow and socials. The slip carries half-circle punch holes at each perforation line.

## Components

### Buttons
Primary is ink on paper with a 3px arrow nudge on hover and `scale(.98)` on press. Ghost is a line-strong outline. One label per intent: «Забронировать» for booking everywhere.

### Chips
Pill radios; selected state inverts to ink. 44px tall on coarse pointers.

### Cards / Containers
White, 1px line, 8px radius; image well on top at 16:10 with a soft bottom shade so photography sits in the monochrome page.

### Inputs / Fields
Label above, hint and error below; cobalt focus ring with a soft halo; errors in `error` with an `aria-describedby` link and a summary at the top of the form.

### Navigation
68px sticky bar on blurred paper, hairline appears once the page scrolls; collapses to a full-screen menu under 860px.

### Call slip (signature)
Head with title and mono slip number, dashed perforation with punch holes, fields, mono data lines that flash cobalt-soft when they change, total in mono 1.35rem, primary action. On submit the cobalt «ПРИНЯТО» stamp presses in (scale 1.6 → 1, rotate -8°).

## Do's and Don'ts

### Do:
- Do put every price, time and plate-like code on a slip or in mono.
- Do keep cobalt to stamps, focus and selection.
- Do let a real car photograph carry each card; the image well is the page's only large color.

### Don't:
- Don't add eyebrows or section numbers above headings.
- Don't use italic display for emphasis or gradient text.
- Don't fill buttons or sections with cobalt.
- Don't show a photo of a car that is not in the fleet.
