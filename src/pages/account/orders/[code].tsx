import { GeneralLayout } from "@/layouts/general";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/functions/products";
import {
  CalendarDaysIcon,
  ChevronLeft,
  Clock,
  DollarSign,
  File,
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
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { type CloudinarySuccess } from "@/types/cloudinary";
import { vars } from "@/utils/vars";
import axios from "axios";
import { ErrorAlert, ErrorSpan, LoadableButton } from "@/components/forms";
import { getPaymentStatus, type Payment } from "@/functions/payments";
import { checkMimetype, cn, withCbk } from "@/utils/lib";
import { getCategories } from "@/functions/categories";
import Link from "next/link";
import MercadoPago from "public/mercado_pago.svg";
import Image from "next/image";
import {
  generateMercadopagoPayment,
  type MPProduct,
} from "@/functions/mercadopago";
import { toast, Toaster } from "sonner";
import { AwaitingPaymentModal } from "@/components/modals/payment";

export default function Order() {
  const params = useParams();
  const queryClient = useQueryClient();

  const orderID = z.string().catch("").parse(params?.code);
  const isValidCode = !isNaN(parseInt(orderID));

  const [uploadedVoucher, setUploadedVoucher] = useState<File>();

  const [isAwaitingPaymentModalOpen, setIsAwaitingPaymentModal] =
    useState(false);
  const [paymentToCheck, setPaymentToCheck] = useState<number>();
  const waitingForPaymentToast = useRef<ReturnType<typeof toast>>();

  // Queries ///////////////////////////////////////////////////////////////////////////////
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
    queryKey: ["order", orderID],
    queryFn: () => getOrder(parseInt(orderID)),
    enabled: !!isValidCode,
    retry: false,
  });

  useEffect(() => {
    if (orderQuery.isError) console.log(orderQuery.error.message);
  }, [orderQuery.isError, orderQuery.error]);

  const paymentStatusQuery = useQuery<
    Awaited<ReturnType<typeof getPaymentStatus>>,
    ServerError
  >({
    queryKey: ["order_payment"],
    queryFn: withCbk({
      queryFn: () => getPaymentStatus(paymentToCheck ?? -1),
      onSuccess: (res) => {
        if (res === "accepted") {
          setPaymentToCheck(undefined);
          toast.dismiss(waitingForPaymentToast.current);
          queryClient.invalidateQueries({ queryKey: ["order"] });
          toast.success("Pago recibido!");
          return;
        }
        if (res === "rejected") {
          setPaymentToCheck(undefined);
          toast.dismiss(waitingForPaymentToast.current);
          toast.error("Ocurrió un error");
        }
      },
    }),
    enabled: !!paymentToCheck,
    refetchOnWindowFocus: false,
    refetchInterval: (res) => (res.state.data === "pending" ? 2000 : false),
  });

  useEffect(() => {
    if (paymentStatusQuery.isSuccess) console.log(paymentStatusQuery.data);
  }, [paymentStatusQuery.isSuccess, paymentStatusQuery.data]);

  useEffect(() => {
    if (paymentStatusQuery.isError)
      console.log(paymentStatusQuery.error.message);
  }, [paymentStatusQuery.isError, paymentStatusQuery.error]);
  // Queries ///////////////////////////////////////////////////////////////////////////////

  // Mutations /////////////////////////////////////////////////////////////////////////////
  const uploadVoucherMutation = useMutation<
    ServerSuccess<CloudinarySuccess>,
    ServerError
  >({
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

  const createMPPaymentMutation = useMutation<
    ServerSuccess<Payment>,
    ServerError,
    MPProduct[]
  >({
    mutationFn: () => {
      const url = `${vars.serverUrl}/api/v1/payments/mercadopago/add`;
      return axios.post(
        url,
        { orderID: parseInt(orderID) },
        { withCredentials: true }
      );
    },
    onSuccess: async (res, variable) => {
      const url = await generateMercadopagoPayment({
        paymentID: res.data.id,
        items: variable,
      });
      if (url) window.open(url, "_blank");
      toast.dismiss(waitingForPaymentToast.current);
      waitingForPaymentToast.current = toast.loading("Esperando pago...");
      setIsAwaitingPaymentModal(true);
      setPaymentToCheck(res.data.id);
    },
  });
  // Mutations /////////////////////////////////////////////////////////////////////////////

  // Functions /////////////////////////////////////////////////////////////////////////////
  function loadVoucher(voucher?: File) {
    if (!voucher) return;
    checkMimetype(voucher.type, ["image/png", "image/jpeg", "application/pdf"]);
    setUploadedVoucher(voucher);
  }

  async function redirectToMP() {
    if (orderQuery.isPending || orderQuery.isError) return;

    const productsList: MPProduct[] = orderQuery.data.orderProducts.map(
      (product) => ({
        id: product.product.id,
        name: product.product.name,
        quantity: product.quantity,
        price: product.product.price,
      })
    );

    createMPPaymentMutation.mutate(productsList);
  }
  // Functions /////////////////////////////////////////////////////////////////////////////

  return (
    <>
      <Toaster richColors />
      <GeneralLayout
        title="Detalle del pedido"
        description="Detalle del pedido"
      >
        <div className="mx-auto flex h-screen w-screen max-w-screen-sm flex-col gap-4 px-4 pb-24 pt-24 lg:max-w-5xl">
          <div className="flex w-full items-baseline justify-between gap-4 border-b border-b-secondary/20 text-primary">
            <div className="flex items-center gap-4">
              <Link href="/account/orders" className="btn btn-ghost btn-sm">
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
            <article className="order-2 flex h-full w-full flex-col gap-2 overflow-y-auto lg:order-1 lg:w-3/5">
              {productsQuery.isPending || orderQuery.isPending ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <SingleOrderItemSkeleton key={i} />
                ))
              ) : productsQuery.isError ||
                categoriesQuery.isError ||
                orderQuery.isError ? (
                <>
                  <ErrorSpan
                    message={productsQuery.error?.response?.data.comment}
                  />
                  <ErrorSpan
                    message={categoriesQuery.error?.response?.data.comment}
                  />
                  <ErrorSpan
                    message={orderQuery.error?.response?.data.comment}
                  />
                </>
              ) : (
                orderQuery.data.orderProducts.map((item) => (
                  <SingleOrderItem
                    key={item.id}
                    item={item}
                    category={
                      categoriesQuery.data?.find(
                        (category) => category.id === item.product.categoryID
                      )?.name
                    }
                  />
                ))
              )}
            </article>

            <article className="order-1 flex h-fit w-full flex-col gap-4 rounded-lg border-secondary/20 bg-secondary/5 p-4 pb-4 shadow-md lg:order-2 lg:h-full lg:w-2/5 lg:rounded-none lg:border-l lg:bg-transparent lg:pb-0 lg:pl-4 lg:shadow-none">
              {orderQuery.isError ? (
                <ErrorSpan message={orderQuery.error.response?.data.comment} />
              ) : (
                <>
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
                    <span className="text-lg text-secondary">
                      Total a abonar:
                    </span>
                    {orderQuery.isPending ? (
                      <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary/30" />
                    ) : (
                      !orderQuery.isError && (
                        <div className="flex items-end gap-1">
                          <span className="text-lg text-primary">$</span>
                          <span className="text-xl text-primary">
                            {orderQuery.data.total.toLocaleString(vars.region)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}

              {!orderQuery.isPending && !orderQuery.isError && (
                <div className="flex w-full flex-col gap-4">
                  <LoadableButton
                    isPending={createMPPaymentMutation.isPending}
                    onClick={redirectToMP}
                    className="btn btn-outline btn-primary w-full border border-sky-500"
                  >
                    <Image
                      alt="mp"
                      src={MercadoPago}
                      className="size-9 min-w-9"
                      unoptimized
                    />
                    Abonar con MercadoPago
                  </LoadableButton>

                  {/* <hr className="border-b border-t-0 border-b-secondary/20" /> */}

                  <input
                    id="voucher"
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files) loadVoucher(e.target.files[0]);
                    }}
                  />
                  <label
                    htmlFor="voucher"
                    className="btn btn-outline btn-primary w-full"
                  >
                    <Paperclip className="size-5" /> Adjuntar comprobante de
                    pago
                  </label>

                  <ErrorAlert
                    message={
                      uploadVoucherMutation.error?.response?.data.comment
                    }
                  />

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
                        isPending={uploadVoucherMutation.isPending}
                        onClick={() => uploadVoucherMutation.mutate()}
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
                        Comprobantes
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
                            position={i}
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

      {paymentStatusQuery.isSuccess && (
        <AwaitingPaymentModal
          isOpen={isAwaitingPaymentModalOpen}
          onClose={() => {
            setIsAwaitingPaymentModal(false);
            // setTimeout(() => {
            //   toast.dismiss(waitingForPaymentToast.current);
            // }, 5000);
          }}
          paymentStatus={paymentStatusQuery.data}
        />
      )}
    </>
  );
}

export const getServerSideProps = withAuth("noAdmin");

export function PaymentVoucher({
  payment,
  position,
}: {
  payment: Payment;
  position: number;
}) {
  return (
    <a
      href={payment.url ?? ""}
      target="_blank"
      className="relative flex h-fit w-full items-center justify-between gap-4 rounded-xl border-2 border-secondary/20 py-2 pl-11 pr-4 hover:border-secondary/60"
    >
      <span className="absolute left-1 top-1 flex items-center gap-0.5 text-sm text-secondary">
        <Hash className="size-3" />
        {position + 1}
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

      {payment.platform === "attachment" ? (
        <div className="flex items-center gap-2 text-sm uppercase tracking-wide">
          <Paperclip className="size-4 min-w-4 text-primary/70" /> Adjunto
        </div>
      ) : (
        <div className="flex flex-col items-center text-sm uppercase tracking-wide">
          <Image
            alt="mp"
            src={MercadoPago}
            className="size-8 min-w-8"
            unoptimized
          />
          <span>$ {payment.received}</span>
        </div>
      )}

      {/* <a
        href={payment.url}
        target="_blank"
        className="btn btn-outline btn-secondary btn-sm"
      >
        <FilePieChart className="size-5" />
        <span className="xxs:hidden lg:block">Ver</span>
        <span className="hidden xxs:block lg:hidden">Ver comprobante</span>
      </a> */}
    </a>
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
