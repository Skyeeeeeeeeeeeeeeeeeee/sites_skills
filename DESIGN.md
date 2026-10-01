---
name: Каретный
description: Catalogue-first premium car rental in the Moscow genre — dark ground, one amber accent, bold uppercase Montserrat, photo cards with price and specs.
colors:
  bg: "#0e0f11"
  bg-2: "#131518"
  card: "#1a1c20"
  card-2: "#22252a"
  line: "#2a2d33"
  line-2: "#3a3e45"
  text: "#f3f1ed"
  text-2: "#bdbab4"
  muted: "#8f8c86"
  accent: "#f2a541"
  accent-ink: "#17110a"
  paper: "#f3f1ed"
  paper-ink: "#16171a"
  whatsapp: "#25d366"
  telegram: "#2aabee"
  sale: "#e5484d"
  new: "#2fb36e"
typography:
  display:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontWeight: 800
    textTransform: uppercase
  body:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontWeight: 400
    fontSize: "16px"
    lineHeight: 1.55
rounded:
  card: "12px"
  control: "8px"
  pill: "999px"
---

# Design System: Каретный

## Overview

Built on the conventions of the Moscow premium rental market (moscowdreamcars.ru, vroomclub.ru, brook-drive.ru, premiercars.ru, erdescars.ru): visitors come to compare cars and prices fast, so the catalogue is the product. The home page opens on a dark photo hero with an uppercase headline, four perks, the phone and brand chips, then goes straight into the car grid. Everything else (occasions, three steps, a lead form, reasons, terms, FAQ, contacts) supports the decision.

Dark only, by design: car photography reads best on near-black, and every reference in the genre is dark.

## Colors

- **Accent amber** `#f2a541` fills primary buttons, active tabs and segment choices, the topbar and the documents block; it colours highlighted words in headings. Text on amber is `#17110a`.
- **Neutrals**: page `#0e0f11`, alternate sections `#131518`, cards `#1a1c20`, chips `#22252a`, hairlines `#2a2d33` / `#3a3e45`.
- **Paper** `#f3f1ed` is used once per page: the lead form band, as in the references' white form block.
- **Messenger colours**: WhatsApp `#25d366`, Telegram `#2aabee`, only on their buttons.
- **Badges**: Хит (amber), Новинка (`#2fb36e`), Скидка (`#e5484d`).

## Typography

Montserrat variable 400–800, self-hosted (cyrillic, latin, latin-ext).
- **H1** 800 uppercase, up to 4.1rem. **H2** 800 uppercase, up to 2.75rem, one word may be amber.
- **Card titles** 700, 1.12rem. **Prices** 800. **Body** 400 16px / 1.55. **Labels** 600.

## Layout

Container 1320px, gutter `clamp(16px, 3.4vw, 40px)`, sections `clamp(64px, 8vw, 112px)` with alternating backgrounds. Section heads: H2 left, link right, hairline below.

- **Home**: topbar, sticky header, hero, catalogue (class tabs, 3/2/1 grid, first 9 cars, "Ещё N"), occasions (4 photo tiles), three steps, lead band, six reasons, terms (4 stats + documents + rules), FAQ with "Не нашли ответ?" aside, contacts, footer.
- **Fleet**: 280px sticky filter sidebar (class, brand, price, seats, driver, sale) and horizontal rows (photo | name, summary, spec chips, price range, Забронировать + WhatsApp/Telegram/call). Below 980px filters become a bottom sheet.
- **Car**: photo + 8 spec tiles, sticky price panel (tiers by length, deposit, mileage, dates, with/without driver, live total), about + features, terms, similar cars.
- **Booking**: two numbered fieldsets and a sticky summary that recalculates; success state with request number.
- **Mobile**: header collapses to messengers + burger drawer; a fixed bottom bar carries call, WhatsApp and Забронировать, and tucks away when the page's own booking button is on screen.

## Components

- **Buttons**: primary amber fill, 52px (44px small), 8px radius; ghost with line border; dark on paper. Icon buttons 44–52px squares, messenger-coloured.
- **Car card**: 16:10 photo with badges, title, year · class, "от X ₽ / сутки" (old price struck through on sale), spec chips (л.с., 0–100, seats, driver), Забронировать + WhatsApp.
- **Tabs**: pills with counts, amber when pressed.
- **Inputs**: 52px, 8px radius, amber focus ring; date/time pickers open from the whole field; phone mask +7 (___) ___-__-__.
- **FAQ**: bordered `details` with a plus that turns into a cross.

## Pricing logic

Price per day drops with length: 1–2 days base, 3–6 −8%, 7–14 −15%, 15+ −22% (rounded to 500 ₽). Cards show the 15+ day price as "от". With driver: car price + 15 000 ₽ per day; hourly rates shown on the car page. Delivery: office and Garden Ring free, inside MKAD 3 000 ₽, airports 5 000 ₽.

## Motion

Hero photo settles from scale 1.06 (2.4s); sections fade up 16px with a 60ms stagger; card photos zoom 4% on hover; drawer, filter sheet and bottom bar slide. All travel is removed under reduced motion.

## Accessibility and touch (ui-ux-pro-max audit)

- Every pointer target is at least 44px on phones; small text links get a vertical hit area through `::before`.
- Text contrast is at least 4.5:1 everywhere (checked by script); inputs use 16px text so iOS does not zoom.
- Inline errors are tied to their controls with `aria-describedby` and `aria-invalid`, validated on blur; the booking form also shows a focusable error summary. Submit buttons show a short loading state.
- The menu drawer and the mobile filter sheet trap focus, close on Escape and return focus to their opener.
- The mobile bottom bar hides while the hero buttons, the lead form or the car page's booking button are on screen.
- Images are WebP with `srcset` (800/1600w) and explicit width and height.

## Do's and Don'ts

- Do keep all 22 cars in the catalogue and label self-drive-only cars.
- Do show price, deposit and mileage limit before the visitor has to call.
- Don't add a second accent colour; messenger and badge colours stay on their elements.
- Don't ship a photo with a readable licence plate (see assets/cars/SOURCES.md).
