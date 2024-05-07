import { getSession } from "@/functions/session";
import { vars } from "@/utils/vars";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";

export function useSession() {
  const router = useRouter();

  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => getSession(),
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/auth/logout`;
      return axios.post(url, null, { withCredentials: true });
    },
    onSuccess: () => router.reload(),
  });

  return { session, logoutMutation };
}
