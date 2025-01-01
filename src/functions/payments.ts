import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export const paymentStatusSchema = z.enum(["accepted", "pending", "rejected"]);

export type Payment = z.infer<typeof paymentSchema>;
export const paymentSchema = z
  .object({
    orderID: z.number(),
    url: z.string().nullable(),
    path: z.string().nullable(),
    paid: z.number().nullable(),
    received: z.number().nullable(),
    status: paymentStatusSchema,
    platform: z.enum(["attachment", "mercadopago"]),
  })
  .and(databaseEntrySchema);

export async function getPaymentStatus(paymentID: number) {
  const url = `${vars.serverUrl}/api/v1/payments/${paymentID}`;
  const res = await axios.get(url, {
    params: {
      statusOnly: true,
    },
  });
  return paymentStatusSchema.parse(res.data);
}
