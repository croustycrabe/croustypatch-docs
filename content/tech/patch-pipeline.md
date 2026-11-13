---
title: Patch pipeline and recovery
description: Restore points, soak, automatic rollback, quarantine and evidence on the agent.
order: 5
group: Engine
---
Every patch on the agent follows the same pipeline, whatever the package manager.

## Stages

1. **Verify**: check the signed command (agent, validity window, nonce, never-run-twice) and that the agent is not sandboxed. A sandboxed agent refuses and changes nothing, because package scripts fail half-way under restrictions.
2. **Restore point**: pin the current versions and keep what is needed to go back. The method depends on the platform (see below). If the policy requires a restore point and one package cannot be restored, the run stops before touching anything.
3. **Apply**: run the package manager with fixed arguments.
4. **Soak**: watch the policy's probes for `soak_minutes`. Probes that were already failing before the patch are ignored; if none are left, the soak is skipped and the log says so.
5. **Decide**: two consecutive failures of the same probe trigger an **automatic rollback**, after which the probes must pass again.
6. **Report**: each step is sent to the server and recorded.

## Restore points

| Platform | Mechanism |
|---|---|
| apt | Version pins; refuses if the previous version cannot be fetched |
| pacman | Pins plus the package files in the pacman cache. Always a full `-Syu`, since Arch forbids partial upgrades |
| FreeBSD pkg | `pkg create` archives, plus a ZFS boot environment when available |
| Docker | The image ID each container runs now |

`croustypatch-agent doctor` rehearses this stage and reports what could not be restored.

## The double-failure protocol

If the rollback fails, or services stay unhealthy after it:

1. **Isolate**: a firewall table (`nft` on Linux, `pf` on FreeBSD) keeps only the server's addresses reachable, plus inbound SSH by default. DNS is cut. If the platform cannot guarantee isolation, it is refused rather than silently ineffective.
2. **Freeze evidence**: logs, package state and the restore point, with a SHA-256 manifest.
3. **Report `quarantined`**. The host is excluded from automatic and manual patches until an operator uses *Restore the network*.

## Only what changed is rolled back

A failure before anything was changed, such as a pull that fails or a registry that is down, ends as *failed, nothing was changed*, never as a double failure. A rollback whose command reports an error, while every container runs its previous image again, counts as rolled back: the state of the machine decides, not an exit code.

## Reboots

The agent detects when a restart is needed (`/var/run/reboot-required` on apt, a missing running-kernel module directory on pacman, `freebsd-version -k` against `uname -r` on FreeBSD). The server then marks the host in *planned downtime* for the warning delay plus 15 minutes so supervision stays quiet, and fails the task and alerts if the host does not return.

## Docker specifics

Container updates use the same pipeline with `docker compose pull` and `up -d --no-deps`, wait for running and healthy, run the probes and on failure re-tag the previous image. Applying a new tag also edits the compose file under strict rules and restores it byte for byte on rollback, only if the file still contains what the update wrote.
