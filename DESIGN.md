# Design System Document: Industrial Precision & Kinetic Depth

## 1. Overview & Creative North Star: "The Kinetic Monolith"
This design system moves away from the "industrial" cliché of heavy textures and yellow hazard stripes. Instead, it adopts the **Kinetic Monolith** North Star. This approach treats digital interfaces like a piece of high-end, precision-machined automation hardware: heavy but effortless, silent but powerful, and impeccably organized.

The system breaks the "template" look by utilizing **Editorial Asymmetry**. By pairing massive, high-contrast typography with expansive white space and overlapping "glass" containers, we create a sense of scale. The interface should feel like a high-tech control room—sophisticated, reliable, and intentionally sparse.

---

## 2. Colors: The Chrome & Energy Palette
The color strategy relies on a sterile, "Clean Room" environment (`surface` / `background`) punctuated by intense "Energy Cores" (`primary` / `secondary` gradients).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning. Boundaries must be defined through tonal shifts. A section should transition from `surface` to `surface_container_low` to create a break. 

### Surface Hierarchy & Nesting
Treat the UI as physical layers of precision-cut material.
*   **Base:** `background` (#f9f9fb) – The foundational floor.
*   **Level 1:** `surface_container_low` (#f3f3f5) – Secondary content areas.
*   **Level 2:** `surface_container_lowest` (#ffffff) – Primary cards or interactive modules.
*   **Level 3:** `surface_bright` – High-priority focal points.

### The "Glass & Gradient" Rule
To mimic the "High-Tech" tone, floating elements (modals, navigation bars) must use **Glassmorphism**. 
*   **Formula:** `surface_container_lowest` at 80% opacity + 20px Backdrop Blur.
*   **Signature Gradient:** For CTAs and Hero accents, blend `primary` (#5e0081) into `secondary` (#b6171e) at a 135-degree angle. This transition from Deep Purple to Crimson represents the "heat" of automation and the "logic" of engineering.

---

## 3. Typography: Industrial Authority
We utilize a pairing of **Space Grotesk** (Display/Headlines) and **Inter** (Body/Labels).

*   **Display-LG (Space Grotesk, 3.5rem):** Used for "Titan" headlines. Tracking should be tightened (-2%) to feel dense and machined.
*   **Headline-MD (Space Grotesk, 1.75rem):** For service titles. Use uppercase for a "technical manual" aesthetic.
*   **Body-LG (Inter, 1rem):** High-readability for technical descriptions. Line height set to 1.6 to ensure the "Professional" tone remains airy.
*   **Label-MD (Inter, 0.75rem):** Use for technical specs or status indicators. Set in All-Caps with +10% letter spacing to mimic serial numbers on industrial parts.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We use **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f3f3f5) background to create a "lifted" effect.
*   **Ambient Shadows:** If a card must float (e.g., in a Hero section), use a shadow color of `#5e0081` (Primary) at 4% opacity with a 40px blur. This creates a subtle "glow" rather than a dirty grey shadow.
*   **The Ghost Border:** If a boundary is required for accessibility, use `outline_variant` (#d2c1d3) at 20% opacity. It should be felt, not seen.

---

## 5. Components: Machined Primitives

### Hero Sections
*   **Layout:** Overlapping elements. A `display-lg` headline should partially overlap a `surface_container_highest` image container.
*   **Background:** Use a subtle radial gradient from `background` to `surface_container`.

### Service Grids
*   **Structure:** No dividers. Use a 40px `gap-8` spacing. 
*   **Interaction:** On hover, the card should shift from `surface_container_low` to `surface_container_lowest` and display a 2px `secondary` (Crimson) accent bar at the top.

### Detailed Contact Forms
*   **Input Fields:** Use `surface_container_high` with a "Ghost Border." On focus, the bottom border animates into a `primary` to `secondary` gradient line.
*   **Labels:** Use `label-md` in All-Caps, positioned strictly above the input.

### Buttons
*   **Primary:** Solid `primary` gradient. 4px (`md`) roundedness. No shadow.
*   **Secondary:** `surface_container_lowest` with a 20% `primary` outline.
*   **Tertiary:** Text-only with a `secondary` (Crimson) underline that expands on hover.

### Chips (Status Indicators)
*   **Style:** `surface_container_highest` background with `on_surface_variant` text. Use `full` roundedness.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Place a technical drawing or SVG schematic offset to the right, bleeding off the edge of the screen.
*   **Do** use "Breathing Room." If a section feels crowded, double the vertical padding. Engineering precision requires clarity.
*   **Do** use the `primary_fixed` (#f8d8ff) color for subtle background highlights behind important text blocks.

### Don't:
*   **Don't** use standard black (#000000). Always use `on_surface` (#1a1c1d) for text to maintain the "high-end" grey-scale feel.
*   **Don't** use 1px dividers. Use white space or a 8px height `surface_container` block to separate logical sections.
*   **Don't** use standard iconography. Use "Thin-stroke" (1px or 1.5px) technical icons that look like CAD drawings.

---

## 7. Context-Specific Components: The "Specs Module"
For an automation brand, we introduce the **Specs Module**. This is a `surface_container_low` block used for displaying technical hardware specifications. 
*   **Left Column:** `label-md` (All Caps, Grey).
*   **Right Column:** `body-md` (Bold, `on_surface`).
*   **Separation:** No line. Just a 24px horizontal gap between the label and the value. This reinforces the "No-Line" rule while maintaining "High-Tech" precision.