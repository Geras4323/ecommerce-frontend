import {
  createCartItem,
  deleteCartItem,
  getCartItems,
  updateCartItem,
} from "@/functions/cart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./session";
import type { ServerError } from "@/types/types";

export function useShoppingCart() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const refetchProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const cartItems = useQuery<
    Awaited<ReturnType<typeof getCartItems>>,
    ServerError
  >({
    queryKey: ["cart"],
    queryFn: getCartItems,
    enabled: !!session.data,
    retry: false,
    staleTime: 1000 * 30,
  });

  const addCartItem = useMutation<
    any,
    ServerError,
    { productID: number; quantity: number }
  >({
    mutationFn: (data) => createCartItem(data.productID, data.quantity),
    onSuccess: refetchProducts,
  });

  const modifyCartItem = useMutation<
    any,
    ServerError,
    { id: number; quantity: number }
  >({
    mutationFn: (data) => updateCartItem(data.id, data.quantity),
    onSuccess: refetchProducts,
  });

  const removeCartItem = useMutation<any, ServerError, { id: number }>({
    mutationFn: (data) => deleteCartItem(data.id),
    onSuccess: refetchProducts,
  });

  return {
    cartItems,
    addCartItem,
    modifyCartItem,
    removeCartItem,
  };
}
