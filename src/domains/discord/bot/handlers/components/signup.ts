import { InputTextComponent } from "../../components/text-input.ts";
import { Modal } from "../../components/modal.ts";
import { EPHEMERAL_MESSAGE_FLAG, reply, sendModal } from "../../response.ts";
import { Context } from "../types.ts";
import { ComponentHandler } from "./mod.ts";

export const signup: ComponentHandler = {
  id: "signup",
  async handle({ storage, interaction }: Context) {
    const userExists = await storage.students.existsByDiscordId(`${interaction.member!.user!.id}`);

    if (userExists) {
      return reply(
        "Opa. Seu usuário já está associado a um email. Se você acha que isso é um engano, procure a moderação",
        { flags: EPHEMERAL_MESSAGE_FLAG },
      );
    }

    return sendModal(
      new Modal("sendConfirmation", "Verificação de Acesso")
        .textInput(
          new InputTextComponent("emailInput", "Digite o email de compra no site 👇")
            .required()
            .placeholder("seu@email.com"),
        ),
    );
  },
};
