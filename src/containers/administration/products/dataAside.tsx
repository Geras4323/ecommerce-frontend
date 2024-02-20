import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  DollarSign,
  PanelRightClose,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import NoImage from "../../../../public/no_image.png";
import { useProductStore } from "@/hooks/states/products";
import {
  DeleteProductImageModal,
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
import { type Product } from "@/functions/products";
import { type CloudinarySuccess } from "@/types/cloudinary";

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

export function ProductDataAside() {
  const {
    product,
    product_select,
    product_remove,
    create_isOpen,
    // update_isChanged,
  } = useProductStore();

  const queryClient = useQueryClient();

  const [image, setImage] = useState<File>();
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] =
    useState(false);
  const [isDeleteProductImageModalOpen, setIsDeleteProductImageModalOpen] =
    useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);

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

  function checkChange() {
    const values = getValues();
    return (
      values.name !== product?.name ||
      values.code !== product?.code ||
      values.description !== product?.description ||
      Number(values.price) !== product?.price ||
      Number(values.categoryID) !== product?.categoryID ||
      Number(values.supplierID) !== product?.supplierID
    );
  }

  function resetInputData() {
    reset({ code: product?.code, name: product?.name });
  }

  function resetImage() {
    setImage(undefined);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  function handleCancel() {
    if (!image && !checkChange()) {
      product_remove();
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
      code: product?.code ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: `${product?.price}` ?? `${-1}`,
      categoryID: `${product?.categoryID}` ?? `${-1}`,
      supplierID: `${product?.supplierID}` ?? `${-1}`,
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (checkChange() || image) {
      if (checkChange()) dataMutation.mutate(data);
      if (image) imageMutation.mutate();
      return;
    }
    resetInputData();
    product_remove();
  };

  const dataMutation = useMutation<ServerSuccess<Product>, ServerError, Input>({
    mutationFn: async (data) => {
      return axios.put(
        `${vars.serverUrl}/api/v1/products/${product?.id}`,
        data,
        { withCredentials: true }
      );
    },
    onSuccess: (p) => {
      product_select(p.data); // update product in aside
      toast.success("Actualizado");
      if (!image) {
        refreshQuery();
        product_remove();
      }
    },
  });

  const imageMutation = useMutation<
    ServerSuccess<{ id: number; cloud: CloudinarySuccess }>,
    ServerError,
    void
  >({
    mutationFn: async () => {
      return axios.post(
        `${vars.serverUrl}/api/v1/products/${product?.id}/image`,
        { file: image },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: (res) => {
      toast.success("Subido");
      refreshQuery();
      resetImage();
      if (product)
        product_select({
          ...product,
          images: [
            { id: res.data.id, url: res.data.cloud.Response.secure_url },
          ],
        });
      if (checkChange()) product_remove();
    },
  });

  return (
    <section
      className={cn(
        product && !create_isOpen
          ? "h-full w-1/2 border-l border-l-secondary/20 px-4 opacity-100 2xl:w-1/3"
          : "w-0 overflow-hidden border-l border-l-transparent px-0 opacity-0",
        "flex flex-col py-4 transition-all duration-300"
      )}
    >
      {/* HEADER */}
      <div className="mb-8 flex h-12 w-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-outline border border-secondary/30"
          >
            <PanelRightClose className="size-6" />
          </button>
          <span className="text-2xl">{product?.name}</span>
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full flex-col items-end gap-4 overflow-y-auto pr-4"
      >
        <div className="grid w-full grid-cols-2 items-center gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="name" className="text-lg text-secondary">
              <MandatoryMark /> Nombre:
            </label>
            <input
              id="name"
              type="text"
              placeholder="Nuevo nombre"
              {...register("name")}
              className="input input-bordered w-full"
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
              className="input input-bordered w-full"
            />
            <ErrorSpan message={errors.code?.message} />
          </div>

          {product && (
            <>
              <div className="flex flex-col gap-1">
                <label htmlFor="category" className="text-lg text-secondary">
                  <MandatoryMark /> Categoría:
                </label>
                <Controller
                  name="categoryID"
                  control={control}
                  render={({ field }) => (
                    <Select
                      defaultValue={`${product.categoryID}`}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="input input-bordered w-full border outline-none">
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
                        product.supplierID
                          ? `${product.supplierID}`
                          : "no_supplier"
                      }
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="input input-bordered w-full border outline-none">
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
            </>
          )}

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="description" className="text-lg text-secondary">
              <MandatoryMark /> Descripción:
            </label>
            <textarea
              id="description"
              placeholder="Nueva descripción"
              {...register("description")}
              className="input input-bordered h-48 max-h-96 min-h-16 w-full py-4"
            />
            <ErrorSpan message={errors.description?.message} />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-lg text-secondary">Imágen:</label>
            <section className="flex min-w-fit flex-row gap-4">
              <div className="flex size-48 min-w-48 items-center justify-center rounded-xl border border-secondary/50">
                <div className="group relative size-11/12 overflow-hidden rounded-md">
                  {product?.images?.[0] && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteProductImageModalOpen(true)}
                      className="btn btn-error btn-sm absolute bottom-2 right-2 z-40 size-10 p-0 text-white opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  )}
                  <label
                    htmlFor="update_image"
                    className="absolute left-0 top-0 z-30 flex size-full cursor-pointer items-center justify-center opacity-0 backdrop-blur-sm transition-opacity group-hover:bg-neutral/50 group-hover:opacity-100"
                  >
                    <Upload className="size-8 animate-bounce text-white" />
                  </label>
                  <input
                    id="update_image"
                    type="file"
                    className="hidden"
                    onChange={(e) => setImage(e.target.files?.[0])}
                  />
                  {image && (
                    <Image
                      alt="preview"
                      width={200}
                      height={200}
                      src={URL.createObjectURL(image)}
                      className="absolute size-full rounded-md"
                    />
                  )}
                  <Image
                    alt={product?.name ?? ""}
                    src={product?.images?.[0]?.url ?? NoImage}
                    width={200}
                    height={200}
                    className="z-10 size-full select-none rounded-md bg-secondary/10 object-cover"
                  />
                </div>
              </div>
              {image && (
                <div className="flex items-center justify-center gap-2 text-error">
                  <AlertCircle className="size-4" />
                  <ErrorSpan message="Imagen no guardada" />
                </div>
              )}
            </section>
          </div>

          {/* <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="description" className="text-lg text-secondary">
              Imágenes:
            </label>
            <div className="flex min-h-36 w-full gap-4">
              <label
                htmlFor="new_images"
                className="flex h-36 min-w-36 cursor-pointer items-center justify-center rounded-lg bg-secondary/20"
              >
                <Upload className="size-8 animate-bounce text-white" />
              </label>
              <input
                id="new_images"
                name="files"
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                  if (!e.target.files) return;
                  setImages(e.target.files);
                }}
              />

              <div className="flex min-h-36 w-full gap-4 overflow-hidden overflow-x-auto rounded-lg">
                {images &&
                  Array.from(images).map((image, i) => (
                    <Image
                      key={image.name}
                      alt={`toUpload ${i}`}
                      src={URL.createObjectURL(image)}
                      width={200}
                      height={200}
                      className="h-full w-36 flex-shrink-0 rounded-lg bg-secondary/10 opacity-50"
                    />
                  ))}

                {product?.images.map((image, i) => (
                  <Image
                    key={image.id}
                    alt={`image ${i}`}
                    src={image.url}
                    width={200}
                    height={200}
                    className="h-full w-36 flex-shrink-0 rounded-lg bg-secondary/10"
                  />
                ))}
              </div>
            </div>
          </div> */}
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
            isLoading={dataMutation.isPending || imageMutation.isPending}
            className="btn-primary w-32"
            animation="loading-dots"
          >
            Guardar
          </LoadableButton>
        </section>
      </form>

      {product && (
        <>
          <DiscardProductChangesModal
            isOpen={isDiscardChangesModalOpen}
            onClose={() => setIsDiscardChangesModalOpen(false)}
            onConfirm={() => {
              resetInputData();
              resetImage();
              product_remove();
            }}
          />
          <DeleteProductModal
            isOpen={isDeleteProductModalOpen}
            onClose={() => setIsDeleteProductModalOpen(false)}
            onSuccess={() => product_remove()}
            product={product}
          />
          <DeleteProductImageModal
            isOpen={isDeleteProductImageModalOpen}
            onClose={() => setIsDeleteProductImageModalOpen(false)}
            product={product}
          />
        </>
      )}
    </section>
  );
}
