# Streamable HTTP: Minimum-Viable Upgrade Spec

> For John — server-side changes to `mcp.flowstudio.app/mcp`
> Written 2026-04-03, revised 2026-04-03

## TL;DR

The MCP ecosystem is standardizing on Streamable HTTP for remote MCP servers.

Flow Studio already has most of the core behavior in place:
- One HTTP endpoint
- JSON-RPC over POST
- JSON responses
- API key auth

A small set of server-side changes should remove the main transport blockers
and make the endpoint much closer to Streamable HTTP compliance.

This does **not** by itself guarantee listing in every marketplace. It does
improve readiness for:
1. Official MCP Registry submission
2. Docker MCP Registry submission
3. OpenAI Apps submission
4. Better compatibility with clients that expect Streamable HTTP

Separate review or submission steps are still required for each channel.

---

## What Streamable HTTP means here

For this server, Streamable HTTP does **not** require SSE.

The important requirements are:
- One MCP endpoint that supports both POST and GET
- POST accepts JSON-RPC
- POST includes support for `Accept: application/json, text/event-stream`
- Notification-only POSTs return `202 Accepted`
- GET returns either `text/event-stream` or `405 Method Not Allowed`
- `Origin` is validated
- Protocol version is negotiated correctly during `initialize`

A JSON-only POST response is still valid for normal request/response flows.

Spec: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http

---

## Current server behavior

Current observed behavior:

```
POST /mcp    → 200, application/json, JSON-RPC response      ✅ good
GET  /mcp    → 200, welcome page                             ❌ should be 405 or SSE
DELETE /mcp  → 404                                           ⚠️ better as 405 for unsupported session termination
initialize   → returns older protocolVersion                 ⚠️ should negotiate the intended supported version
CORS headers → already partly prepared                       ✅ useful, but not enough by itself
```

---

## The minimum changes

### 1. Negotiate the intended protocol version during initialize

The server should return the protocol version requested by the client **if
it supports that version**. If not, it should return another version it
supports.

The lifecycle spec says the client sends a supported version, and if the
server supports it, the server must respond with that same version. This
is negotiation, not a universal hardcode.

If Flow Studio is targeting `2025-03-26`, then it should return
`2025-03-26` when the client requests it and the server supports it.

**Example flow:**

```
Client sends:   {"params": {"protocolVersion": "2025-03-26", ...}}
Server returns: {"result": {"protocolVersion": "2025-03-26", ...}}
```

If the client requests a version the server does not support, the server
should return the version it does support, and the client decides whether
to continue.

---

### 2. Return 202 for notification-only POSTs

For JSON-RPC notifications such as `notifications/initialized`, return:

```
HTTP/1.1 202 Accepted
```

with an empty body.

**How to detect:** If the POST body is a JSON-RPC message (or array of
messages) where no item has both an `id` field and a `method` field
(i.e., everything is a notification or a response), return 202.

**Note:** The server already returns 202 for notifications (verified
2026-04-03). No change needed if this is intentional.

---

### 3. Return 405 on GET if no SSE stream is offered

Change:

```
GET /mcp → 200 welcome page
```

to:

```
HTTP/1.1 405 Method Not Allowed
Allow: POST
```

This is the simplest compliant behavior when the server does not open
an SSE stream.

> If you want to keep the welcome page for browsers, you could check
> the `Accept` header — if it contains `text/event-stream`, return 405;
> otherwise return the welcome page. But returning 405 unconditionally
> is simpler and fully compliant.

---

### 4. Validate Origin

The spec requires Origin validation to prevent DNS rebinding.

**Do not** reflect every origin blindly. Use a real validation rule:

- A fixed allowlist of trusted origins
- A controlled wildcard rule you actually own
- Another explicit check that rejects untrusted origins

No `Origin` header (server-to-server callers) can still be allowed through.

**Example allowlist:**
```
https://mcp.flowstudio.app
https://flowstudio.app
vscode-webview://*
https://github.com
https://claude.ai
https://chatgpt.com
```

Add origins as needed for known MCP clients. Reject anything not on the
list with `403 Forbidden`.

---

### 5. Optionally return Mcp-Session-Id

This is optional.

- If the server is stateless, skip it.
- If the server wants session affinity later, add `Mcp-Session-Id` on
  the `initialize` response and require it on subsequent requests.

---

## What does NOT change

- Core JSON-RPC request handling
- Tool implementations
- `x-api-key` auth model
- Single `/mcp` endpoint
- Response format for normal POST requests

No SSE implementation is required for the minimum upgrade path.

---

## How to verify

After deployment, verify these:

```bash
TOKEN="<your-test-token>"

# 1. initialize succeeds and returns the negotiated protocol version
curl -s -X POST https://mcp.flowstudio.app/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' \
  | python -c "import sys,json; r=json.load(sys.stdin); v=r['result']['protocolVersion']; print(f'Protocol version: {v}')"

# 2. notifications/initialized returns 202
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://mcp.flowstudio.app/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}')
echo "Notification: HTTP $STATUS (expect 202)"

# 3. GET /mcp returns 405
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET https://mcp.flowstudio.app/mcp \
  -H "x-api-key: $TOKEN")
echo "GET: HTTP $STATUS (expect 405)"

# 4. tools/list still works over POST
curl -s -X POST https://mcp.flowstudio.app/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}' \
  | python -c "import sys,json; r=json.load(sys.stdin); print(f'Tools: {len(r[\"result\"][\"tools\"])}')"

# 5. Origin validation rejects untrusted browser origins
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://mcp.flowstudio.app/mcp \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.example.com" \
  -H "x-api-key: $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":3}')
echo "Untrusted origin: HTTP $STATUS (expect 403)"
```

---

## Expected impact

After this change, Flow Studio should be in a much better position for:
- Official MCP Registry publication
- Docker MCP Registry submission
- Compatibility with clients that expect Streamable HTTP

Separate review or submission steps are still required for:
- OpenAI Apps (requires public domain, CSP, screenshots, tool metadata, prompts, review)
- Marketplace visibility in specific clients
- Any downstream registry or gallery that applies its own intake rules

---

## Summary

| Change | Risk | Notes |
|--------|------|-------|
| Correct GET behavior | Low | Required for Streamable HTTP compatibility |
| Return 202 for notifications | Low | Required for notification-only POSTs (already working) |
| Version negotiation cleanup | Low | Should follow initialize semantics |
| Real Origin validation | Low to Medium | Security-sensitive, but straightforward |
| Optional session ID support | Low | Skip if stateless |
