---
title: Testing and building
description: How the tests are organised, what runs against a real database, and how to build from source.
order: 10
group: Components
---
## Building

```sh
cargo build --workspace        # server, agent, common
cargo run --bin croustypatch-server
cd frontend && npm ci && npm run build
```

The desktop app center needs WebKitGTK to build, so it has its own lock file and is built in Docker.

## Test layout

Tests live in each crate's `tests/` folder, never inline in `src/`.

```sh
docker compose -f docker/docker-compose.yml up -d   # PostgreSQL for the database-backed tests
cargo test --workspace
```

| Crate | Covers |
|---|---|
| `common` | RSA and HMAC primitives, JWT algorithm confusion, signed-command verification |
| `server` (engine) | Rule language, risk and decision logic, windows, permission patterns, CSRF host detection |
| `server` (database) | **Real PostgreSQL**: planner, waivers, audit chain and tamper detection, concurrent appends, lock-out guard, command dispatch |
| `server` (HTTP) | **Real HTTP stack on a real database**: login, lockout, forced password change, RBAC and privilege escalation, enrolment, agent JWT replay, installer distribution |
| `agent` | Package-manager parsers, sandboxed execution, firewall rule generation |
| `agent` (pipeline) | The real task runner end to end with a simulated service: patch, soak, automatic rollback, double failure, replay, manual rollback |

Each database test creates its own temporary database and drops it afterwards, so they run safely in parallel. If PostgreSQL is unreachable they **fail with instructions** rather than skip.

## Beyond unit tests

- **Regression tests** exist for bugs that were only visible end to end, and each fails without its fix.
- **Browser tests** drive the real interface and cover small window sizes.
- **Live Docker tests** (ignored by default, they need Docker and internet) apply and roll back a real version change with a real daemon and compose.

## Not covered

The apt and pacman command paths are tested through parsers and a mock backend, not on those systems, and firewall rules are generated and checked but not applied to a live host.
