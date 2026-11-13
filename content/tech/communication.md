---
title: Communication and eco mode
description: Push and pull modes, the WebSocket tunnel, reverse-proxy support and battery-friendly behaviour.
order: 2
group: Foundations
---
## Two modes

- **Push**: the agent sends telemetry, inventory and results at a fixed interval over HTTPS. The server's reply carries settings and any pending command.
- **Pull** (the default): the agent opens and keeps a **persistent, encrypted WebSocket** to the server at `/api/v1/agent/ws`. The server can push an order immediately (a critical patch, a scan) without the agent exposing any port or polling.

Either way the traffic is TLS 1.3 only, and every request carries the agent's identity (see [Security](/technical/security/)).

## Capabilities

Agents advertise what they understand (`capabilities` such as `settings`, `app_command`, `self_update`, `docker_retag`). The server never sends an order an older agent would misread, and answers with a clear refusal rather than letting it do the wrong thing. Settings reach the agent by a WebSocket `settings` message or in the push-mode reply, and the agent keeps the last ones in `settings.json` in its state directory.

## Transport and reverse proxies

The server has two modes. In **direct** mode it terminates TLS 1.3 itself, with your certificate or a self-signed one that agents pin. In **proxy** mode it listens on plain HTTP behind nginx, Traefik, HAProxy or a Cloudflare tunnel.

In proxy mode it reads `X-Forwarded-For`, `-Proto` and `-Host` **only from configured trusted peers**, so a client cannot forge its address. The session cookie gets `Secure` when the proxy reports `https`. The proxy must pass the WebSocket upgrade and allow long reads.

The agent also records the server's last resolved IP addresses and can connect through them while keeping the host name for TLS. This is what lets a quarantined host, which has no DNS, reconnect.

## Eco mode

A laptop on battery should not hold a constant connection. With eco mode on:

- **Adaptive heartbeats**: the interval grows when the machine is on battery (`eco_heartbeat_secs`).
- **Tunnel suspension**: when the machine sleeps the tunnel is suspended cleanly and reconnects on wake-up or when a stable network returns.

Eco is a per-host switch that the server sends to the agent; it replaces the agent's local `eco_enabled` setting.

## Resources

Every heartbeat carries CPU use, memory, load, uptime and filesystems. A freshly connected agent sends one at once. The server keeps the latest reading and one point every five minutes for two weeks.
