import { MongoClient } from "deps.ts";

export type Role = {
  role: string;
  tag?: string;
};

export function getRolesRepository(client: MongoClient) {
  const db = client.database("discord");
  const roles = db.collection<Role>("roles");

  return {
    all: () => roles.find(),
    getForTag: (tag: string) => roles.find({ $or: [{ tag }, { tag: { $exists: false } }, { tag: null }] }),
    getForTags: (tags: string[]) =>
      roles.find({ $or: [...tags.map((tag) => ({ tag })), { tag: { $exists: false } }, { tag: null }] }),
    add: (params: Role) => roles.insertOne(params),
  };
}

export type RolesRepository = ReturnType<typeof getRolesRepository>;
