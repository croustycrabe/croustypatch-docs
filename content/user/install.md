---
title: Install the server
description: Docker, source builds, configuration, TLS modes, reverse proxy and backups.
order: 2
group: Get started
---
## Requirements

- Server: a 64-bit Linux host or container and PostgreSQL 14 or newer. The PostgreSQL client library is compiled in.
- Agent: Linux with apt or pacman, or FreeBSD with `pkg`; root access; `nft` (Linux) or `pf` (FreeBSD) for quarantine.
- Building from source: a recent stable Rust and Node 22.

## With Docker

```sh
cd docker
printf 'CROUSTYPATCH_DB_PASSWORD=%s\nCROUSTYPATCH_MASTER_KEY=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -base64 32)" > .env
chmod 600 .env
docker compose -f docker-compose.prod.yml up -d --build
```

The first start creates a fallback super-admin called `admin`. Its password is printed once in the log, or taken from `CROUSTYPATCH_BOOTSTRAP_PASSWORD` if you set it (then it is not printed). You must change it at first login.

Other administration commands:

| Command | Effect |
|---|---|
| `croustypatch-server admin disable --super-admin-fallback` | Turn the fallback account off (refused if it would lock everyone out) |
| `croustypatch-server admin enable --super-admin-fallback` | Turn it back on |
| `croustypatch-server admin reset-password <user>` | Reset a password; the new one goes in `CROUSTYPATCH_NEW_PASSWORD` |
| `croustypatch-server migrate` | Run database migrations by hand |

## From source

```sh
cd frontend && npm ci && npm run build && cd ..
cargo build --release -p croustypatch-server -p croustypatch-agent
export DATABASE_URL=postgres://croustypatch:...@127.0.0.1/croustypatch
export CROUSTYPATCH_MASTER_KEY=$(openssl rand -base64 32)   # keep it
CROUSTYPATCH_STATIC_DIR=frontend/out target/release/croustypatch-server serve
```

Migrations run automatically at start. A hardened systemd unit is provided in `docker/croustypatch-server.service`.

## Configuration

Everything is a flag or an environment variable (`croustypatch-server --help`).

| Variable | Default | Meaning |
|---|---|---|
| `DATABASE_URL` | local dev URL | PostgreSQL connection string |
| `CROUSTYPATCH_LISTEN` | `127.0.0.1:8443` | Listen address |
| `CROUSTYPATCH_DATA_DIR` | `./data` | Master key file, TLS files |
| `CROUSTYPATCH_MASTER_KEY` | file in the data dir | Base64, 32 bytes. If unset, `master.key` (mode 600) is created |
| `CROUSTYPATCH_TLS_MODE` | `direct` | `direct` or `proxy` |
| `CROUSTYPATCH_TLS_CERT` / `_KEY` | self-signed | PEM files |
| `CROUSTYPATCH_TLS_SAN` | `localhost,127.0.0.1` | Names for the generated certificate |
| `CROUSTYPATCH_TRUSTED_PROXIES` | `127.0.0.1,::1` | Peers allowed to set `X-Forwarded-*` |
| `CROUSTYPATCH_STATIC_DIR` | `../frontend/out` | The exported web interface |
| `CROUSTYPATCH_AGENT_DIR` | `./data/agents` | Agent binaries offered by *Add agent* (comma separated) |

## TLS modes

- **direct**: the server speaks HTTPS and accepts **only TLS 1.3**. Give it your certificate, or let it create a self-signed one; agents then pin that certificate with `--ca-file`.
- **proxy**: the server speaks plain HTTP behind nginx, Traefik, HAProxy or a Cloudflare tunnel, which terminates TLS 1.3. The server reads `X-Forwarded-For`, `-Proto` and `-Host` **only from the peers in `CROUSTYPATCH_TRUSTED_PROXIES`**: set that list to your proxy's address.

The proxy must pass the WebSocket upgrade for the agent tunnel (`/api/v1/agent/ws`). With nginx:

```nginx
location / {
    proxy_pass http://127.0.0.1:8443;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 1h;
}
```

## Backups and upgrades

- Back up the PostgreSQL database **and**, separately, the master key.
- Upgrading means replacing the image or the binary; migrations apply at start.
- You can verify the audit log's integrity from the UI (**Audit**, verify the chain) or with `GET /api/v1/audit/verify`.
