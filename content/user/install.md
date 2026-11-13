---
title: Install the server
description: "Run the server with Docker Compose: copy-paste quickstart, first login, first agent, upgrade, backup and restore."
order: 2
group: Get started
---
The server ships as a container image, **`{{image}}`**, next to a PostgreSQL container. One Compose file runs both.

> Replace the image owner once: `OWNER` in the image name stands for the GitHub account that publishes it (see the [project on GitHub]({{repoUrl}})).

## Requirements

- A 64-bit Linux host with Docker and the Compose plugin.
- A DNS name for the server (for example `patch.example.com`), because agents connect to it.
- A TLS 1.3 front: either the server's own certificate handling, or a reverse proxy in front of it.

## 1. Get the files

```sh
mkdir croustypatch && cd croustypatch
curl -fsSLO {{repoUrl}}/raw/main/deploy/docker-compose.yml
curl -fsSLO {{repoUrl}}/raw/main/deploy/.env.example
cp .env.example .env
chmod 600 .env
```

## 2. Set the secrets

Fill in `.env`. The database password and the master key are random values you generate once:

```sh
printf 'CROUSTYPATCH_DB_PASSWORD=%s\nCROUSTYPATCH_MASTER_KEY=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -base64 32)" >> .env
```

> **Back up the master key separately from the database.** It encrypts the sensitive columns (such as an AI API key) and derives the session key. Lose it and those values cannot be recovered; leak it together with a database dump and the encryption is defeated.

## 3. Start it

```sh
docker compose pull
docker compose up -d
docker compose logs server | head -30     # shows the bootstrap password once
```

Migrations run automatically at start.

## 4. First login

Open `https://patch.example.com` and sign in as `admin` with the password printed in the log (or the value of `CROUSTYPATCH_BOOTSTRAP_PASSWORD` if you set it; then it is not printed). You are asked to change it right away.

Create your own administrator under **Accounts**, then turn the fallback account off so the bootstrap one cannot be used:

```sh
docker compose exec server croustypatch-server admin disable --super-admin-fallback
```

The command refuses to run if no other enabled account can manage users, so you cannot lock yourself out. Other commands: `admin enable --super-admin-fallback`, `admin reset-password <user>` (the new password goes in `CROUSTYPATCH_NEW_PASSWORD`) and `migrate`.

## 5. Enrol your first agent

In the web interface click **Add agent**, choose the mode, group and environment, and **Generate the command**. Run the one-liner it shows as root on the machine:

```sh
curl -fsSL https://patch.example.com/api/v1/agent/install.sh | sudo env CROUSTYPATCH_ENROLL_TOKEN=cpt_xxxxxxxx sh
```

The wizard waits for the agent and confirms when the host appears. See [Add and manage agents](/docs/agents/) for options.

## TLS and reverse proxy

- **direct** (default): the server speaks HTTPS, TLS 1.3 only. Mount your certificate and set `CROUSTYPATCH_TLS_CERT` and `CROUSTYPATCH_TLS_KEY`, or let it create a self-signed one in its data volume; agents then pin it with `--ca-file`.
- **proxy**: set `CROUSTYPATCH_TLS_MODE=proxy` and list your proxy in `CROUSTYPATCH_TRUSTED_PROXIES`. The server then speaks plain HTTP and reads `X-Forwarded-*` only from those peers.

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

## Upgrade

Back up first (below), then pull the new image and restart. Migrations apply at start.

```sh
docker compose pull
docker compose up -d
```

To pin a version instead of following a tag, set it in the image reference of your Compose file. See [Releases and updates](/docs/releases/) for what to read before upgrading and how agents follow.

## Backup and restore

Back up two things, and keep them apart: the **database** and the **master key**.

```sh
# database dump
docker compose exec -T postgres pg_dump -U croustypatch -Fc croustypatch > croustypatch-$(date +%F).dump
# the master key lives in your .env: store it in a password manager or a separate vault
```

Restore into a fresh stack (same master key in `.env`):

```sh
docker compose up -d postgres
docker compose exec -T postgres pg_restore -U croustypatch -d croustypatch --clean --if-exists < croustypatch-2026-11-13.dump
docker compose up -d
```

You can verify the audit log's integrity from the UI (**Audit**, verify the chain) or with `GET /api/v1/audit/verify`, and export its head hash to keep elsewhere.

## Configuration reference

Everything is an environment variable or a flag (`croustypatch-server --help`).

| Variable | Default | Meaning |
|---|---|---|
| `DATABASE_URL` | set by the Compose file | PostgreSQL connection string |
| `CROUSTYPATCH_LISTEN` | `127.0.0.1:8443` | Listen address |
| `CROUSTYPATCH_DATA_DIR` | `./data` | Master key file, TLS files |
| `CROUSTYPATCH_MASTER_KEY` | file in the data dir | Base64, 32 bytes |
| `CROUSTYPATCH_TLS_MODE` | `direct` | `direct` or `proxy` |
| `CROUSTYPATCH_TLS_CERT` / `_KEY` | self-signed | PEM files |
| `CROUSTYPATCH_TLS_SAN` | `localhost,127.0.0.1` | Names for the generated certificate |
| `CROUSTYPATCH_TRUSTED_PROXIES` | `127.0.0.1,::1` | Peers allowed to set `X-Forwarded-*` |
| `CROUSTYPATCH_AGENT_DIR` | `./data/agents` | Agent binaries offered by *Add agent* |

## Building from source

Needs a recent stable Rust and Node 22.

```sh
cd frontend && npm ci && npm run build && cd ..
cargo build --release -p croustypatch-server -p croustypatch-agent
export DATABASE_URL=postgres://croustypatch:...@127.0.0.1/croustypatch
export CROUSTYPATCH_MASTER_KEY=$(openssl rand -base64 32)   # keep it
CROUSTYPATCH_STATIC_DIR=frontend/out target/release/croustypatch-server serve
```

A hardened systemd unit is in `docker/croustypatch-server.service` in the repository.
