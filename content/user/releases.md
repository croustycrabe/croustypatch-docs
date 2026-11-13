---
title: Releases and updates
description: Where releases are published, how to upgrade the server and how agents follow.
order: 3
group: Get started
---
## Where releases come from

Each release is published on [GitHub Releases]({{releasesUrl}}) with its notes, and the matching container image is pushed to `{{image}}`. The version of the running server is shown at the foot of the sidebar and on the sign-in page.

Bugs and questions go to the [issue tracker]({{issuesUrl}}); the source is at [{{repoUrl}}]({{repoUrl}}).

## Upgrading the server

1. Read the release notes, especially anything about the database or the agents.
2. [Back up](/docs/install/) the database and keep the master key safe.
3. `docker compose pull && docker compose up -d`. Migrations apply by themselves at start.
4. Sign in and check the version in the sidebar. Verify the audit chain from the **Audit** page if you want a proof that nothing moved.

To roll back, put the previous image tag back and restore the database dump taken before the upgrade, since migrations only move forward.

## Upgrading the agents

Agents keep working across server upgrades: they advertise their capabilities, and the server never sends an order an older agent would misread. To update one, open the host and use **Update agent** (permission `hosts:write`) when its version differs from the server's. The agent downloads the matching build from your own server, verifies its SHA-256, checks that the new binary starts, swaps it in and restarts; any failure leaves the running binary untouched. Agents older than 0.4 cannot update themselves: run the installer one-liner on them once, no token needed.

On laptops and workstations the same action also updates the desktop app center.
