import { MongoClient } from "deps.ts";

export type Role = {
  role: string;
  offer?: string;
};

export function getRolesRepository(client: MongoClient) {
  const db = client.database("discord");
  const roles = db.collection<Role>("roles");

  return {
    all: () => roles.find(),
    getForOffer: (offer: string) => roles.find({ $or: [{ offer }, { offer: { $exists: false } }, { offer: null }] }),
    add: (params: Role) => roles.insertOne(params),
  };
}

export type RolesRepository = ReturnType<typeof getRolesRepository>;
