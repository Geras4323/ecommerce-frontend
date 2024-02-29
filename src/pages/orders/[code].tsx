import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useQuery } from "@tanstack/react-query";
import { type Product, getProducts } from "@/functions/products";
import { CalendarDaysIcon, DollarSign, Hash, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { type OrderProduct, getOrder } from "@/functions/orders";
import { z } from "zod";
import Image from "next/image";
import { cn } from "@/utils/lib";
import NoImage from "../../../public/no_image.png";

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

  const orderQuery = useQuery({
    queryKey: ["order", codeID],
    queryFn: () => getOrder(parseInt(codeID)),
    enabled: !!isValidCode,
    retry: false,
  });

  return (
    <GeneralLayout title="Detalle del pedido" description="Detalle del pedido">
      <div className="mx-auto flex h-screen w-screen max-w-5xl flex-col gap-4 pb-24 pt-24">
        <h1 className="border-b border-b-secondary/20 py-2 text-xl font-medium">
          DETALLE DEL PEDIDO
        </h1>
        <section className="flex h-full w-full flex-row gap-4">
          <article className="flex h-full w-3/5 flex-col gap-4 overflow-y-auto">
            {orderQuery.data?.orderProducts?.map((item) => {
              const product = productsQuery.data?.find(
                (p) => p.id === item.productID
              );
              if (product)
                return (
                  <OrderItem key={item.id} item={item} product={product} />
                );
            })}
          </article>

          <article className="flex h-full w-2/5 flex-col gap-4 border-l border-l-secondary/20 pl-4">
            <div className="flex items-center gap-2">
              <Hash className="size-5 text-secondary" />
              <span className="text-lg text-secondary">Pedido Nro</span>
              <span className="text-xl font-medium text-primary">
                {orderQuery.data?.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="size-5 text-secondary" />
              <span className="text-lg text-secondary">Iniciado el</span>
              {orderQuery.data?.createdAt && (
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
              )}
            </div>

            <hr className="border-b border-t-0 border-b-secondary/20" />

            <div className="flex items-center gap-2">
              <DollarSign className="size-5 text-secondary" />
              <span className="text-lg text-secondary">Total a abonar:</span>
              {orderQuery.data?.total && (
                <div className="flex items-end gap-1">
                  <span className="text-lg text-primary">$</span>
                  <span className="text-xl text-primary">
                    {orderQuery.data.total.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>

            <button className="btn btn-outline">
              <Paperclip className="size-5" /> Adjuntar comprobante de pago
            </button>
          </article>
        </section>
      </div>
    </GeneralLayout>
  );
}

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
