import { GeneralLayout } from "@/layouts/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Product, getProducts } from "@/functions/products";
import {
  CalendarDaysIcon,
  ChevronDown,
  ChevronLeft,
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
import { type OrderProduct, getOrder } from "@/functions/orders";
import { z } from "zod";
import { withAuth } from "@/functions/session";
import { type ServerError } from "@/types/types";
import { type Day, days } from "@/utils/miscellaneous";
import { useEffect, useState } from "react";
import axios from "axios";
import { vars } from "@/utils/vars";
import {
  PaymentVoucher,
  PaymentVoucherSkeleton,
} from "src/pages/account/orders/[code]";
import { ErrorSpan } from "@/components/forms";
import Image from "next/image";
import { cn } from "@/utils/lib";
import NoImage from "../../../../public/no_image.png";
import { getCategories } from "@/functions/categories";
import { mqs, useMediaQueries } from "@/hooks/screen";
import Link from "next/link";

type OpenState = keyof OpenStates;
export type OpenStates = {
  general: boolean;
  stage: boolean;
  payments: boolean;
  products: boolean;
};

type OrderState = keyof OrderStates;
export type OrderStates = {
  confirmed: number;
  payed: number;
  sent: number;
  delivered: number;
};

export default function Order() {
  const params = useParams();
  const queryClient = useQueryClient();

  const mq = useMediaQueries();

  const codeID = z.string().catch("").parse(params?.code);
  const isValidCode = !isNaN(parseInt(codeID));

  const [openState, setOpenState] = useState<OpenStates>({
    general: true,
    stage: true,
    payments: false,
    products: false,
  });

  const [orderState, setOrderState] = useState<OrderStates>({
    confirmed: 0,
    payed: 0,
    sent: 0,
    delivered: 0,
  });

  function alternateOpenState(state: OpenState) {
    setOpenState((prev) => {
      const newState = { ...prev, [state]: !!prev[state] ? false : true };
      return newState;
    });
  }

  function alternateOrderState(state: OrderState) {
    setOrderState((prev) => {
      const newState = { ...prev, [state]: prev[state] === 1 ? 0 : 1 };

      const newStateNumber = Number(`0b${Object.values(newState).join("")}`);
      updateOrderStateMutation.mutate(newStateNumber);

      return newState;
    });
  }

  const productsQuery = useQuery<
    Awaited<ReturnType<typeof getProducts>>,
    ServerError
  >({
    queryKey: ["products"],
    queryFn: () => getProducts(true),
    refetchOnWindowFocus: true,
    retry: false,
  });

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const orderQuery = useQuery<
    Awaited<ReturnType<typeof getOrder>>,
    ServerError
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
        return Object.fromEntries(tempOrders) as OrderStates;
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

  if (!mq) return;

  return (
    <GeneralLayout title="Detalle del pedido" description="Detalle del pedido">
      <div className="mx-auto flex h-screen w-screen max-w-7xl flex-col gap-4 px-4 pb-24 pt-24">
        <div className="flex w-full items-center gap-4 border-b border-b-secondary/20 text-primary">
          <Link href="/administration/orders" className="btn btn-ghost btn-sm">
            <ChevronLeft className="size-5" />
          </Link>
          <h1 className="py-2 text-xl font-medium">DETALLE DEL PEDIDO</h1>
        </div>

        {orderQuery.isError ? (
          <ErrorSpan message={orderQuery.error.response?.data.comment} />
        ) : (
          <section className="flex h-full w-full flex-col gap-4 md:flex-row">
            <div className="flex w-full flex-col gap-4 md:w-1/2 xl:w-2/3 xl:flex-row">
              {/* ORDER INFO */}
              <article className="mb-4 flex h-fit w-full flex-col gap-2 xl:h-full xl:w-1/2 xl:gap-4">
                <div
                  onClick={() => alternateOpenState("general")}
                  className="col-span-2 flex w-full items-center justify-between"
                >
                  <span className="select-none text-lg underline underline-offset-4">
                    INFORMACIÓN GENERAL
                  </span>
                  <ChevronDown
                    className={cn(
                      mq >= mqs.md && "hidden",
                      !!openState.general && "rotate-180",
                      "size-6 transition-all"
                    )}
                  />
                </div>
                {orderQuery.isError ? (
                  <ErrorSpan message="Ocurrió un error al cargar el pedido" />
                ) : (
                  <div
                    className={cn(
                      !!openState.general || mq >= mqs.md
                        ? "h-72 border py-3"
                        : "h-0 opacity-0",
                      "flex flex-col gap-4 overflow-hidden rounded-lg border-secondary/20 bg-secondary/10 px-3 shadow-md transition-all ease-in-out"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="size-5 text-secondary" />
                      <span className="text-lg text-secondary">Pedido Nro</span>
                      {orderQuery.isPending ? (
                        <div className="h-6 w-20 animate-pulse rounded-lg bg-secondary/30" />
                      ) : (
                        <span className="text-xl font-medium text-primary">
                          {orderQuery.data?.id}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="size-5 min-w-5 text-secondary" />
                      <span className="text-lg text-secondary">
                        Iniciado el
                      </span>
                      {orderQuery.isPending ? (
                        <div className="h-6 w-48 animate-pulse rounded-lg bg-secondary/30" />
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
                      <DollarSign className="size-5 min-w-5 text-secondary" />
                      <span className="text-lg text-secondary">
                        Total a abonar:
                      </span>
                      {orderQuery.isPending ? (
                        <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary/30" />
                      ) : (
                        <div className="flex items-end gap-1">
                          <span className="text-lg text-primary">$</span>
                          <span className="text-xl text-primary">
                            {orderQuery.data.total.toLocaleString(vars.region)}
                          </span>
                        </div>
                      )}
                    </div>

                    <hr className="border-b border-t-0 border-b-secondary/20" />

                    {/* USER INFO */}
                    <div className="flex items-center gap-2">
                      <User2 className="size-5 min-w-5 text-secondary" />
                      <span className="text-lg text-secondary">
                        A nombre de
                      </span>
                      {orderQuery.isPending ? (
                        <div className="h-6 w-36 animate-pulse rounded-lg bg-secondary/30" />
                      ) : (
                        <span className="text-lg text-primary">
                          {orderQuery.data?.user.name}{" "}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="size-5 min-w-5 text-secondary" />
                      <span className="text-lg text-secondary">Email:</span>
                      {orderQuery.isPending ? (
                        <div className="h-6 w-64 animate-pulse rounded-lg bg-secondary/30" />
                      ) : (
                        <span className="text-lg text-primary">
                          {orderQuery.data?.user.email}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="size-5 min-w-5 text-secondary" />
                      <span className="text-lg text-secondary">Teléfono: </span>
                      {orderQuery.isPending ? (
                        <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary/30" />
                      ) : (
                        <span className="text-lg text-primary">
                          {orderQuery.data?.user.phone ?? "-"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </article>

              <hr className="hidden h-full w-px border-none bg-secondary/20 xl:block" />

              {/* STAGE */}
              <article className="mb-4 flex h-fit w-full flex-col items-center gap-2 xl:h-full xl:w-1/2 xl:gap-4">
                <section className="mb-4 flex w-full flex-col items-center gap-2 xl:mb-0 xl:gap-4">
                  <div
                    onClick={() => alternateOpenState("stage")}
                    className="flex w-full select-none items-center justify-between"
                  >
                    <span className="col-span-2 w-full text-lg underline underline-offset-4">
                      ETAPAS DEL PEDIDO
                    </span>
                    <ChevronDown
                      className={cn(
                        mq >= mqs.md && "hidden",
                        !!openState.stage && "rotate-180",
                        "size-6 transition-all"
                      )}
                    />
                  </div>

                  <div
                    className={cn(
                      !!openState.stage || mq >= mqs.md
                        ? "h-28 border py-3"
                        : "h-0 opacity-0",
                      "grid w-full select-none grid-cols-2 gap-x-10 gap-y-5 overflow-hidden rounded-lg border-secondary/20 bg-secondary/10 px-4 shadow-md transition-all"
                    )}
                  >
                    <div
                      className="flex w-fit cursor-pointer items-center gap-2"
                      onClick={() => alternateOrderState("confirmed")}
                    >
                      <input
                        type="checkbox"
                        className="checkbox-primary checkbox"
                        checked={!!orderState.confirmed}
                        readOnly
                        disabled={orderQuery.isPending}
                      />
                      <span>Confirmado</span>
                      <ClipboardCheck className="size-5" />
                    </div>
                    <div
                      className="flex w-fit cursor-pointer items-center gap-2"
                      onClick={() => alternateOrderState("payed")}
                    >
                      <input
                        type="checkbox"
                        className="checkbox-primary checkbox"
                        checked={!!orderState.payed}
                        disabled={orderQuery.isPending}
                      />
                      <span>Pagado</span>
                      <CreditCard className="size-5" />
                    </div>
                    <div
                      className="flex w-fit cursor-pointer items-center gap-2"
                      onClick={() => alternateOrderState("sent")}
                    >
                      <input
                        type="checkbox"
                        className="checkbox-primary checkbox"
                        checked={!!orderState.sent}
                        disabled={orderQuery.isPending}
                      />
                      <span>Enviado</span>
                      <Truck className="size-5" />
                    </div>
                    <div
                      className="flex w-fit cursor-pointer items-center gap-2"
                      onClick={() => alternateOrderState("delivered")}
                    >
                      <input
                        type="checkbox"
                        className="checkbox-primary checkbox"
                        checked={!!orderState.delivered}
                        disabled={orderQuery.isPending}
                      />
                      <span>Entregado</span>
                      <PackageOpen className="size-5" />
                    </div>
                  </div>

                  {updateOrderStateMutation.isError && (
                    <div className="w-full">
                      <ErrorSpan
                        className="self-start"
                        message={
                          updateOrderStateMutation.error.response?.data.comment
                        }
                      />
                    </div>
                  )}
                </section>

                <hr className="hidden h-px w-full border-none bg-secondary/20 xl:block" />

                <section className="flex w-full flex-col gap-2 overflow-y-auto overflow-x-hidden xl:gap-4">
                  <div
                    onClick={() => alternateOpenState("payments")}
                    className="flex w-full select-none items-center justify-between"
                  >
                    <span className="text-lg underline underline-offset-4">
                      COMPROBANTES ADJUNTOS
                    </span>
                    <ChevronDown
                      className={cn(
                        mq >= mqs.md && "hidden",
                        !!openState.payments && "rotate-180",
                        "size-6 transition-all"
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      mq >= mqs.md
                        ? "h-full"
                        : !!openState.payments
                        ? orderQuery.data?.payments.length === 0
                          ? "h-12"
                          : "h-44"
                        : "h-0 opacity-0",
                      "overflow-y-auto transition-all"
                    )}
                  >
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
                  </div>
                </section>
              </article>
            </div>

            <hr className="hidden h-full w-px border-none bg-secondary/20 md:block" />

            {/* PRODUCTS */}
            <article className="mb-4 flex h-full w-full flex-col gap-2 pb-4 md:w-1/2 md:pb-0 xl:h-full xl:max-h-none xl:w-1/3 xl:gap-4">
              <div
                onClick={() => alternateOpenState("products")}
                className="flex select-none items-center justify-between"
              >
                <span className="text-lg underline underline-offset-4">
                  PRODUCTOS ENCARGADOS
                </span>
                <ChevronDown
                  className={cn(
                    mq >= mqs.md && "hidden",
                    !!openState.products && "rotate-180",
                    "size-6 transition-all"
                  )}
                />
              </div>
              <section
                className={cn(
                  mq >= mqs.md
                    ? "h-full"
                    : !!openState.products
                    ? "h-104"
                    : "h-0 opacity-0",
                  "flex w-full flex-col gap-3 overflow-y-auto pr-1 transition-all xl:h-full"
                )}
              >
                {productsQuery.isPending || orderQuery.isPending ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <OrderedProductSkeleton key={i} />
                  ))
                ) : productsQuery.isError || orderQuery.isError ? (
                  <ErrorSpan
                    className="self-center"
                    message="Ocurrió un error al cargar el pedido"
                  />
                ) : (
                  orderQuery.data.orderProducts.map((item) => {
                    const product = productsQuery.data.find(
                      (p) => p.id === item.product.id
                    );
                    if (product)
                      return (
                        <OrderedProduct
                          key={item.id}
                          item={item}
                          product={product}
                          category={
                            categoriesQuery.data?.find(
                              (category) => category.id === product.categoryID
                            )?.name
                          }
                        />
                      );
                  })
                )}
              </section>
            </article>
          </section>
        )}
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");

function OrderedProductSkeleton() {
  return (
    <div className="flex h-fit w-full animate-pulse flex-col justify-between gap-2 rounded-xl border-2 border-secondary/20 p-4">
      <div className="flex flex-row gap-6">
        {/* Image */}
        <div className={cn("size-16 min-w-16 rounded-full bg-secondary/20")} />

        {/* Data */}
        <div className="flex w-full flex-col gap-2">
          {/* Name */}
          <div className="flex w-full flex-col gap-1.5">
            <div className="line-clamp-3 h-4 w-full rounded-md bg-secondary/20 text-primary" />
            <div className="line-clamp-3 h-4 w-3/5 rounded-md bg-secondary/20 text-primary" />
          </div>
          {/* Category */}
          <div className="h-5 w-24 rounded-md bg-secondary/20" />
        </div>
      </div>

      {/* Price */}
      <div className="flex h-full flex-row justify-end gap-2">
        <div className="order-1 mt-1 flex h-7 w-24 items-end justify-center gap-2 rounded-md bg-secondary/20" />

        <div className="order-2 mt-1 flex h-7 w-20 items-end justify-center gap-1 rounded-md bg-secondary/20 text-center" />
      </div>
    </div>
  );
}

function OrderedProduct({
  item,
  product,
  category,
}: {
  item: OrderProduct;
  product: Product;
  category?: string;
}) {
  const price = item.quantity * product.price;

  return (
    <div className="flex h-fit w-full flex-col justify-between gap-2 rounded-xl border-2 border-secondary/20 p-4">
      <div className="flex flex-row gap-6">
        <Image
          alt="product"
          width={50}
          height={50}
          src={product.images[0]?.url ?? NoImage}
          className={cn(
            !product.images[0]?.url && "opacity-50 blur-[1px]",
            "size-16 min-w-16 rounded-full border border-secondary/30"
          )}
        />
        <div className="flex flex-col gap-2">
          <span className="line-clamp-3 text-primary">{product.name}</span>
          {category && (
            <div className="flex flex-col gap-0.5 text-sm text-secondary">
              {category}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-full flex-row justify-end gap-2">
        <div className="order-1 flex h-8 w-24 items-end justify-center gap-2">
          <div className="flex items-end gap-0.5">
            <span className="text-xl text-primary">{item.quantity}</span>
            <span className="text-base text-primary/70">x</span>
          </div>
          <div className="flex items-end gap-0.5">
            <span className="text-base text-primary/70">$</span>
            <span className="text-lg text-primary">
              {product.price.toLocaleString(vars.region)}
            </span>
          </div>
        </div>

        <div className="order-2 flex w-fit items-end justify-center gap-1 border-l border-secondary/50 pl-3 text-center">
          <span className="text-lg text-primary/70">$</span>
          <span className="text-xl text-primary">
            {price.toLocaleString(vars.region)}
          </span>
        </div>
      </div>
    </div>
  );
}
