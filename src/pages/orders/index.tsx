import { type OrdersItem as TOrdersItem, getOrders } from "@/functions/orders";
import { withAuth } from "@/functions/session";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  ClipboardCheck,
  DollarSign,
  Hash,
  Package,
  Undo2,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

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

export default function Orders() {
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    retry: false,
  });

  return (
    <GeneralLayout title="Pedidos" description="Pedidos">
      <div className="mx-auto flex h-screen w-screen max-w-3xl flex-col gap-4 py-24">
        <div className="flex w-full items-center gap-4 border-b border-b-secondary/20">
          <WalletCards className="size-6" />
          <h1 className="py-2 text-xl font-medium">PEDIDOS</h1>
        </div>
        <section className="flex h-full w-full flex-col gap-4 overflow-y-auto">
          {ordersQuery.isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <LoadingOrdersItem key={i} />
            ))
          ) : ordersQuery.isError ? (
            <div className="flex h-16 w-full items-center rounded-lg bg-error px-4 py-2 font-semibold text-primary">
              Se ha producido un error
            </div>
          ) : ordersQuery.data.length === 0 ? (
            <div className="mx-auto mt-4 flex w-fit items-center justify-center gap-4">
              <p className="text-xl">Aún no hay pedidos</p>
              <Link href="/showroom" className="btn btn-primary btn-sm">
                <Undo2 className="size-4" />
                Volver al showroom
              </Link>
            </div>
          ) : (
            ordersQuery.data?.map((item) => (
              <OrdersItem key={item.id} item={item} />
            ))
          )}
        </section>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");

function OrdersItem({ item }: { item: TOrdersItem }) {
  return (
    <div className="flex w-full items-center justify-between gap-6 rounded-xl border-2 border-secondary/20 p-4">
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
                {format(new Date(), "dd-MM-yyyy")}
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
            {item.products} productos
          </span>
        </div>

        <Link
          href={`/orders/${item.id}`}
          className="btn btn-primary btn-sm mt-2 w-48 self-end"
        >
          <ClipboardCheck className="size-5" /> Ver detalle
        </Link>
      </article>
    </div>
  );
}

function LoadingOrdersItem() {
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
