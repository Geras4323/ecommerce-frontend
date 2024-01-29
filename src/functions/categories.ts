import { z } from "zod";
import { databaseEntrySchema } from "@/types/types";
import axios from "axios";
import { vars } from "@/utils/vars";
import { nullToUndefined } from "./returnTypes";

export type Category = z.infer<typeof categorySchema>;
const categorySchema = z
  .object({
    code: nullToUndefined(z.string()),
    name: z.string(),
    image: nullToUndefined(z.string()),
  })
  .and(databaseEntrySchema);

export async function getCategories() {
  const url = `${vars.serverUrl}/api/v1/categories`;
  const res = await axios.get(url);
  return categorySchema.array().parse(res.data);
}
