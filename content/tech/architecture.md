---
title: Architecture overview
description: The three parts of CroustyPatch, how they talk, and the rules that shape the design.
order: 1
group: Foundations
---
CroustyPatch is a patch-management and automated-remediation platform in 100 % Rust, with a Next.js interface. It is a workspace of four crates plus a frontend:

| Part | Location | Role |
|---|---|---|
| **Server** | `server/` | REST API, WebSocket gateway, policy engine, planner, scheduler, notifications, audit log. Serves the web interface. |
| **Agent** | `agent/` | Root-privileged binary on each Linux or FreeBSD host: inventory, patching, rollback, quarantine, local app center. |
| **Common** | `common/` | The wire protocol, signed commands, JWT and crypto primitives shared by both sides. |
| **Web UI** | `frontend/` | Next.js static export, embedded and served by the server. |
| **Desktop app center** | `portal-gui/` | A Tauri window for laptops and workstations, built separately. |

```text
 browser ──HTTPS──▶ ┌────────────┐ ◀── TLS 1.3 (WebSocket or HTTPS) ──▶ agent (root, per host)
 API / MCP client ─▶ │   server   │ ◀── TLS 1.3 ───────────────────────▶ agent
                     └─────┬──────┘
                           │ Diesel
                      PostgreSQL
```

## Stack

- **Server**: `actix-web` and `actix` for the API and WebSockets, `diesel` with PostgreSQL, `rustls` for TLS 1.3, `aes-gcm` for column encryption, Argon2id for passwords.
- **Agent**: a lightweight multi-distribution binary with modular features (Docker, helper scripts, app center, eco mode, the pull tunnel).
- **Frontend**: React and Next.js built as a static export, so the server needs no Node runtime.
- **Protocols**: TLS 1.3, JWT, per-agent RSA keys, HMAC-SHA256 webhooks and the Model Context Protocol.

## Design rules

1. **The server decides, the agent verifies.** The agent runs as root, so it never trusts a request on its own authority: it only runs commands the server signed, bound to it, valid for ten minutes and carrying a nonce.
2. **The agent is confined.** Fixed programs from system directories, no shell, a wiped environment, a timeout and validated arguments.
3. **Nothing is applied without a way back.** A restore point comes first, health probes watch the result, and failure isolates the host.
4. **Deterministic first.** The policy engine is a rule language and decision tables. AI can only advise within strict limits.
5. **Everything is recorded.** Actions are audited in an append-only, hash-chained log, and their notifications are queued in the same transaction.
6. **Modules are per host.** Docker, the app center and eco mode are detected by the agent and switched by the server.

## Tasks, end to end

1. A scanner or a heartbeat updates the host's **inventory** and pending updates.
2. The **planner** matches the host to a policy, evaluates risk and decides `AUTO_DEPLOY`, `REQUIRE_APPROVAL` or `BLOCK`, and records a **task** with its reasoning.
3. When the task is due (approved, patch day open), the server **signs a command** and hands it to the agent through the tunnel or the next telemetry reply.
4. The agent verifies the command, runs the **pipeline** (restore point, apply, soak, rollback if needed) and reports each step.
5. The server records the result, writes the audit entry and queues notifications.

The next pages follow each of these: [Communication](/technical/communication/), [Security](/technical/security/), [Policy engine](/technical/policy-engine/), [Patch pipeline](/technical/patch-pipeline/).
