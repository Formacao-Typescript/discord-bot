import { create, decode, getNumericDate } from "deps.ts";
import { getConfig } from "../../common/config.ts";
import { nsDebug } from "../../common/debug.ts";
const BASE_URL = "https://blog.lsantos.dev/ghost/api/admin/";
const config = getConfig();

const log = nsDebug("ghost");

const pick = <TObj extends Record<string, unknown>, TKeys extends Array<keyof TObj>>(...keys: TKeys) => (obj: TObj) =>
  keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {} as Pick<TObj, typeof keys[number]>);

const getLabelsForOffer = (offer: string) => {
  const offerLabel = config.offerLabels
    .filter((o) => o.offer === offer)
    .map(pick("name", "slug"));

  return [
    ...(offerLabel ? offerLabel : []),
    { name: `Oferta ${offer}`, slug: `oferta-${offer}` },
    { name: "Aluno Formação TS", slug: "aluno-formacaots" },
    { name: "Aluno", slug: "aluno" },
  ];
};

const getLabelsForOrigin = (origin: string) => {
  const originLabels = {
    "hotmart": [{ name: "Hotmart", slug: "hotmart" }],
  };

  return [originLabels[origin as keyof typeof originLabels] ?? []];
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

const getLabelsForTags = (tags: string[]) => {
  const offers = tags
    .filter((tag) => tag.startsWith("offer:"))
    .map((tag) => tag.replace("offer:", ""))
    .flatMap((offer) => getLabelsForOffer(offer));

  const originLabels = tags
    .filter((tag) => tag.startsWith("origin:"))
    .map((tag) => tag.replace("origin:", ""))
    .flatMap((origin) => getLabelsForOrigin(origin));

  return [...offers, ...originLabels];
};

// deno-lint-ignore no-explicit-any
export const updateMemberLabels = (member: any, tags: string[]) => {
  const labels = getLabelsForTags(tags);
  const date = new Date().toLocaleDateString("pt", { day: "2-digit", month: "2-digit", year: "numeric" });

  return sendRequest("PUT", `members/${member.id}`, {
    members: [{ ...member, labels, note: member.note ?? `Atualizado pelo back-end da Formação TS em ${date}` }],
  });
};

export const addMember = (email: string, tags: string[]) => {
  const date = new Date().toLocaleDateString("pt", { day: "2-digit", month: "2-digit", year: "numeric" });

  return sendRequest("POST", "members", {
    members: [{
      email,
      newsletters: [{ id: config.ghostNewsletterId }],
      labels: getLabelsForTags(tags),
      note: `Adicionado no dia ${date} pelo back-end da Formação TS.`,
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
