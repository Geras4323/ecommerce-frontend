import { getSession } from "@/functions/session";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export function useSession() {
  const sessionCookie = Cookies.get("ec_session");

  return useQuery({
    queryKey: ["session"],
    queryFn: () => getSession(sessionCookie ?? ""),
    staleTime: 30 * 1000,
    retry: false,
  });
}
