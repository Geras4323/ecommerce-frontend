import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import type { ServerError, ServerSuccess } from "@/types/types";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, ChevronLeft, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { Toaster, toast } from "sonner";
import { z } from "zod";
import {
  DeleteProductModal,
  DiscardProductChangesModal,
} from "@/components/modals/administration/products";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { getCategories } from "@/functions/categories";
import { getSuppliers } from "@/functions/suppliers";
import { getProduct, type Product } from "@/functions/products";
import { ReactSortable } from "react-sortablejs";
import { cn } from "@/utils/lib";
import { type ProductImage } from "@/functions/images";
import { GeneralLayout } from "@/layouts/general";
import { useRouter } from "next/router";
import imageCompression from "browser-image-compression";
import _, { round } from "lodash";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export type ProductsFilters = {
  name: string | null;
  categoryID: string | null;
  supplierID: string | null;
};

type Input = z.input<typeof inputSchema>;
const inputSchema = z.object({
  name: z.string().min(1, { message: "Debe tener un nombre" }),
  price: z
    .string()
    .min(1, { message: "Debe ingresar un precio" })
    .transform((p) => Number(p)),
  code: z.string().optional(),
  categoryID: z
    .string({ required_error: "Categoría requerida" })
    .transform((id) => parseInt(id)),
  supplierID: z
    .string()
    .optional()
    .transform((id) => (id ? parseInt(id) : undefined)),
  description: z.string().min(10, { message: "Mínimo 10 caracteres" }),
});

export default function ProductData() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [existentFiles, setExistentFiles] = useState<
    (ProductImage & { isDeleted: boolean })[]
  >([]);

  const [tempFiles, setTempFiles] = useState<File[]>([]);

  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] =
    useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);

  const productID = z.string().catch("").parse(router.query.id);
  const isValidProductID = !isNaN(parseInt(productID));

  const productQuery = useQuery<
    Awaited<ReturnType<typeof getProduct>>,
    ServerError
  >({
    queryKey: ["product"],
    queryFn: () => getProduct(parseInt(productID)),
    enabled: isValidProductID,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!productQuery.isPending && productQuery.isSuccess) {
      const temp = productQuery.data.images.map((image) => ({
        ...image,
        isDeleted: false,
      }));
      setExistentFiles(temp);
    }
  }, [productQuery.data, productQuery.isSuccess, productQuery.isPending]);

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const suppliersQuery = useQuery<
    Awaited<ReturnType<typeof getSuppliers>>,
    ServerError
  >({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
    refetchOnWindowFocus: true,
    retry: false,
  });

  function removeUploadedImage(index: number) {
    setTempFiles((prev) => {
      const temp = structuredClone(prev);
      temp.splice(index, 1);
      return temp;
    });
  }

  function alternateExistentImageDeletion(imageToDeleteID: number) {
    setExistentFiles((prev) => {
      const imgIndex = prev.findIndex((img) => img.id === imageToDeleteID);
      if (imgIndex === -1) return prev;

      const temp = structuredClone(prev);
      temp[imgIndex]!.isDeleted = !temp[imgIndex]!.isDeleted;
      return temp;
    });
  }

  function inputsChanged() {
    const values = getValues();
    return (
      values.name !== productQuery.data?.name ||
      values.code !== productQuery.data?.code ||
      values.description !== productQuery.data?.description ||
      Number(values.price).toLocaleString(vars.region) !==
        productQuery.data?.price.toLocaleString(vars.region) ||
      Number(values.categoryID) !== productQuery.data?.categoryID ||
      Number(values.supplierID) !== productQuery.data?.supplierID
    );
  }

  function existentImagesChanged() {
    return !existentFiles.every((file, i) =>
      _.isEqual(file, { ...productQuery.data?.images[i], isDeleted: false })
    );
  }

  function uplodadedImagesChanged() {
    return tempFiles.length !== 0;
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["product"] });
  }

  function handleCancel() {
    if (
      !inputsChanged() &&
      !existentImagesChanged() &&
      !uplodadedImagesChanged()
    ) {
      setExistentFiles([]);
      goBack();
      return;
    }
    setIsDiscardChangesModalOpen(true);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    values: {
      code: productQuery.data?.code ?? "",
      name: productQuery.data?.name ?? "",
      description: productQuery.data?.description ?? "",
      price: `${round(productQuery.data?.price ?? 0, 2)}` ?? `${-1}`,
      categoryID: `${productQuery.data?.categoryID}` ?? `${-1}`,
      supplierID: `${productQuery.data?.supplierID}` ?? `${-1}`,
    },
  });

  const dataMutation = useMutation<ServerSuccess<Product>, ServerError, Input>({
    mutationFn: async (data) => {
      return axios.put(`${vars.serverUrl}/api/v1/products/${productID}`, data, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success("Producto actualizado");
      refreshQuery();
    },
  });

  const updateImagesMutation = useMutation<
    ServerSuccess<
      {
        id: number;
        position: number;
      }[]
    >,
    ServerError,
    void
  >({
    mutationFn: async () => {
      const images = existentFiles.map((file, i) => ({
        id: file.id,
        position: i,
        isDeleted: file.isDeleted,
      }));

      return axios.patch(
        `${vars.serverUrl}/api/v1/products/${productID}/images`,
        images,
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      toast.success("Imágenes actualizadas");
      refreshQuery();
    },
  });

  const uploadImagesMutation = useMutation<any, ServerError>({
    mutationFn: async () => {
      const images = new FormData();

      for (let i = 0; i < tempFiles.length; i++) {
        const element = tempFiles[i];
        if (!element) return;
        const compressedFile = await imageCompression(element, {
          maxSizeMB: 0.5,
        });
        images.append("images", compressedFile);
      }

      return axios.post(
        `${vars.serverUrl}/api/v1/products/${productID}/images`,
        images,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Imágenes subidas");
      setTempFiles([]);
      refreshQuery();
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (inputsChanged()) dataMutation.mutate(data);
    if (existentImagesChanged()) updateImagesMutation.mutate();
    if (uplodadedImagesChanged()) uploadImagesMutation.mutate();
  };

  const filtersRef = useRef<ProductsFilters>({
    name: "",
    categoryID: "",
    supplierID: "",
  });

  useEffect(() => {
    filtersRef.current = {
      name: searchParams.get("name"),
      categoryID: searchParams.get("categoryID"),
      supplierID: searchParams.get("supplierID"),
    };
  }, [searchParams]);

  function goBack() {
    let url = "/administration/products?";

    if (!!filtersRef.current.name) {
      url += `name=${filtersRef.current.name}&`;
    }
    if (!!filtersRef.current.categoryID) {
      url += `categoryID=${filtersRef.current.categoryID}&`;
    }
    if (!!filtersRef.current.supplierID) {
      url += `supplierID=${filtersRef.current.supplierID}&`;
    }

    router.push(url.slice(0, -1));
  }

  const anyPending =
    productQuery.isPending ||
    categoriesQuery.isPending ||
    suppliersQuery.isPending;

  const anyError =
    productQuery.isError || categoriesQuery.isError || suppliersQuery.isError;

  return (
    <>
      <Toaster richColors />
      <GeneralLayout title="Product" description="Edición de producto">
        <div className="flex h-full w-screen flex-col pb-4 pt-24">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto flex h-full w-full flex-col items-end gap-8 overflow-y-auto px-4 lg:w-fit"
          >
            <div className="flex h-fit w-full items-center justify-between gap-4">
              <div className="flex w-full items-center gap-4 truncate">
                <button onClick={goBack} className="btn btn-ghost btn-sm">
                  <ChevronLeft className="size-5" />
                </button>
                {productQuery.isPending ? (
                  <div className="h-8 w-52 animate-pulse rounded-md bg-secondary/20 sm:w-80 md:w-96" />
                ) : anyError ? (
                  <span className="text-lg">Volver a administración</span>
                ) : (
                  <span className="truncate text-lg sm:text-xl md:text-2xl">
                    {productQuery.data.name}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsDeleteProductModalOpen(true)}
                className={cn(
                  (anyPending || anyError) && "invisible",
                  "btn btn-error w-12 flex-row flex-nowrap items-center justify-end gap-4 overflow-hidden whitespace-nowrap rounded-md px-3 text-white transition-all hover:w-56"
                )}
              >
                <span>Eliminar producto</span>
                <div className="min-w-6">
                  <Trash2 className="size-6" />
                </div>
              </button>
            </div>

            {anyError ? (
              <div className="flex w-full justify-center">
                <div className="flex w-full max-w-screen-md flex-col gap-2">
                  {productQuery.isError && (
                    <ErrorSpan message="Ocurrió un error durante la carga del producto" />
                  )}
                  {categoriesQuery.isError && (
                    <ErrorSpan message="Ocurrió un error durante la carga de las categorías" />
                  )}
                  {suppliersQuery.isError && (
                    <ErrorSpan message="Ocurrió un error durante la carga de los proveedores" />
                  )}
                  <Link
                    href="/administration/products"
                    className="btn btn-primary mt-4 w-fit self-center"
                  >
                    <ArrowLeft className="size-5" />
                    Volver a administración
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col items-start gap-6 sm:flex-row">
                <div className="grid w-full max-w-screen-sm grid-cols-2 items-center gap-4 lg:w-screen">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label
                      htmlFor="name"
                      className="text-md text-primary sm:text-lg"
                    >
                      <MandatoryMark /> Nombre:
                    </label>
                    {productQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-md bg-secondary/20" />
                    ) : (
                      <input
                        id="name"
                        type="text"
                        placeholder="Nuevo nombre"
                        {...register("name")}
                        className="input input-bordered w-full shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
                      />
                    )}
                    <ErrorSpan message={errors.name?.message} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="price"
                      className="text-md text-primary sm:text-lg"
                    >
                      <MandatoryMark /> Precio:
                    </label>
                    {productQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-md bg-secondary/20" />
                    ) : (
                      <div className="flex h-12 items-center justify-start gap-3 rounded-lg border border-[var(--fallback-bc,oklch(var(--bc)/0.2))] px-4 shadow-inner-sm outline-none">
                        <span className="text-xl text-secondary">$</span>
                        <input
                          type="text"
                          placeholder="..."
                          {...register("price")}
                          className="h-full w-full bg-transparent pr-3 outline-none"
                        />
                      </div>
                    )}
                    <ErrorSpan message={errors.price?.message} />
                  </div>

                  <div className="flex h-full flex-col justify-start gap-1">
                    <label
                      htmlFor="code"
                      className="text-md text-primary sm:text-lg"
                    >
                      Código:
                    </label>
                    {productQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-md bg-secondary/20" />
                    ) : (
                      <input
                        id="code"
                        type="text"
                        placeholder="Nuevo código"
                        {...register("code")}
                        className="input input-bordered w-full shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
                      />
                    )}
                    <ErrorSpan message={errors.code?.message} />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
                    <label
                      htmlFor="category"
                      className="text-md text-primary sm:text-lg"
                    >
                      <MandatoryMark /> Categoría:
                    </label>
                    {productQuery.isPending || categoriesQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-md bg-secondary/20" />
                    ) : (
                      <Controller
                        name="categoryID"
                        control={control}
                        render={({ field }) => (
                          <Select
                            defaultValue={`${productQuery.data.categoryID}`}
                            onValueChange={(v) => field.onChange(v)}
                          >
                            <SelectTrigger className="input input-bordered w-full border shadow-inner-sm outline-none focus:shadow-inner-sm focus:outline-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesQuery.data.map((category) => (
                                <SelectOption
                                  key={category.id}
                                  value={`${category.id}`}
                                >
                                  {category.name}
                                </SelectOption>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    <ErrorSpan message={errors.categoryID?.message} />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1 md:col-span-1">
                    <label
                      htmlFor="supplier"
                      className="text-md text-primary sm:text-lg"
                    >
                      Proveedor:
                    </label>
                    {productQuery.isPending || suppliersQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-md bg-secondary/20" />
                    ) : (
                      <Controller
                        name="supplierID"
                        control={control}
                        render={({ field }) => (
                          <Select
                            defaultValue={
                              productQuery.data.supplierID
                                ? `${productQuery.data.supplierID}`
                                : "no_supplier"
                            }
                            onValueChange={(v) => field.onChange(v)}
                          >
                            <SelectTrigger className="input input-bordered w-full border shadow-inner-sm outline-none focus:shadow-inner-sm focus:outline-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectOption value="no_supplier">
                                <span className="italic text-secondary">
                                  Sin proveedor
                                </span>
                              </SelectOption>
                              {suppliersQuery.data.map((supplier) => (
                                <SelectOption
                                  key={supplier.id}
                                  value={`${supplier.id}`}
                                >
                                  {supplier.name}
                                </SelectOption>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    <ErrorSpan message={errors.supplierID?.message} />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1">
                    <label
                      htmlFor="description"
                      className="text-md text-primary sm:text-lg"
                    >
                      <MandatoryMark /> Descripción:
                    </label>
                    {productQuery.isPending ? (
                      <div className="h-48 max-h-96 min-h-16 w-full animate-pulse rounded-md bg-secondary/20" />
                    ) : (
                      <textarea
                        id="description"
                        placeholder="Nueva descripción"
                        {...register("description")}
                        className="input input-bordered h-48 max-h-96 min-h-16 w-full py-4 shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
                      />
                    )}
                    <ErrorSpan message={errors.description?.message} />
                  </div>
                </div>

                {/* IMAGES */}
                <div className="flex w-full min-w-80 flex-col gap-1 sm:w-80">
                  <label className="text-md text-primary sm:text-lg">
                    Imágenes:
                  </label>
                  <section className="flex min-w-fit flex-col gap-4">
                    {productQuery.isPending ? (
                      <div className="flex h-12 w-full animate-pulse rounded-md bg-secondary/20" />
                    ) : (
                      <div className="flex h-12 items-center justify-center rounded-lg border border-secondary/30 bg-base-300/50">
                        <label
                          htmlFor="update_image"
                          className="flex size-full cursor-pointer items-center justify-center gap-3 text-primary/80 hover:text-primary hover:shadow-md"
                        >
                          <Upload className="mt-1 size-5 animate-bounce sm:size-6" />
                          <span className="sm:text-md text-sm">
                            Subir imágenes
                          </span>
                        </label>
                        <input
                          id="update_image"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={(e) => {
                            if (!e.target.files) return;
                            setTempFiles((prev) => [
                              ...prev,
                              ...(e.target.files as FileList),
                            ]);
                          }}
                        />
                      </div>
                    )}

                    <div className="flex max-h-104 flex-col gap-4 overflow-y-auto">
                      {tempFiles.length !== 0 && (
                        <div className="flex grid-cols-3 flex-wrap gap-4 sm:grid">
                          {tempFiles.map((file, i) => (
                            <div key={i} className="group relative">
                              <Image
                                src={URL.createObjectURL(file)}
                                width={200}
                                height={200}
                                alt={`${i}`}
                                className="size-24 select-none rounded-xl object-cover opacity-50"
                                draggable={false}
                              />
                              <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                                <Upload className="size-3.5" />
                              </div>
                              <div
                                onClick={() => removeUploadedImage(i)}
                                className="absolute bottom-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-md bg-error font-semibold opacity-0 transition-opacity duration-100 group-hover:opacity-90"
                              >
                                <Trash2 className="size-3 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {productQuery.isPending ? (
                        <div className="flex grid-cols-3 flex-wrap gap-4 sm:grid">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="size-24 animate-pulse rounded-md bg-secondary/20"
                            />
                          ))}
                        </div>
                      ) : (
                        !!existentFiles && (
                          <ReactSortable
                            animation={150}
                            list={existentFiles}
                            setList={setExistentFiles}
                            className="flex grid-cols-3 flex-wrap gap-4 sm:grid"
                            direction="horizontal"
                          >
                            {existentFiles.map((image, i) => (
                              <div key={image.id} className="group relative">
                                <Image
                                  src={image.url}
                                  width={200}
                                  height={200}
                                  alt={image.url}
                                  className={cn(
                                    image.isDeleted && "opacity-30",
                                    i === 0 && "border-2 border-primary",
                                    "size-24 rounded-xl object-cover hover:cursor-grab active:cursor-grabbing"
                                  )}
                                />
                                <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                                  {i + 1}
                                </div>
                                <div
                                  onClick={() =>
                                    alternateExistentImageDeletion(image.id)
                                  }
                                  className="absolute bottom-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-md bg-error font-semibold text-white opacity-0 transition-opacity duration-100 group-hover:opacity-90"
                                >
                                  {image.isDeleted ? (
                                    <X className="size-3" />
                                  ) : (
                                    <Trash2 className="size-3" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </ReactSortable>
                        )
                      )}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {!anyPending && !anyError && (
              <section className="flex gap-4">
                <button
                  type="button"
                  className="btn btn-ghost w-32"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <LoadableButton
                  type="submit"
                  isPending={
                    dataMutation.isPending ||
                    updateImagesMutation.isPending ||
                    uploadImagesMutation.isPending
                  }
                  className="btn-primary w-32"
                  animation="dots"
                >
                  Guardar
                </LoadableButton>
              </section>
            )}
          </form>

          <>
            <DiscardProductChangesModal
              isOpen={isDiscardChangesModalOpen}
              onClose={() => setIsDiscardChangesModalOpen(false)}
              onConfirm={() => {
                router.push("/administration/products/");
              }}
            />
            {!productQuery.isPending && !productQuery.isError && (
              <DeleteProductModal
                isOpen={isDeleteProductModalOpen}
                onClose={() => setIsDeleteProductModalOpen(false)}
                onSuccess={() => {
                  setExistentFiles([]);
                  router.push("/administration/products/");
                }}
                product={productQuery.data}
              />
            )}
          </>
        </div>
      </GeneralLayout>
    </>
  );
}
