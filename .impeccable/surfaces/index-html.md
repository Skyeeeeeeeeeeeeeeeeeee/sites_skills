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

THESIS: The site is one night street: eight numbered garage boxes on Каретный Ряд, one car in each. The visitor walks past them, doors roll up, and the car in front of them is the car they are booking. Refuses hero-with-widget, card grids, steppers and CTA bands.

OWN-WORLD: Moscow at night. Lacquer #0D0E10 and asphalt #1C1F23 grounds, ivory #ECE7DF text, sodium #F2A541 only as light (the time, states, focus), each car's own light colour spilling from its box ceiling. Night-graded photography, plates blurred. Unbounded 300 and Golos Text. Square corners, hairlines.

STORY: Arrive at the street, the first door rolls up and the Wraith lights up. Scroll and the street pans; each box opens as you pass and the dock picks up that car with its total. Garage is the floor plan, a car page is its box opening, booking shows the car standing in its open box.

FIRST VIEWPORT: Left, h1 «Восемь боксов на Каретном Ряду» and one line of promise; right, box 1 opening with the next box's closed door at the edge; streetlamps on the kerb; the dock at the bottom with car, day, time, mode, total and «Забронировать». Header transparent.

FORM: Night street, structural redesign chosen by the user over the night-dispatch scene (whose intro animation was rejected). Palette and type carried from direction B.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

The door: one `--open` value per box rolls the door up, lights the ceiling strip and brings the car up from the dark; the dock follows the box nearest the centre.

## Fixes carried from the critique

All 8 cars always shown (self-drive-only labelled), one primary CTA per viewport, bottom dock with total on every selling page, booking for another person, earliest pickup = now + 90 min enforced, request number and shareable summary on success, no fabricated testimonials.
