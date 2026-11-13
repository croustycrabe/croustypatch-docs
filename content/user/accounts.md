---
title: Accounts, roles and settings
description: Users, RBAC, API tokens and where the server-wide settings live.
order: 15
group: Administration
---
## Accounts and roles

Permissions are `module:action` strings with wildcards (for example `hosts:write`, `tasks:create`, `settings:read`). A role is a set of them, and the interface only shows what your role allows. **You can only create roles or assign roles whose permissions you hold yourself**, so nobody can escalate.

Passwords use Argon2id; five failed sign-ins lock the account for 15 minutes; a password change is forced at first login. Set your e-mail address in *My account* to receive test messages and reports.

## API tokens

*My account > API tokens* creates personal tokens (`cpat_…`) for the API and for [MCP](/docs/ai-mcp/).

## Settings

*Settings* holds the server-wide choices: default modules for new tokens, agent heartbeat defaults, network isolation, the AI provider and more. Each change is audited.
