import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import type { ServerError, ServerSuccess } from "@/types/types";
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
import { type Dispatch, type SetStateAction, useState } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import NoImage from "../../../../public/no_image.png";
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
import { Sheet, SheetContent } from "@/components/shadcn/sheet";
import { ReactSortable } from "react-sortablejs";
import { cn } from "@/utils/lib";
import { type ProductImage } from "@/functions/images";

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

export function ProductDataAside({
  product,
  setProduct,
}: {
  product: Product;
  setProduct: Dispatch<SetStateAction<Product | null>>;
}) {
  const queryClient = useQueryClient();

  const [existentFiles, setExistentFiles] = useState<ProductImage[]>(
    product.images
  );
  const [closing, setClosing] = useState(false);

  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] =
    useState(false);
  // const [isDeleteProductImageModalOpen, setIsDeleteProductImageModalOpen] =
  //   useState(false);
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
      values.name !== product.name ||
      values.code !== product.code ||
      values.description !== product.description ||
      Number(values.price).toLocaleString("es-AR") !==
        product.price.toLocaleString("es-AR") ||
      Number(values.categoryID) !== product.categoryID ||
      Number(values.supplierID) !== product.supplierID
    );
  }

  function closeAside() {
    setClosing(true);
    setTimeout(() => {
      setProduct(null);
    }, 200);
  }

  function resetInputData() {
    reset({ code: product.code, name: product.name });
  }

  function resetImages() {
    setExistentFiles([]);
    // setTempFiles([]);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  function handleCancel() {
    // if (tempFiles.length === 0 && !checkChange()) {
    if (!checkChange()) {
      setExistentFiles([]);
      closeAside();
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
      code: product.code ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      price: `${product.price}` ?? `${-1}`,
      categoryID: `${product.categoryID}` ?? `${-1}`,
      supplierID: `${product.supplierID}` ?? `${-1}`,
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    // if (checkChange() || tempFiles.length !== 0) {
    if (checkChange()) {
      if (checkChange()) dataMutation.mutate(data);
      // if (tempFiles.length !== 0) imagesMutation.mutate();
      // if (true) imagesMutation.mutate();
      return;
    }
    resetInputData();
    closeAside();
  };

  const dataMutation = useMutation<ServerSuccess<Product>, ServerError, Input>({
    mutationFn: async (data) => {
      return axios.put(
        `${vars.serverUrl}/api/v1/products/${product.id}`,
        data,
        { withCredentials: true }
      );
    },
    onSuccess: (res) => {
      setProduct(res.data); // update product in aside
      toast.success("Actualizado");
      // if (tempFiles.length === 0) {
      //   refreshQuery();
      //   product_remove();
      // }
      if (true) {
        refreshQuery();
        closeAside();
      }
    },
  });

  const imagesMutation = useMutation<
    ServerSuccess<{ id: number; cloud: CloudinarySuccess }>,
    ServerError,
    void
  >({
    mutationFn: async () => {
      const images = new FormData();
      // tempFiles.forEach((file) => images.append("images", file.data));

      return axios.post(
        `${vars.serverUrl}/api/v1/products/${product.id}/image`,
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
      toast.success("Subido");
      refreshQuery();
      resetImages();
      queryClient.invalidateQueries({ queryKey: ["product"] });
      // if (checkChange()) product_remove();
    },
  });

  return (
    <Sheet open={!!product && !closing}>
      <SheetContent className="flex h-full w-1/3 min-w-screen-sm flex-col border-l border-l-secondary/20 bg-base-100">
        {/* HEADER */}
        <div className="mb-8 flex h-fit w-full items-center justify-between gap-4">
          <div className="flex w-full items-center gap-4 truncate">
            <button
              onClick={handleCancel}
              className="btn btn-outline border border-secondary/30"
            >
              <PanelRightClose className="size-6" />
            </button>
            <span className="truncate text-2xl">{product.name}</span>
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
          className="flex h-full flex-col items-end gap-4 overflow-y-auto pr-2"
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
              <label className="text-lg text-secondary">Imágenes:</label>
              <section className="flex min-w-fit flex-row gap-4">
                <div className="flex size-24 min-w-24 items-center justify-center rounded-xl border border-secondary/50">
                  <label
                    htmlFor="update_image"
                    className="flex size-full cursor-pointer items-center justify-center"
                  >
                    <Upload className="size-8 animate-bounce text-white" />
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
                    className="flex flex-wrap gap-4"
                    direction="horizontal"
                  >
                    {existentFiles.map((image, i) => (
                      <div key={i}>
                        <Image
                          src={image.url}
                          width={200}
                          height={200}
                          alt={image.url}
                          className={cn(
                            i === 0 && "border-2",
                            "size-24 rounded-xl hover:cursor-grab active:cursor-grabbing"
                          )}
                        />
                      </div>
                    ))}
                  </ReactSortable>
                )}
                {/* {tempFiles.map((file, i) => (
                    <div key={i}>
                      <Image
                        src={URL.createObjectURL(file.data)}
                        width={200}
                        height={200}
                        alt={file.data.name}
                        className={cn(
                          i === 0 && "border-2",
                          "size-24 rounded-xl hover:cursor-grab active:cursor-grabbing"
                        )}
                      />
                    </div>
                  ))} */}
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

                {selected_product?.images.map((image, i) => (
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
              isPending={dataMutation.isPending || imagesMutation.isPending}
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
                resetImages();
                closeAside();
              }}
            />
            <DeleteProductModal
              isOpen={isDeleteProductModalOpen}
              onClose={() => setIsDeleteProductModalOpen(false)}
              onSuccess={() => closeAside()}
              product={product}
            />
            {/* <DeleteProductImageModal
              isOpen={isDeleteProductImageModalOpen}
              onClose={() => setIsDeleteProductImageModalOpen(false)}
              product={selected_product}
            /> */}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
