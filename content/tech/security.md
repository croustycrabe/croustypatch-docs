---
title: Security model
description: Channels, agent identity, signed commands, confinement, secrets, the audit chain and known limits.
order: 3
group: Foundations
---
## Channels

- **TLS 1.3 only** (rustls) for the API, the web interface and the agent tunnel. Behind a proxy, the proxy must enforce it. TLS 1.2 handshakes are refused in direct mode.
- **Agent identity**: each agent generates its own **RSA-2048** key at enrolment and the server keeps only the public key. Every request carries an **RS256 JWT** lasting at most 10 minutes, with a unique `jti` so replays are refused.
- **Signed commands**: the server signs commands with **RSA-3072** (PKCS#1 v1.5, SHA-256). A command is bound to one agent, valid for 10 minutes and carries a nonce. The agent verifies all of it, refuses replays and never runs a task id twice.
- **Enrolment tokens** are stored hashed, shown once, limited in uses and lifetime, and revocable.
- **Installer and downloads** are public on purpose, since a new host has no credentials, and contain no secret. The script refuses a binary whose SHA-256 differs from the server's and is generated only for a plain host name, never from a hostile `Host` header. The checksum is served by the same server, so it detects corruption, not a compromised server: the TLS certificate is what authenticates the server.

## Agent confinement

The agent runs as root but executes only **fixed programs from system directories**, without a shell, with a wiped environment, a timeout and arguments passed one by one. Package names are validated against a strict character set. Health probes accept only `tcp`, `http(s)` and service-status checks.

App-center commands are the one place where an administrator-authored command runs as root. They require a dedicated permission, nothing from the requester is ever interpolated, and the full text is in the audit log and in the signed order.

## Server

- **Passwords**: Argon2id, lockout after 5 failures for 15 minutes, a forced change at first login.
- **Sessions**: HS256 JWT in an `HttpOnly`, `SameSite=Strict` cookie (`Secure` over HTTPS). State-changing browser requests must come from the same origin, which also works over HTTP/2 where there is no `Host` header.
- **RBAC**: `module:action` permissions with wildcards. A user can only create or assign roles whose permissions they hold.
- **Secrets at rest**: AES-256-GCM with the master key, wiped from memory after use. Settings never return a stored secret.
- **Audit log**: append-only (database triggers refuse update, delete and truncate) and **hash-chained**, so a row edited by someone who disables the triggers is detected at verification. It cannot prove that the latest entries were not removed unless you export the head hash periodically.
- **API and MCP tokens** are hashed, shown once and expire.

## Self-service limits

Updates started from the local app center need no approval, so the server limits them: the request comes from the agent's own signed identity (a host only acts on itself), the local user comes from the socket's peer credentials, the module and the host's switch must be on, the host must not be pending or quarantined, one operation at a time, and every name must be a pending system update of that machine. All of it is audited.

Applying a Docker tag edits only the `image:` line of a compose file, on a signed command that the server builds from the container's own inventory. The agent re-checks the change on the real file and keeps the original for rollback.

## Known limits

- The server to PostgreSQL link is not TLS-protected (the client library is compiled without OpenSSL): keep it on a private network or a Unix socket.
- There is no per-IP rate limit on sign-in, only account lockout: add a proxy rate limit.
- The content-security policy allows inline scripts, which the static export requires.
- Operational messages written by the server and agents are in English whatever the interface language.
- A task in flight is lost if the agent restarts; the server marks it failed after 90 minutes of silence.
- OIDC/SSO, SMS and SIEM export are not implemented yet.
- The apt and pacman paths are covered by parsers and a mock backend in the test suite; firewall rules are generated and checked but the suite does not apply them to a live host.
