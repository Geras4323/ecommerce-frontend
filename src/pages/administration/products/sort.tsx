import {
  SortableItem,
  SortableItemSkeleton,
} from "@/components/administration/products";
import { ErrorSpan, LoadableButton } from "@/components/forms";
import { getProducts } from "@/functions/products";
import { withAuth } from "@/functions/session";
import { GeneralLayout } from "@/layouts/general";
import { type ServerError } from "@/types/types";
import { withCbk } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { ReactSortable } from "react-sortablejs";

export default function ProductSorting() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [productList, setProductList] = useState<
    { id: number; name: string; imageURL: string }[]
  >([]);

  const productsQuery = useQuery<
    Awaited<ReturnType<typeof getProducts>>,
    ServerError
  >({
    queryKey: ["products"],
    queryFn: withCbk({
      queryFn: getProducts,
      onSuccess: (data) =>
        setProductList(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            imageURL: p.images[0]?.url ?? "",
          }))
        ),
    }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const mutation = useMutation<void, ServerError>({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/products/positions`;
      const temp = productList.map((p, i) => ({ id: p.id, position: i }));
      return axios.patch(url, temp, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/administration/products");
    },
  });

  return (
    <GeneralLayout title="Productos" description="Ordenar productos">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 px-4 pb-4 pt-24">
        <div className="flex w-full items-center justify-between gap-4 border-b border-b-secondary/20">
          <div className="flex w-fit items-center gap-4">
            <Link
              href="/administration/products"
              className="btn btn-ghost btn-sm"
            >
              <ChevronLeft className="size-5" />
            </Link>
            <span className="flex gap-2 py-2 text-xl font-medium">
              ORDENAR <span className="hidden xxs:block">PRODUCTOS</span>
            </span>
          </div>

          {productsQuery.isPending ? (
            <div className="h-8 w-32 animate-pulse rounded-md bg-secondary/20 xs:w-48" />
          ) : productsQuery.isError ? (
            <ErrorSpan message={productsQuery.error.response?.data.comment} />
          ) : (
            <div className="flex flex-col items-end gap-3">
              <LoadableButton
                onClick={() => mutation.mutate()}
                isPending={mutation.isPending}
                className="btn btn-primary btn-sm w-32 xs:w-48"
              >
                <Save className="size-5 min-w-5" />
                <span>Guardar</span>
                <span className="-ml-1 hidden xs:block">cambios</span>
              </LoadableButton>

              <ErrorSpan
                className="mb-1.5"
                message={mutation.error?.response?.data.comment}
              />
            </div>
          )}
        </div>

        {productsQuery.isPending ? (
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SortableItemSkeleton key={i} />
            ))}
          </div>
        ) : productsQuery.isError ? (
          <div className="mt-2 flex w-full justify-center">
            <ErrorSpan
              message="Ocurrió un error al cargar los productos"
              className="text-lg"
            />
          </div>
        ) : (
          <ReactSortable
            animation={150}
            list={productList}
            setList={setProductList}
            className="mx-auto grid grid-cols-1 justify-center gap-3 md:grid-cols-2 xl:grid-cols-3"
            direction="horizontal"
          >
            {productList?.map((product, i) => (
              <SortableItem key={i} product={product} position={i} />
            ))}
          </ReactSortable>
        )}
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("admin");
