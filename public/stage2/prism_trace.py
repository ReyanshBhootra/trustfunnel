#!/usr/bin/env python3
"""Send a Stage 2 result to Block Convey PRISM as one trace per signal.

Usage:
  PRISMTRACE_PROJECT_ID=... PRISMTRACE_API_KEY=pt-sk-... python3 prism_trace.py result.json
  pbpaste | PRISMTRACE_PROJECT_ID=... PRISMTRACE_API_KEY=... python3 prism_trace.py -

Env (optional): PRISMTRACE_HOST, default https://prism.blockconvey.com
Only stdlib; nothing else to install.
"""
import json, os, sys, time, urllib.request

HOST = os.environ.get("PRISMTRACE_HOST", "https://prism.blockconvey.com").rstrip("/")
PROJECT = os.environ.get("PRISMTRACE_PROJECT_ID")
KEY = os.environ.get("PRISMTRACE_API_KEY")
if not (PROJECT and KEY):
    sys.exit("set PRISMTRACE_PROJECT_ID and PRISMTRACE_API_KEY")

src = sys.argv[1] if len(sys.argv) > 1 else "-"
result = json.load(sys.stdin if src == "-" else open(src))
cid = result.get("candidate_id", "unknown")
session = f"stage2-{cid}-{int(time.time())}"

def post(body):
    req = urllib.request.Request(
        f"{HOST}/api/traces", data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "X-PRISMtrace-Key": KEY}, method="POST")
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

# one trace per scoring signal, so the PRISM trajectory shows the score math step by step
for step in result.get("trace", []):
    out = post({
        "project_id": PROJECT, "api_key": KEY,
        "model": result.get("model", "stage2-rules"),
        "session_id": session, "agent_id": "trustfunnel-stage2",
        "input_messages": [{"role": "user", "content": f"signal={step['signal']} value={step['value']}"}],
        "output_message": f"delta={step['delta']:+d}",
        "latency_ms": 1,
        "metadata": {"agent_name": "TrustFunnel Stage 2", "candidate_id": cid,
                     "signal": step["signal"], "delta": step["delta"], "source": "hackathon-demo"},
    })
    print("trace", out.get("id", "?"), step["signal"], step["delta"])

# final summary trace with flags
flags = [f["code"] for f in result.get("stage2_flags", [])]
out = post({
    "project_id": PROJECT, "api_key": KEY,
    "model": result.get("model", "stage2-rules"),
    "session_id": session, "agent_id": "trustfunnel-stage2",
    "input_messages": [{"role": "user", "content": f"candidate={cid} flags={flags}"}],
    "output_message": f"consistency_score={result.get('stage2_consistency_score')} status={result.get('status')}",
    "latency_ms": 1,
    "metadata": {"agent_name": "TrustFunnel Stage 2", "candidate_id": cid,
                 "score": result.get("stage2_consistency_score"), "status": result.get("status"),
                 "flags": flags, "source": "hackathon-demo"},
})
print("summary trace", out.get("id", "?"), "session", session)
