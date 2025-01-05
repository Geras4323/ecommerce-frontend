import {
  ErrorAlert,
  ErrorSpan,
  LoadableButton,
  MandatoryMark,
} from "@/components/forms";
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
import {
  Check,
  ChevronDown,
  PanelRightClose,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { ReactSortable } from "react-sortablejs";
import { toast } from "sonner";
import { z } from "zod";
import imageCompression from "browser-image-compression";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";

const measurementUnits = [
  {
    value: "u",
    label: "Unidades",
  },
  {
    value: "g",
    label: "Gramos",
  },
  {
    value: "kg",
    label: "Kilos",
  },
  {
    value: "ml",
    label: "Mililitros",
  },
  {
    value: "l",
    label: "Litros",
  },
] as const;
const measurementUnitsValues = measurementUnits.map((unit) => unit.value);
// const measurementUnitsLabels = measurementUnits.map((unit) => unit.label);

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
  units: z
    .enum(measurementUnits.map((unit) => unit.value) as [string, ...string[]])
    .array()
    .min(1, { message: "Unidad/es requerida/s" })
    .transform((s) =>
      measurementUnitsValues.filter((value) => s.includes(value)).join(",")
    ),
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

  function anyChangeMade() {
    const values = getValues();
    return (
      values.name !== "" ||
      values.code !== "" ||
      values.description !== "" ||
      values.price !== "" ||
      values.categoryID !== undefined ||
      values.supplierID !== undefined ||
      values.units.length !== 0
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
    if (uploadedFiles.length === 0 && !anyChangeMade()) {
      create_close();
      return;
    }
    create_modal_discardChanges_change(true);
  }

  function removeTempFile(itemIndex: number) {
    setTempFiles((prev) => {
      const temp = prev.filter((_, i) => i !== itemIndex);
      return temp;
    });
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
    defaultValues: { code: "", name: "", price: "", units: [] },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (anyChangeMade()) {
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
            <PanelRightClose className="size-6" />
          </button>
        </div>

        {/* DATA */}
        {categoriesQuery.isError || suppliersQuery.isError ? (
          <div className="flex w-full flex-col gap-3">
            <ErrorSpan
              message={categoriesQuery.error?.response?.data.comment}
            />
            <ErrorSpan message={suppliersQuery.error?.response?.data.comment} />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex h-full flex-col items-end gap-4 overflow-y-auto px-2"
          >
            <div className="grid w-full grid-cols-2 items-center gap-4">
              <div className="col-span-2 flex flex-col gap-1">
                <label
                  htmlFor="name"
                  className="text-base tracking-wide text-primary"
                >
                  <MandatoryMark /> TÍTULO:
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
                  className="text-base tracking-wide text-primary"
                >
                  <MandatoryMark /> PRECIO:
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
                <label
                  htmlFor="code"
                  className="text-base tracking-wide text-primary"
                >
                  CÓDIGO:
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
                      className="text-base tracking-wide text-primary"
                    >
                      <MandatoryMark /> CATEGORÍA:
                    </label>
                    {categoriesQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-lg bg-secondary/20" />
                    ) : (
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
                    )}
                    <ErrorSpan message={errors.categoryID?.message} />
                  </div>

                  <div className="col-span-2 flex h-full flex-col justify-start gap-1 xs:col-span-1">
                    <label
                      htmlFor="supplier"
                      className="text-base tracking-wide text-primary"
                    >
                      PROVEEDOR:
                    </label>
                    {suppliersQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-lg bg-secondary/20" />
                    ) : (
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
                    )}
                    <ErrorSpan message={errors.supplierID?.message} />
                  </div>

                  <div className="col-span-2 flex h-full flex-col justify-start gap-1 xs:col-span-1">
                    <label
                      htmlFor="units"
                      className="text-base tracking-wide text-primary"
                    >
                      <MandatoryMark /> UNIDADES DE MEDIDA:
                    </label>
                    {suppliersQuery.isPending ? (
                      <div className="h-12 w-full animate-pulse rounded-lg bg-secondary/20" />
                    ) : (
                      <Controller
                        name="units"
                        control={control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger className="input input-bordered flex w-full items-center justify-between border text-left shadow-inner-sm outline-none focus:shadow-inner-sm focus:outline-none data-[state=open]:rounded-b-none">
                              {field.value.length === 0 ? (
                                <span>Seleccionar unidades</span>
                              ) : (
                                measurementUnits
                                  .filter((unit) =>
                                    field.value.includes(unit.value)
                                  )
                                  .map((unit) => unit.label)
                                  .join(", ")
                              )}
                              <ChevronDown className="size-6 min-w-6 text-secondary" />
                            </PopoverTrigger>
                            <PopoverContent
                              sideOffset={0}
                              className="border border-secondary/30 bg-base-100"
                            >
                              {measurementUnits?.map((unit) => (
                                <div
                                  key={unit.value}
                                  onClick={() => {
                                    const newUnits = !field.value.includes(
                                      unit.value
                                    )
                                      ? [...field.value, unit.value]
                                      : field.value.filter(
                                          (item) => item !== unit.value
                                        );
                                    field.onChange(newUnits);
                                  }}
                                  className="flex h-8 w-full cursor-pointer items-center gap-2.5 px-3 hover:bg-secondary/15"
                                >
                                  <Check
                                    className={cn(
                                      !field.value.includes(unit.value) &&
                                        "opacity-0",
                                      "size-4 min-w-4 text-secondary"
                                    )}
                                  />
                                  {unit.label}
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    )}
                    <ErrorSpan message={errors.units?.message} />
                  </div>
                </>
              )}

              <div className="col-span-2 flex flex-col gap-1">
                <label
                  htmlFor="description"
                  className="text-base tracking-wide text-primary"
                >
                  <MandatoryMark /> DESCRIPCIÓN:
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
              <label className="text-base tracking-wide text-primary">
                IMÁGENES:
              </label>
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
                    <div key={i} className="group relative">
                      <Image
                        src={URL.createObjectURL(file.data)}
                        width={200}
                        height={200}
                        alt={file.data.name}
                        className={cn(
                          i === 0 && "border-2 border-primary",
                          "size-24 rounded-xl object-cover hover:cursor-grab active:cursor-grabbing"
                        )}
                      />
                      <div
                        onClick={() => removeTempFile(i)}
                        className="absolute bottom-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-md bg-error font-semibold opacity-0 transition-opacity duration-100 group-hover:opacity-90"
                      >
                        <Trash2 className="size-3 text-white" />
                      </div>
                    </div>
                  ))}
                </ReactSortable>
              </section>
            </div>

            <ErrorAlert
              message={dataMutation.error?.response?.data.comment}
              showX
            />
            <ErrorAlert
              message={imagesMutation.error?.response?.data.comment}
              showX
            />

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
        )}

        <DiscardProductChangesModal
          isOpen={create_modal_discardChanges_isOpen}
          onClose={() => create_modal_discardChanges_change(false)}
          onConfirm={() => {
            resetInputData();
            resetImage();
            create_close();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
