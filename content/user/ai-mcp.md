---
title: AI and MCP
description: Optional AI risk assessment, and an MCP server so assistants can read the fleet.
order: 14
group: Features
---
## AI-assisted risk

Under *Settings > AI*, point CroustyPatch at any OpenAI-compatible chat API (Ollama, vLLM, LocalAI, OpenAI…): base URL, model and an optional key (stored encrypted). **Test provider** makes a real round trip.

A policy with **AI mode** asks the model for one thing only: the **contextual risk** of a batch. Stability, the decision table, waivers, windows, approvals, soak and rollback all stay deterministic.

Guardrails:

- the answer must be valid JSON with a known level, or it is ignored;
- the model may **raise** the risk freely but **lower it by one level at most**;
- any error, timeout or bad answer falls back to the deterministic engine, and the task says so;
- only host attributes, package names, versions and CVE metadata are sent, never keys or logs.

On any task, **Ask the AI** gives an advisory second opinion that changes nothing and is audited. Small models answer in the right format but reason poorly: use a 7B model or larger for real decisions, and keep an unauthenticated Ollama on a management network.

## MCP server

`POST /api/v1/mcp` speaks the [Model Context Protocol](https://modelcontextprotocol.io) (JSON-RPC 2.0). Authenticate with a **personal API token** (*My account > API tokens*, `Authorization: Bearer cpat_…`). It acts as you, with your role and permissions, and shows in the audit trail. Tokens are stored hashed, shown once, expire in 1 to 365 days and can be revoked.

Tools: `fleet_summary`, `list_hosts`, `get_host`, `list_tasks`, `get_task` (read-only) and `request_patch`, which always creates a task **awaiting human approval**. An assistant never installs anything by itself.

```json
{ "mcpServers": { "croustypatch": { "type": "http", "url": "https://patch.example.org/api/v1/mcp",
  "headers": { "Authorization": "Bearer cpat_…" } } } }
```
