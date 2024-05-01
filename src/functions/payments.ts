import { databaseEntrySchema } from "@/types/types";
import { z } from "zod";

export type Payment = z.infer<typeof paymentSchema>;
export const paymentSchema = z
  .object({
    orderID: z.number(),
    url: z.string(),
    name: z.string(),
  })
  .and(databaseEntrySchema);
