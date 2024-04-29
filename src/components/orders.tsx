import type {
  OrderProduct,
  OrdersItem as TOrdersItem,
} from "@/functions/orders";
import { type Product } from "@/functions/products";
import { cn } from "@/utils/lib";
import { type Day, days } from "@/utils/miscellaneous";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Hash,
  Mail,
  Package,
  PackageOpen,
  Phone,
  Truck,
  User2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NoImage from "../../public/no_image.png";
import { useEffect, useState } from "react";
import { type States } from "src/pages/administration/orders/[code]";

export function OrdersItem({
  item,
  fromAdmin = false,
}: {
  item: TOrdersItem;
  fromAdmin?: boolean;
}) {
  const [orderState, setOrderState] = useState<States>({
    confirmed: 0,
    payed: 0,
    sent: 0,
    delivered: 0,
  });

  useEffect(() => {
    const dbStates = item.state.toString(2).padStart(4, "0").split("");

    setOrderState((prev) => {
      const tempOrders = Object.entries(structuredClone(prev));
      dbStates.forEach((v, i) => {
        tempOrders[i]![1] = parseInt(v);
      });
      return Object.fromEntries(tempOrders) as States;
    });
  }, [item.state]);

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 rounded-xl border-2 border-secondary/20 p-4">
      <section className="flex w-full items-center justify-between gap-6">
        <article className="flex h-full w-1/2 flex-col gap-4">
          <div className="flex items-center gap-2">
            <Hash className="size-5 text-secondary" />
            <span className="text-lg text-secondary">Pedido Nro</span>
            <span className="text-xl font-medium text-primary">{item.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="size-5 text-secondary" />
            <span className="text-lg text-secondary">Iniciado el</span>
            {item.createdAt && (
              <>
                <span className="text-primary">
                  {days[format(new Date(item.createdAt), "EEEE") as Day]}
                </span>
                <span className="text-lg text-primary">
                  {format(new Date(item.createdAt), "dd-MM-yyyy")}
                </span>
              </>
            )}
          </div>
        </article>

        <article className="flex h-full w-1/2 flex-col gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="size-5 text-secondary" />
            <span className="text-lg text-secondary">Monto:</span>
            {item.total && (
              <div className="flex items-end gap-1">
                <span className="text-lg text-primary">$</span>
                <span className="text-xl text-primary">
                  {item.total.toLocaleString("es-AR")}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Package className="size-5 text-secondary" />
            <span className="text-lg text-secondary">Contiene</span>
            <span className="text-lg text-primary">
              {item.products} {item.products === 1 ? "producto" : "productos"}
            </span>
          </div>
        </article>
      </section>

      {!!item.user && (
        <section className="flex w-full flex-col justify-between gap-4 border-y border-y-secondary/20 py-4">
          <div className="flex w-1/2 items-center gap-2">
            <User2 className="size-5 text-secondary" />
            <span className="text-lg text-secondary">A nombre de</span>
            <span className="text-lg text-primary">
              {item.user.name} {item.user.surname}
            </span>
          </div>

          <div className="flex w-full items-center gap-2">
            <Mail className="size-5 text-secondary" />
            <span className="text-lg text-secondary">Email:</span>
            <span className="text-lg text-primary">{item.user.email}</span>
          </div>

          <div className="flex w-1/2 items-center gap-2">
            <Phone className="size-5 text-secondary" />
            <span className="text-lg text-secondary">Teléfono: </span>
            <span className="text-lg text-primary">
              {item.user.phone ?? "-"}
            </span>
          </div>
        </section>
      )}

      <div className="flex w-full justify-between">
        <div className="flex gap-3">
          <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
            <ClipboardCheck className="size-5" />
            <input
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={!!orderState.confirmed}
              readOnly
            />
          </div>
          <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
            <CreditCard className="size-5" />
            <input
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={!!orderState.payed}
              readOnly
            />
          </div>
          <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
            <Truck className="size-5" />
            <input
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={!!orderState.sent}
              readOnly
            />
          </div>
          <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
            <PackageOpen className="size-5" />
            <input
              type="checkbox"
              className="checkbox-primary checkbox checkbox-sm"
              checked={!!orderState.delivered}
              readOnly
            />
          </div>
        </div>

        <Link
          href={
            fromAdmin
              ? `/administration/orders/${item.id}`
              : `/orders/${item.id}`
          }
          className="btn btn-primary btn-sm w-48 self-end"
        >
          <ClipboardCheck className="size-5" /> Ver detalle
        </Link>
      </div>
    </div>
  );
}

export function LoadingOrdersItem() {
  return (
    <div className="flex w-full items-center justify-between gap-6 rounded-xl border-2 border-secondary/20 p-4">
      <article className="flex h-full w-1/2 flex-col gap-4">
        <div className="flex items-center gap-2">
          <Hash className="size-5 text-secondary" />
          <span className="text-lg text-secondary">Pedido Nro</span>
          <div className="h-7 w-16 animate-pulse rounded-lg bg-secondary/30" />
        </div>

        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="size-5 text-secondary" />
          <span className="text-lg text-secondary">Iniciado el</span>
          <div className="h-7 w-36 animate-pulse rounded-lg bg-secondary/30" />
        </div>
      </article>

      <article className="flex h-full w-1/2 flex-col gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="size-5 text-secondary" />
          <span className="text-lg text-secondary">Monto:</span>
          <div className="h-7 w-28 animate-pulse rounded-lg bg-secondary/30" />
        </div>

        <div className="flex items-center gap-2">
          <Package className="size-5 text-secondary" />
          <span className="text-lg text-secondary">Contiene</span>
          <div className="h-7 w-28 animate-pulse rounded-lg bg-secondary/30" />
        </div>

        <div className="mt-2 h-8 w-48 animate-pulse self-end rounded-lg bg-secondary/30" />
      </article>
    </div>
  );
}

export function SingleOrderItem({
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
          unoptimized
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

export function LoadingSingleOrderItem() {
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
