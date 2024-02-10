import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import { DiscardProductChangesModal } from "@/components/modals/administration/products";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { getCategories } from "@/functions/categories";
import { type Product } from "@/functions/products";
import { getSuppliers } from "@/functions/suppliers";
import { useProductStore } from "@/hooks/states/products";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  DollarSign,
  PanelLeftClose,
  Search,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Input = z.infer<typeof inputSchema>;
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

export function ProductCreateAside() {
  const queryClient = useQueryClient();

  const {
    create_isOpen,
    create_close,
    create_isChanged,
    create_change,
    create_modal_discardChanges_isOpen,
    create_modal_discardChanges_change,
  } = useProductStore();

  const [image, setImage] = useState<File>();

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

  function resetInputData() {
    reset();
    create_change(false);
  }

  function resetImage() {
    setImage(undefined);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  function handleCancel() {
    if (!image && !create_isChanged) {
      create_change(false);
      create_close();
      return;
    }

    create_modal_discardChanges_change(true);
  }

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    defaultValues: { code: "", name: "" },
  });

  watch((value, { type }) => {
    if (type !== "change") return;
    create_change(
      value.name !== "" ||
        value.code !== "" ||
        value.description !== "" ||
        value.price !== undefined ||
        value.categoryID !== undefined ||
        value.supplierID !== undefined
    );
  });

  const onSubmit: SubmitHandler<z.output<typeof inputSchema>> = (data) => {
    if (create_isChanged) dataMutation.mutate(data);
    console.log(data);
  };

  const dataMutation = useMutation<
    ServerSuccess<Product>,
    ServerError,
    z.output<typeof inputSchema>
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/products`;
      return axios.post(url, [data], { withCredentials: true });
    },
    onSuccess: (product) => {
      // if (image) {
      //   // imageMutation.mutate(product.data.id);
      //   return;
      // }
      toast.success("Producto creado exitosamente");
      resetInputData();
      refreshQuery();
      create_close();
    },
  });

  // const imageMutation = useMutation<any, ServerError, number>({
  //   mutationFn: async (catID) => {
  //     return axios.post(
  //       `${vars.serverUrl}/api/v1/products/${catID}/image`,
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
  //     resetInputData();
  //     refreshQuery();
  //     resetImage();
  //     create_close();
  //   },
  // });

  return (
    <section
      className={cn(
        create_isOpen
          ? "h-full w-1/2 border-r border-r-secondary/20 px-4 opacity-100 2xl:w-1/3"
          : "w-0 overflow-hidden border-r border-r-transparent px-0 opacity-0",
        "flex flex-col py-4 transition-all duration-300"
      )}
    >
      <div className="mb-8 flex h-12 w-full items-center justify-end gap-4">
        <span className="whitespace-nowrap text-2xl">Crear nuevo producto</span>
        <button
          onClick={handleCancel}
          className="btn btn-ghost btn-outline border border-secondary/30"
        >
          <PanelLeftClose className="size-6" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full flex-col items-end gap-4 overflow-y-auto"
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
                type="number"
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

          {create_isOpen && (
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
                      // defaultValue="no_category"
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="input input-bordered w-full border outline-none">
                        <SelectValue placeholder="Seleccionar categoría" />
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
                      // defaultValue="no_category"
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="input input-bordered w-full border outline-none">
                        <SelectValue placeholder="Seleccionar proveedor" />
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
            disabled={!create_isChanged && !image}
            className="btn btn-ghost w-32"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <LoadableButton
            type="submit"
            // isLoading={dataMutation.isPending || imageMutation.isPending}
            isLoading={dataMutation.isPending}
            disabled={!create_isChanged && !image}
            className="btn-primary w-32"
            animation="loading-dots"
          >
            Guardar
          </LoadableButton>
        </section>
      </form>

      <DiscardProductChangesModal
        isOpen={create_modal_discardChanges_isOpen}
        onClose={() => create_modal_discardChanges_change(false)}
        onConfirm={() => {
          resetInputData();
          resetImage();
          create_close();
        }}
        deselectProduct
      />
    </section>
  );
}
