import { vars } from "@/utils/vars";
import axios from "axios";

export async function verifyEmail(token: string) {
  const url = `${vars.serverUrl}/api/v1/auth/signup/verify/${token}`;
  const options = { withCredentials: true };
  return axios.post(url, null, options);
}
