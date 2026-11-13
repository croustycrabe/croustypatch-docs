---
title: App center
description: Let people install approved applications and update their own machine from a terminal or desktop app.
order: 11
group: Features
---
The app center lets an administrator publish a catalog of applications, and lets people on managed machines install or remove them without root. It is a module, switched on per host.

## The catalog

Under **App center > Catalog** (permission `settings:write`) an application has a name, version, category, description, icon, installation instructions per system and the host groups that see it (none means every host).

- **Installation per system**: one entry per package manager (`apt`, `pacman`, `pkg`, `dnf`) and/or a catch-all, so one catalog entry can be `fd-find` on Debian and `fd` on Arch.
- **Packages** are installed and removed by the agent's package manager.
- **Commands** (internal tools, vendor installers) run as root, so creating or editing one needs the extra `portal:commands` permission. Never put a secret in a command: it is stored and shown in clear.
- **Suggestions**: a built-in list of common applications you can copy into the catalog and adjust.

## Applications and updates

In the web app, **App center > Applications** shows, for a chosen machine, which apps are offered, which are installed and any operation in progress. Install and Remove create a task that the agent runs; one operation at a time per host, and every request is audited.

An **Updates** view lets a person update their own machine on laptops and workstations, where the *Updates from the app center* switch is on. The server checks every request: the host acts only on itself, nothing in flight, and only real pending system updates are accepted.

## On the machine

- **Terminal app center**: any local user without root runs `croustypatch-portal` for a full-screen terminal interface with categories, details, a progress bar and a notification log.
- **Desktop app center**: on laptops and workstations the installer also adds a window with the same features, following the system language and theme.

Both talk to the local agent, which relays to the server under its own signed identity and records the local account in the task and the audit log.
