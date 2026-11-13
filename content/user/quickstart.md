---
title: Getting started
description: From nothing to a patched machine in about ten minutes.
order: 1
group: Get started
---
This page takes you from an empty server to a first host patched under a policy. Each step links to the full page on the feature.

## 1. What you need

- A 64-bit Linux host or container for the **server**, and PostgreSQL 14 or newer (the Docker setup below brings its own).
- At least one machine to manage: Linux with **apt** or **pacman**, or FreeBSD with **pkg**. You need root on it.

## 2. Start the server

```sh
cd docker
printf 'CROUSTYPATCH_DB_PASSWORD=%s\nCROUSTYPATCH_MASTER_KEY=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -base64 32)" > .env
chmod 600 .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs server | head -30   # shows the bootstrap password once
```

> **Back up the master key**, separately from the database. It encrypts the sensitive columns (such as an AI API key). Lose it and those values cannot be recovered.

Details, TLS modes and the reverse-proxy setup are in [Install the server](/docs/install/).

## 3. Sign in

Open the server's address. Sign in as `admin` with the password printed in the log. You are asked to change it right away.

Create your own administrator account under **Accounts**, then disable the fallback account so nobody can use the bootstrap one:

```sh
docker compose exec server croustypatch-server admin disable --super-admin-fallback
```

The command refuses to run if no other enabled account can manage users, so you cannot lock yourself out.

## 4. Add your first host

1. Click **Add agent** (sidebar, Hosts page, or <kbd>Ctrl</kbd>+<kbd>K</kbd>).
2. Choose the communication mode, a group and an environment.
3. Click **Generate the command** and run the one-liner it shows as root on the machine.
4. The wizard waits for the agent and confirms as soon as the host appears.

```sh
curl -fsSL https://patch.example.com/api/v1/agent/install.sh | sudo env CROUSTYPATCH_ENROLL_TOKEN=cpt_xxxxxxxx sh
```

The installer checks the agent's SHA-256, installs a service and enrols the host with a one-time token. See [Add agents](/docs/agents/).

## 5. Look at what it found

The host shows up with its pending updates. Open it to see its tabs: **Overview**, **Packages**, **History** and **Settings**. The [Dashboard](/docs/dashboard/) summarises the whole fleet.

## 6. Write a policy

A policy covers **groups**, so put the host in a group first. Then open **Policies** and create one. A good first policy:

- *Which updates*: security updates only.
- *What happens to a new update*: wait for approval.
- *When*: on a patch day, for example the first Monday of the month, 02:00 to 05:00.
- *Rollback*: restore point required, a soak of 30 minutes and a probe on the service that matters (for example a TCP check on port 443).

See [Policies](/docs/policies/) for every option.

## 7. Patch

Because the policy asks for approval, a task appears under **Tasks** as *awaiting approval*. Review the reasoning stored on it, approve it, and it runs at the next patch day. To run now, start a manual update from the host page (this is an explicit human decision and is audited).

The agent creates a restore point, applies the updates, watches the probes during the soak and rolls back by itself if they fail twice in a row. Read [Tasks and approvals](/docs/tasks/) for the life of a task.

## 8. Get told

Set up a channel and a rule under **Notifications** so a failed patch or an offline host reaches you. See [Notifications and reports](/docs/notifications/).
