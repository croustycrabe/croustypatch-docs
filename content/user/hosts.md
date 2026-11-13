---
title: Hosts
description: The fleet list, a host's tabs, resources, modules, scans and bulk actions.
order: 5
group: Using the app
---
## The list

Hosts are searchable, filterable by status and group, and sortable. Select several to **patch** or **scan** them in bulk. Status colours: green for online or up to date, blue for eco or running, amber for needing a patch, awaiting approval or maintenance, red for alert, quarantined or failed, grey for offline.

## A host's page

- **Overview**: what the machine is made of and how busy it is.
- **Packages**: its inventory and pending updates. Long lists are paged (25 or 50 rows, remembered by your browser).
- **History**: its tasks.
- **Settings**: group, environment, modules, network isolation behaviour and more.
- **Automatic patches**: which policy applies, what each policy considered would take, and the next patch days. A host in no group is patched by no policy, and the page says so.

### Hardware and resources

Each inventory records the processor, cores, memory, swap, manufacturer and model, BIOS and whether the machine is virtual (`lxc`, `kvm/qemu`, `vmware`…). No serial number or identifier is collected.

Every heartbeat carries **resources**: CPU use, memory and swap, load, uptime and every real filesystem. The card shows meters (green below 75 %, amber to 90 %, red above) and 24-hour charts. The server keeps one point every five minutes for two weeks. Resources are reported on Linux only for now.

## Modules per host

Optional features are **detected by the agent** and **switched on or off per host**: Docker, the app center, eco mode, helper scripts and notifications. A module that is off for a host has its data dropped, its actions refused and nothing planned for it. Switch them under **Host > Settings > Modules**, in the Add agent wizard (applied to every host enrolled with that token), or set server-wide defaults under **Settings > Modules**. Every change is audited.

## Actions

- **Scan**: refresh the inventory now.
- **Update**: start a manual patch. With Docker on, choose *System*, *Docker* or *System and Docker*. This is an explicit human decision: it bypasses the maintenance window and the approval step (and is audited), but it never targets a quarantined host.
- **Force a reboot**: see [Reboot](/docs/reboot/).
- **Update agent**: when the agent is older than the server.
- **Restore the network**: lifts a quarantine. See [Tasks and rollback](/docs/tasks/).

## Eco mode

On laptops running on battery the agent can lengthen its heartbeats and let its tunnel sleep with the machine, then reconnect when it wakes. Eco mode is switched per host and the server sends the setting to the agent. See [Communication](/technical/communication/).
