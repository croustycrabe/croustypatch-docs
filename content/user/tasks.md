---
title: Tasks, approvals and waivers
description: The life of a task, approving patches, rolling back, quarantine and deferring with waivers.
order: 10
group: Patching
---
## Tasks

Everything the agent does is a **task**: a scan, a patch, a container update, a rollback, an app installation, a reboot. The **Tasks** page lists them with their status; open one to see its detail, including the full risk reasoning and each status change.

A task moves through statuses such as awaiting approval, queued, running, soaking, succeeded, failed, rolled back, expired or quarantined. A queued task is judged stale 7 days after it was **due**, and an agent task that is silent for 90 minutes is marked failed.

## Approving

When a policy says `REQUIRE_APPROVAL`, the task waits. Read its reasoning, then approve or reject it. An approved task runs at the next patch day. A rejected batch is not planned again until a newer version appears. Approving needs the right permission, and a notification rule can tell the right people that one is waiting.

## Manual patches and rollback

You can start a patch or a rollback by hand from a host, a package or the Hosts bulk bar. A manual patch is audited and bypasses the maintenance window and approvals, but never targets a quarantined host. A manual rollback restores the restore point of a previous task.

## The double-failure protocol

If the soak fails twice, the agent rolls back. If the **rollback itself fails**, or services stay unhealthy afterwards, the agent:

1. **isolates the host** from the network (only the server's addresses, plus inbound SSH by default, stay reachable);
2. **freezes evidence**: logs, package state and the restore point, with a SHA-256 manifest;
3. reports `quarantined`.

The host shows as quarantined and a critical notification is sent. Once you have repaired it, use **Restore the network**. SSH access during quarantine is controlled in *Settings > Network isolation* (on by default, port 22, any source; limit it to your admin networks or turn it off). An isolated host keeps the server's last-known addresses so it reconnects after a restart.

## Waivers

A waiver defers patching for a package or a CVE on a host or group. It requires:

- a justification and compensating controls;
- an expiry within 90 days;
- two approvals by **different people**, one holding `waivers:approve_ciso` and one `waivers:approve_business`. The requester cannot approve their own.

The planner honours approved, unexpired waivers, and revoking one makes it act again.
