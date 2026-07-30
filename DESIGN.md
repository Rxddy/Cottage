---
name: Lakefront Serenity
description: A grounded waterfront cottage booking experience for Kawartha Lakes.
colors:
  deep-water: "#0c2a23"
  forest: "#173b31"
  reed: "#57633e"
  sage: "#889176"
  cottage-cream: "#f3f0e7"
  warm-paper: "#fbfaf6"
  charcoal: "#171b18"
  muted-copy: "#646a63"
  sunlight: "#e4b321"
typography:
  display:
    fontFamily: "Charter, Bitstream Charter, Sitka Text, Georgia, serif"
    fontSize: "clamp(2.875rem, 4.2vw, 4.125rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "5px"
  surface: "9px"
  panel: "18px"
spacing:
  compact: "8px"
  control: "14px"
  section: "clamp(4.5rem, 7vw, 6rem)"
components:
  button-primary:
    backgroundColor: "{colors.deep-water}"
    textColor: "{colors.warm-paper}"
    rounded: "{rounded.control}"
    padding: "0 23px"
    height: "52px"
  panel:
    backgroundColor: "{colors.cottage-cream}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.panel}"
    padding: "20px"
---

# Design System: Lakefront Serenity

## Overview

**Creative North Star: "The Kept Cottage"**

The site should feel cared for rather than staged. Actual property photography, dark lake-green surfaces and warm paper tones carry the identity. Practical details stay close to the moments when guests need them.

The system rejects generic luxury language, repetitive feature-card walls and animation used as decoration. Motion is quick, calm and tied to orientation, photo changes or a clear interaction.

## Colors

Deep water green anchors the hero, gallery and booking flow. Cottage cream and warm paper keep long planning sections comfortable to read. Sunlight gold is reserved for focus and ratings.

## Typography

**Display Font:** Charter (with Sitka Text and Georgia fallbacks)  
**Body Font:** System UI (with Segoe UI and Arial fallbacks)

The display face gives the site a familiar residential character. The body stack keeps pricing, dates and rules crisp across devices.

## Elevation

Most sections are separated by tone, borders and spacing. Shadows are reserved for floating booking controls, photo overlays and raised interactive states.

## Components

### Buttons

Primary buttons use deep water green, compact corners and a short upward hover movement. Focus always uses the sunlight outline.

### Cards / Containers

Photo cards exist to open real images. Information uses grouped panels only when the border helps scanning, especially booking, contact and safety content.

### Inputs / Fields

Fields use warm white surfaces, a quiet border and a clearly visible focus state. Entire guest and date controls are interactive, not only their labels or arrows.

### Navigation

The fixed header stays narrow, left aligned and vertically centred. Desktop links remain horizontal; the mobile menu trigger stays at the right edge.

## Do's and Don'ts

### Do:

- **Do** keep the booking action visible while guests browse.
- **Do** show actual rates beside the calendar and itemize selected dates.
- **Do** use Anime.js for restrained reveals, category changes and the rotating cottage photograph.
- **Do** respect reduced motion and keep all interactions keyboard accessible.

### Don't:

- **Don't** use generic AI landing-page copy or inflated resort language.
- **Don't** repeat identical icon cards across long sections.
- **Don't** hide pricing behind a contact request.
- **Don't** use glass-heavy panels, elastic motion or decorative gradient text.
