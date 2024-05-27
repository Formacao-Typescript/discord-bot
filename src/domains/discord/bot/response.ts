import { InteractionCallbackData, InteractionResponse, InteractionResponseTypes, json } from "deps.ts";
import { Modal } from "./components/modal.ts";

export const EPHEMERAL_MESSAGE_FLAG = 64;

const interactionResponse = (response: InteractionResponse) => {
  return json(response);
};

export function reply(
  message: string,
  other: Partial<{ ephemeral: boolean } & Omit<InteractionCallbackData, "content">> = {},
) {
  const { ephemeral, ...otherParams } = other;
  return interactionResponse({
    type: InteractionResponseTypes.ChannelMessageWithSource,
    data: {
      tts: false,
      embeds: [],
      allowedMentions: { parse: [] },
      content: message,
      ...(ephemeral ? { flags: EPHEMERAL_MESSAGE_FLAG } : {}),
      ...otherParams,
    },
  });
}

export function defer(data: InteractionResponse["data"] = {}) {
  return interactionResponse({
    type: InteractionResponseTypes.DeferredChannelMessageWithSource,
    data,
  });
}

export function pong() {
  return interactionResponse({
    type: InteractionResponseTypes.Pong,
  });
}

export function deferUpdateMessage(data: InteractionResponse["data"] = {}) {
  return interactionResponse({
    type: InteractionResponseTypes.DeferredUpdateMessage,
    data,
  });
}

export function sendModal(modal: Modal) {
  return interactionResponse({
    type: InteractionResponseTypes.Modal,
    // deno-lint-ignore no-explicit-any
    data: modal.build() as any,
  });
}
