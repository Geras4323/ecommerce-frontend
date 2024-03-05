import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useQuery } from "@tanstack/react-query";
import { type Product, getProducts } from "@/functions/products";
import {
  CalendarDaysIcon,
  CreditCard,
  DollarSign,
  Hash,
  Info,
  Paperclip,
} from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { type OrderProduct, getOrder } from "@/functions/orders";
import { z } from "zod";
import Image from "next/image";
import { cn } from "@/utils/lib";
import NoImage from "../../../public/no_image.png";
import { withAuth } from "@/functions/session";
import { type ServerError } from "@/types/types";

type Day = keyof typeof days;
const days = {
  Sunday: "domingo",
  Monday: "lunes",
  Tuesday: "martes",
  Wednesday: "miércoles",
  Thursday: "jueves",
  Friday: "viernes",
  Saturday: "sábado",
} as const;

export default function Order() {
  const params = useParams();

  const codeID = z.string().catch("").parse(params?.code);
  const isValidCode = !isNaN(parseInt(codeID));

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const orderQuery = useQuery<
    Awaited<ReturnType<typeof getOrder>>,
    ServerError<string>
  >({
    queryKey: ["order", codeID],
    queryFn: () => getOrder(parseInt(codeID)),
    enabled: !!isValidCode,
    retry: false,
  });

  return (
    <GeneralLayout title="Detalle del pedido" description="Detalle del pedido">
      <div className="mx-auto flex h-screen w-screen max-w-5xl flex-col gap-4 pb-24 pt-24">
        <div className="flex w-full items-center gap-4 border-b border-b-secondary/20">
          <CreditCard className="size-6" />
          <h1 className="py-2 text-xl font-medium">DETALLE DEL PEDIDO</h1>
        </div>
        <section className="flex h-full w-full flex-row gap-4">
          <article className="flex h-full w-3/5 flex-col gap-4 overflow-y-auto">
            {productsQuery.isPending || orderQuery.isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <LoadingOrderItem key={i} />
              ))
            ) : productsQuery.isError || orderQuery.isError ? (
              <div className="flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-semibold text-primary">
                Se ha producido un error
              </div>
            ) : (
              orderQuery.data.orderProducts.map((item) => {
                const product = productsQuery.data.find(
                  (p) => p.id === item.productID
                );
                if (product)
                  return (
                    <OrderItem key={item.id} item={item} product={product} />
                  );
              })
            )}
          </article>

          <article className="flex h-full w-2/5 flex-col gap-4 border-l border-l-secondary/20 pl-4">
            <div className="flex items-center gap-2">
              <Hash className="size-5 text-secondary" />
              <span className="text-lg text-secondary">Pedido Nro</span>
              {orderQuery.isPending ? (
                <div className="h-7 w-20 animate-pulse rounded-lg bg-secondary/30" />
              ) : (
                <span className="text-xl font-medium text-primary">
                  {orderQuery.data?.id}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="size-5 text-secondary" />
              <span className="text-lg text-secondary">Iniciado el</span>
              {orderQuery.isPending ? (
                <div className="h-7 w-48 animate-pulse rounded-lg bg-secondary/30" />
              ) : (
                !orderQuery.isError && (
                  <>
                    <span className="text-primary">
                      {
                        days[
                          format(
                            new Date(orderQuery.data?.createdAt),
                            "EEEE"
                          ) as Day
                        ]
                      }
                    </span>
                    <span className="text-lg text-primary">
                      {format(new Date(), "dd-MM-yyyy")}
                    </span>
                  </>
                )
              )}
            </div>

            <hr className="border-b border-t-0 border-b-secondary/20" />

            <div className="flex items-center gap-2">
              <DollarSign className="size-5 text-secondary" />
              <span className="text-lg text-secondary">Total a abonar:</span>
              {orderQuery.isPending ? (
                <div className="h-7 w-32 animate-pulse rounded-lg bg-secondary/30" />
              ) : (
                !orderQuery.isError && (
                  <div className="flex items-end gap-1">
                    <span className="text-lg text-primary">$</span>
                    <span className="text-xl text-primary">
                      {orderQuery.data.total.toLocaleString("es-AR")}
                    </span>
                  </div>
                )
              )}
            </div>

            {!orderQuery.isPending && (
              <button className="btn btn-outline">
                <Paperclip className="size-5" /> Adjuntar comprobante de pago
              </button>
            )}

            <hr className="border-b border-t-0 border-b-secondary/20" />

            <div className="flex gap-2 text-info">
              <Info className="size-5" />
              Nos pondremos en contacto a la brevedad
            </div>
          </article>
        </section>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");

export function OrderItem({
  item,
  product,
}: {
  item: OrderProduct;
  product: Product;
}) {
  const price = item.quantity * product.price;

  return (
    <div className="flex h-28 w-full justify-between gap-6 rounded-xl border-2 border-secondary/20 p-4">
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

      <div className="flex h-full flex-col justify-center gap-2">
        <div className="flex w-full items-end justify-center gap-1 text-center">
          <span className="text-lg text-primary/70">$</span>
          <span className="text-xl text-primary">
            {price.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="flex h-8 w-24 items-end justify-center gap-2 rounded-lg">
          <div className="flex items-end gap-0.5">
            <span className="text-xl text-primary">{item.quantity}</span>
            <span className="text-base text-primary/70">x</span>
          </div>
          <div className="flex items-end gap-0.5">
            <span className="text-base text-primary/70">$</span>
            <span className="text-lg text-primary">
              {product.price.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingOrderItem() {
  return (
    <div className="flex h-28 w-full animate-pulse justify-between gap-6 rounded-xl border-2 border-secondary/20 p-4">
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

      {/* Price */}
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <div className="flex h-7 w-24 rounded-md bg-secondary/20" />

        <div className="flex h-7 w-32 rounded-lg bg-secondary/20" />
      </div>
    </div>
  );
}
