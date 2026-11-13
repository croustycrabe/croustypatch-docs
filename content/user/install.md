---
title: Install the server
description: "Run the server with Docker Compose: copy-paste quickstart, first login, first agent, upgrade, backup and restore."
order: 2
group: Get started
---
The server ships as a container image, **`{{image}}`**, and runs next to a PostgreSQL 17 container. One Compose file runs both, and everything is configured from a `.env` file.

> `OWNER` in the image name stands for the GitHub account that publishes it: see the [project on GitHub]({{repoUrl}}).

## Requirements

- A 64-bit Linux host with Docker and the Compose plugin (v2), and `openssl`.
- A DNS name for the server (for example `patch.example.com`), because agents connect to it.

## 1. Get the files

```sh
mkdir croustypatch && cd croustypatch
curl -fsSLO {{repoUrl}}/raw/main/deploy/docker-compose.yml
curl -fsSLo .env {{repoUrl}}/raw/main/deploy/.env.example
chmod 600 .env
```

(Or clone the repository and use its `deploy/` directory.)

## 2. Set the secrets

Two values are required. Generate them straight into `.env`:

```sh
sed -i "s|^CROUSTYPATCH_DB_PASSWORD=.*|CROUSTYPATCH_DB_PASSWORD=$(openssl rand -hex 24)|" .env
sed -i "s|^CROUSTYPATCH_MASTER_KEY=.*|CROUSTYPATCH_MASTER_KEY=$(openssl rand -base64 32)|" .env
```

Then edit `.env` for the rest:

- `CROUSTYPATCH_VERSION`: pin a release tag such as `1.0.0` (recommended). `latest` follows the newest release.
- `CROUSTYPATCH_TLS_SAN`: the name or address you will use, for example `patch.example.com,10.0.0.5`. Set it **before the first start**, since the certificate is created then.
- `CROUSTYPATCH_BOOTSTRAP_PASSWORD` (optional, 12 characters or more): the first-login password. Empty means a random one is printed once in the log.

> **Back up the master key now**, separately from the database (copy `CROUSTYPATCH_MASTER_KEY` to a password manager). It encrypts the sensitive columns (such as an AI API key) and derives the session key. Lose it and those values cannot be recovered; leak it together with a database dump and the encryption is defeated.

## 3. Start it

```sh
docker compose up -d
docker compose ps                        # both services should become "healthy"
docker compose logs server | head -30    # the first-login password, shown once
```

The server listens on `https://<host>:8443` with a self-signed TLS 1.3 certificate. Migrations run automatically at start. For a certificate your browsers trust, use a reverse proxy (below).

## 4. First login

Open `https://<host>:8443` and sign in as `admin` with the password from the log (or the one you set). You must change it straight away.

Create your own administrator under **Administration**, then turn the fallback account off so the bootstrap one cannot be used:

```sh
docker compose exec server croustypatch-server admin disable --super-admin-fallback
```

The command refuses to run if no other enabled account can manage users, so you cannot lock yourself out. Other commands: `admin enable --super-admin-fallback`, `admin reset-password <user>` (the new password goes in `CROUSTYPATCH_NEW_PASSWORD`) and `migrate`.

## 5. Enrol your first agent

In the web interface choose **Add agent**. The wizard shows a one-line command for Linux with a one-time token that expires. Run it as root on the machine to manage:

```sh
curl -fsSL https://patch.example.com/api/v1/agent/install.sh | sudo env CROUSTYPATCH_ENROLL_TOKEN=cpt_xxxxxxxx sh
```

The agent installs itself as a service and the host appears within seconds. With a self-signed certificate the wizard's command also tells the agent which certificate to trust. See [Add and manage agents](/docs/agents/) for the options.

## Reverse proxy and TLS

For a public name and a trusted certificate, run the server behind a reverse proxy (Caddy, Traefik, nginx and others) that terminates TLS. In `.env`:

```ini
CROUSTYPATCH_TLS_MODE=proxy
CROUSTYPATCH_BIND=127.0.0.1                  # publish the plain-HTTP port to the proxy only
CROUSTYPATCH_PORT=8443
CROUSTYPATCH_TRUSTED_PROXIES=172.18.0.1      # the proxy's address as the container sees it
```

The server honours `X-Forwarded-*` headers **only from the addresses in `CROUSTYPATCH_TRUSTED_PROXIES`**. With the port published by Docker the proxy usually appears as the bridge gateway; check the server log if client addresses look wrong. The proxy must forward to `http://127.0.0.1:8443` and keep WebSocket upgrades working, because agents connect over a WebSocket (`/api/v1/agent/ws`). With nginx:

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

### Your own certificate (direct mode)

Add a `compose.override.yml` next to `docker-compose.yml`:

```yaml
services:
  server:
    environment:
      CROUSTYPATCH_TLS_CERT: /certs/fullchain.pem
      CROUSTYPATCH_TLS_KEY: /certs/privkey.pem
    volumes:
      - ./certs:/certs:ro
```

```sh
docker compose -f docker-compose.yml -f compose.override.yml up -d
```

## Upgrade

1. Read the [release notes]({{releasesUrl}}) and take a backup (below).
2. Set `CROUSTYPATCH_VERSION` in `.env` to the new version.
3. Pull and restart:

```sh
docker compose pull && docker compose up -d
```

Database migrations apply when the server starts. To go back, restore the backup taken before the upgrade and set the previous version again, since newer migrations are not always reversible. See [Releases and updates](/docs/releases/).

## Backup and restore

The data lives in two named volumes: `pgdata` (the database) and `serverdata` (the generated certificate and the agent binaries served to new hosts). Back up the database with `pg_dump`, and the master key separately:

```sh
docker compose exec -T database pg_dump -U croustypatch -d croustypatch | gzip > croustypatch-$(date +%Y%m%d-%H%M).sql.gz
```

Restore into an empty database (a fresh install):

```sh
docker compose up -d database
gunzip -c croustypatch-YYYYMMDD-HHMM.sql.gz | docker compose exec -T database psql -U croustypatch -d croustypatch
docker compose up -d
```

Use the **same master key** as when the backup was taken. Afterwards you can check the audit log's integrity from the UI (**Audit**, verify the chain).

## Everyday commands

- Logs: `docker compose logs -f server`. The health endpoint is `/api/v1/health`.
- Stop: `docker compose down` keeps the data; `docker compose down -v` deletes the volumes, and with them the database.
- The server container runs as an unprivileged user with a read-only root file system and no capabilities.

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
