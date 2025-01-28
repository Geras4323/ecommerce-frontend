import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type State = z.infer<typeof stateSchema>;
export const stateSchema = z.object({
  name: z.enum(["vacation", "mercadopago", "units"]),
  active: z.boolean(),
  from: z.string().nullable(),
  to: z.string().nullable(),
});

export async function getState(state: State["name"]) {
  const url = `${vars.serverUrl}/api/v1/states/${state}`;
  const res = await axios.get(url, { withCredentials: true });
  return stateSchema.parse(res.data);
}
