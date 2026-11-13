---
title: Groups
description: Organise hosts into groups, which are also how policies find their hosts.
order: 8
group: Using the app
---
A **group** collects hosts. Groups matter because **a policy applies to hosts through their groups**: a policy with no group applies to no host, and a host in no group is patched by no policy. The dashboard warns about machines with no policy.

Each group has a colour from a nine-colour palette (`brick`, `sand`, `moss`, `teal`, `sky`, `plum`, `rose`, `slate`, `ink`), an *automatic* colour derived from its name, or any custom `#rrggbb`. Pick it when creating or editing the group, or from the palette button in the Groups table. The coloured tag appears wherever the group is shown.

Notification rules and reports can also be limited to some groups.
