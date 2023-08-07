import { load } from "deps.ts";

export const getConfig = async () => {
  await load({
    export: true,
    allowEmptyValues: false,
  });

  return {
    token: Deno.env.get("BOT_TOKEN")!,
    applicationId: Deno.env.get("APPLICATION_ID")!,
    publicKey: Deno.env.get("DISCORD_PUBLIC_KEY")!,
    port: Number(Deno.env.get("PORT") ?? "") || undefined,
    atlasApiKey: Deno.env.get("ATLAS_API_KEY")!,
    atlasEndpoint: Deno.env.get("ATLAS_ENDPOINT")!,
    guildId: Deno.env.get("GUILD_ID")!,
  };
};

export type Config = Awaited<ReturnType<typeof getConfig>>;
