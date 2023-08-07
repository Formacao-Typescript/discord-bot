import { MongoClient } from "deps.ts";

const TEN_MINUTES_IN_MS = 60 * 1000 * 10;

export type Confirmation = {
  email: string;
  tier: string;
  discordId: string;
  code: string;
  expiresAt: Date;
  consumed: boolean;
};

const getRandomCode = () => Array.from(crypto.getRandomValues(new Uint8Array(4))).map((n) => n.toString(16)).join("");

export function getConfirmationRepository(client: MongoClient) {
  const db = client.database("discord");
  const confirmations = db.collection<Confirmation>("roles");

  return {
    create: async (discordId: string, email: string, tier: string) => {
      const code = getRandomCode();
      const expiresAt = new Date(Date.now() + TEN_MINUTES_IN_MS);

      await confirmations.updateOne({ discordId }, { $set: { code, expiresAt, email, tier, consumed: false } }, {
        upsert: true,
      });

      return code;
    },
    getByDiscordId: (discordId: string) => {
      return confirmations.findOne({ discordId, expiresAt: { $lt: new Date() } });
    },
    consume: (discordId: string) => confirmations.updateOne({ discordId }, { $set: { consumed: true } }),
  };
}

export type ConfirmationRepository = ReturnType<typeof getConfirmationRepository>;
