import { z } from "zod";
import { databaseEntrySchema } from "@/types/types";
import axios from "axios";
import { vars } from "@/utils/vars";

export type Category = z.infer<typeof categorySchema>;
const categorySchema = z
  .object({
    name: z.string(),
    image: z.string().nullable(),
  })
  .and(databaseEntrySchema);

export async function getCategories() {
  const url = `${vars.serverUrl}/api/v1/categories`;
  const res = await axios.get(url);
  return categorySchema.array().parse(res.data);
}
