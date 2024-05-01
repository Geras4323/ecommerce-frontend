import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/functions/products";
import {
  CalendarDaysIcon,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Hash,
  Mail,
  PackageOpen,
  Phone,
  Truck,
  User2,
} from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { getOrder } from "@/functions/orders";
import { z } from "zod";
import { withAuth } from "@/functions/session";
import { type ServerError } from "@/types/types";
import { type Day, days } from "@/utils/miscellaneous";
import { LoadingSingleOrderItem, SingleOrderItem } from "@/components/orders";
import { useEffect, useState } from "react";
import axios from "axios";
import { vars } from "@/utils/vars";
import {
  PaymentVoucher,
  PaymentVoucherSkeleton,
} from "src/pages/orders/[code]";
import { ErrorSpan } from "@/components/forms";

type State = keyof States;
export type States = {
  confirmed: number;
  payed: number;
  sent: number;
  delivered: number;
};

export default function Order() {
  const params = useParams();
  const queryClient = useQueryClient();

  const codeID = z.string().catch("").parse(params?.code);
  const isValidCode = !isNaN(parseInt(codeID));

  const [orderState, setOrderState] = useState<States>({
    confirmed: 0,
    payed: 0,
    sent: 0,
    delivered: 0,
  });

  function alternateState(state: State) {
    setOrderState((prev) => {
      const newState = { ...prev, [state]: prev[state] === 1 ? 0 : 1 };

      const newStateNumber = Number(`0b${Object.values(newState).join("")}`);
      updateOrderStateMutation.mutate(newStateNumber);

      return newState;
    });
  }

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

  useEffect(() => {
    if (orderQuery.isSuccess) {
      const dbStates = orderQuery.data.state
        .toString(2)
        .padStart(4, "0")
        .split("");

      setOrderState((prev) => {
        const tempOrders = Object.entries(structuredClone(prev));
        dbStates.forEach((v, i) => {
          tempOrders[i]![1] = parseInt(v);
        });
        return Object.fromEntries(tempOrders) as States;
      });
    }
  }, [orderQuery.isSuccess, orderQuery.data]);

  const updateOrderStateMutation = useMutation<void, ServerError, number>({
    mutationFn: async (state) => {
      return axios.patch(
        `${vars.serverUrl}/api/v1/orders/${orderQuery.data?.id}/state`,
        { state },
        { withCredentials: true }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order"] }),
  });

  return (
    <GeneralLayout title="Detalle del pedido" description="Detalle del pedido">
      <div className="mx-auto flex h-screen w-screen max-w-7xl flex-col gap-4 pb-24 pt-24">
        <div className="flex w-full items-center gap-4 border-b border-b-secondary/20 text-primary">
          <CreditCard className="size-6" />
          <h1 className="py-2 text-xl font-medium">DETALLE DEL PEDIDO</h1>
        </div>

        <section className="flex h-full w-full flex-row gap-4">
          {/* DETAILS */}
          <article className="flex h-full w-1/3 flex-col gap-4">
            {/* ORDER INFO */}
            <span className="col-span-2 w-full text-lg underline underline-offset-4">
              INFORMACIÓN GENERAL
            </span>
            {orderQuery.isError ? (
              <ErrorSpan message="Ocurrió un error al cargar el pedido" />
            ) : (
              <>
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

                <div className="flex items-center gap-2">
                  <DollarSign className="size-5 text-secondary" />
                  <span className="text-lg text-secondary">
                    Total a abonar:
                  </span>
                  {orderQuery.isPending ? (
                    <div className="h-7 w-32 animate-pulse rounded-lg bg-secondary/30" />
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-lg text-primary">$</span>
                      <span className="text-xl text-primary">
                        {orderQuery.data.total.toLocaleString("es-AR")}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="border-b border-t-0 border-b-secondary/20" />

                {/* USER INFO */}
                <div className="flex items-center gap-2">
                  <User2 className="size-5 text-secondary" />
                  <span className="text-lg text-secondary">A nombre de</span>
                  {orderQuery.isPending ? (
                    <div className="h-7 w-36 animate-pulse rounded-lg bg-secondary/30" />
                  ) : (
                    <span className="text-lg text-primary">
                      {orderQuery.data?.user.name}{" "}
                      {orderQuery.data?.user.surname}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="size-5 text-secondary" />
                  <span className="text-lg text-secondary">Email:</span>
                  {orderQuery.isPending ? (
                    <div className="h-7 w-64 animate-pulse rounded-lg bg-secondary/30" />
                  ) : (
                    <span className="text-lg text-primary">
                      {orderQuery.data?.user.email}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="size-5 text-secondary" />
                  <span className="text-lg text-secondary">Teléfono: </span>
                  {orderQuery.isPending ? (
                    <div className="h-7 w-32 animate-pulse rounded-lg bg-secondary/30" />
                  ) : (
                    <span className="text-lg text-primary">
                      {orderQuery.data?.user.phone ?? "-"}
                    </span>
                  )}
                </div>
              </>
            )}
          </article>

          <hr className="h-full w-px border-none bg-secondary/20" />

          {/* PRODUCTS */}
          <article className="flex h-full w-1/3 flex-col gap-4">
            <span className="text-lg underline underline-offset-4">
              PRODUCTOS ENCARGADOS
            </span>
            <section className="flex h-full w-full flex-col gap-3 overflow-y-auto">
              {productsQuery.isPending || orderQuery.isPending ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <LoadingSingleOrderItem key={i} />
                ))
              ) : productsQuery.isError || orderQuery.isError ? (
                <ErrorSpan
                  className="self-center"
                  message="Ocurrió un error al cargar el pedido"
                />
              ) : (
                orderQuery.data.orderProducts.map((item) => {
                  const product = productsQuery.data.find(
                    (p) => p.id === item.productID
                  );
                  if (product)
                    return (
                      <SingleOrderItem
                        key={item.id}
                        item={item}
                        product={product}
                        showDescription={false}
                      />
                    );
                })
              )}
            </section>
          </article>

          <hr className="h-full w-px border-none bg-secondary/20" />

          {/* STATE */}
          <article className="flex h-full w-1/3 flex-col items-center gap-4">
            <section className="flex w-full flex-col items-center gap-4">
              <span className="col-span-2 w-full text-lg underline underline-offset-4">
                ETAPAS DEL PEDIDO
              </span>
              <div className="grid select-none grid-cols-2 gap-x-10 gap-y-5">
                <div
                  className="flex w-fit cursor-pointer items-center gap-2"
                  onClick={() => alternateState("confirmed")}
                >
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox"
                    checked={!!orderState.confirmed}
                    readOnly
                  />
                  <span>Confirmado</span>
                  <ClipboardCheck className="size-5" />
                </div>
                <div
                  className="flex w-fit cursor-pointer items-center gap-2"
                  onClick={() => alternateState("payed")}
                >
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox"
                    checked={!!orderState.payed}
                    readOnly
                  />
                  <span>Pagado</span>
                  <CreditCard className="size-5" />
                </div>
                <div
                  className="flex w-fit cursor-pointer items-center gap-2"
                  onClick={() => alternateState("sent")}
                >
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox"
                    checked={!!orderState.sent}
                    readOnly
                  />
                  <span>Enviado</span>
                  <Truck className="size-5" />
                </div>
                <div
                  className="flex w-fit cursor-pointer items-center gap-2"
                  onClick={() => alternateState("delivered")}
                >
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox"
                    checked={!!orderState.delivered}
                    readOnly
                  />
                  <span>Entregado</span>
                  <PackageOpen className="size-5" />
                </div>
              </div>
            </section>

            <hr className="h-px w-full border-none bg-secondary/20" />

            <section className="flex w-full flex-col gap-4 overflow-y-auto">
              <span className="text-lg underline underline-offset-4">
                COMPROBANTES ADJUNTOS
              </span>

              {orderQuery.data?.payments.length === 0 ? (
                <p className="mt-1 w-full text-center text-secondary">
                  No hay comprobantes de pago adjuntos
                </p>
              ) : (
                <div className="flex h-full flex-col gap-2 overflow-y-auto">
                  {orderQuery.isPending ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <PaymentVoucherSkeleton key={i} />
                    ))
                  ) : orderQuery.isError ? (
                    <ErrorSpan
                      className="w-fit self-center"
                      message="Ocurrió un error al cargar el pedido"
                    />
                  ) : (
                    orderQuery.data.payments.map((payment, i) => (
                      <PaymentVoucher
                        key={payment.id}
                        payment={payment}
                        number={i}
                      />
                    ))
                  )}
                </div>
              )}
            </section>
          </article>
        </section>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");
