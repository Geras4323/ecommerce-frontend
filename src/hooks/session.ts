import { getSession } from "@/functions/session";
import { useQuery } from "@tanstack/react-query";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => getSession(),
    staleTime: 30 * 1000,
    retry: false,
  });
}
