import { Composer, Middleware } from "../deps.ts";
import { Event, EventType } from "./db/events.ts";

type MaybeArray<T> = T | Array<T>;
type Context = {
  event: Event;
};

export class HotmartComposer<T extends Context> extends Composer<T> {
  public on(eventType: MaybeArray<EventType>, ...middleware: Middleware<T>[]) {
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType];

    return this.filter((ctx) => eventTypes.includes(ctx.event.event), ...middleware);
  }
}
