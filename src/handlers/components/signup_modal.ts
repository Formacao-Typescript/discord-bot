import { ButtonComponent } from "../../util/components/button.ts";
import { InputTextComponent } from "../../util/components/text-input.ts";
import { Modal } from "../../util/modal.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply, sendModal } from "../../util/response.ts";
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
                new ButtonComponent("ok").label("OK").build(),
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

    const _code = await storage.confirmation.create(
      `${interaction.member!.user!.id}`,
      email,
      preRegisteredUser.tier,
    );

    // TODO: Send email with code

    return sendModal(
      new Modal("confirmationModal", "Confirmação de email").textInput(
        new InputTextComponent("confirmationCode", "Código de confirmação")
          .required()
          .placeholder("Código recebido por email")
          .max(6)
          .min(6),
      ),
    );
  },
};
