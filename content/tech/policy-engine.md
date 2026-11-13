---
title: Policy engine
description: The rule language, the two risk dimensions and how the planner turns them into tasks.
order: 4
group: Engine
---
The engine is **deterministic and explainable**: the same inputs give the same decision, and every task stores the reasoning that produced it. For the user view see [Policies](/docs/policies/).

## Two independent risks

| Risk | Question | Derived from |
|---|---|---|
| **Contextual** | How dangerous is it to leave this machine unpatched? | Matching rule, else highest CVSS, known exploitation, internet exposure |
| **Stability** | How likely is the patch to break the machine? | Kernel updates, sensitive packages (libc, systemd, openssl, databases, Docker, proxies), criticality, production, missing staging twin, batch size |

A decision table maps `(contextual, stability)` to `AUTO_DEPLOY`, `REQUIRE_APPROVAL` or `BLOCK`. Entries can match exactly or by inclusive bounds (`contextual_risk_min`, `stability_risk_max`), first match wins, otherwise `default_action`.

## The rule language

A small expression language: comparison operators, `in`, boolean operators and parentheses over named host and update variables. Design choices:

- An unknown variable **never matches** and never raises an error, so a policy written for a newer attribute does not break older data.
- String comparison ignores case.
- Syntax errors carry their position and are reported when a policy is saved.

## The planner

The planner runs per host and per policy, in priority order, and stops at the first policy that is in scope, has something to do and can act now. It:

1. gathers candidates (pending updates minus those covered by an approved waiver);
2. evaluates both risks and the decision;
3. creates a task **only when it is useful**: an automatic decision only while the patch day is open (so nothing goes stale), a decision needing approval right away, a block as a recorded, blocked task;
4. never plans the same batch (same packages and versions) twice, so a rejected, blocked, failed or rolled-back batch cannot loop.

System updates and container images are planned as **separate tasks**, each waiting only for its own open task.

## Time

Patch days support weekly, nth-weekday and day-of-month repeats in an IANA time zone. A local time skipped by daylight saving opens right after the gap; a repeated one opens at its first occurrence. Tasks carry the end of the window as a **deadline**, so a host that was offline does not start a patch late. Staleness is counted from the due date, so approved work waiting for next month is kept.

## Waivers

A waiver is a time-boxed exception (90 days at most) requiring two approvals from different people holding different permissions. The planner honours it while it is approved and unexpired.

## Where AI fits

In AI mode the model returns only a contextual risk as strict JSON. It may raise the rating, lower it by at most one level, and any failure falls back to the deterministic result, with the rationale saying so. See [AI and MCP](/docs/ai-mcp/).
