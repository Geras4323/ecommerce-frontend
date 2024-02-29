import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type OrderProduct = z.infer<typeof orderProductSchema>;
export const orderProductSchema = z
  .object({
    quantity: z.number(),
    productID: z.number(),
  })
  .and(databaseEntrySchema);

export type BaseOrder = z.infer<typeof baseOrderSchema>;
export const baseOrderSchema = z
  .object({
    userID: z.number(),
    total: z.number(),
    // orderProducts: orderProductSchema.array().nullable(),
    // products: z.number(),
  })
  .and(databaseEntrySchema);

export type OrderItem = z.infer<typeof orderSchema>;
export const orderSchema = baseOrderSchema.and(
  z.object({
    orderProducts: orderProductSchema.array(),
  })
);

export type OrdersItem = z.infer<typeof ordersSchema>;
export const ordersSchema = baseOrderSchema.and(
  z.object({ products: z.number() })
);

export async function getOrders() {
  const url = `${vars.serverUrl}/api/v1/orders/my-orders`;
  const res = await axios.get(url, { withCredentials: true });
  return ordersSchema.array().parse(res.data);
}

export async function getOrder(orderID: number) {
  const url = `${vars.serverUrl}/api/v1/orders/${orderID}`;
  const res = await axios.get(url, { withCredentials: true });
  return orderSchema.parse(res.data);
}
