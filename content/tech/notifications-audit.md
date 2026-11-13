---
title: Notifications and audit
description: The event queue, webhook signatures and the hash-chained audit log.
order: 8
group: Engine
---
## Event queue

An important action writes its **audit entry and its notification event in one database transaction**. A delivery worker then sends events to channels (e-mail, webhook, ntfy, Gotify) according to rules: events, minimum severity, scope and immediate or digest mode. Failed deliveries retry five times with growing delays. Reports are different: they are built from the database at send time on a schedule, and a failed send is retried after 10 and 20 minutes and raises `report.failed`.

## Webhook format

```text
POST <url>
content-type: application/json
x-croustypatch-event: host.quarantined
x-croustypatch-delivery: <uuid>
x-croustypatch-timestamp: 1762610000
x-croustypatch-signature: sha256=<hex HMAC-SHA256(key, "<timestamp>.<raw body>")>

{"id": "...", "event": "host.quarantined", "severity": "critical", "title": "...", "text": "...", "data": {...}}
```

To verify: compute HMAC-SHA256 over `<timestamp>.<raw body>` with the shared key, compare in constant time and reject old timestamps to stop replays.

## The audit chain

Each audit row stores a hash that covers its content and the previous row's hash. Database triggers refuse update, delete and truncate. Verification walks the chain and reports the first broken link, which proves tampering after the fact. Because a truncated tail would still look valid, export the head hash periodically and keep it outside the database.
