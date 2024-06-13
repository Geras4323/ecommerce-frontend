import { AdministrationLayout } from "@/layouts/administration";
import { getOrders } from "@/functions/orders";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Undo2, WalletCards } from "lucide-react";
import { useEffect } from "react";
import {
  OrdersItemSkeleton,
  OrdersItem,
} from "@/components/administration/orders";
import { ErrorSpan } from "@/components/forms";

function Orders() {
  const ordersQuery = useQuery<
    Awaited<ReturnType<typeof getOrders>>,
    ServerError
  >({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    if (ordersQuery.isError) console.log(ordersQuery.error);
  }, [ordersQuery.isError, ordersQuery.error]);

  return (
    <AdministrationLayout active="Pedidos">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-4 p-4">
        <div className="flex w-full items-center gap-4 border-b border-b-secondary/20">
          <WalletCards className="size-6" />
          <h1 className="py-2 text-xl font-medium">PEDIDOS</h1>
        </div>

        <section className="flex h-full w-full flex-col gap-4 overflow-y-auto">
          {ordersQuery.isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <OrdersItemSkeleton key={i} fromAdmin />
            ))
          ) : ordersQuery.isError ? (
            <ErrorSpan message={ordersQuery.error.response?.data.comment} />
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
              <OrdersItem key={item.id} item={item} fromAdmin />
            ))
          )}
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Orders;
