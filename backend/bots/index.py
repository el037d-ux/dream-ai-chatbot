"""CRUD для ботов. Action через query: ?action=list|create|get&id=N|save&id=N"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}

def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}

def get_user(cur, token: str):
    if not token:
        return None
    cur.execute("""
        SELECT u.id FROM users u JOIN sessions s ON s.user_id = u.id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    row = cur.fetchone()
    return row[0] if row else None

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "list")
    bot_id_str = qs.get("id", "")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user(cur, token)
    if not user_id:
        conn.close()
        return err("Не авторизован", 401)

    if action == "list":
        cur.execute("""
            SELECT id, name, description, status, dialogs_count, created_at
            FROM bots WHERE user_id = %s ORDER BY created_at DESC
        """, (user_id,))
        bots = [{"id": r[0], "name": r[1], "description": r[2], "status": r[3],
                 "dialogs_count": r[4], "created_at": str(r[5])} for r in cur.fetchall()]
        conn.close()
        return ok({"bots": bots})

    if action == "create":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()
        description = (body.get("description") or "").strip()
        if not name:
            conn.close()
            return err("Укажите название бота")
        cur.execute("""
            INSERT INTO bots (user_id, name, description)
            VALUES (%s,%s,%s) RETURNING id, name, description, status, dialogs_count, created_at
        """, (user_id, name, description))
        r = cur.fetchone()
        bot_id = r[0]
        cur.execute("""
            INSERT INTO bot_nodes (bot_id, node_id, type, label, message, pos_x, pos_y)
            VALUES (%s,'start_1','trigger','Старт','Привет! Чем могу помочь?',200,100)
        """, (bot_id,))
        conn.commit()
        conn.close()
        return ok({"bot": {"id": r[0], "name": r[1], "description": r[2], "status": r[3], "dialogs_count": r[4], "created_at": str(r[5])}})

    if action == "get":
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите id бота")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id, name, description, status, dialogs_count, created_at FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        r = cur.fetchone()
        if not r:
            conn.close()
            return err("Бот не найден", 404)
        cur.execute("SELECT node_id, type, label, message, pos_x, pos_y FROM bot_nodes WHERE bot_id=%s", (bot_id,))
        nodes = [{"id": n[0], "type": n[1], "label": n[2], "message": n[3], "x": n[4], "y": n[5]} for n in cur.fetchall()]
        cur.execute("SELECT edge_id, source_node_id, target_node_id FROM bot_edges WHERE bot_id=%s", (bot_id,))
        edges = [{"id": e[0], "source": e[1], "target": e[2]} for e in cur.fetchall()]
        conn.close()
        return ok({"bot": {"id": r[0], "name": r[1], "description": r[2], "status": r[3], "dialogs_count": r[4], "created_at": str(r[5])}, "nodes": nodes, "edges": edges})

    if action == "save":
        if not bot_id_str.isdigit():
            conn.close()
            return err("Укажите id бота")
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id=%s AND user_id=%s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return err("Бот не найден", 404)
        body = json.loads(event.get("body") or "{}")
        nodes = body.get("nodes", [])
        edges = body.get("edges", [])
        cur.execute("DELETE FROM bot_edges WHERE bot_id=%s", (bot_id,))
        cur.execute("DELETE FROM bot_nodes WHERE bot_id=%s", (bot_id,))
        for n in nodes:
            cur.execute("""
                INSERT INTO bot_nodes (bot_id, node_id, type, label, message, pos_x, pos_y)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (bot_id, n["id"], n.get("type","message"), n.get("label",""), n.get("message",""), n.get("x",100), n.get("y",100)))
        for e in edges:
            cur.execute("""
                INSERT INTO bot_edges (bot_id, edge_id, source_node_id, target_node_id)
                VALUES (%s,%s,%s,%s)
            """, (bot_id, e["id"], e["source"], e["target"]))
        cur.execute("UPDATE bots SET updated_at=NOW() WHERE id=%s", (bot_id,))
        conn.commit()
        conn.close()
        return ok({"ok": True})

    conn.close()
    return err("Unknown action", 404)
