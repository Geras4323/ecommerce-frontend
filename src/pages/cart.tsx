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
import {
  Check,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Undo2,
} from "lucide-react";
import Image from "next/image";
import NoImage from "../../public/no_image.png";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import axios, { type AxiosError } from "axios";
import { LoadableButton } from "@/components/forms";
import { type OrderItem } from "@/functions/orders";
import { type Session, withAuth } from "@/functions/session";
import Link from "next/link";
import { useSession } from "@/hooks/session";
import { format } from "date-fns";
import { OrderConfirmationModal } from "@/components/modals/cart";
import { useState } from "react";
import { getCategories } from "@/functions/categories";

export default function Cart() {
  const { session } = useSession();
  const cart = useShoppingCart();

  const queryClient = useQueryClient();

  const [confirmedOrder, setConfirmedOrder] = useState<OrderItem | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
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
      if (session.data) {
        discordNotifyMutation.mutate({
          session: session.data,
          order: order.data,
        });
      }
      setConfirmedOrder(order.data);
    },
  });

  const discordNotifyMutation = useMutation<
    void,
    AxiosError,
    { session: Session; order: OrderItem }
  >({
    mutationFn: async (data) => {
      const products: { name?: string; value: string; inline: boolean }[] = [];

      data.order.orderProducts?.map((item) => {
        return products.push({
          name: productsQuery.data?.find((p) => p.id === item.productID)?.name,
          value: `x ${item.quantity}`,
          inline: true,
        });
      });

      return axios.postForm(`${vars.discordNotify}`, {
        payload_json: JSON.stringify({
          embeds: [
            {
              title: `Nuevo pedido`,
              description: `
                **Nombre**: \`${data.session.name} ${data.session.surname}\`

                **Email**:  \`${data.session.email}\`

                **Número de teléfono**:  \`${data.session.phone ?? "-"}\`


                **Número de orden**: \`${data.order.id}\`
                **Fecha**: \`${format(
                  new Date(data.order.createdAt),
                  "dd-MM-yyyy HH:mm"
                )}\`

                **Total**:  \`$${total?.toLocaleString("es-AR")}\`

                **Descripción**:
              `,
              fields: products,
              color: 65280,
            },
          ],
        }),
      });
    },
    onError: (err) => console.log(err),
  });

  return (
    <GeneralLayout title="Carrito" description="Carrito de compras">
      {/* ITEMS */}
      <section className="mx-auto flex max-h-screen w-screen max-w-screen-sm flex-col gap-4 px-4 pb-4 pt-24 sm:max-w-screen-lg md:max-w-screen-xl">
        <div className="flex h-fit flex-col items-end justify-between gap-6 border-b border-b-secondary/20 pb-3 pt-2 md:flex-row">
          <div className="flex w-full items-center gap-4 text-primary md:w-fit">
            <Link href="/showroom" className="btn btn-ghost btn-sm">
              <ChevronLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-4">
              <ShoppingCart className="hidden size-6" />
              <h1 className="text-xl font-medium">CARRITO DE COMPRAS</h1>
            </div>
          </div>

          {cart.cartItems.data?.length !== 0 && (
            <div className="flex w-full items-end justify-end gap-4 md:w-fit">
              <span className="hidden text-lg font-medium text-primary xs:block">
                TOTAL
              </span>
              {cart.cartItems.isPending ? (
                <div className="flex h-8 w-32 animate-pulse rounded-lg bg-secondary/20" />
              ) : (
                <div className="flex items-end gap-1">
                  <span className="text-xl text-primary/70">$</span>
                  <span className="text-2xl text-primary">
                    {total?.toLocaleString("es-AR")}
                  </span>
                </div>
              )}

              <span className="hidden pb-0.5 text-xl text-secondary">|</span>

              {cart.cartItems.data?.length !== 0 && (
                <LoadableButton
                  onClick={() => createOrderMutation.mutate()}
                  isPending={createOrderMutation.isPending}
                  className="btn btn-primary btn-sm ml-1 w-48"
                  animation="dots"
                  disabled={cart.cartItems.isPending}
                >
                  <Check className="size-5" />
                  Confirmar pedido
                </LoadableButton>
              )}
            </div>
          )}
        </div>

        <div className="grid h-auto w-full grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
          {productsQuery.isPending || cart.cartItems.isPending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CartItemSkeleton key={i} />
            ))
          ) : productsQuery.isError || cart.cartItems.isError ? (
            <div className="col-span-2 flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-semibold text-primary">
              Se ha producido un error
            </div>
          ) : cart.cartItems.data.length === 0 ? (
            <div className="col-span-2 mx-auto mt-4 flex w-fit items-center justify-center gap-4">
              <p className="text-xl">El carrito está vacío</p>
              <Link href="/showroom" className="btn btn-primary btn-sm">
                <Undo2 className="size-4" />
                Volver al showroom
              </Link>
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
                    category={
                      categoriesQuery.data?.find(
                        (category) => category.id === product.categoryID
                      )?.name
                    }
                  />
                );
            })
          )}
        </div>
      </section>

      {confirmedOrder && session.data && (
        <OrderConfirmationModal
          isOpen={!!confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          order={confirmedOrder}
          email={session.data.email}
        />
      )}
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");

export function CartItemSkeleton() {
  return (
    <div className="flex h-40 w-full animate-pulse flex-col justify-between gap-2 rounded-xl border-2 border-secondary/20 p-4 lg:h-28 lg:flex-row">
      <div className="flex w-full flex-row gap-6">
        {/* Image */}
        <div className="size-16 min-w-16 rounded-full bg-secondary/20" />
        {/* Data */}
        <div className="flex w-full flex-col gap-2">
          <div className="h-6 w-4/5 rounded-md bg-secondary/20 pr-4" />
          <div className="h-6 w-1/4 min-w-20 rounded-md bg-secondary/20 pr-4" />
        </div>
      </div>

      <div className="flex h-full flex-row items-end justify-end gap-4 lg:mr-6 lg:flex-col lg:items-center lg:justify-center lg:gap-2">
        {/* Price */}
        <div className="flex h-8 w-24 rounded-md bg-secondary/20 lg:w-24 lg:items-end" />

        <div className="flex h-8 w-28 items-center rounded-md bg-secondary/20" />
      </div>
    </div>
  );
}

export function CartItem({
  item,
  updateItem,
  removeItem,
  product,
  category,
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
  category?: string;
}) {
  const price = item.quantity * product.price;

  return (
    <div className="relative flex h-40 w-full flex-col justify-between gap-2 rounded-xl border-2 border-secondary/20 p-4 lg:h-28 lg:flex-row">
      <Trash2
        onClick={() => removeItem.mutate({ id: item.id })}
        className="absolute right-2 top-2 size-5 cursor-pointer text-secondary/60 transition-all hover:text-error"
      />

      <div className="flex flex-row gap-6">
        <Image
          alt="product"
          width={50}
          height={50}
          src={product.images[0]?.url ?? NoImage}
          className={cn(
            !product.images[0]?.url && "opacity-50 blur-[1px]",
            "size-16 min-w-16 rounded-full border border-secondary/30"
          )}
        />
        <div className="flex flex-col gap-2">
          <span className="pr-4 text-primary">{product.name}</span>
          <div className="flex flex-col gap-0.5 text-secondary">{category}</div>
        </div>
      </div>

      <div className="flex h-full flex-row items-end justify-end gap-4 lg:mr-6 lg:flex-col lg:justify-center lg:gap-2">
        <div className="flex w-fit items-center justify-center gap-1 text-center lg:w-full lg:items-end">
          <span className="text-base text-primary/70">$</span>
          <span className="text-xl text-primary lg:text-lg">
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
