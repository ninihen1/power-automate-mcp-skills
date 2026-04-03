# Streamable HTTP: Minimum-Viable Upgrade Spec

> For John — server-side changes to `mcp.flowstudio.app/mcp`
> Written 2026-04-03

## TL;DR

The MCP ecosystem has standardised on a transport called "Streamable HTTP".
Flow Studio's server already does 95% of what the spec requires — plain
JSON-RPC POST in, JSON out. Five small changes make it fully compliant.
**No SSE, no streaming, no WebSockets, no new dependencies.**

This single change unblocks listing on:
1. Official MCP Registry (registry.modelcontextprotocol.io)
2. VS Code `@mcp` gallery (powered by the registry)
3. OpenAI Apps Directory (ChatGPT apps + Codex plugins)
4. copilot-mcp VS Code extension (registry tab)
5. Docker MCP Registry

---

## What "Streamable HTTP" actually means

The spec (MCP 2025-03-26) defines a transport where:
- Client sends JSON-RPC via **HTTP POST** → server responds with JSON
- Server **may** respond with SSE stream instead of JSON — but this is optional
- Server **may** support GET for server-initiated push — but can return 405
- Server **may** support DELETE for session termination — but can return 405

The key word is **may**. A server that only does POST→JSON is valid.

Spec: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http

---

## Current server behaviour (audited 2026-04-03)

```
POST /mcp  → 200, Content-Type: application/json, JSON-RPC response    ✅ already correct
GET  /mcp  → 200, text/plain welcome page                               ❌ must be 405
DELETE /mcp → 404                                                        ⚠️ should be 405
protocolVersion → "2024-11-05"                                           ❌ must be "2025-03-26"
CORS headers → already include mcp-session-id, GET/POST/DELETE/OPTIONS   ✅ already set up
```

---

## The 5 changes

### 1. Return protocolVersion "2025-03-26" in InitializeResult

**Where:** The handler for `method: "initialize"`

**Before:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": { ... },
    "serverInfo": { ... }
  }
}
```

**After:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-03-26",
    "capabilities": { ... },
    "serverInfo": { ... }
  }
}
```

**That's it.** One string change.

---

### 2. Return 202 for notification-only POSTs

JSON-RPC messages without an `id` field are "notifications" — the client
doesn't expect a response. The spec says return `202 Accepted` with an
empty body.

**How to detect:** If the POST body is a JSON-RPC message (or array of
messages) where every item either has no `id` field or has a `result`/`error`
field (i.e., it's a response), return 202.

**Pseudocode:**
```
if request.method == "POST":
    body = parse_json(request.body)
    messages = body if is_array(body) else [body]

    has_requests = any(msg has "id" and msg has "method" for msg in messages)

    if not has_requests:
        return Response(status=202, body="")

    # Otherwise, handle normally (existing code path)
```

**In practice:** The only notification clients typically send is
`notifications/initialized` (sent after the initialize handshake). If Flow
Studio currently ignores this or returns 200 with an empty body, the change
is just switching the status code to 202.

---

### 3. Return 405 on GET

**Before:** GET /mcp returns a 200 welcome page.

**After:** GET /mcp returns:
```
HTTP/1.1 405 Method Not Allowed
Allow: POST
```

**Pseudocode:**
```
if request.method == "GET":
    return Response(status=405, headers={"Allow": "POST"})
```

This tells MCP clients "I don't support server-initiated SSE push, but I'm
a valid streamable-http server." The spec explicitly allows this.

> Note: If you want to keep the welcome page for browsers, you could check
> the Accept header — if it contains `text/event-stream`, return 405;
> otherwise return the welcome page. But returning 405 unconditionally is
> simpler and fully compliant.

---

### 4. Validate Origin header

The spec requires this for DNS rebinding protection. Since the server is
public on the internet (not localhost), this is straightforward.

**Pseudocode:**
```
ALLOWED_ORIGINS = [
    "https://mcp.flowstudio.app",
    "https://flowstudio.app",
    "vscode-webview://*",         # VS Code
    "https://github.com",         # GitHub Copilot
    "https://claude.ai",          # Claude
    "https://chatgpt.com",        # ChatGPT
    # Add more as needed, or use a permissive policy for public servers
]

origin = request.headers.get("Origin")
if origin is not None and origin not in ALLOWED_ORIGINS:
    return Response(status=403, body="Forbidden: origin not allowed")

# If no Origin header is present (e.g., server-to-server calls), allow through
```

**For a public MCP server**, a pragmatic approach is to allow all origins
but log the Origin header for monitoring. The spec says MUST validate, but
for a server that requires an API key anyway, the API key is the real
access control. A permissive Origin policy is reasonable:

```
origin = request.headers.get("Origin")
if origin is not None:
    # Set CORS response header to reflect the request origin
    response.headers["Access-Control-Allow-Origin"] = origin
# If no Origin header, skip (non-browser client)
```

---

### 5. (Optional) Return Mcp-Session-Id on InitializeResult

This is optional per spec (server MAY assign a session ID). Adding it
enables clients to maintain session affinity, which is useful if the server
ever needs to track per-session state.

**Pseudocode:**
```
if method == "initialize":
    session_id = generate_uuid()   # or any unique ASCII string
    response.headers["Mcp-Session-Id"] = session_id
    # Store session_id → session state mapping if needed
```

If the server is stateless (each request is independent), skip this.
Clients will work fine without it.

---

## What does NOT change

- **POST handling**: Exact same JSON-RPC in, JSON-RPC out. No streaming.
- **Tool definitions**: No changes to tools/list or any tool handler.
- **Auth**: x-api-key header stays exactly the same.
- **Response format**: Always `Content-Type: application/json`. Never SSE.
- **No new endpoints**: Same single `/mcp` endpoint.
- **No new dependencies**: Pure HTTP status code and header changes.

---

## How to verify

After deploying, run these tests:

```bash
# 1. Initialize — check protocolVersion
curl -s -X POST https://mcp.flowstudio.app/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1,"params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' \
  | python -c "import sys,json; r=json.load(sys.stdin); assert r['result']['protocolVersion']=='2025-03-26', f'got {r}'; print('PASS: protocolVersion')"

# 2. Notification — check 202
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://mcp.flowstudio.app/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}')
[ "$STATUS" = "202" ] && echo "PASS: notification 202" || echo "FAIL: got $STATUS"

# 3. GET — check 405
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET https://mcp.flowstudio.app/mcp \
  -H "x-api-key: $TOKEN")
[ "$STATUS" = "405" ] && echo "PASS: GET 405" || echo "FAIL: got $STATUS"

# 4. DELETE — check 405
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE https://mcp.flowstudio.app/mcp \
  -H "x-api-key: $TOKEN")
[ "$STATUS" = "405" ] && echo "PASS: DELETE 405" || echo "FAIL: got $STATUS"

# 5. tools/list — unchanged
curl -s -X POST https://mcp.flowstudio.app/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: $TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":2}' \
  | python -c "import sys,json; r=json.load(sys.stdin); print(f'PASS: {len(r[\"result\"][\"tools\"])} tools')"
```

---

## After deployment — what Catherine will do

1. Publish to Official MCP Registry via `mcp-publisher` CLI
2. Flow Studio automatically appears in VS Code `@mcp` gallery
3. Submit to OpenAI Apps Directory
4. Submit to Docker MCP Registry via PR
5. copilot-mcp extension registry tab picks it up automatically

---

## Summary

| # | Change | Lines of code | Risk |
|---|--------|--------------|------|
| 1 | protocolVersion string | 1 | Zero — cosmetic |
| 2 | 202 for notifications | ~5 | Low — new code path for a message type that currently returns 200 |
| 3 | 405 on GET | ~3 | Low — removes welcome page on /mcp for GET requests |
| 4 | Origin validation | ~5 | Low — can be permissive for public server |
| 5 | Mcp-Session-Id header | ~3 | Zero — optional, skip if stateless |
| **Total** | | **~15 lines** | **No architecture change** |
