import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../util/response.ts";
import { ComponentHandler } from "./mod.ts";

export const confirmEmail: ComponentHandler = {
  id: "confirmEmail",
  handle: async ({ interaction, storage, api }) => {
    const userId = `${interaction.member!.user!.id}`;
    const confirmationCode = interaction.data?.components?.at(0)?.components
      // deno-lint-ignore no-explicit-any
      ?.find((component: any) => component.custom_id === "confirmationCode")
      ?.value
      ?.toLowerCase();

    if (!confirmationCode) {
      return reply("Erro ao processar código de confirmação. Por favor, tente novamente.", {
        flags: EPHEMERAL_MESSAGE_FLAG,
      });
    }

    const confirmation = await storage.confirmation.getByDiscordId(userId);

    if (!confirmation || confirmation.consumed || confirmation.code.toLowerCase() !== confirmationCode) {
      return reply("O código informado é inválido ou está expirado. Por favor, tente novamente", {
        flags: EPHEMERAL_MESSAGE_FLAG,
      });
    }

    const email = confirmation.email;
    const roles = await storage.roles.all();

    const student = await storage.students.findPreRegistered(email);

    await Promise.all([
      storage.confirmation.consume(confirmationCode),
      student.completeRegister(userId),
    ]);

    const userRoles = await storage.roles.getForOffer(student.tier).then((r) => r.map((r) => r.role));

    if (!userRoles.length) throw new Error(`no roleId for guild ${interaction.guild_id}. ${roles}`);

    await api.addUserRoles(
      userId,
      userRoles,
    );

    return reply(`Pronto! O email ${email} foi associado ao seu usuário do discord!`, {
      flags: EPHEMERAL_MESSAGE_FLAG,
    });
  },
};
