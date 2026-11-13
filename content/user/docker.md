---
title: Docker containers
description: See container image updates across hosts, update them safely, and move to a newer tag.
order: 7
group: Using the app
---
CroustyPatch only ever **updates images**. It never starts, stops or removes a container on its own.

## What is detected

The module is detected when `/var/run/docker.sock` and the `docker` CLI exist. Every running container is reported with its image and digest, and the agent asks the image's registry (Docker Hub, GHCR, Quay and most self-hosted registries, anonymously) which digest the tag points to now. A different digest is an available update. Images pinned by digest are never updated.

## The Docker page

The **Docker** page lists every container of every host with the module on, and each host has a **Docker** tab. A row shows the container, image, state and health, its compose project and service, and whether a newer image exists. Search by container name or image, and use *Updates only* to filter.

## Updating

Container updates go through the normal pipeline: policy, risk, approval, maintenance window and health probes. They apply to **Docker Compose services only**:

1. A restore point records the image each container runs now.
2. `docker compose pull <service>` then `up -d --no-deps <service>`: volumes, variables, networks and ports stay as written in the compose file.
3. The agent waits for the container to run (and be healthy if it has a health check), then runs the policy's probes.
4. On failure it re-tags the previous image and brings the service back up.

Containers started by hand are reported but never recreated, since the agent cannot know which of their settings are intentional. Stacks deployed by a manager running in a container (Arcane, Dockge, Komodo…) are supported: the agent maps the compose paths through the mounts.

System and container updates are **two separate tasks**: a container that fails to restart never rolls a system update back. A policy chooses whether it takes containers (`include`, the default), leaves them to another policy (`exclude`) or is a dedicated Docker policy (`only`).

## Newer versions (suggested updates)

For a container whose tag is a version, the agent also looks for a higher tag **of the same shape**: `v3.3.1` is only compared with `v#.#.#` tags, `17-alpine` with `#-alpine`. Release candidates, other flavours, build tags and moving tags (`latest`) are never offered. A new first number is flagged **major**. Results are cached for 6 hours per image.

A suggestion shows as *v3.3.1 → v3.4.1* with a **Move to v3.4.1** button. The agent edits the tag in the service's compose file and recreates it; if that fails, the file **and** the previous image are put back.

The edit is deliberately narrow. The service needs a literal `image:` line that says exactly what runs now. A variable (`${VERSION}`), an alias, a merge key, `extends` or a build-only service is refused with the reason, and you change the tag by hand (the page shows what to write). A **major** version needs an explicit confirmation, and a **database**'s major version (Postgres, MariaDB, MySQL, MongoDB…) is never applied this way because the new image cannot open the old data directory: use a dump and restore.

## Proxmox helper scripts

Applications installed by the community Proxmox helper scripts are reported with their version, but their update command is interactive, so CroustyPatch lists them and does not run it.
