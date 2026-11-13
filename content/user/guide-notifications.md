---
title: Set up notification channels
description: "Step by step: add an e-mail, webhook, ntfy or Gotify channel, test it, and route events to it with a rule."
order: 18
group: Guides
---
Notifications work in two steps: a **channel** says where messages go, and a **rule** says which events go to which channels. You need the permission `settings:write` to change them.

Open **Notifications** in the sidebar.

## 1. Add a channel

Press **New channel**, pick a type and fill in the fields. Passwords, keys and tokens are encrypted in the database and never shown again; leave a secret empty when editing to keep the saved value.

### E-mail (SMTP)

| Field | Value |
|---|---|
| SMTP server | your mail server, for example `smtp.example.org` |
| Port | `587` with STARTTLS, `465` with implicit TLS, `25` for a trusted relay |
| Encryption | STARTTLS, Implicit TLS, or None (trusted network only) |
| Username and Password | the account that sends |
| Sender | the From address, for example `croustypatch@example.org` |

Recipients are set on each rule and report, not on the channel. E-mails go out as plain text plus an HTML version. With a provider such as Gmail or Microsoft 365, use an app password or a dedicated relay account rather than your own password.

### Signed webhook

| Field | Value |
|---|---|
| URL | where to send the JSON, for example `https://hooks.example.org/croustypatch` |
| HMAC signing key | a long random secret, for example `openssl rand -hex 32` |

Each delivery is signed so you can check it came from your server. The request carries `x-croustypatch-timestamp` and `x-croustypatch-signature: sha256=<hex>`, the HMAC-SHA256 of `"<timestamp>.<raw body>"` with your key. Verify over the raw body and reject old timestamps to stop replays. A short example in Python:

```python
import hmac, hashlib, time

def valid(key: bytes, timestamp: str, body: bytes, signature: str) -> bool:
    if abs(time.time() - int(timestamp)) > 300:
        return False
    expected = hmac.new(key, timestamp.encode() + b"." + body, hashlib.sha256).hexdigest()
    return hmac.compare_digest("sha256=" + expected, signature)
```

### ntfy

| Field | Value |
|---|---|
| URL | your ntfy server, for example `https://ntfy.sh` or your own |
| Topic | the topic to publish to, for example `croustypatch-alerts` |
| Access token | optional, for a protected topic |

On a public server anyone who knows the topic can read it: choose a long, unguessable name, or use your own server with access control.

### Gotify

| Field | Value |
|---|---|
| URL | your Gotify server, for example `https://gotify.example.org` |
| Application token | create an application in Gotify and paste its token |

## 2. Test it

Press **Send test** on the channel. The message is delivered at once, and the error is shown if it fails. For e-mail it asks who to send to; your own address is suggested (set it under *My account*).

## 3. Create a rule

Channels send nothing until a rule uses them. Press **New rule**:

1. **Events**: pick what you care about. Critical events are a host quarantined, a host unresponsive after planned downtime, and a host not back after a reboot. High ones are a failed task and a rolled-back patch.
2. **Minimum severity**: hide the noise, for example High and above.
3. **Channels**: one or more of the channels you added.
4. **Frequency**: **Immediate**, or a **daily digest** at a chosen UTC hour. A digest only holds the events since the last one, and sends nothing when there were none.
5. **Scope**: limit to some host groups, or leave empty for every host.
6. **Recipients** (e-mail only): roles and extra addresses.

Press **Send digest now** on a digest rule to see what it looks like.

## 4. Optional: a regular report

A rule tells you when something happens. A **report** is a summary of the fleet sent on a daily, weekly or monthly schedule, even when nothing happened. Create one under *Notifications > Reports*; see [Notifications and reports](/docs/notifications/).

## Checking deliveries

**History** lists every delivery with its status. A failed delivery is retried five times with growing delays. If a report cannot be sent, the `report.failed` event is raised, so you can have a rule warn you on another channel.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Test e-mail fails with a TLS error | Wrong Encryption for the port: 587 with STARTTLS, 465 with implicit TLS |
| Authentication failed | Wrong password, or the provider needs an app password |
| Webhook receiver rejects the signature | Verifying a re-serialised body instead of the raw one, or a clock more than a few minutes off |
| Nothing arrives although the test works | No rule uses the channel, the minimum severity is too high, or the scope excludes the host |
