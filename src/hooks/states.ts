import { getState } from "@/functions/states";
import { useQuery } from "@tanstack/react-query";

export const useVacation = () => {
  const query = useQuery({
    queryKey: ["vacation"],
    queryFn: () => getState("vacation"),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });

  return query;
};

export const useMercadopago = () => {
  const query = useQuery({
    queryKey: ["mercadopago"],
    queryFn: () => getState("mercadopago"),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });

  return query;
};

export const useUnits = () => {
  const query = useQuery({
    queryKey: ["units"],
    queryFn: () => getState("units"),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });

  return query;
};
