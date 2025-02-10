import type {
  OrderProduct,
  OrdersItem as TOrdersItem,
} from "@/functions/orders";
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
import NoImage from "../../../public/no_image.png";
import { useEffect, useMemo, useState } from "react";
import { type OrderStates } from "src/pages/administration/orders/[code]";
import { vars } from "@/utils/vars";
import { useUnits } from "@/hooks/states";

export function OrdersItemSkeleton({
  fromAdmin = false,
}: {
  fromAdmin?: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 rounded-xl border-2 border-secondary/20 p-4">
      <section className="flex w-full flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
        <article className="flex h-full w-full flex-col gap-4 md:w-1/2">
          <div className="flex items-center gap-2">
            <Hash className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Pedido Nro</span>
            <div className="mb-1 h-6 w-16 animate-pulse rounded-md bg-secondary/20" />
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <CalendarDaysIcon className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Hecho el</span>
            <div className="mb-1 h-6 w-48 animate-pulse rounded-md bg-secondary/20" />
          </div>
        </article>

        <article className="flex h-full w-full flex-col gap-4 md:w-1/2">
          <div className="flex items-center gap-2">
            <DollarSign className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Monto:</span>
            <div className="mb-1 h-6 w-24 animate-pulse rounded-md bg-secondary/20" />
          </div>

          <div className="flex items-center gap-2">
            <Package className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Contiene</span>
            <div className="mb-1 h-6 w-32 animate-pulse rounded-md bg-secondary/20" />
          </div>
        </article>
      </section>

      {fromAdmin && (
        <section className="flex w-full flex-col justify-between gap-4 border-y border-y-secondary/20 py-4">
          <div className="flex w-full items-center gap-2">
            <User2 className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">A nombre de</span>
            <div className="mb-1 h-6 w-36 animate-pulse rounded-md bg-secondary/20" />
          </div>

          <div className="flex w-full items-center gap-2">
            <Mail className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Email:</span>
            <div className="mb-1 h-6 w-56 animate-pulse rounded-md bg-secondary/20" />
          </div>

          <div className="flex w-full items-center gap-2">
            <Phone className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Teléfono: </span>
            <div className="mb-1 h-6 w-36 animate-pulse rounded-md bg-secondary/20" />
          </div>
        </section>
      )}

      <div
        className={cn(
          !!fromAdmin ? "justify-between" : "justify-end",
          "flex w-full"
        )}
      >
        {!!fromAdmin && (
          <div className="flex gap-3">
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <ClipboardCheck className="size-5" />
              <input
                type="checkbox"
                className="checkbox-secondary checkbox checkbox-sm pointer-events-none animate-pulse border-none bg-secondary/20 shadow-inner-sm"
                checked={false}
              />
            </div>
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <CreditCard className="size-5" />
              <input
                type="checkbox"
                className="checkbox-secondary checkbox checkbox-sm pointer-events-none animate-pulse border-none bg-secondary/20 shadow-inner-sm"
                checked={false}
              />
            </div>
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <Truck className="size-5" />
              <input
                type="checkbox"
                className="checkbox-secondary checkbox checkbox-sm pointer-events-none animate-pulse border-none bg-secondary/20 shadow-inner-sm"
                checked={false}
              />
            </div>
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <PackageOpen className="size-5" />
              <input
                type="checkbox"
                className="checkbox-secondary checkbox checkbox-sm pointer-events-none animate-pulse border-none bg-secondary/20 shadow-inner-sm"
                checked={false}
              />
            </div>
          </div>
        )}

        <div className="h-8 w-48 animate-pulse self-end rounded-md bg-secondary/20" />
      </div>
    </div>
  );
}

export function OrdersItem({
  item,
  fromAdmin = false,
}: {
  item: TOrdersItem;
  fromAdmin?: boolean;
}) {
  const [orderState, setOrderState] = useState<OrderStates>({
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
      return Object.fromEntries(tempOrders) as OrderStates;
    });
  }, [item.state]);

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 rounded-xl border-2 border-secondary/20 p-4">
      <section className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-6">
        <article className="flex h-full w-full flex-col gap-4 lg:w-1/2">
          <div className="flex items-center gap-2">
            <Hash className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Pedido Nro</span>
            <span className="text-xl font-medium text-primary">{item.id}</span>
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <CalendarDaysIcon className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Hecho el</span>
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

        <article className="flex h-full w-full flex-col gap-4 lg:w-1/2">
          <div className="flex items-center gap-2">
            <DollarSign className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Monto:</span>
            {item.total && (
              <div className="flex items-end gap-1">
                <span className="text-lg text-primary">$</span>
                <span className="text-xl text-primary">
                  {item.total.toLocaleString(vars.region)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Package className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Contiene</span>
            <span className="text-lg text-primary">
              {item.products} {item.products === 1 ? "producto" : "productos"}
            </span>
          </div>
        </article>
      </section>

      {fromAdmin && !!item.user && (
        <section className="flex w-full flex-col justify-between gap-4 border-y border-y-secondary/20 py-4">
          <div className="flex w-full items-center gap-2">
            <User2 className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">A nombre de</span>
            <span className="text-lg text-primary">{item.user.name}</span>
          </div>

          <div className="flex w-full items-center gap-2">
            <Mail className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Email:</span>
            <span className="text-lg text-primary">{item.user.email}</span>
          </div>

          <div className="flex w-full items-center gap-2">
            <Phone className="size-5 min-w-5 text-secondary" />
            <span className="text-lg text-secondary">Teléfono: </span>
            <span className="text-lg text-primary">
              {item.user.phone ?? "-"}
            </span>
          </div>
        </section>
      )}

      <div
        className={cn(
          !!fromAdmin ? "justify-between" : "justify-end",
          "flex w-full"
        )}
      >
        {!!fromAdmin && (
          <div className="flex gap-3">
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <ClipboardCheck className="size-5" />
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm shadow-inner-sm"
                checked={!!orderState.confirmed}
                readOnly
              />
            </div>
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <CreditCard className="size-5" />
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm shadow-inner-sm"
                checked={!!orderState.payed}
                readOnly
              />
            </div>
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <Truck className="size-5" />
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm shadow-inner-sm"
                checked={!!orderState.sent}
                readOnly
              />
            </div>
            <div className="pointer-events-none flex w-fit flex-col items-center gap-2">
              <PackageOpen className="size-5" />
              <input
                type="checkbox"
                className="checkbox-primary checkbox checkbox-sm shadow-inner-sm"
                checked={!!orderState.delivered}
                readOnly
              />
            </div>
          </div>
        )}

        <Link
          href={
            fromAdmin
              ? `/administration/orders/${item.id}`
              : `/account/orders/${item.id}`
          }
          className="btn btn-primary btn-sm w-48 self-end"
        >
          <ClipboardCheck className="size-5" /> Ver detalle
        </Link>
      </div>
    </div>
  );
}

export function SingleOrderItemSkeleton() {
  return (
    <div className="flex h-40 w-full animate-pulse flex-col justify-between gap-2 rounded-xl border-2 border-secondary/20 p-4 xs:h-28 xs:flex-row xs:gap-6">
      <div className="flex w-full flex-row gap-6">
        {/* Image */}
        <div className="size-16 min-w-16 rounded-full bg-secondary/20" />
        {/* Data */}
        <div className="flex w-full flex-col gap-2">
          <div className="h-6 w-4/5 rounded-md bg-secondary/20 text-primary" />
          <div className="h-6 w-2/5 min-w-20 rounded-md bg-secondary/20 text-primary" />
        </div>
      </div>

      <div className="flex h-full flex-row items-end justify-end gap-3 xs:flex-col xs:items-center xs:justify-center xs:gap-2">
        <div className="order-2 flex h-7 w-20 rounded-md bg-secondary/20 xs:order-1 xs:border-none" />

        <div className="order-2 flex h-7 w-24 rounded-md bg-secondary/20 xs:order-1 xs:border-none" />
      </div>
    </div>
  );
}

export function SingleOrderItem({
  item,
  category,
  showCategory = true,
}: {
  item: OrderProduct;
  category?: string;
  showCategory?: boolean;
}) {
  const unitsState = useUnits();

  const product = item.product;
  const total = item.quantity * item.unit.price;

  const unitsEnabled = useMemo(
    () => unitsState.data?.active,
    [unitsState.data]
  );

  return (
    <div className="flex h-36 w-full flex-col justify-between gap-2 rounded-xl border-2 border-secondary/20 p-4 xs:h-28 xs:flex-row xs:gap-6">
      <div className="flex flex-row gap-6">
        <Image
          alt="product"
          width={120}
          height={120}
          src={product.images[0]?.url ?? NoImage}
          className={cn(
            !product.images[0]?.url && "opacity-50 blur-[1px]",
            "size-16 min-w-16 rounded-full border border-secondary/30 object-cover"
          )}
        />
        <div className="flex flex-col gap-2">
          <span className="text-primary">{product.name}</span>
          {showCategory && (
            <div className="flex flex-col gap-0.5 text-sm text-secondary">
              {category}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-full flex-row items-end justify-end gap-2 xs:flex-col xs:items-center xs:justify-center xs:gap-2">
        <div className="order-2 flex w-fit items-end justify-center gap-1 border-l border-secondary/50 pl-3 text-center xs:order-1 xs:border-none xs:pl-0">
          <span className="text-lg text-primary/70">$</span>
          <span className="text-xl text-primary">
            {total.toLocaleString(vars.region)}
          </span>
        </div>

        <div className="order-1 flex h-8 w-fit items-end justify-center gap-2 rounded-lg xs:order-2">
          <div className="flex items-end gap-0.5">
            <span className="text-xl text-primary">{item.quantity}</span>
            {unitsEnabled && (
              <span className="text-xl text-primary">{item.unit.unit}</span>
            )}
            <span className="text-base text-primary/70">x</span>
          </div>
          <div className="flex items-end gap-0.5">
            <span className="text-base text-primary/70">$</span>
            <span className="text-lg text-primary">
              {item.unit.price.toLocaleString(vars.region)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
