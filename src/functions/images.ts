import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type ProductImage = z.infer<typeof imageSchema>;
export const imageSchema = z
  .object({
    url: z.string(),
  })
  .and(databaseEntrySchema);

export async function getImages() {
  const url = `${vars.serverUrl}/api/v1/images`;
  const res = await axios.get(url, { withCredentials: true });
  return imageSchema.array().parse(res.data);
}
