---
title: The server
description: The crate layout, background workers, data and the database.
order: 7
group: Components
---
The server is a thin `main.rs` over a library crate, so tests can import the real code. It serves the REST API, the agent gateway, the MCP endpoint and the exported web interface.

## Modules

| Area | Responsibility |
|---|---|
| `api/` | REST handlers, authentication, permission checks |
| `gateway` | Agent WebSocket sessions and push-mode telemetry |
| `engine/` | The rule language and risk evaluation |
| `planner`, `scheduler` | Turning pending updates into tasks, and running due tasks |
| `audit` | The hash-chained, append-only log |
| `notify`, `reports` | Channels, rules, queue, retries, digests and scheduled reports |
| `reboot`, `modules` | Reboot workflow, per-host modules |
| `ai` | OpenAI-compatible client with its guardrails |
| `logs` | An in-memory ring of server messages for the Logs page |
| `auth`, `crypto`, `tls` | Sessions and passwords, column encryption, TLS setup |
| `db`, `schema`, `models` | Diesel and PostgreSQL |

## Data

PostgreSQL holds the inventory, policies, tasks, the audit chain, notification queues and settings. Migrations run on start. Sensitive columns (AI key, channel passwords, webhook keys) use AES-256-GCM with the master key, which comes from `CROUSTYPATCH_MASTER_KEY` or a mode-600 file in the data directory. It also derives the session key.

## Consistency

- **Notifications are queued in the same transaction as their audit entry**, so nothing recorded is lost and nothing is sent for an action that was rolled back.
- The audit table refuses update, delete and truncate through database triggers, and each row hashes its predecessor.
- Enrolment rejections stay in the audit log even though the request failed, since they are recorded outside the failed transaction.

## Background work

A scheduler plans and dispatches tasks, ends stale ones (a task is failed after 90 minutes of silence), retries notification deliveries (five tries for rules, three for reports) and sends digests and reports on their schedule.

## Administration

The binary has subcommands: `serve`, `migrate` and `admin` (disable or enable the fallback super-admin, reset a password). `admin disable` refuses when no other enabled account can manage users.
