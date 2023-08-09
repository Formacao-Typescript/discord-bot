import { Context } from "../types.ts";
import { confirmEmail } from "./confirm_email.ts";
import { sendConfirmation } from "./send_confirmation.ts";
import { showConfirmationModal } from "./show_confirmation_modal.ts";
import { signup } from "./signup.ts";
import { unlink } from "./unlink.ts";

export type ComponentHandler = {
  id: string;
  handle: (context: Context) => Response | Promise<Response>;
};

export const HANDLERS = [
  signup,
  sendConfirmation,
  showConfirmationModal,
  confirmEmail,
  unlink,
];

export const getHandler = (id: string) => {
  const handler = HANDLERS.find((handler) => handler.id === id);

  if (!handler) {
    throw new Error(`handler ${id} not found`);
  }

  return handler;
};
