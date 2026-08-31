---
name: ps-interface-design
description: Design and refine professional PS_Platform product interfaces such as dashboards, SaaS applications, admin panels, ERP systems, and data-heavy tools. Use for UI architecture, layouts, components, design systems, visual hierarchy, interaction states, and interface-quality reviews; not for marketing or branding-only pages.
---

# Interface design

Begin with the user, their context, the main task, and a deliberate product feeling. Name product-domain concepts, derive a contextual color world, and choose a signature interaction or presentation element.

## Establish a system before screens

Define the primary hierarchy, intended density (dense, balanced, or airy), 4px or 8px spacing scale, semantic color tokens, typography hierarchy, component reuse plan, and one consistent depth/radius strategy.

Use semantic tokens such as background, surface, text-primary, text-secondary, border, brand, success, warning, and danger. Reuse established components before creating new patterns.

## Requirements

- Make one element or task dominant on each screen; do not give all elements equal weight.
- Give business metrics context: what it is, why it matters, and what changed.
- Define default, hover, active, focus, and disabled states for interaction; include loading, empty, and error states for data surfaces.
- Use spacing, type, soft borders, and restrained surfaces before adding visual noise, heavy shadows, or arbitrary cards.
- Avoid generic dashboards, random colors, inconsistent radii, and template-like arrangements.

Before delivery, test three-second comprehension, component consistency, meaningful identity, systematic tokens, and suitability for a commercial business application. Record reusable tokens and patterns in `.interface-design/system.md` when a design system is established or changed.
