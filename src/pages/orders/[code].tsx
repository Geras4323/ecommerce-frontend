import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/functions/products";
import {
  CalendarDaysIcon,
  ChevronLeft,
  Clock,
  DollarSign,
  File,
  FilePieChart,
  FileUp,
  Hash,
  Info,
  Paperclip,
} from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { getOrder } from "@/functions/orders";
import { z } from "zod";
import { withAuth } from "@/functions/session";
import type { ServerSuccess, ServerError } from "@/types/types";
import { type Day, days } from "@/utils/miscellaneous";
import {
  SingleOrderItem,
  SingleOrderItemSkeleton,
} from "@/components/administration/orders";
import { useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { type CloudinarySuccess } from "@/types/cloudinary";
import { vars } from "@/utils/vars";
import axios from "axios";
import { LoadableButton } from "@/components/forms";
import { type Payment } from "@/functions/payments";
import { cn } from "@/utils/lib";
import { getCategories } from "@/functions/categories";
import Link from "next/link";

export default function Order() {
  const params = useParams();
  const queryClient = useQueryClient();

  const orderID = z.string().catch("").parse(params?.code);
  const isValidCode = !isNaN(parseInt(orderID));

  const [uploadedVoucher, setUploadedVoucher] = useState<File>();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
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
    ServerError<string>
  >({
    queryKey: ["order", orderID],
    queryFn: () => getOrder(parseInt(orderID)),
    enabled: !!isValidCode,
    retry: false,
  });

  const mutation = useMutation<ServerSuccess<CloudinarySuccess>, ServerError>({
    mutationFn: () => {
      const url = `${vars.serverUrl}/api/v1/payments/${orderID}`;
      return axios.post(
        url,
        { file: uploadedVoucher },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      setUploadedVoucher(undefined);
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });

  return (
    <GeneralLayout title="Detalle del pedido" description="Detalle del pedido">
      <div className="mx-auto flex h-screen w-screen max-w-screen-sm flex-col gap-4 px-4 pb-24 pt-24 lg:max-w-5xl">
        <div className="flex w-full items-baseline justify-between gap-4 border-b border-b-secondary/20 text-primary">
          <div className="flex items-center gap-4">
            <Link href="/orders" className="btn btn-ghost btn-sm">
              <ChevronLeft className="size-5" />
            </Link>
            <h1 className="py-2 text-xl font-medium">DETALLE DEL PEDIDO</h1>
          </div>
          {!orderQuery.isPending && !orderQuery.isError && (
            <div className="hidden gap-2 text-info lg:flex">
              <Info className="size-5" />
              Nos pondremos en contacto a la brevedad
            </div>
          )}
        </div>

        <section className="flex h-full w-full flex-col gap-4 lg:flex-row">
          <article className="order-2 flex h-full w-full flex-col gap-4 overflow-y-auto lg:order-1 lg:w-3/5">
            {productsQuery.isPending || orderQuery.isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SingleOrderItemSkeleton key={i} />
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
                    <SingleOrderItem
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
          </article>

          <article className="order-1 flex h-fit w-full flex-col gap-4 rounded-lg border-secondary/20 bg-secondary/5 p-4 pb-4 shadow-md lg:order-2 lg:h-full lg:w-2/5 lg:rounded-none lg:border-l lg:bg-transparent lg:pb-0 lg:pl-4 lg:shadow-none">
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
              <CalendarDaysIcon className="size-5 text-secondary" />
              <span className="text-lg text-secondary">Iniciado el</span>
              {orderQuery.isPending ? (
                <div className="h-6 w-48 animate-pulse rounded-lg bg-secondary/30" />
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
                <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary/30" />
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
              <div className="flex w-full flex-col gap-4">
                <input
                  id="voucher"
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files) setUploadedVoucher(e.target.files[0]);
                  }}
                />
                <label
                  htmlFor="voucher"
                  className="btn btn-outline btn-secondary w-full"
                >
                  <Paperclip className="size-5" /> Adjuntar comprobante de pago
                </label>

                {uploadedVoucher && (
                  <div className="my-1.5 flex items-center justify-between gap-4">
                    <Tooltip>
                      <TooltipTrigger className="cursor-default truncate text-lg">
                        {uploadedVoucher.name}
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align="start"
                        className="w-fit rounded-md border border-secondary/30 bg-base-100 px-2 py-1"
                      >
                        <TooltipArrow className="fill-secondary" />
                        {uploadedVoucher.name}
                      </TooltipContent>
                    </Tooltip>

                    <LoadableButton
                      isPending={mutation.isPending}
                      onClick={() => mutation.mutate()}
                      className="btn btn-primary btn-sm w-52"
                      animation="dots"
                    >
                      <FileUp className="size-5" />
                      <span>Subir comprobante</span>
                    </LoadableButton>
                  </div>
                )}

                {orderQuery.data?.payments.length !== 0 && (
                  <div className="flex flex-col gap-2 border-t border-t-secondary/20 pt-3">
                    <span className="flex items-center gap-2 text-lg text-secondary">
                      <File className="size-5" />
                      Comprobantes adjuntos
                    </span>
                    <div
                      className={cn(
                        uploadedVoucher
                          ? "max-h-48 2xl:max-h-104"
                          : "max-h-60 2xl:max-h-104",
                        "flex flex-col gap-2 overflow-y-auto"
                      )}
                    >
                      {orderQuery.data?.payments.map((payment, i) => (
                        <PaymentVoucher
                          key={payment.id}
                          payment={payment}
                          number={i}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        </section>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("noAdmin");

export function PaymentVoucher({
  payment,
  number,
}: {
  payment: Payment;
  number: number;
}) {
  return (
    <div className="relative flex h-fit w-full items-center justify-between gap-4 rounded-xl border-2 border-secondary/20 py-2 pl-11 pr-4">
      <span className="absolute left-1 top-1 flex items-center gap-0.5 text-sm text-secondary">
        <Hash className="size-3" />
        {number + 1}
      </span>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="size-4 text-secondary" />
          {format(new Date(payment.createdAt), "dd-MM-yyyy")}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-secondary" />
          {format(new Date(payment.createdAt), "HH:mm")}
        </div>
      </div>
      <a
        href={payment.url}
        target="_blank"
        className="btn btn-outline btn-secondary btn-sm"
      >
        <FilePieChart className="size-5" />
        <span className="xxs:hidden lg:block">Ver</span>
        <span className="hidden xxs:block lg:hidden">Ver comprobante</span>
      </a>
    </div>
  );
}

export function PaymentVoucherSkeleton() {
  return (
    <div className="relative flex h-fit w-full animate-pulse items-center justify-between gap-4 rounded-xl border-2 border-secondary/20 py-2 pl-11 pr-4">
      {/* Number */}
      <div className="absolute left-1 top-1 size-5 rounded-md bg-secondary/20" />
      {/* Data */}
      <div className="flex flex-col gap-2">
        <div className="h-5 w-28 rounded-md bg-secondary/20" />
        <div className="h-5 w-20 rounded-md bg-secondary/20" />
      </div>
      <div className="h-7 w-44 rounded-md bg-secondary/20" />
    </div>
  );
}
