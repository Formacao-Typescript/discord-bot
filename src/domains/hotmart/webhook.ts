import { json } from "deps.ts";
import { createPurchaseConfirmedEvent } from "../../events/hotmart/purchase-confirmed.ts";
import { createPurchaseRevokedEvent } from "../../events/hotmart/purchase-revoked.ts";
import { getStorage } from "../../common/db/db.ts";
import { Event, EventType } from "../../common/db/events.ts";
import { eventBus } from "../../events/event-bus.ts";

const httpError = (code: string, message: string, status: number) =>
  json({
    ok: false,
    error: {
      code,
      message,
    },
  }, {
    status,
  });

export async function handleWebhookRequest(request: Request) {
  const storage = getStorage();
  const event: Event | undefined = await request.json().catch(() => undefined);

  if (!event) return httpError("bad_request", "cannot parse request body", 400);
  if (!event.data.buyer.email) return httpError("unprocessable_entity", "missing email field", 422);

  await storage.events.add(event);

  if (event.event === EventType.PurchaseApproved) {
    await eventBus.emit(createPurchaseConfirmedEvent({
      buyer: event.data.buyer,
      offer: event.data.purchase.offer.code,
    }));
  }

  if (event.event === EventType.PurchaseProtest || event.event === EventType.PurchaseCanceled) {
    await eventBus.emit(createPurchaseRevokedEvent({
      buyer: event.data.buyer,
      offer: event.data.purchase.offer.code,
    }));
  }

  return new Response(null, { status: 202 });
}
