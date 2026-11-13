---
title: Interface and design system
description: The static Next.js frontend, its design tokens, accessibility and tests.
order: 9
group: Components
---
## Static export

The interface is a Next.js application built with `next build` as a **static export** and served by the Rust server from `CROUSTYPATCH_STATIC_DIR`. There is no Node runtime in production, which keeps deployment to one binary. The price is a content-security policy that allows inline scripts, which the export needs.

## Design system

The interface follows the **CroustyLab Software** design system: a cream, ink and a single brick accent, flat surfaces separated by tone and 1 px hairlines, four state colours (success teal, warning amber, danger crimson, info blue) and a light and dark theme. Fonts are self-hosted so the interface makes no third-party request.

Rules applied throughout: bracketed page titles, sentence case, a state colour always paired with an icon and a word, hard unblurred shadows only on floating layers and no slide or scale animations. Group colours come from a nine-colour palette or any validated `#rrggbb`.

## Behaviour

- The app frame is exactly the viewport; only the content column scrolls.
- The sidebar folds to an icon rail on desktop and a drawer on phones.
- Everything is bilingual (French by default). The English table is typed against the French one, so **a missing translation fails the build**.
- Keyboard: every control is reachable, panels trap focus and close on Escape, the command palette is a combobox, and there is a skip link. Motion respects `prefers-reduced-motion`.
- Dashboard layout is stored per user on the server.
