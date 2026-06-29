"""Лиды: сохранение email из чат-бота и получение списка."""
import json
import os
import re
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(data): return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, default=str)}
def err(msg, code=400): return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email.strip().lower()))

def get_user(cur, token):
    if not token: return None
    cur.execute("""SELECT u.id FROM users u JOIN sessions s ON s.user_id=u.id
        WHERE s.token=%s AND s.expires_at>NOW()""", (token,))
    row = cur.fetchone()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""
    body = json.loads(event.get("body") or "{}")

    # POST ?action=save — сохранить лид (публичный, без авторизации)
    if action == "save":
        bot_id_str = qs.get("bot_id", "")
        if not bot_id_str.isdigit():
            return err("Укажите bot_id")
        email = (body.get("email") or "").strip().lower()
        if not is_valid_email(email):
            return err("Некорректный email")
        name = (body.get("name") or "").strip()
        phone = (body.get("phone") or "").strip()
        extra = body.get("extra") or {}
        conn = get_conn()
        cur = conn.cursor()
        # Не дублируем email для одного бота
        cur.execute("SELECT id FROM leads WHERE bot_id=%s AND email=%s", (int(bot_id_str), email))
        if cur.fetchone():
            conn.close()
            return ok({"ok": True, "duplicate": True})
        cur.execute("""INSERT INTO leads (bot_id, email, name, phone, extra)
            VALUES (%s,%s,%s,%s,%s) RETURNING id""",
            (int(bot_id_str), email, name, phone, json.dumps(extra)))
        lead_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({"ok": True, "lead_id": lead_id})

    # GET ?action=list&bot_id=N — список лидов (требует авторизации)
    if action == "list":
        conn = get_conn()
        cur = conn.cursor()
        user_id = get_user(cur, token)
        if not user_id:
            conn.close()
            return err("Не авторизован", 401)
        bot_id_str = qs.get("bot_id", "")
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите bot_id")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)
        cur.execute("""SELECT id, email, name, phone, extra, created_at
            FROM leads WHERE bot_id=%s ORDER BY created_at DESC""", (bot_id,))
        leads = [{"id": r[0], "email": r[1], "name": r[2], "phone": r[3],
                  "extra": r[4], "created_at": str(r[5])} for r in cur.fetchall()]
        conn.close()
        return ok({"leads": leads, "total": len(leads)})

    return err("Unknown action", 404)
