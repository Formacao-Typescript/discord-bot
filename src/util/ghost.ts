import { decode } from "https://deno.land/std@0.199.0/encoding/hex.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import { getConfig } from "./config.ts";
import { nsDebug } from "./debug.ts";
const BASE_URL = "https://blog.lsantos.dev/ghost/api/admin/";
const config = await getConfig();

const log = nsDebug("ghost");

const getLabelsForOffer = (offer: string, preExisting = false) => {
  const offerLabel = config.offerLabels
    .filter((o) => o.offer === offer)
    .map(({ name, slug }) => ({ name, slug }));

  return [
    ...(offerLabel ? offerLabel : []),
    { name: `Oferta ${offer}`, slug: `oferta-${offer}` },
    { name: "Aluno Formação TS", slug: "aluno-formacaots" },
    { name: "Aluno", slug: "aluno" },
    ...(preExisting ? [] : [{ name: "Hotmart", slug: "hotmart" }]),
  ];
};

const auth = {
  token: "",
  eat: 0,
};

const getJwt = async () => {
  if (auth.token && auth.eat > Date.now()) return auth.token;

  const [id, secret] = config.ghostToken
    .split(":");

  const keyBuf = decode(new TextEncoder().encode(secret));

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );

  const eat = getNumericDate(60 * 4);

  const token = await create({ alg: "HS256", kid: id, typ: "JWT" }, {
    "exp": eat,
    "iat": getNumericDate(-10),
    "aud": "/admin/",
  }, key);

  auth.token = token;
  auth.eat = eat;

  return token;
};

export const sendRequest = async (method: string, path: string, data?: unknown) => {
  const token = await getJwt();
  const url = new URL(path, BASE_URL);

  log(`sending ${method} to ${url} with body ${JSON.stringify(data)}`);

  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Ghost ${token}`,
      "Accept-Version": "v5.25",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  }).then(async (response) => {
    log(`got ${response.status} response`);
    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  });
};

// deno-lint-ignore no-explicit-any
export const addMemberLabels = (member: any, offer: string) => {
  const newLabels = getLabelsForOffer(offer);

  const labels = [...member.labels, ...newLabels];
  const date = new Date().toLocaleDateString("pt", { day: "2-digit", month: "2-digit", year: "numeric" });

  return sendRequest("PUT", `members/${member.id}`, {
    members: [{ ...member, labels, note: member.note ?? `Atualizado pelo James em ${date}` }],
  });
};

export const addMember = async (email: string, offer: string) => {
  const member = await getMemberByEmail(email);

  if (member) return addMemberLabels(member, offer);

  const date = new Date().toLocaleDateString("pt", { day: "2-digit", month: "2-digit", year: "numeric" });

  return sendRequest("POST", "members", {
    members: [{
      email,
      newsletters: [{ id: config.ghostNewsletterId }],
      labels: getLabelsForOffer(offer),
      note: `Adicionado no dia ${date} pela integração da Hotmart com o James`,
    }],
  });
};

export const getMemberByEmail = (email: string) => {
  return sendRequest("GET", `members?filter=email:${email}&limit=1`)
    .then(({ members: [member] = [] } = {}) => member)
    .then((member) => member ?? null)
    .catch(() => null);
};

export const removeMember = async (email: string) => {
  const member = await getMemberByEmail(email);

  if (!member) {
    console.log(`member not found with email ${email}`);
    return;
  }

  const currentLabels = member.labels as Array<{ name: string; slug: string }>;
  const newLabels = currentLabels
    .filter((label) => !label.slug.startsWith("oferta") && !label.slug.startsWith("aluno"))
    .concat([{ slug: "reembolso-formacao-ts", name: "Reembolso Formação TS" }]);

  return sendRequest("PUT", `members/${member.id}`, {
    members: [{ labels: newLabels }],
  });
};
