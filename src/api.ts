const AUTH_URL = "https://functions.poehali.dev/2f65484d-2036-4c51-b6f3-e01cc65ddf91";
const BOTS_URL = "https://functions.poehali.dev/3a31590d-66a8-4a32-8018-9180fb2e6cb3";
const LEADS_URL = "https://functions.poehali.dev/96aa177e-abc9-4ba3-ad48-bbf935357753";
const AI_URL = "https://functions.poehali.dev/fa4308f7-059d-4404-aca1-10cfeb46e8ff";
const AI_ASSISTANT_URL = "https://functions.poehali.dev/17e10c45-10e7-4ed3-af8e-8168e7fa6e23";
const VK_CONNECT_URL = "https://functions.poehali.dev/f8b7cbf4-0be7-40e9-873e-54b9c2a9ba08";
export const VK_BOT_URL = "https://functions.poehali.dev/bf37291d-9d5d-4ef1-a4d6-361dbf50b813";

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
  deleteBot: (id: number) =>
    req(`${BOTS_URL}?action=delete&id=${id}`, "POST", {}, true),

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

  askAssistant: (message: string, history: { role: string; content: string }[], context: object) =>
    req(AI_ASSISTANT_URL, "POST", { message, history, context }),

  vkStatus: (botId: number) =>
    req(`${VK_CONNECT_URL}?action=status&bot_id=${botId}`, "GET", undefined, true),
  vkConnect: (botId: number, accessToken: string, groupId: number, secretKey: string, confirmCode: string) =>
    req(`${VK_CONNECT_URL}?action=connect`, "POST", { bot_id: botId, access_token: accessToken, group_id: groupId, secret_key: secretKey, confirm_code: confirmCode }, true),
  vkSetConfirm: (botId: number, confirmCode: string) =>
    req(`${VK_CONNECT_URL}?action=set_confirm`, "POST", { bot_id: botId, confirm_code: confirmCode }, true),
  vkToggle: (botId: number, active: boolean) =>
    req(`${VK_CONNECT_URL}?action=toggle`, "POST", { bot_id: botId, active }, true),
  vkDisconnect: (botId: number) =>
    req(`${VK_CONNECT_URL}?action=disconnect`, "POST", { bot_id: botId }, true),
};