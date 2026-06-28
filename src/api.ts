const AUTH_URL = "https://functions.poehali.dev/2f65484d-2036-4c51-b6f3-e01cc65ddf91";
const BOTS_URL = "https://functions.poehali.dev/3a31590d-66a8-4a32-8018-9180fb2e6cb3";

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
    req(`${AUTH_URL}/register`, "POST", { email, password, name }),
  login: (email: string, password: string) =>
    req(`${AUTH_URL}/login`, "POST", { email, password }),
  me: () => req(`${AUTH_URL}/me`, "GET", undefined, true),
  logout: () => req(`${AUTH_URL}/logout`, "POST", undefined, true),

  getBots: () => req(`${BOTS_URL}/bots`, "GET", undefined, true),
  createBot: (name: string, description: string) =>
    req(`${BOTS_URL}/bots`, "POST", { name, description }, true),
  getBot: (id: number) => req(`${BOTS_URL}/bots/${id}`, "GET", undefined, true),
  saveBot: (id: number, nodes: object[], edges: object[]) =>
    req(`${BOTS_URL}/bots/${id}/save`, "POST", { nodes, edges }, true),
};
