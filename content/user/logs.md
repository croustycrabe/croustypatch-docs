---
title: Audit and logs
description: Who changed what, and what the server did.
order: 16
group: Administration
---
## Audit

The **Audit** page is the record of who changed what. It is append-only and hash-chained. Use **verify the chain** (or `GET /api/v1/audit/verify`) to detect tampering. To also catch deletion of the latest entries, export the head hash periodically and keep it elsewhere.

## Logs

*Administration > Logs* (permission `audit:read`) shows what the server did, newest first, in a single list: every task status change, notification deliveries (with errors and attempts), report sends and the server's own warnings and information lines.

Filter by source, by level (warnings and errors, errors only), by words and by host. *Show more* pages back in time and *Follow live* reloads every 10 seconds. The server's messages are kept in memory since it started (the last 3000 lines); its full log stays on standard output.

Audit explains who decided; Logs explains what happened.
