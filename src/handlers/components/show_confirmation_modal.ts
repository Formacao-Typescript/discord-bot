import { InputTextComponent } from "../../util/components/text-input.ts";
import { Modal } from "../../util/modal.ts";
import { sendModal } from "../../util/response.ts";
import { ComponentHandler } from "./mod.ts";

export const showConfirmationModal: ComponentHandler = {
  id: "showConfirmationModal",
  handle: () =>
    sendModal(
      new Modal("confirmEmail", "Confirmação de email").textInput(
        new InputTextComponent("confirmationCode", "Código de confirmação")
          .required()
          .placeholder("Digite o código que acabamos de te enviar por email")
          .max(8)
          .min(8),
      ),
    ),
};
