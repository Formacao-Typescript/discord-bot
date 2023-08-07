import { ButtonComponent } from "../../util/components/button.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply } from "../../util/response.ts";
import { ComponentHandler } from "./mod.ts";

export const emailModal: ComponentHandler = {
  id: "emailModal",
  handle: async ({ interaction, storage, api }) => {
    const roles = await storage.roles.all();
    const email = interaction.data?.components?.at(0)?.components
      // deno-lint-ignore no-explicit-any
      ?.find((component: any) => component.custom_id === "emailInput")
      ?.value;

    if (!email) {
      return reply("Desculpa. Não consegui encontrar seu email.", { flags: EPHEMERAL_MESSAGE_FLAG });
    }

    const preRegisteredUser = await storage.students.findPreRegistered(email);

    if (!preRegisteredUser) {
      return reply(
        `Opa. Não consegui achar o email ${email} no meu banco de dados. Tem certeza que foi com esse email que você comprou o curso?`,
        {
          flags: EPHEMERAL_MESSAGE_FLAG,
          components: [
            {
              type: 1,
              components: [
                new ButtonComponent("retry").label("Tentar novamente").build(),
              ],
            },
          ],
        },
      );
    }

    const userExists = await storage.students.existsByEmail(email);

    if (userExists) {
      return reply(
        [
          `Opa. Parece que o email ${email} já está em uso por outro usuário no discord.`,
          "Se você acha que isso é um erro, entre em contato com a moderação",
        ].join(" "),
        { flags: EPHEMERAL_MESSAGE_FLAG },
      );
    }

    await storage.students.completeRegister(email, `${interaction.member!.user!.id}`);

    const student = await storage.students.findByDiscordId(`${interaction.member!.user!.id}`);

    const userRoles = await storage.roles.getForOffer(student.tier).then((r) => r.map((r) => r.role));

    if (!userRoles.length) throw new Error(`no roleId for guild ${interaction.guild_id}. ${roles}`);

    await api.addUserRoles(
      `${interaction.member!.user!.id}`,
      userRoles,
    );

    return reply(`Pronto! O email ${email} foi associado ao seu usuário do discord! Sua oferta é: ${student.tier}`, {
      flags: EPHEMERAL_MESSAGE_FLAG,
    });
  },
};
