import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";
import { sessionSchema } from "./session";
import { paymentSchema } from "./payments";

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
    state: z.number(),
  })
  .and(databaseEntrySchema);

export type OrdersItem = z.infer<typeof ordersSchema>;
export const ordersSchema = baseOrderSchema.and(
  z.object({
    products: z.number(),
    user: sessionSchema.optional(),
  })
);

export type MyOrdersItem = z.infer<typeof myOrdersSchema>;
export const myOrdersSchema = baseOrderSchema.and(
  z.object({
    products: z.number(),
  })
);

export type OrderItem = z.infer<typeof orderSchema>;
export const orderSchema = baseOrderSchema.and(
  z.object({
    orderProducts: orderProductSchema.array(),
    user: sessionSchema,
    payments: paymentSchema.array(),
  })
);

export async function getOrders() {
  const url = `${vars.serverUrl}/api/v1/orders`;
  const res = await axios.get(url, { withCredentials: true });
  return ordersSchema.array().parse(res.data);
}

export async function getMyOrders() {
  const url = `${vars.serverUrl}/api/v1/orders/my-orders`;
  const res = await axios.get(url, { withCredentials: true });
  return myOrdersSchema.array().parse(res.data);
}

export async function getOrder(orderID: number) {
  const url = `${vars.serverUrl}/api/v1/orders/${orderID}`;
  const res = await axios.get(url, { withCredentials: true });
  return orderSchema.parse(res.data);
}
