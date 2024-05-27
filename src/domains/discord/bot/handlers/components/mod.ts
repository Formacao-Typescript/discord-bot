import { Context } from "../types.ts";
import { confirmEmail } from "./confirm_email.ts";
// import { retryEvent } from "./retry_event.ts";
import { sendConfirmation } from "./send_confirmation.ts";
import { showConfirmationModal } from "./show_confirmation_modal.ts";
import { signup } from "./signup.ts";
import { unlink } from "./unlink.ts";

export type ComponentHandler = {
  id: string | RegExp;
  handle: (context: Context, id: string) => Response | Promise<Response>;
};

export const HANDLERS = [
  signup,
  sendConfirmation,
  showConfirmationModal,
  confirmEmail,
  unlink,
  // retryEvent,
];

export const getHandler = (id: string) => {
  const handler = HANDLERS.find((handler) => {
    return typeof handler.id === "string" ? handler.id === id : handler.id.test(id);
  });

  if (!handler) {
    throw new Error(`handler ${id} not found`);
  }

  return handler;
};
