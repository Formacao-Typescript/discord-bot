import { decode } from "https://deno.land/std@0.199.0/encoding/hex.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import { getConfig } from "./config.ts";
const BASE_URL = "https://blog.lsantos.dev/ghost/api/admin/";
const config = await getConfig();

const getLabelsForOffer = (offer: string, direction: "join" | "leave") => {
  const label = config.offerLabels.filter((o) => o.offer === offer)[0];

  return [
    ...(label ? [label] : []),
    { name: `Oferta ${offer}`, "slug": `oferta-${offer}` },
    ...(
      direction === "join"
        ? [{ name: "Aluno Formação TS", "slug": "aluno-formacaots" }, { name: "Aluno", "slug": "aluno" }]
        : [{ slug: "reembolso-formacao-ts", name: "Reembolso Formação TS" }]
    ),
    { name: "Hotmart", "slug": "hotmart" },
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

  return fetch(new URL(path, BASE_URL), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Ghost ${token}`,
      "Accept-Version": "v5.25",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  });
};

export const addMember = (email: string, offer: string) => {
  return sendRequest("POST", "members", {
    members: [{ email, newsletters: [{ id: config.ghostNewsletterId }], labels: getLabelsForOffer(offer, "join") }],
  });
};

export const removeMember = async (email: string, offer: string) => {
  const member = await sendRequest("GET", `members?filter=email:${email}&limit=1`)
    .then(({ members: [member] = [] } = {}) => member);

  if (!member) throw new Error(`Member not found with email ${email}`);

  return sendRequest("PUT", `members/${member.id}`, {
    members: [{ labels: getLabelsForOffer(offer, "leave") }],
  });
};
