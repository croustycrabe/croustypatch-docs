---
title: Notifications and reports
description: Channels, rules, daily digests and scheduled fleet reports.
order: 12
group: Features
---
Open **Notifications** in the sidebar (permission `settings:read` to view, `settings:write` to change).

## Channels

A channel says where messages go: **e-mail** (SMTP with STARTTLS, implicit TLS or none), a **signed webhook**, **ntfy** or **Gotify**. Passwords, keys and tokens are stored encrypted and never returned. **Send test** delivers a test message and shows the error if it fails.

## Rules

A rule says what and to whom: a list of events, a minimum severity, channels, an optional scope of host groups, and for e-mail the recipient roles plus extra addresses. It is **immediate** or a **daily digest** sent at a chosen UTC hour (or with *Send digest now*).

| Severity | Events |
|---|---|
| Critical | Host quarantined; host unresponsive after planned downtime; host not back after reboot |
| High | Task failed; patch rolled back |
| Medium | Host offline; patch awaiting approval |
| Info | Patch applied; reboot scheduled, started, completed |

Successful scans are not notified. Failed deliveries are retried five times with growing delays, and **History** lists every delivery.

## Reports

Rules tell you when something **happens**. A **report** is a summary of the fleet built when it is sent, on a daily, weekly or monthly schedule, **even if nothing happened**.

Under *Notifications > Reports*, set a name, a language (French or English), a schedule with its time zone, where to send it and what to include: the fleet summary, updates waiting per machine, patch history, failures and missed patch days, reboots required, each policy's next patch day and container images with a newer version. You can limit it to some groups and skip sending when empty. **Preview** shows it formatted or plain; **Send now** sends it at once. A failed send is retried and raises a `report.failed` event.

E-mail goes as plain text plus HTML; other channels get the text version.

## Webhooks

Each webhook is signed with HMAC-SHA256. See [Notifications internals](/technical/notifications-audit/) for the format and how to verify it.
