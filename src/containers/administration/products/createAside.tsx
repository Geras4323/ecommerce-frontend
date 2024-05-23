import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import { DiscardProductChangesModal } from "@/components/modals/administration/products";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Sheet, SheetContent } from "@/components/shadcn/sheet";
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
import { PanelLeftClose, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { ReactSortable } from "react-sortablejs";
import { toast } from "sonner";
import { z } from "zod";
import imageCompression from "browser-image-compression";

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

export function ProductCreateAside() {
  const queryClient = useQueryClient();

  const {
    create_isOpen,
    create_close,
    create_modal_discardChanges_isOpen,
    create_modal_discardChanges_change,
  } = useProductStore();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [tempFiles, setTempFiles] = useState<{ id: number; data: File }[]>([]);

  useEffect(() => {
    setTempFiles(
      uploadedFiles.map((file, i) => ({
        id: i,
        data: file,
      }))
    );
  }, [uploadedFiles]);

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
      values.name !== "" ||
      values.code !== "" ||
      values.description !== "" ||
      values.price !== "" ||
      values.categoryID !== undefined ||
      values.supplierID !== undefined
    );
  }

  function resetInputData() {
    reset();
  }

  function resetImage() {
    setUploadedFiles([]);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  function handleCancel() {
    if (uploadedFiles.length === 0 && !checkChange()) {
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
    getValues,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    defaultValues: { code: "", name: "", price: "" },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (checkChange()) {
      dataMutation.mutate(data);
      return;
    }
    resetInputData();
    create_close();
  };

  const dataMutation = useMutation<ServerSuccess<Product>, ServerError, Input>({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/products`;
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: (res) => {
      if (uploadedFiles.length !== 0) {
        imagesMutation.mutate(res.data.id);
        return;
      }
      toast.success("Producto creado exitosamente");
      resetInputData();
      refreshQuery();
      create_close();
    },
  });

  const imagesMutation = useMutation<any, ServerError, number>({
    mutationFn: async (prodID) => {
      const images = new FormData();
      for (let i = 0; i < tempFiles.length; i++) {
        const element = tempFiles[i];
        if (!element) return;
        const compressedFile = await imageCompression(element.data, {
          maxSizeMB: 0.5,
        });
        images.append("images", compressedFile);
      }

      return axios.post(
        `${vars.serverUrl}/api/v1/products/${prodID}/images`,
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
      resetInputData();
      refreshQuery();
      resetImage();
      create_close();
    },
  });

  return (
    <Sheet open={create_isOpen}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col border-l border-l-secondary/20 bg-base-100 md:w-1/3 md:min-w-screen-sm"
      >
        {/* HEADER */}
        <div className="mb-8 flex h-fit w-full items-center justify-end gap-4">
          <span className="whitespace-nowrap text-xl md:text-2xl">
            Crear nuevo producto
          </span>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-outline border border-secondary/30 shadow-sm"
          >
            <PanelLeftClose className="size-6" />
          </button>
        </div>

        {/* DATA */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full flex-col items-end gap-4 overflow-y-auto px-2"
        >
          <div className="grid w-full grid-cols-2 items-center gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label htmlFor="name" className="text-md text-primary sm:text-lg">
                <MandatoryMark /> Nombre:
              </label>
              <input
                id="name"
                type="text"
                placeholder="Nuevo nombre"
                {...register("name")}
                className="input input-bordered w-full shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
              />
              <ErrorSpan message={errors.name?.message} />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="price"
                className="text-md text-primary sm:text-lg"
              >
                <MandatoryMark /> Precio:
              </label>
              <div className="flex h-12 items-center justify-start gap-3 rounded-lg border border-[var(--fallback-bc,oklch(var(--bc)/0.2))] px-4 shadow-inner-sm outline-none">
                <span className="text-xl text-secondary">$</span>
                <input
                  type="text"
                  placeholder="..."
                  {...register("price")}
                  className="h-full w-full bg-transparent pr-3 focus:outline-none"
                />
              </div>
              <ErrorSpan message={errors.price?.message} />
            </div>

            <div className="flex h-full flex-col justify-start gap-1">
              <label htmlFor="code" className="text-md text-primary sm:text-lg">
                Código:
              </label>
              <input
                id="code"
                type="text"
                placeholder="Nuevo código"
                {...register("code")}
                className="input input-bordered w-full shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
              />
              <ErrorSpan message={errors.code?.message} />
            </div>

            {create_isOpen && (
              <>
                <div className="col-span-2 flex flex-col gap-1 xs:col-span-1">
                  <label
                    htmlFor="category"
                    className="text-md text-primary sm:text-lg"
                  >
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
                        <SelectTrigger className="input input-bordered w-full border shadow-inner-sm outline-none focus:shadow-inner-sm focus:outline-none">
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

                <div className="col-span-2 flex h-full flex-col justify-start gap-1 xs:col-span-1">
                  <label
                    htmlFor="supplier"
                    className="text-md text-primary sm:text-lg"
                  >
                    Proveedor:
                  </label>
                  <Controller
                    name="supplierID"
                    control={control}
                    render={({ field }) => (
                      <Select
                        defaultValue="no_supplier"
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="input input-bordered w-full border shadow-inner-sm outline-none focus:shadow-inner-sm focus:outline-none">
                          {/* <SelectValue placeholder="Seleccionar proveedor" /> */}
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
              <label
                htmlFor="description"
                className="text-md text-primary sm:text-lg"
              >
                <MandatoryMark /> Descripción:
              </label>
              <textarea
                id="description"
                placeholder="Nueva descripción"
                {...register("description")}
                className="input input-bordered h-32 max-h-96 min-h-16 w-full py-4 shadow-inner-sm focus:shadow-inner-sm focus:outline-none xs:h-48"
              />
              <ErrorSpan message={errors.description?.message} />
            </div>
          </div>

          {/* IMAGES */}
          <div className="col-span-2 flex w-full flex-col gap-1">
            <label className="text-md text-primary sm:text-lg">Imágenes:</label>
            <section className="flex min-w-fit flex-wrap gap-4">
              <div className="flex size-24 min-w-24 items-center justify-center rounded-xl border border-secondary/50 bg-base-300/50 text-primary/80 hover:text-primary hover:shadow-md">
                <label
                  htmlFor="new_image"
                  className={cn(
                    "z-10 flex size-full cursor-pointer items-center justify-center"
                  )}
                >
                  <Upload className="size-8 animate-bounce" />
                </label>
                <input
                  id="new_image"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (!e.target.files) return;
                    setUploadedFiles((prev) => [
                      ...prev,
                      ...(e.target.files as FileList),
                    ]);
                  }}
                />
              </div>
              <ReactSortable
                animation={150}
                list={tempFiles}
                setList={setTempFiles}
                className="flex flex-wrap gap-4"
                direction="horizontal"
              >
                {tempFiles.map((file, i) => (
                  <div key={i}>
                    <Image
                      src={URL.createObjectURL(file.data)}
                      width={200}
                      height={200}
                      alt={file.data.name}
                      className={cn(
                        i === 0 && "border-2 border-primary",
                        "size-24 rounded-xl hover:cursor-grab active:cursor-grabbing"
                      )}
                      unoptimized
                    />
                  </div>
                ))}
              </ReactSortable>
            </section>
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
              animation="dots"
            >
              Crear
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
          // deselectProduct
        />
      </SheetContent>
    </Sheet>
  );
}
