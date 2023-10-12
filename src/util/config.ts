import { loadSync } from "deps.ts";

type Offer = { offer: string; name: string; slug: string };

export const getConfig = () => {
  loadSync({
    envPath: ".env.prod",
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
    defaultDiscordInvite: Deno.env.get("DEFAULT_DISCORD_INVITE")!,
    guildId: Deno.env.get("GUILD_ID")!,
    channelId: Deno.env.get("CHANNEL_ID")!,
    mailgunApiKey: Deno.env.get("MAILGUN_API_KEY")!,
    mailgunDomain: Deno.env.get("MAILGUN_DOMAIN")!,
    mailgunFrom: Deno.env.get("MAILGUN_FROM")!,
    mailgunRegion: Deno.env.get("MAILGUN_REGION")! as "eu" | "us",
    ghostToken: Deno.env.get("GHOST_TOKEN")!,
    ghostNewsletterId: Deno.env.get("GHOST_NEWSLETTER_ID")!,
    offerLabels: JSON.parse(Deno.env.get("OFFER_LABELS")!) as Offer[],
    devChannelId: Deno.env.get("DEV_CHANNEL_ID")!,
  };
};

export type Config = Awaited<ReturnType<typeof getConfig>>;
