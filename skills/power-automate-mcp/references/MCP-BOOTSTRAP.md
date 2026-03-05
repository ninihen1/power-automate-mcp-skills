# MCP Bootstrap — Quick Reference

Everything an agent needs to start calling the FlowStudio MCP server.

```
Endpoint:  https://mcp.flowstudio.app/mcp
Protocol:  JSON-RPC 2.0 over HTTP POST
Transport: Streamable HTTP — single POST per request, no SSE, no WebSocket
Auth:      x-api-key header with JWT token (NOT Bearer)
```

## Required Headers

```
Content-Type: application/json
x-api-key: <token>
User-Agent: FlowStudio-MCP/1.0    ← required, or Cloudflare blocks you
```

## Step 1 — Discover Tools

```json
POST {"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

Returns all tools with names, descriptions, and input schemas.
Free — not counted against plan limits.

## Step 2 — Find Your Environment

```json
POST {"jsonrpc":"2.0","id":1,"method":"tools/call",
      "params":{"name":"get_live_environments","arguments":{}}}
```

Returns environment IDs (e.g. `Default-<tenant-guid>`).
You need this for every subsequent tool call.

## Step 3 — Call a Tool

```json
POST {"jsonrpc":"2.0","id":1,"method":"tools/call",
      "params":{"name":"<tool_name>","arguments":{"environmentName":"Default-..."}}}
```

## Response Shape

```
Success → {"result":{"content":[{"type":"text","text":"<JSON string>"}]}}
Error   → {"result":{"content":[{"type":"text","text":"{\"error\":{...}}"}]}}
```

Always parse `result.content[0].text` as JSON to get the actual data.

## Key Tips

- Tool results are JSON strings inside the text field — **double-parse needed**
- `"error"` field in parsed body: `null` = success, object = failure
- `environmentName` is required for all `live/*` and `store/*` tools
- Call `get_live_environments` first to discover available environments
