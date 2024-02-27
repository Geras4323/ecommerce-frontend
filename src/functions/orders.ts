import { z } from "zod";

export type Order = z.infer<typeof orderSchema>;
export const orderSchema = z.object({
  userID: z.number(),
  total: z.number(),
});
