import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type Supplier = z.infer<typeof supplierSchema>;
export const supplierSchema = z
  .object({
    name: z.string(),
  })
  .and(databaseEntrySchema);

export async function getSuppliers() {
  const url = `${vars.serverUrl}/api/v1/suppliers`;
  const res = await axios.get(url, { withCredentials: true });
  return supplierSchema.array().parse(res.data);
}
