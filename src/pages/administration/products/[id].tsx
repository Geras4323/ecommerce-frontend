import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import type { ServerError, ServerSuccess } from "@/types/types";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DollarSign, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
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
import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useRouter } from "next/router";

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

  const [existentFiles, setExistentFiles] = useState<
    (ProductImage & { isDeleted: boolean })[]
  >([]);

  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] =
    useState(false);
  // const [isDeleteProductImageModalOpen, setIsDeleteProductImageModalOpen] =
  //   useState(false);
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
    console.log("change");
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

  function alternateImageDeletion(imageToDeleteID: number) {
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
      Number(values.price).toLocaleString("es-AR") !==
        productQuery.data?.price.toLocaleString("es-AR") ||
      Number(values.categoryID) !== productQuery.data?.categoryID ||
      Number(values.supplierID) !== productQuery.data?.supplierID
    );
  }

  function imagesChanged() {
    return !existentFiles.every(
      (file, i) => file === productQuery.data?.images[i]
    );
  }

  function resetInputData() {
    reset({ code: productQuery.data?.code, name: productQuery.data?.name });
  }

  function resetImages() {
    setExistentFiles([]);
    // setTempFiles([]);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["product"] });
  }

  function handleCancel() {
    if (!inputsChanged() && !imagesChanged()) {
      setExistentFiles([]);
      return;
    }
    setIsDiscardChangesModalOpen(true);
  }

  const {
    reset,
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
      price: `${productQuery.data?.price}` ?? `${-1}`,
      categoryID: `${productQuery.data?.categoryID}` ?? `${-1}`,
      supplierID: `${productQuery.data?.supplierID}` ?? `${-1}`,
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (inputsChanged()) dataMutation.mutate(data);
    if (imagesChanged()) imagesMutation.mutate();
  };

  const dataMutation = useMutation<ServerSuccess<Product>, ServerError, Input>({
    mutationFn: async (data) => {
      return axios.put(`${vars.serverUrl}/api/v1/products/${productID}`, data, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success("Actualizado");
      // if (tempFiles.length === 0) {
      //   refreshQuery();
      //   product_remove();
      // }
      refreshQuery();
    },
  });

  const imagesMutation = useMutation<
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
      toast.success("Actualizado");
      refreshQuery();
      // resetImages();
      // if (checkChange()) product_remove();
    },
  });

  if (productQuery.isPending) return <>loading</>;
  if (productQuery.isError) return <>error</>;

  return (
    <>
      <Toaster richColors />
      <GeneralLayout title="Product" description="Edición de producto">
        <div className="flex h-full w-screen flex-col pt-24">
          {/* HEADER */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto flex h-full w-fit flex-col items-end gap-8 overflow-y-auto px-2"
          >
            <div className="flex h-fit w-full items-center justify-between gap-4">
              <div className="flex w-full items-center gap-4 truncate">
                <span className="truncate text-2xl">
                  {productQuery.data.name}
                </span>
              </div>
              <button
                onClick={() => setIsDeleteProductModalOpen(true)}
                className="btn btn-error w-12 flex-row flex-nowrap items-center justify-end gap-4 overflow-hidden whitespace-nowrap rounded-md px-3 text-white transition-all hover:w-56"
              >
                <span>Eliminar producto</span>
                <div className="min-w-6">
                  <Trash2 className="size-6" />
                </div>
              </button>
            </div>

            <div className="flex flex-row items-start gap-6">
              <div className="grid w-screen max-w-screen-sm grid-cols-2 items-center gap-4">
                <div className="col-span-2 flex flex-col gap-1">
                  <label htmlFor="name" className="text-lg text-secondary">
                    <MandatoryMark /> Nombre:
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Nuevo nombre"
                    {...register("name")}
                    className="input input-bordered w-full bg-base-300/50"
                  />
                  <ErrorSpan message={errors.name?.message} />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="price" className="text-lg text-secondary">
                    <MandatoryMark /> Precio:
                  </label>
                  <div className="input flex items-center justify-start border border-secondary/30 p-0">
                    <div className="flex h-full w-12 items-center justify-center">
                      <DollarSign className="size-6 text-secondary" />
                    </div>
                    <input
                      type="text"
                      placeholder="..."
                      {...register("price")}
                      className="h-full w-full bg-transparent pr-3"
                    />
                  </div>
                  <ErrorSpan message={errors.price?.message} />
                </div>

                <div className="flex h-full flex-col justify-start gap-1">
                  <label htmlFor="code" className="text-lg text-secondary">
                    Código:
                  </label>
                  <input
                    id="code"
                    type="text"
                    placeholder="Nuevo código"
                    {...register("code")}
                    className="input input-bordered w-full bg-base-300/50"
                  />
                  <ErrorSpan message={errors.code?.message} />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="category" className="text-lg text-secondary">
                    <MandatoryMark /> Categoría:
                  </label>
                  <Controller
                    name="categoryID"
                    control={control}
                    render={({ field }) => (
                      <Select
                        defaultValue={`${productQuery.data.categoryID}`}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="input input-bordered w-full border bg-base-300/50 outline-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesQuery.data?.map((category) => (
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
                  <ErrorSpan message={errors.categoryID?.message} />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="supplier" className="text-lg text-secondary">
                    Proveedor:
                  </label>
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
                        <SelectTrigger className="input input-bordered w-full border bg-base-300/50 outline-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectOption value="no_supplier">
                            <span className="italic text-secondary">
                              Sin proveedor
                            </span>
                          </SelectOption>
                          {suppliersQuery.data?.map((supplier) => (
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
                  <ErrorSpan message={errors.supplierID?.message} />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label
                    htmlFor="description"
                    className="text-lg text-secondary"
                  >
                    <MandatoryMark /> Descripción:
                  </label>
                  <textarea
                    id="description"
                    placeholder="Nueva descripción"
                    {...register("description")}
                    className="input input-bordered h-48 max-h-96 min-h-16 w-full bg-base-300/50 py-4"
                  />
                  <ErrorSpan message={errors.description?.message} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-lg text-secondary">Imágenes:</label>
                <section className="flex min-w-fit flex-col gap-4">
                  <div className="flex h-12 items-center justify-center rounded-lg border border-secondary/30 bg-base-300/50">
                    <label
                      htmlFor="update_image"
                      className="flex size-full cursor-pointer items-center justify-center"
                    >
                      <Upload className="mt-1 size-6 animate-bounce text-primary/80" />
                    </label>
                    <input
                      id="update_image"
                      type="file"
                      className="hidden"
                      multiple
                      // onChange={(e) =>
                      //   setUploadedFiles((prev) => [
                      //     ...prev,
                      //     ...(e.target.files as FileList),
                      //   ])
                      // }
                    />
                  </div>
                  {!!existentFiles && (
                    <ReactSortable
                      animation={150}
                      list={existentFiles}
                      setList={setExistentFiles}
                      className="grid grid-cols-3 flex-wrap gap-4"
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
                              "size-24 rounded-xl hover:cursor-grab active:cursor-grabbing"
                            )}
                            unoptimized
                          />
                          <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                            {i + 1}
                          </div>
                          <div
                            onClick={() => alternateImageDeletion(image.id)}
                            className="absolute bottom-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-md bg-error font-semibold text-primary opacity-0 transition-opacity duration-100 group-hover:opacity-90"
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
                  )}
                </section>
              </div>
            </div>

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
                isPending={dataMutation.isPending || imagesMutation.isPending}
                className="btn-primary w-32"
                animation="loading-dots"
              >
                Guardar
              </LoadableButton>
            </section>
          </form>

          <>
            <DiscardProductChangesModal
              isOpen={isDiscardChangesModalOpen}
              onClose={() => setIsDiscardChangesModalOpen(false)}
              onConfirm={() => {
                resetInputData();
                resetImages();
              }}
            />
            <DeleteProductModal
              isOpen={isDeleteProductModalOpen}
              onClose={() => setIsDeleteProductModalOpen(false)}
              onSuccess={() => null}
              product={productQuery.data}
            />
            {/* <DeleteProductImageModal
              isOpen={isDeleteProductImageModalOpen}
              onClose={() => setIsDeleteProductImageModalOpen(false)}
              product={selected_product}
            /> */}
          </>
        </div>
      </GeneralLayout>
    </>
  );
}
