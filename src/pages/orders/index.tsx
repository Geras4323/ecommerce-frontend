import { OrdersItem, getOrders } from "@/functions/orders";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  ClipboardCheck,
  DollarSign,
  Hash,
  Package,
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
      <div className="mx-auto mb-8 flex w-screen max-w-3xl flex-col gap-4 pt-24">
        <h1 className="border-b border-b-secondary/20 py-2 text-xl font-medium">
          PEDIDOS
        </h1>
        <section className="flex h-full w-full flex-row gap-8">
          <article className="flex h-full w-full flex-col gap-4 overflow-y-auto">
            {ordersQuery.data?.map((item) => (
              <OrdersItem key={item.id} item={item} />
            ))}
          </article>
        </section>
      </div>
    </GeneralLayout>
  );
}

function OrdersItem({ item }: { item: OrdersItem }) {
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
