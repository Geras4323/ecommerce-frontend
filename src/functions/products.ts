import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type ImageSchema = z.infer<typeof imageSchema>;
export const imageSchema = z
  .object({
    url: z.string(),
  })
  .and(databaseEntrySchema)
  .array();

export type Product = z.infer<typeof productSchema>;
export const productSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    orderProducts: z.any(),
    images: imageSchema,
    categoryID: z.number(),
    supplierID: z.number(),
  })
  .and(databaseEntrySchema);

export async function getProducts() {
  const url = `${vars.serverUrl}/api/v1/products`;
  const res = await axios.get(url);
  return productSchema.array().parse(res.data);
}
