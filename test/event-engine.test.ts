// deno-lint-ignore-file no-explicit-any
import { defineEvent, EventEngine } from "../src/events/event-engine.ts";
import { mock } from "./deps.ts";
import { z } from "deps.ts";

Deno.test("event engine", async () => {
  const [schema, factory] = defineEvent("test_event", z.object({ value: z.number() }));
  const [schema2, factory2] = defineEvent("test_event2", z.object({ value2: z.number() }));

  const listeners: Array<(...params: any[]) => any> = [];
  const kv = {
    listenQueue: (listener: (...params: any[]) => any) => {
      listeners.push(listener);
    },
    async enqueue(value: any) {
      for (const listener of listeners) {
        await listener(value);
      }
    },
  } as unknown as Deno.Kv;

  const handler = mock.spy(() => {});
  const handler2 = mock.spy(() => {});
  const handler3 = mock.spy(() => {});
  const event = factory({ value: 42 });
  const event2 = factory2({ value2: 42 });

  const eventBus = new EventEngine(kv, [schema, schema2]);

  eventBus.subscribe(schema, handler);
  eventBus.subscribe(schema, handler2);
  eventBus.subscribe(schema2, handler3);

  await eventBus.listen();

  await eventBus.emit(event);
  await eventBus.emit(event2);

  mock.assertSpyCallArgs(handler, 0, [event]);
  mock.assertSpyCallArgs(handler2, 0, [event]);
  mock.assertSpyCallArgs(handler3, 0, [event2]);

  console.log(event);
});
