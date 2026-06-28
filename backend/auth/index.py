"""Аутентификация: регистрация, вход, профиль, выход. Action передаётся через query ?action=register|login|me|logout"""
import json
import os
import hashlib
import secrets
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}

def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""
    body = json.loads(event.get("body") or "{}")

    if action == "register":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        name = (body.get("name") or "").strip()
        if not email or not password or not name:
            return err("Заполните все поля")
        if len(password) < 6:
            return err("Пароль минимум 6 символов")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return err("Email уже зарегистрирован", 409)
        pw_hash = hash_password(password)
        cur.execute("INSERT INTO users (email, password_hash, name) VALUES (%s,%s,%s) RETURNING id", (email, pw_hash, name))
        user_id = cur.fetchone()[0]
        t = secrets.token_hex(32)
        cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s,%s)", (user_id, t))
        conn.commit()
        conn.close()
        return ok({"token": t, "user": {"id": user_id, "email": email, "name": name}})

    if action == "login":
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, name, password_hash FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        if not row or row[2] != hash_password(password):
            conn.close()
            return err("Неверный email или пароль", 401)
        user_id, name, _ = row
        t = secrets.token_hex(32)
        cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s,%s)", (user_id, t))
        conn.commit()
        conn.close()
        return ok({"token": t, "user": {"id": user_id, "email": email, "name": name}})

    if action == "me":
        if not token:
            return err("Не авторизован", 401)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT u.id, u.email, u.name FROM users u
            JOIN sessions s ON s.user_id = u.id
            WHERE s.token = %s AND s.expires_at > NOW()
        """, (token,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return err("Сессия истекла", 401)
        return ok({"user": {"id": row[0], "email": row[1], "name": row[2]}})

    if action == "logout":
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
            conn.close()
        return ok({"ok": True})

    return err("Unknown action", 404)
