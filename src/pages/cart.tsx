import type { TCartItem } from "@/functions/cart";
import { type Product, getProducts } from "@/functions/products";
import { useShoppingCart } from "@/hooks/cart";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import type { ServerError, ServerSuccess } from "@/types/types";
import {
  useQuery,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Check, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import NoImage from "../../public/no_image.png";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import axios from "axios";
import { LoadableButton } from "@/components/forms";
import { useRouter } from "next/router";
import { type OrderItem } from "@/functions/orders";
import { withAuth } from "@/functions/session";

export default function Cart() {
  const cart = useShoppingCart();

  const router = useRouter();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const total = cart.cartItems.data?.reduce((acc, curr) => {
    const product = productsQuery.data?.find((p) => p.id === curr.productID);
    if (!product) return 0;

    const price = curr.quantity * product?.price;
    return acc + price;
  }, 0);

  const createOrderMutation = useMutation<
    ServerSuccess<OrderItem>,
    ServerError,
    void
  >({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/orders`;
      const items = cart.cartItems.data?.map((d) => ({
        productID: d.productID,
        quantity: d.quantity,
      }));
      return axios.post(url, items, { withCredentials: true });
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push(`/orders/${order.data.id}`);
    },
  });

  return (
    <GeneralLayout title="Carrito" description="Carrito de compras">
      {/* ITEMS */}
      <section className="mx-auto mb-8 flex w-screen max-w-7xl flex-col gap-4 pt-24">
        <div className="flex h-fit items-end justify-between border-b border-b-secondary/20 py-2">
          <h2 className="text-xl font-medium">CARRITO DE COMPRAS</h2>

          <div className="flex items-end gap-4">
            <h2 className="text-lg font-medium">TOTAL</h2>
            {cart.cartItems.isPending ? (
              <div className="flex h-8 w-32 animate-pulse rounded-lg bg-secondary/30" />
            ) : (
              <div className="flex items-end gap-1">
                <span className="text-xl text-primary/70">$</span>
                <span className="text-2xl text-primary">
                  {total?.toLocaleString("es-AR")}
                </span>
              </div>
            )}

            <span className="pb-0.5 text-xl text-secondary">|</span>

            {cart.cartItems.data?.length !== 0 && (
              <LoadableButton
                onClick={() => createOrderMutation.mutate()}
                isPending={createOrderMutation.isPending}
                className="btn btn-primary btn-sm ml-1"
              >
                <Check className="size-5" />
                Confirmar pedido
              </LoadableButton>
            )}
          </div>
        </div>

        <div className="grid h-auto w-full grid-cols-1 gap-6 xl:grid-cols-2">
          {productsQuery.isPending || cart.cartItems.isPending ? (
            Array.from({ length: 4 }).map((_, i) => <LoadingCartItem key={i} />)
          ) : productsQuery.isError || cart.cartItems.isError ? (
            <div className="col-span-2 flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-semibold text-primary">
              Se ha producido un error
            </div>
          ) : (
            cart.cartItems.data.map((item) => {
              const product = productsQuery.data.find(
                (p) => p.id === item.productID
              );
              if (product)
                return (
                  <CartItem
                    key={item.id}
                    item={item}
                    removeItem={cart.removeCartItem}
                    updateItem={cart.modifyCartItem}
                    product={product}
                  />
                );
            })
          )}
        </div>
      </section>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");

export function CartItem({
  item,
  updateItem,
  removeItem,
  product,
}: {
  item: TCartItem;
  updateItem: UseMutationResult<
    any,
    ServerError,
    {
      id: number;
      quantity: number;
    },
    unknown
  >;
  removeItem: UseMutationResult<
    any,
    ServerError,
    {
      id: number;
    },
    unknown
  >;
  product: Product;
}) {
  const price = item.quantity * product.price;

  return (
    <div className="relative flex h-28 w-full justify-between rounded-xl border-2 border-secondary/20 p-4">
      <Trash2
        onClick={() => removeItem.mutate({ id: item.id })}
        className="absolute right-2 top-2 size-5 cursor-pointer text-secondary/60 transition-all hover:text-error"
      />

      <div className="flex flex-row gap-4">
        <Image
          alt="product"
          width={50}
          height={50}
          src={product.images[0]?.url ?? NoImage}
          className={cn(
            !product.images[0]?.url && "opacity-50 blur-[1px]",
            "size-16 rounded-full border border-secondary/30"
          )}
        />
        <div className="flex flex-col gap-2">
          <span className="text-primary">{product.name}</span>
          <div className="flex flex-col gap-0.5 text-secondary">
            {product.description.split("\n").map((t, i) => {
              if (i < 2) return <p key={i}>{t}</p>;
            })}
          </div>
        </div>
      </div>

      <div className="mr-6 flex h-full flex-col justify-center gap-2">
        <div className="flex w-full items-end justify-center gap-1 text-center">
          <span className="text-base text-primary/70">$</span>
          <span className="text-lg text-primary">
            {price.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="flex h-8 w-24 items-center rounded-lg">
          <button
            onClick={() =>
              updateItem.mutate({ id: item.id, quantity: --item.quantity })
            }
            disabled={item.quantity === 1}
            className="flex h-8 w-8 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0 disabled:text-secondary/50"
          >
            <Minus className="size-4" />
          </button>
          <input
            value={item.quantity}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num))
                // updateItem.mutate({ id: item.id, quantity: num > 0 ? num : 1 });
                updateItem.mutate({ id: item.id, quantity: num });
            }}
            className="btn-sm m-0 h-8 w-full max-w-10 rounded-none border-y-2 border-y-secondary/20 bg-base-100/70 p-1 text-center font-semibold outline-none"
          />
          <button
            onClick={() =>
              updateItem.mutate({ id: item.id, quantity: ++item.quantity })
            }
            className="flex h-8 w-8 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoadingCartItem() {
  return (
    <div className="flex h-28 w-full animate-pulse justify-between rounded-xl border-2 border-secondary/20 p-4">
      <div className="flex flex-row gap-4">
        {/* Image */}
        <div className="size-16 rounded-full bg-secondary/20" />

        {/* Title and description */}
        <div className="flex flex-col gap-2">
          <div className="h-8 w-80 rounded-md bg-secondary/20" />
          <div className="h-8 w-56 rounded-md bg-secondary/20" />
          <div className="h-8 w-52 rounded-md bg-secondary/20" />
        </div>
      </div>

      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="flex h-6 w-24 rounded-md bg-secondary/20" />

        <div className="flex h-7 w-28 rounded-lg bg-secondary/20" />
      </div>
    </div>
  );
}
