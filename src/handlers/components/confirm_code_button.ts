import { InputTextComponent } from "../../util/components/text-input.ts";
import { Modal } from "../../util/modal.ts";
import { sendModal } from "../../util/response.ts";
import { ComponentHandler } from "./mod.ts";

export const confirmCodeButton: ComponentHandler = {
  id: "confirmCodeButton",
  handle: () =>
    sendModal(
      new Modal("confirmationModal", "Confirmação de email").textInput(
        new InputTextComponent("confirmationCode", "Código de confirmação")
          .required()
          .placeholder("Digite o código que acabamos de te enviar por email")
          .max(6)
          .min(6),
      ),
    ),
};
