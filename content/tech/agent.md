---
title: The agent
description: What runs on each host, how it stays small and safe, and its self-update and local interfaces.
order: 6
group: Components
---
The agent is a single Rust binary (`croustypatch-agent`) installed as a service. The same binary also provides `croustypatch-portal`, the terminal app center.

## Responsibilities

- **Inventory**: installed packages, pending updates, security flags and CVE ids where the package manager provides them, hardware facts and, on Linux, resource metrics.
- **Patching** through apt or pacman, with the [pipeline](/technical/patch-pipeline/).
- **Modules**: Docker (images, registry checks, compose updates), helper-script detection and the app-center relay. Each is detected by the agent and only runs when the server switches it on for the host.
- **Isolation**: firewall quarantine through `nft`.
- **Self-update**: the agent downloads the new build named in a signed order, checks its SHA-256, makes sure it starts and prints the expected version, swaps it in place and exits so the service manager restarts it. Any failure leaves the running binary untouched.

## Source layout

`runner` (the pipeline), the package-manager backends (apt and pacman, plus a mock), `exec` (confined execution), `isolate`, `health` (probes), `link` (tunnel and telemetry), `identity`, `reboot`, `selfupdate`, `portal` and `tui` (app center), `modules/` and `preflight`.

## Safety properties

- Fixed programs from system directories, no shell, wiped environment, timeouts, one argument at a time and validated package names.
- A command must be signed, in date, addressed to this agent and unseen.
- A dry-run mode (`run --dry-run`) logs everything it would do.
- It saves the server's last-known addresses so it can reconnect from quarantine.

## Local app center

The terminal and desktop app centers talk to the agent over a Unix socket (`/run/croustypatch/portal.sock`). The agent identifies the local user from the socket's **peer credentials**, never from what the client says, and relays to the server under its own signed identity. By default the socket is open to every local user because the catalog is admin-approved; `portal_group` restricts it to one group. The desktop window can call three commands (list, install, uninstall) under a strict content-security policy and has no shell, file or network access of its own.

## Machine type

At install time the agent reports whether the machine is a *laptop* (battery), *workstation* (display manager or desktop sessions) or *server*. Laptops and workstations get the desktop app center and its runtime on Linux x86_64; everything else uses the terminal one.
