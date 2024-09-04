import { vars } from "@/utils/vars";
import axios from "axios";
import { z } from "zod";

export type State = z.infer<typeof stateSchema>;
export const stateSchema = z.object({
  name: z.enum(["vacation"]),
  active: z.boolean(),
});

export async function getVacationState() {
  const url = `${vars.serverUrl}/api/v1/states/vacation`;
  const res = await axios.get(url, { withCredentials: true });
  return stateSchema.parse(res.data);
}
