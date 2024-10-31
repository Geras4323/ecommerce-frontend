import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";
import { imageSchema } from "./images";

export type Product = z.infer<typeof productSchema>;
export const productSchema = z
  .object({
    code: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    position: z.number(),
    listed: z.boolean(),
    images: imageSchema.array(),
    categoryID: z.number(),
    supplierID: z.number(),
  })
  .and(databaseEntrySchema);

export async function getProducts(showAll = false) {
  const url = `${vars.serverUrl}/api/v1/products`;
  const res = await axios.get(url, {
    withCredentials: true,
    params: { showAll },
  });
  return productSchema.array().parse(res.data);
}

export async function getProduct(productID: number) {
  const url = `${vars.serverUrl}/api/v1/products/${productID}`;
  const res = await axios.get(url, { withCredentials: true });
  return productSchema.parse(res.data);
}
