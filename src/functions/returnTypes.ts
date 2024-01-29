import { type z } from "zod";

export function nullToUndefined<T extends z.ZodSchema>(schema: T) {
  return schema.nullish().transform((s) => (s === null ? undefined : s));
}
