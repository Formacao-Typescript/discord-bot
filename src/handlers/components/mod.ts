import { Context } from "../types.ts";
import { confirmCodeButton } from "./confirm_code_button.ts";
import { confirmationModal } from "./confirmation_modal.ts";
import { signupButton } from "./signup_button.ts";
import { emailModal } from "./signup_modal.ts";
import { unlinkButton } from "./unlink_button.ts";

export type ComponentHandler = {
  id: string;
  handle: (context: Context) => Response | Promise<Response>;
};

export const HANDLERS = [
  signupButton,
  emailModal,
  unlinkButton,
  confirmCodeButton,
  confirmationModal,
];

export const getHandler = (id: string) => {
  const handler = HANDLERS.find((handler) => handler.id === id);

  if (!handler) {
    throw new Error(`handler ${id} not found`);
  }

  return handler;
};
