import json, urllib.request, os

token = os.environ.get("FLOWSTUDIO_MCP_TOKEN_FS", "")
if not token:
    print("NO TOKEN SET")
    exit(1)

payload = {
    "jsonrpc": "2.0", "id": 1, "method": "tools/list",
    "params": {}
}

req = urllib.request.Request(
    "https://mcp.flowstudio.app/mcp",
    data=json.dumps(payload).encode(),
    headers={
        "x-api-key": token,
        "Content-Type": "application/json",
        "User-Agent": "FlowStudio-MCP/1.0"
    }
)

try:
    raw = urllib.request.urlopen(req, timeout=60).read()
    resp = json.loads(raw)
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()[:300]}")
    exit(1)

if "error" in resp:
    print("JSON-RPC ERROR:", json.dumps(resp["error"], indent=2))
    exit(1)

inner = json.loads(resp["result"]["content"][0]["text"])

with open(r"c:\Users\ninih\GitHub\FlowStudio MCP\mcp_flows.json", "w") as f:
    json.dump(inner, f, indent=2)

if isinstance(inner, list):
    print(f"Total flows: {len(inner)}\n")
    for fl in inner:
        fid = fl.get("id", "?")[:12]
        name = fl.get("displayName", "?")
        state = fl.get("state", "?")
        trigger = fl.get("triggerType", "?")
        print(f"  {fid}..  | {state:<10} | {trigger:<15} | {name}")
elif isinstance(inner, dict) and "error" in inner:
    print("ERROR:", json.dumps(inner["error"], indent=2))
else:
    print(json.dumps(inner, indent=2)[:2000])
