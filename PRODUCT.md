# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and vanilla JS (user requirement): every page opens directly from disk with no build step. No frameworks, no bundler.

## Users

Wealthy private clients in Moscow, plus their assistants and concierge services, who need a premium car for a defined occasion: a business visit, a wedding, a weekend outside the city, a guest's arrival. They decide quickly, value discretion and certainty, and expect the car, the driver and the paperwork to be handled without friction.

## Product Purpose

«Каретный» (Karetny) rents premium and executive cars, with or without a chauffeur. The site exists to let a visitor pick a car and place a booking request (dates, car, with/without driver, contact). Success = a completed booking request.

## Positioning

A small, curated fleet kept in a private garage on Karetny Ryad (the historic coach-makers' street in central Moscow): every car is hand-prepared before each rental and delivered to the client's door. Named after the carriage trade, the house treats a rental as a carriage service, not a car-sharing transaction.

## Operating Context

- Booking request → manager confirms by phone or messenger within 15 minutes → car delivered to address → returned or collected.
- Rental with chauffeur (hourly) or self-drive (daily). Deposit required for self-drive.
- Clients often book on a phone, on behalf of someone else.

## Capabilities and Constraints

- Booking is a request, not an instant payment; there is no backend. The form validates client-side and shows a confirmation state.
- Fleet, prices, address, phone, and reviews are **demo data invented for this build** (user approved). They must be clearly replaceable and must not be presented as verified third-party claims beyond the site itself.

## Brand Commitments

- Name: «Каретный». Language: Russian.
- Audience is affluent; tone is calm, precise, understated. No hype, no discount language.
- Brief asks for premium, individual design "with an accent".

## Evidence on Hand

No real photography, logo, legal details or testimonials exist in the repo. All are demo/inferred. Car imagery must come from stock sources or be omitted; never fake brand logos.

## Product Principles

1. Certainty over spectacle: price, terms and what happens next are always visible.
2. Discretion: few words, no pressure tactics.
3. The car is the hero; the interface recedes.
4. One clear path to booking from every page.

## Accessibility & Inclusion

WCAG 2.1 AA contrast and keyboard access; reduced-motion respected.
