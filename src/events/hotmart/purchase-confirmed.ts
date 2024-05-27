import { defineEvent } from "../event-engine.ts";
import { z } from "deps.ts";

export const [PurchaseConfirmedEvent, createPurchaseConfirmedEvent] = defineEvent(
  "purchase_confirmed",
  z.object({
    buyer: z.object({ email: z.string().email(), name: z.string() }),
    offer: z.string(),
  }),
);
