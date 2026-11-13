---
title: Reboot
description: Forced and automatic reboots without false alarms.
order: 13
group: Features
---
- **Force a reboot** from a host's menu, or from the *reboot needed* banner. Servers restart at once; workstations and laptops get 10 minutes of warning by default, announced through the system's `shutdown` broadcast with your optional message.
- **After a patch** that needs a restart, the policy's *Reboot* section decides: do nothing, reboot automatically in the maintenance window, or warn users 30 minutes ahead and then reboot.

While a host restarts it is in **planned downtime** (status *maintenance*) for the warning delay plus 15 minutes, so your supervision does not raise false alarms. When the agent reports from the new boot, the task succeeds and the host goes back online. If it stays silent past the window, the reboot task fails, the host turns *alert* and the critical event *host did not come back after reboot* is sent.
