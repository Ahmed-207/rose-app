#!/usr/bin/env python3
"""E2E test: register -> forgot password -> reset password -> login."""
import json
import re
import time
import urllib.error
import urllib.request

API = "https://rose-app.elevate-bootcamp.cloud"
MAIL_API = "https://api.mail.tm"


def req(url, method="GET", data=None, headers=None):
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    if headers:
        h.update(headers)
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"status": False, "message": raw}
        payload["_http_status"] = e.code
        return payload


def as_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return "".join(as_text(item) for item in value)
    return str(value)


def message_text(full: dict) -> str:
    return (
        as_text(full.get("text"))
        + as_text(full.get("html"))
        + as_text(full.get("subject"))
        + as_text(full.get("intro"))
    )


def main():
    domains_resp = req(f"{MAIL_API}/domains")
    if isinstance(domains_resp, list):
        members = domains_resp
    elif isinstance(domains_resp, dict):
        members = domains_resp.get("hydra:member", [])
    else:
        raise SystemExit(f"Unexpected domains response: {domains_resp}")
    domain = members[0]["domain"]

    ts = str(int(time.time()))
    local = f"rosetest{ts}"
    email = f"{local}@{domain}"
    mail_pass = "RoseTest123!"
    username = f"rose{ts[-6:]}"
    app_pass = "TestPass123!"
    new_pass = "NewPass456!"

    print(f"EMAIL={email}")
    print(f"USERNAME={username}")

    create = req(f"{MAIL_API}/accounts", "POST", {"address": email, "password": mail_pass})
    if not isinstance(create, dict) or not create.get("id"):
        raise SystemExit(f"mail.tm create failed: {create}")

    mail_token = req(f"{MAIL_API}/token", "POST", {"address": email, "password": mail_pass}).get("token")
    if not mail_token:
        raise SystemExit("No mail.tm token")
    mail_headers = {"Authorization": f"Bearer {mail_token}"}

    def wait_for_message(predicate, timeout=90):
        deadline = time.time() + timeout
        seen = set()
        while time.time() < deadline:
            msgs_resp = req(f"{MAIL_API}/messages", headers=mail_headers)
            if isinstance(msgs_resp, list):
                msgs = msgs_resp
            elif isinstance(msgs_resp, dict):
                msgs = msgs_resp.get("hydra:member", [])
            else:
                msgs = []
            for m in msgs:
                mid = m["id"]
                if mid in seen:
                    continue
                seen.add(mid)
                full = req(f"{MAIL_API}/messages/{mid}", headers=mail_headers)
                text = message_text(full)
                if predicate(text, full):
                    return full
            time.sleep(3)
        return None

    print("\n=== 1. SEND EMAIL VERIFICATION ===")
    print(req(f"{API}/api/auth/send-email-verification", "POST", {"email": email}))

    verify_msg = wait_for_message(lambda t, f: re.search(r"\b(\d{6})\b", t))
    if not verify_msg:
        raise SystemExit("No verification code received")
    code = re.search(r"\b(\d{6})\b", message_text(verify_msg)).group(1)
    print(f"OTP={code}")

    print("\n=== 2. CONFIRM EMAIL ===")
    print(req(f"{API}/api/auth/confirm-email-verification", "POST", {"email": email, "code": code}))

    print("\n=== 3. REGISTER ===")
    reg = req(f"{API}/api/auth/register", "POST", {
        "username": username,
        "email": email,
        "password": app_pass,
        "confirmPassword": app_pass,
        "firstName": "Rose",
        "lastName": "Test",
    })
    print(json.dumps({k: reg.get(k) for k in ("status", "code", "message")}, indent=2))
    if not reg.get("status"):
        raise SystemExit(f"Register failed: {reg}")

    print("\n=== 4. LOGIN (original password) ===")
    login1 = req(f"{API}/api/auth/login", "POST", {"username": username, "password": app_pass})
    print(json.dumps({k: login1.get(k) for k in ("status", "code", "message")}, indent=2))

    print("\n=== 5. FORGOT PASSWORD ===")
  # host is the frontend origin; backend uses it to build the reset link in the email
    print(req(f"{API}/api/auth/forgot-password", "POST", {"email": email, "redirectUrl": "http://localhost:4200/auth/reset-password"}))

    reset_token = None

    def capture_token(text, _full):
        nonlocal reset_token
        patterns = [
            r"reset-password\?token=([A-Za-z0-9._\-]+)",
            r"token=([A-Za-z0-9._\-]+)",
            r"\b([A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b",
        ]
        for pattern in patterns:
            m = re.search(pattern, text)
            if m:
                reset_token = m.group(1)
                return True
        return False

    reset_msg = wait_for_message(capture_token, timeout=90)
    if not reset_token:
        snippet = message_text(reset_msg or {})[:800]
        raise SystemExit(f"No reset token found. Email snippet: {snippet}")
    print(f"RESET_TOKEN={reset_token[:50]}...")

    print("\n=== 6. RESET PASSWORD ===")
    reset = req(f"{API}/api/auth/reset-password", "POST", {
        "token": reset_token,
        "newPassword": new_pass,
        "confirmPassword": new_pass,
    })
    print(json.dumps(reset, indent=2))
    if not reset.get("status"):
        raise SystemExit(f"Reset failed: {reset}")

    print("\n=== 7. LOGIN (old password) ===")
    old_login = req(f"{API}/api/auth/login", "POST", {"username": username, "password": app_pass})
    print(json.dumps({k: old_login.get(k) for k in ("status", "code", "message")}, indent=2))

    print("\n=== 8. LOGIN (new password) ===")
    login2 = req(f"{API}/api/auth/login", "POST", {"username": username, "password": new_pass})
    print(json.dumps({k: login2.get(k) for k in ("status", "code", "message")}, indent=2))
    if login2.get("status"):
        print("\n✅ Full flow succeeded: register → forgot → reset → login with new password")
    else:
        raise SystemExit(f"Login with new password failed: {login2}")


if __name__ == "__main__":
    main()
