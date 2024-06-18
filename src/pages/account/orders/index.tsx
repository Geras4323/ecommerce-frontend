import {
  OrdersItemSkeleton,
  OrdersItem,
} from "@/components/administration/orders";
import { ErrorAlert } from "@/components/forms";
import { AccountLayout } from "@/components/layouts/account";
import { getMyOrders } from "@/functions/orders";
import { withAuth } from "@/functions/session";
import { GeneralLayout } from "@/layouts/general";
import { type ServerError } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Undo2 } from "lucide-react";
import Link from "next/link";

export default function Orders() {
  const ordersQuery = useQuery<
    Awaited<ReturnType<typeof getMyOrders>>,
    ServerError
  >({
    queryKey: ["orders"],
    queryFn: getMyOrders,
    retry: false,
  });

  return (
    <GeneralLayout title="Pedidos" description="Pedidos">
      <AccountLayout active="Pedidos">
        <div className="flex h-full w-full max-w-2xl flex-col gap-6 overflow-hidden">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-wide text-primary">
              Pedidos
            </h1>
            <p className="text-secondary">Historial de pedidos</p>
          </div>

          <section className="flex h-full w-full flex-col gap-4 overflow-y-auto">
            {ordersQuery.isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <OrdersItemSkeleton key={i} />
              ))
            ) : ordersQuery.isError ? (
              <ErrorAlert
                className="w-full"
                message={ordersQuery.error.response?.data.comment}
              />
            ) : ordersQuery.data.length === 0 ? (
              <div className="mx-auto mt-4 flex w-fit items-center justify-center gap-4">
                <p className="text-xl">Aún no hay pedidos</p>
                <Link href="/showroom" className="btn btn-primary btn-sm">
                  <Undo2 className="size-4" />
                  Volver al showroom
                </Link>
              </div>
            ) : (
              ordersQuery.data.map((item) => (
                <OrdersItem key={item.id} item={item} />
              ))
            )}
          </section>
        </div>
      </AccountLayout>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");
