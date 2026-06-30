const AUTH_URL = "https://functions.poehali.dev/2f65484d-2036-4c51-b6f3-e01cc65ddf91";
const BOTS_URL = "https://functions.poehali.dev/3a31590d-66a8-4a32-8018-9180fb2e6cb3";
const LEADS_URL = "https://functions.poehali.dev/96aa177e-abc9-4ba3-ad48-bbf935357753";
const AI_URL = "https://functions.poehali.dev/fa4308f7-059d-4404-aca1-10cfeb46e8ff";

function getToken() {
  return localStorage.getItem("bf_token") || "";
}

async function req(url: string, method: string, body?: object, auth = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers["X-Auth-Token"] = getToken();
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export const api = {
  register: (email: string, password: string, name: string) =>
    req(`${AUTH_URL}?action=register`, "POST", { email, password, name }),
  login: (email: string, password: string) =>
    req(`${AUTH_URL}?action=login`, "POST", { email, password }),
  me: () => req(`${AUTH_URL}?action=me`, "GET", undefined, true),
  logout: () => req(`${AUTH_URL}?action=logout`, "POST", undefined, true),

  getBots: () => req(`${BOTS_URL}?action=list`, "GET", undefined, true),
  createBot: (name: string, description: string) =>
    req(`${BOTS_URL}?action=create`, "POST", { name, description }, true),
  getBot: (id: number) => req(`${BOTS_URL}?action=get&id=${id}`, "GET", undefined, true),
  saveBot: (id: number, nodes: object[], edges: object[], prompt: object) =>
    req(`${BOTS_URL}?action=save&id=${id}`, "POST", { nodes, edges, prompt }, true),

  saveLead: (botId: number, email: string, name: string, extra?: object) =>
    req(`${LEADS_URL}?action=save&bot_id=${botId}`, "POST", { email, name, extra: extra || {} }),
  getLeads: (botId: number) =>
    req(`${LEADS_URL}?action=list&bot_id=${botId}`, "GET", undefined, true),

  getWebhooks: (botId: number) =>
    req(`${BOTS_URL}?action=webhooks&id=${botId}`, "GET", undefined, true),
  saveWebhook: (botId: number, data: object) =>
    req(`${BOTS_URL}?action=webhook-save&id=${botId}`, "POST", data, true),
  toggleWebhook: (id: number, active: boolean) =>
    req(`${BOTS_URL}?action=webhook-toggle`, "POST", { id, active }, true),

  askAI: (messages: { role: string; content: string }[], prompt: object) =>
    req(AI_URL, "POST", { messages, prompt, model: "gpt-4o-mini", max_tokens: 500 }),
};