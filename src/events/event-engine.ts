// deno-lint-ignore-file no-explicit-any
import { Composer, z } from "deps.ts";

export const createEventSchema = <TEventType extends string, TData extends z.ZodTypeAny>(
  type: TEventType,
  schema: TData,
) =>
  z.object({
    type: z.literal<TEventType>(type),
    emittedAt: z.date(),
    data: schema,
  });

export const createEventFactory =
  <TEventType extends string, TData extends z.ZodTypeAny>(type: TEventType, dataSchema: TData) =>
  (
    data: z.infer<TData>,
  ) => ({
    type,
    emittedAt: new Date(),
    data: dataSchema.parse(data) as z.infer<TData>,
  });

export const defineEvent = <TType extends string, TData extends z.ZodTypeAny>(
  type: TType,
  dataSchema: TData,
) =>
  [
    createEventSchema(type, dataSchema),
    createEventFactory(type, dataSchema),
  ] as const;

type DistributedInferArray<T extends z.ZodTypeAny[]> = T extends any ? z.infer<T[number]> : never;

export class EventEngine<TEvents extends z.ZodTypeAny[]> extends Composer<DistributedInferArray<TEvents>> {
  constructor(private readonly kv: Deno.Kv, private readonly knownEvents: TEvents) {
    super();
  }

  emit(event: DistributedInferArray<TEvents>) {
    return this.kv.enqueue(event);
  }

  subscribe<TEvent extends TEvents[number]>(
    event: TEvent,
    listener: (data: z.infer<TEvent>) => void | Promise<void>,
  ) {
    return this.filter((e) => {
      return event.safeParse(e)?.success;
    }).use(async (ctx, next) => {
      await listener(ctx);
      return next(ctx);
    });
  }

  private isKnownEvent(event: unknown): event is DistributedInferArray<TEvents> {
    return this.knownEvents.some((schema) => schema.safeParse(event).success);
  }

  async listen() {
    await this.kv.listenQueue(async (event) => {
      if (!this.isKnownEvent(event)) return;
      await this.execute(event);
    });
  }
}
