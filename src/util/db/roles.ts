import { MongoClient } from "deps.ts";

export type Role = {
  role: string;
  offer?: string;
};

export function getRolesRepository(client: MongoClient) {
  const db = client.database("discord");
  const roles = db.collection<Role>("roles");

  return {
    getForOffer: (offer: string) => roles.find({ $or: [{ offer }, { offer: { $exists: false } }] }),
    add: (params: Role) => roles.insertOne(params),
  };
}

export type RolesRepository = ReturnType<typeof getRolesRepository>;
