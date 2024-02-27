import type { TCartItem } from "@/functions/cart";
import { Product, getProducts } from "@/functions/products";
import { useShoppingCart } from "@/hooks/cart";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import type { ServerError, ServerSuccess } from "@/types/types";
import {
  useQuery,
  type UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { Check, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import NoImage from "../../public/no_image.png";
import { cn } from "@/utils/lib";
import { Order } from "@/functions/orders";
import { vars } from "@/utils/vars";
import { useSession } from "@/hooks/session";
import axios from "axios";

export default function Cart() {
  const session = useSession();
  const cart = useShoppingCart();

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
    ServerSuccess<Order>,
    ServerError,
    void
  >({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/orders/user/${session.data?.id}`;
      const items = cart.cartItems.data?.map((d) => ({
        productID: d.productID,
        quantity: d.quantity,
      }));
      return axios.post(url, items, { withCredentials: true });
    },
  });

  return (
    <GeneralLayout title="Carrito" description="Carrito de compras">
      <div className="mx-auto flex h-fit gap-8 pt-24">
        {/* ITEMS */}
        <section className="mb-8 flex w-screen max-w-7xl flex-col gap-4">
          <div className="flex h-fit items-end justify-between border-b border-b-secondary/20 py-2">
            <h2 className="text-xl font-medium">CARRITO DE COMPRAS</h2>

            <div className="flex items-end gap-4">
              <h2 className="text-lg font-medium">TOTAL</h2>
              <div className="flex items-end gap-1">
                <span className="text-xl text-primary/70">$</span>
                <span className="text-2xl text-primary">
                  {total?.toLocaleString("es-AR")}
                </span>
              </div>
              <span className="pb-0.5 text-xl text-secondary">|</span>
              <button
                onClick={() => createOrderMutation.mutate()}
                className="btn btn-primary btn-sm ml-1"
              >
                <Check className="size-5" />
                Confirmar pedido
              </button>
            </div>
          </div>

          <div className="grid h-auto w-full grid-cols-1 gap-6 xl:grid-cols-2">
            {productsQuery.data &&
              cart.cartItems.data?.map((item) => {
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
              })}
          </div>
        </section>
      </div>
    </GeneralLayout>
  );
}

function CartItem({
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

        <div className="flex h-8 w-full items-center rounded-lg">
          <button
            onClick={() =>
              updateItem.mutate({ id: item.id, quantity: --item.quantity })
            }
            disabled={item.quantity === 1}
            className="flex h-8 w-8 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0"
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
