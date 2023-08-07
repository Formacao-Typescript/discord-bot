import { ApplicationCommandOption, PermissionStrings } from "deps.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../util/response.ts";
import { Context } from "../types.ts";
import { info } from "./info.ts";
import { init } from "./init.ts";
import { role } from "./role.ts";
import { unlink } from "./unlink.ts";

export type Command = {
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
  permissions?: PermissionStrings[];
  allowDm?: boolean;
  run: (ctx: Context) => Response | Promise<Response>;
};

export const COMMANDS = [
  init,
  role,
  unlink,
  info,
];

const NOT_FOUND: Command = {
  name: "notfound",
  description: "Comando não encontrado",
  run: () => reply("Comando não encontrado :/", { flags: EPHEMERAL_MESSAGE_FLAG }),
};

export const getCommand = (name = "notfound") => COMMANDS.find((command) => command.name === name) || NOT_FOUND;
