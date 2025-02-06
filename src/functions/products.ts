import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";
import { imageSchema } from "./images";
import { measurementUnitsValues } from "@/utils/measurement";

export type Unit = z.infer<typeof unitSchema>;
export const unitSchema = z.object({
  unit: z.enum(measurementUnitsValues as [string, ...string[]]),
  price: z.number(),
});

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
    units: unitSchema.array(),
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
