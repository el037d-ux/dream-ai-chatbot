"""CRUD для ботов и узлов конструктора."""
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

def get_user(cur, token):
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

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token")

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user(cur, token)

    if not user_id:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    # GET /bots — список ботов
    if method == "GET" and path.endswith("/bots"):
        cur.execute("""
            SELECT id, name, description, status, dialogs_count, created_at
            FROM bots WHERE user_id = %s ORDER BY created_at DESC
        """, (user_id,))
        rows = cur.fetchall()
        bots = [{"id": r[0], "name": r[1], "description": r[2], "status": r[3],
                 "dialogs_count": r[4], "created_at": str(r[5])} for r in rows]
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"bots": bots})}

    # POST /bots — создать бота
    if method == "POST" and path.endswith("/bots"):
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()
        description = (body.get("description") or "").strip()
        if not name:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите название бота"})}
        cur.execute("""
            INSERT INTO bots (user_id, name, description) VALUES (%s, %s, %s) RETURNING id, name, description, status, dialogs_count, created_at
        """, (user_id, name, description))
        r = cur.fetchone()
        bot = {"id": r[0], "name": r[1], "description": r[2], "status": r[3], "dialogs_count": r[4], "created_at": str(r[5])}

        # Создаём стартовый узел
        cur.execute("""
            INSERT INTO bot_nodes (bot_id, node_id, type, label, message, pos_x, pos_y)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (r[0], "start_1", "trigger", "Старт", "Привет! Чем могу помочь?", 200, 100))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"bot": bot})}

    # GET /bots/{id} — получить бота + его узлы/рёбра
    parts = path.rstrip("/").split("/")
    bot_id_str = parts[-1] if parts[-1].isdigit() else (parts[-2] if len(parts) > 1 and parts[-2].isdigit() else None)
    sub = parts[-1] if not parts[-1].isdigit() else None

    if bot_id_str:
        bot_id = int(bot_id_str)
        cur.execute("SELECT id FROM bots WHERE id = %s AND user_id = %s", (bot_id, user_id))
        if not cur.fetchone():
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Бот не найден"})}

        # GET /bots/{id}
        if method == "GET" and sub is None:
            cur.execute("SELECT id, name, description, status, dialogs_count, created_at FROM bots WHERE id = %s", (bot_id,))
            r = cur.fetchone()
            cur.execute("SELECT node_id, type, label, message, pos_x, pos_y FROM bot_nodes WHERE bot_id = %s", (bot_id,))
            nodes = [{"id": n[0], "type": n[1], "label": n[2], "message": n[3], "x": n[4], "y": n[5]} for n in cur.fetchall()]
            cur.execute("SELECT edge_id, source_node_id, target_node_id FROM bot_edges WHERE bot_id = %s", (bot_id,))
            edges = [{"id": e[0], "source": e[1], "target": e[2]} for e in cur.fetchall()]
            bot = {"id": r[0], "name": r[1], "description": r[2], "status": r[3], "dialogs_count": r[4], "created_at": str(r[5])}
            conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"bot": bot, "nodes": nodes, "edges": edges})}

        # PUT /bots/{id} — обновить имя/описание
        if method == "PUT" and sub is None:
            body = json.loads(event.get("body") or "{}")
            name = body.get("name")
            description = body.get("description")
            if name:
                cur.execute("UPDATE bots SET name = %s, updated_at = NOW() WHERE id = %s", (name, bot_id))
            if description is not None:
                cur.execute("UPDATE bots SET description = %s, updated_at = NOW() WHERE id = %s", (description, bot_id))
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        # POST /bots/{id}/save — сохранить весь граф
        if method == "POST" and sub == "save":
            body = json.loads(event.get("body") or "{}")
            nodes = body.get("nodes", [])
            edges = body.get("edges", [])

            cur.execute("SELECT id FROM bot_nodes WHERE bot_id = %s", (bot_id,))
            cur.execute("DELETE FROM bot_edges WHERE bot_id = %s", (bot_id,))
            cur.execute("DELETE FROM bot_nodes WHERE bot_id = %s", (bot_id,))

            for n in nodes:
                cur.execute("""
                    INSERT INTO bot_nodes (bot_id, node_id, type, label, message, pos_x, pos_y)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (bot_id, n["id"], n.get("type", "message"), n.get("label", ""), n.get("message", ""), n.get("x", 100), n.get("y", 100)))
            for e in edges:
                cur.execute("""
                    INSERT INTO bot_edges (bot_id, edge_id, source_node_id, target_node_id)
                    VALUES (%s, %s, %s, %s)
                """, (bot_id, e["id"], e["source"], e["target"]))

            cur.execute("UPDATE bots SET updated_at = NOW() WHERE id = %s", (bot_id,))
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
