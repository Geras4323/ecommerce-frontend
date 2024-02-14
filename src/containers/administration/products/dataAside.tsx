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
import { useEffect, useState } from "react";
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
    .string({ required_error: "Proveedor requerido" })
    .transform((id) => parseInt(id)),
  description: z.string().min(10, { message: "Mínimo 10 caracteres" }),
});

export function ProductDataAside() {
  const {
    product,
    product_select,
    product_remove,
    create_isOpen,
    update_isChanged,
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
      refreshQuery();
      resetInputData();
      product_remove();
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (checkChange()) {
      dataMutation.mutate(data);
      return;
    }

    resetInputData();
    product_remove();
    // if (image) imageMutation.mutate();
  };

  // const imageMutation = useMutation<any, ServerError, void>({
  //   mutationFn: async () => {
  //     return axios.post(
  //       `${vars.serverUrl}/api/v1/categories/${product?.id}/image`,
  //       { file: image },
  //       {
  //         withCredentials: true,
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //   },
  //   onSuccess: () => {
  //     toast.success("Subido");
  //     refreshQuery();
  //     resetImage();
  //   },
  // });

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
            <AlertCircle className="size-6" />
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
                  <MandatoryMark /> Proveedor:
                </label>
                <Controller
                  name="supplierID"
                  control={control}
                  render={({ field }) => (
                    <Select
                      defaultValue={`${product.supplierID}`}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="input input-bordered w-full border outline-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
        </div>

        <section className="mt-8 flex gap-4">
          <button
            type="button"
            disabled={!update_isChanged && !image}
            className="btn btn-ghost w-32"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <LoadableButton
            type="submit"
            // isLoading={dataMutation.isPending || imageMutation.isPending}
            isLoading={dataMutation.isPending}
            disabled={!update_isChanged && !image}
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
