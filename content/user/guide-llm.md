---
title: Connect a language model (Ollama and others)
description: "Step by step: run a model on your own hardware, point CroustyPatch at it, and use it for risk assessment and Docker migration drafts."
order: 17
group: Guides
---
CroustyPatch talks to any **OpenAI-compatible chat API**. Ollama is the easiest way to run one on your own hardware, so nothing leaves your network. The same provider serves every AI feature: the contextual **risk assessment** of a patch batch, **Ask the AI** on a task, and the **AI draft** in the Docker migration console.

## 1. Run a model with Ollama

On the machine that will host the model (a GPU helps a lot, but a recent CPU works for small models):

```sh
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:7b
```

Pick a model of **7B parameters or more** for real decisions. A 3B model answers in the right format but its reasoning is weak: in testing it contradicted its own input. Use what your hardware can run well.

### Make the answers steadier (optional)

A small `Modelfile` fixes the temperature at 0 so that the same question gives the same answer, and limits the threads when the machine is shared:

```text
FROM qwen2.5:7b
PARAMETER temperature 0
PARAMETER num_thread 4
```

```sh
ollama create croustypatch-risk -f Modelfile
```

The model is now called `croustypatch-risk`. Use whatever name you gave it in step 3.

## 2. Let the CroustyPatch server reach it

By default Ollama only listens on the machine itself. To accept connections from the CroustyPatch server, set `OLLAMA_HOST`:

```sh
sudo systemctl edit ollama
```

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

```sh
sudo systemctl restart ollama
```

Check it from the machine that runs the CroustyPatch server (replace the address):

```sh
curl http://10.0.0.40:11434/v1/models
```

```sh
curl http://10.0.0.40:11434/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"croustypatch-risk","messages":[{"role":"user","content":"Reply with OK"}]}'
```

If the second command prints a JSON answer, the model is reachable.

> **Security.** Ollama has no authentication. Keep it on a management network that only the CroustyPatch server can reach, or put a reverse proxy with an API key in front of it. If you run the server in Docker, the address must be reachable **from inside the container**: use the host's LAN address, not `localhost`.

## 3. Configure CroustyPatch

Open **Settings > AI** (permission `settings:write`).

| Field | Value |
|---|---|
| Allow AI analysis | on |
| Provider URL | `http://10.0.0.40:11434/v1` (Ollama's address, with `/v1`) |
| Model | `croustypatch-risk` (or `qwen2.5:7b`) |
| API key | empty for Ollama; a key for a hosted API |

Save, then press **Test provider**. It makes a real round trip to the model and shows the error if it fails. A timeout usually means the network or firewall, a 404 usually means a wrong model name or a missing `/v1`.

Other providers work the same way: vLLM and LocalAI expose a `/v1` URL, and a hosted API needs its URL, a model name and a key (stored encrypted, never shown again).

## 4. Use it

- **Risk assessment.** Edit a policy and set `ai_mode_enabled` to `true` (see [Policies](/docs/policies/)). The model is asked one thing only, the contextual risk of a batch. It may raise the risk freely but lower it by one level at most, and any error falls back to the deterministic engine.
- **Ask the AI.** On any task, the button gives an advisory second opinion that changes nothing and is audited.
- **Docker migration draft.** In the migration console of a container, **Do with AI** writes the steps of a migration. A person reads and edits every command before anything runs as root. See [Docker](/docs/docker/).

## What is sent

Host attributes (type, environment, criticality, exposure, tags), package names and versions, and CVE metadata. For a migration draft: container, service and project names, image tags and compose file paths. Never passwords, keys, environment values, logs or file contents. A migration draft request is recorded in the audit log, with what was sent.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Test provider times out | The server cannot reach the address: firewall, wrong host, Ollama still on `127.0.0.1` |
| 404 from the provider | Missing `/v1` in the URL, or a model name that Ollama does not have (`ollama list`) |
| Answers ignored, engine falls back | The model did not return valid JSON: use a larger model and temperature 0 |
| Very slow answers | Too few threads or no GPU: try a smaller model, or limit it to the policies that need it |
