import { databaseEntrySchema } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type ProductImage = z.infer<typeof imageSchema>;
export const imageSchema = z
  .object({
    url: z.string(),
    position: z.number(),
  })
  .and(databaseEntrySchema);

export async function getImages(limit: number) {
  const url = `${vars.serverUrl}/api/v1/images?limit=${limit}`;
  const res = await axios.get(url, { withCredentials: true });
  return imageSchema.array().parse(res.data);
}
