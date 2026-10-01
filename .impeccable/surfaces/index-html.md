---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["fleet.html","car.html","booking.html","terms.html"]
---

## Scope

Redesign of the whole site for «Каретный»: index.html, fleet.html, car.html, booking.html, terms.html. Replaces the earlier "call slip on paper" world. Mode: Persuade (home, garage, car), Operate (booking).

## Audience and action

Affluent Moscow clients and, very often, their assistants booking on a phone for someone else. Primary action: a booking request. One CTA label: «Забронировать».

## Direction contract

THESIS: The site sells a moment, not a car: the visitor sets the minute the car will be at the door, and everything else (car, price, the evening's timeline) follows that time. Refuses the category default of hero-with-widget, stepper, testimonial cards and CTA band.

OWN-WORLD: Moscow at night. Lacquer #0D0E10 and asphalt #1C1F23 grounds, ivory #ECE7DF text, muted #8D8A84, sodium streetlight #F2A541 used only as light (the time, active states, focus). All photography graded to one night look, plates blurred. Unbounded 300 for display and numerals, Golos Text for reading. Sharp corners, hairlines #2A2E33, no cards with shadows.

STORY: The visitor sees a car at an entrance at night and a large time. They change the time and the car, see the price, read the evening as a timeline derived from their time, then book; on a phone a bottom bar always carries the total and the button.

FIRST VIEWPORT: Full-bleed graded photo of the selected car. Bottom-left: h1 «Экипаж подан к» with the time as a giant sodium numeral control (minus/plus, arrow keys, day switch). Bottom-right: car switcher (name, mode, price) and «Забронировать». Header transparent on top.

FORM: Night dispatch, grounded candidate B of 3 presented to the user (user choice). Seed key 023fb55a (degraded roll).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

The pickup time control: digits roll when the time changes, the scene crossfades when the car changes, and the evening timeline on the page recomputes from the chosen time (T-90 request, T-75 call, T-40 car ready, T-10 at the door).

## Fixes carried from the critique

All 8 cars always shown (self-drive-only labelled), one primary CTA per viewport, sticky mobile bar with total, booking for another person, earliest pickup = now + 90 min enforced, request number and shareable summary on success, no fabricated testimonials.
