import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type DatabaseLike = {
  prepare: (...args: unknown[]) => unknown;
};

export const dbSchema = schema;

export function getDb(env?: { DB?: DatabaseLike }) {
  const injected = env?.DB ?? (globalThis as Record<string, unknown>).DB as DatabaseLike | undefined;

  if (!injected) {
    return null;
  }

  return drizzle(injected as never, { schema });
}
