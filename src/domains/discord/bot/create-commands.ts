import { createBot, upsertGlobalApplicationCommands } from "deps.ts";
import { COMMANDS } from "./handlers/commands/mod.ts";
import { getConfig } from "../../../common/config.ts";

const config = getConfig();

const bot = createBot({
  token: config.token,
});

await upsertGlobalApplicationCommands(
  bot,
  COMMANDS.map(({ name, description, allowDm, permissions, options }) => ({
    name,
    description,
    defaultMemberPermissions: permissions,
    dmPermission: allowDm,
    options,
  })),
);

bot.gateway.manager.shards.map((s) => s.close(0, ""));

console.log("Done");

Deno.exit(0);
