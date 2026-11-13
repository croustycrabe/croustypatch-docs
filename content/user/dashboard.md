---
title: Dashboard and navigation
description: The fleet at a glance, the sidebar, the command palette and how to customise the layout.
order: 4
group: Using the app
---
## Dashboard

The dashboard is made of **tiles** (single indicators) and **widgets** (panels). Every one can be shown, hidden, resized (XS to L) and reordered by dragging or with the arrows. Click **Personnaliser** to edit; the layout is saved per user, and you can restore the default.

| Tiles shown by default | Tiles hidden by default |
|---|---|
| Machines, needing updates, security updates, outdated packages, needing attention, machines with no policy | Reboots required, awaiting approval, patches applied (7 days), failures and missed patch days (7 days) |

Widgets: fleet status, update status, patching (next patch days with their policy and host count, what happened this week, and a warning for machines no policy covers), fleet resources, packages most behind, vulnerabilities, systems, activity and the app center.

## Navigation

- **Sidebar**: overview, fleet, patching, governance and administration, plus the **Add agent** button and your user menu. On a phone it becomes a drawer; on a desktop the menu button folds it to an icon rail.
- **Pages**: Dashboard, Hosts, Packages, Docker, Groups, App center, Tasks, Policies, Waivers, Vulnerabilities, Audit, Logs, Agent tokens, Accounts and roles, Settings. You only see what your role allows.
- **Command palette**: <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> on a Mac) searches pages, hosts and actions.
- **Panels**: forms and details open as a slide-over (policy editor, task detail, Add agent). Confirmations are small dialogs; feedback is a toast, and errors tied to a form stay inline.
- **Language and theme**: French (default) or English, light or dark. The theme follows your choice, otherwise the system.
- The server's **version** is shown at the foot of the sidebar and on the sign-in page.
