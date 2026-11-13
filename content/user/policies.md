---
title: Policies
description: Decide what is patched, how risky it is, what to do, when, and how to roll back.
order: 9
group: Patching
---
A policy says which hosts it covers (through groups), how risky an update is, what to do about it, and how to watch the result. Edit policies under **Policies**; the stored form is JSON.

## Which policy applies

When several policies match a host they are tried in `priority` order (lowest first, then by name). The first one that is in scope, **has something to do and can act now** decides. A policy that takes nothing from the pending updates does not hold back the ones after it, and neither does an automatic policy that is waiting for its patch day, so two policies with different patch days each patch the host on their own day.

## A policy

```json
{
  "security_only": true,
  "target_scope": "asset_environment == 'production'",
  "rules": [
    { "rule_id": "internet_critical",
      "condition": "cvss_score >= 8.0 AND asset_environment == 'production' AND port_exposed_to_internet == true",
      "contextual_risk": "Critical" }
  ],
  "decisions": [
    { "conditions": { "contextual_risk": "Critical", "stability_risk": "Low" }, "action": "AUTO_DEPLOY" },
    { "conditions": { "contextual_risk_min": "High", "stability_risk_max": "Medium" }, "action": "REQUIRE_APPROVAL" }
  ],
  "default_action": "REQUIRE_APPROVAL",
  "maintenance_window": { "repeat": "monthly_weekday", "nth": 1, "days": [0], "start": "02:00", "end": "05:00", "timezone": "Europe/Paris" },
  "rings": { "delay_minutes": 60 },
  "rollback": {
    "soak_minutes": 30, "auto_rollback": true, "snapshot_required": true,
    "probes": [ { "type": "tcp", "host": "127.0.0.1", "port": 443 },
                { "type": "http", "url": "http://127.0.0.1/health", "expect_status": 200 },
                { "type": "systemd", "unit": "nginx.service" } ]
  }
}
```

## How a decision is made

1. **Candidates**: pending updates (security only when `security_only`), minus anything covered by an approved, unexpired waiver.
2. **Contextual risk** (how dangerous it is to leave the machine unpatched): the first matching rule sets it. With no match it comes from the highest CVSS (9 and up Critical, 7 High, 4 Medium), raised to at least High for a known-exploited CVE and by one level for an internet-exposed host.
3. **Stability risk** (will the patch break the machine?): points for kernel updates, sensitive packages (libc, systemd, openssl, databases, Docker, proxies…), business criticality, production, no staging twin and large batches; fewer with a staging twin. Low, Medium, High or Critical.
4. **Decision**: the first decision whose conditions match; otherwise `default_action`. `contextual_risk_min` and `stability_risk_max` are inclusive bounds.
5. **Task**: `AUTO_DEPLOY` queues a task while the patch day is open; `REQUIRE_APPROVAL` is planned right away so it can be approved ahead of time and runs at the next patch day; `BLOCK` records a blocked task. The same batch is never planned twice, so a rejected, failed or rolled-back batch does not loop. A newer version is a new batch.

Every task keeps its full reasoning, visible in the task's detail.

## Patch days

A patch day says **when** updates may run. In the editor you pick what happens to a new update (wait for approval or apply automatically) and when (as soon as possible, or only on a patch day). Presets: every Saturday, the first Monday of the month, the 15th of each month.

| Field | Meaning |
|---|---|
| `repeat` | `weekly` (default), `monthly_weekday` ("the first Monday") or `monthly_day` ("the 15th") |
| `days` | Weekdays, 0 = Monday to 6 = Sunday |
| `nth` | For monthly_weekday: 1 to 4, or 5 for the **last** one |
| `day_of_month` | For monthly_day: 1 to 28 |
| `start`, `end` | Local times; an `end` before `start` runs overnight |
| `timezone` | IANA zone such as `Europe/Paris`, daylight saving included |

A task planned for a patch day has a **deadline**, the end of the window. A host that was offline all day does not start it late: the task ends as *expired*, the audit log records `task.missed_window`, and the planner plans it again for the next patch day. An approved update waiting for next month's patch day is not dropped. The reboot after a patch also waits for the next patch-day slot.

## Rings

`rings.delay_minutes` staggers hosts: ring N starts N times that delay after ring 0. There is no automatic halt when an earlier ring fails, so watch the tasks.

## Rule language

Boolean expressions with `== != < <= > >=`, `in`, `AND` / `OR` / `NOT` (or `&& || !`) and parentheses. Strings are quoted and compared ignoring case. An unknown variable never matches and never raises an error; syntax errors are reported with their position when you save.

Variables: `cvss_score`, `exploited`, `security_count`, `package_count`, `includes_kernel`, `asset_environment`, `asset_type`, `criticality`, `os_family`, `distro`, `hostname`, `port_exposed_to_internet`, `has_staging`, `ring`, `tags` (as in `'pci' in tags`), `has_docker_module`, `has_helper_script_module`.

## Containers

`"docker": "include" | "exclude" | "only"` says what the policy does with container image updates. See [Docker](/docs/docker/).

## Rollback

Before applying, the agent creates a restore point and refuses to continue if `snapshot_required` is set and a package cannot be restored. Hosts with high criticality and no staging twin always require one. After applying, the agent watches the probes for `soak_minutes`. **Two consecutive failures of the same probe** trigger an automatic rollback. A probe that was already failing before the patch is ignored. See [Tasks and rollback](/docs/tasks/) for what happens if the rollback itself fails.
