---
title: Packages and vulnerabilities
description: Every package across the fleet, fleet-wide updates and the vulnerability view.
order: 6
group: Using the app
---
## Packages

The **Packages** page shows every package across the whole fleet, paged by the server so every one is reachable. Open a package to see the hosts that have it, and update it on **all the hosts that need it** in one action.

## Vulnerabilities

The **Vulnerabilities** page lists CVEs reported for the pending updates, with their CVSS score and whether they are known to be exploited. The policy engine uses the same data to rate risk: see [Policies](/docs/policies/).

How much CVE information you get depends on the package manager: apt reports a security flag but no CVE ids; pacman needs `arch-audit`. See [Add and manage agents](/docs/agents/).
