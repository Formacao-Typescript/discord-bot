import { MongoClient } from "deps.ts";

const TEN_MINUTES_IN_MS = 60 * 1000 * 10;

export type Confirmation = {
  email: string;
  discordId: string;
  code: string;
  expiresAt: Date;
  consumed: boolean;
};

const getRandomCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8))).map((n) => n.toString(16)).join("").slice(0, 8);

export function getConfirmationRepository(client: MongoClient) {
  const db = client.database("discord");
  const confirmations = db.collection<Confirmation>("confirmation");

  return {
    create: async (discordId: string, email: string) => {
      const code = getRandomCode();
      const expiresAt = new Date(Date.now() + TEN_MINUTES_IN_MS);

      await confirmations.updateMany({ discordId }, { $set: { consumed: true } });
      await confirmations.insertOne({ discordId, code, expiresAt, email, consumed: false });

      return code;
    },
    getByDiscordId: (discordId: string) => {
      return confirmations.findOne({ discordId, expiresAt: { $gt: new Date() }, consumed: false });
    },
    consume: (code: string) => confirmations.updateOne({ code }, { $set: { consumed: true } }),
  };
}

export type ConfirmationRepository = ReturnType<typeof getConfirmationRepository>;
