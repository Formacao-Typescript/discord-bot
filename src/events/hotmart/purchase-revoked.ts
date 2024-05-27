import { defineEvent } from "../event-engine.ts";
import { z } from "deps.ts";

export const [PurchaseRevokedEvent, createPurchaseRevokedEvent] = defineEvent(
  "purchase_revoked",
  z.object({
    buyer: z.object({ email: z.string().email(), name: z.string() }),
    offer: z.string(),
  }),
);
