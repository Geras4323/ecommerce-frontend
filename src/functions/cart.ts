import { databaseEntrySchema } from "@/types/types";
import { type MeasurementUnitsValue } from "@/utils/measurement";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type TCartItem = z.infer<typeof cartItemSchema>;
export const cartItemSchema = z
  .object({
    userID: z.number(),
    productID: z.number(),
    quantity: z.number(),
  })
  .and(databaseEntrySchema);

// QUERIES /////////////////////////////////////////////////////////////////////
export async function getCartItems() {
  const url = `${vars.serverUrl}/api/v1/cart`;
  const res = await axios.get(url, { withCredentials: true });
  return cartItemSchema.array().parse(res.data);
}
// QUERIES /////////////////////////////////////////////////////////////////////

// MUTATIONS ///////////////////////////////////////////////////////////////////
export async function createCartItem(
  productID: number,
  quantity: number,
  unit: MeasurementUnitsValue
) {
  const url = `${vars.serverUrl}/api/v1/cart`;
  const res = await axios.post(
    url,
    { productID, quantity, unit },
    { withCredentials: true }
  );
  return cartItemSchema.parse(res.data);
}

export async function updateCartItem(id: number, quantity: number) {
  const url = `${vars.serverUrl}/api/v1/cart/${id}`;
  const res = await axios.patch(url, { quantity }, { withCredentials: true });
  return cartItemSchema.parse(res.data);
}

export async function deleteCartItem(id: number) {
  const url = `${vars.serverUrl}/api/v1/cart/${id}`;
  const res = await axios.delete(url, { withCredentials: true });
  return res.data;
}
// MUTATIONS ///////////////////////////////////////////////////////////////////
