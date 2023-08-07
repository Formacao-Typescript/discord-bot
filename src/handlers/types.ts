import { Api } from "../api.ts";
import { Interaction } from "../deps.ts";
import { Storage } from "../util/db/db.ts";
import { Role } from "../util/db/roles.ts";

export type Context = {
  interaction: Interaction & { guild_id: string } & { channel_id: string };
  api: Api;
  storage: Storage;
  roles: Role[];
};
