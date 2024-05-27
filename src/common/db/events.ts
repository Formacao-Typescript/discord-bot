import { MongoClient } from "deps.ts";

export const enum EventType {
  PurchaseCanceled = "PURCHASE_CANCELED",
  PurchaseComplete = "PURCHASE_COMPLETE",
  PurchaseBilletPrinted = "PURCHASE_BILLET_PRINTED",
  PurchaseApproved = "PURCHASE_APPROVED",
  PurchaseProtest = "PURCHASE_PROTEST",
  PurchaseRefunded = "PURCHASE_REFUNDED",
  PurchaseChargeback = "PURCHASE_CHARGEBACK",
  PurchaseExpired = "PURCHASE_EXPIRED",
  PurchaseDelayed = "PURCHASE_DELAYED",
}

export type Event = {
  data: Data;
  hottok: string;
  id: string;
  creation_date: number;
  event: EventType;
  version: string;
};

export type Data = {
  product: Product;
  commissions: Commission[];
  purchase: Purchase;
  affiliates: Affiliate[];
  producer: Producer;
  subscription: Subscription;
  buyer: Buyer;
};

export type Affiliate = {
  affiliate_code: string;
  name: string;
};

export type Buyer = {
  name: string;
  checkout_phone: string;
  email: string;
};

export type Commission = {
  currency_value: string;
  source: string;
  value: number;
};

export type Producer = {
  name: string;
};

export type Product = {
  has_co_production: boolean;
  name: string;
  id: number;
  ucode: string;
};

export type Purchase = {
  offer: Offer;
  order_date: number;
  original_offer_price: Price;
  price: Price;
  checkout_country: CheckoutCountry;
  buyer_ip: string;
  order_bump: OrderBump;
  payment: Payment;
  approved_date: number;
  full_price: Price;
  transaction: string;
  status: string;
};

export type CheckoutCountry = {
  iso: string;
  name: string;
};

export type Price = {
  currency_value: string;
  value: number;
};

export type Offer = {
  code: string;
};

export type OrderBump = {
  parent_purchase_transaction: string;
  is_order_bump: boolean;
};

export type Payment = {
  refusal_reason?: string;
  installments_number: number;
  type: string;
};

export type Subscription = {
  subscriber: Offer;
  plan: Plan;
  status: string;
};

export type Plan = {
  name: string;
  id: number;
};

export function getEventsRepository(client: MongoClient) {
  const db = client.database("discord");
  const events = db.collection<Event & { received_at: Date }>("events");

  return {
    add: (params: Event) => events.insertOne({ ...params, received_at: new Date() }),
    findById: (id: string) => events.findOne({ id }),
  };
}

export type EventsRepository = ReturnType<typeof getEventsRepository>;
