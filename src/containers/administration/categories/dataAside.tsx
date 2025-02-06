import {
  ErrorAlert,
  ErrorSpan,
  LoadableButton,
  MandatoryMark,
} from "@/components/forms";
import type { ServerError, ServerSuccess } from "@/types/types";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  PanelBottomClose,
  PanelLeftClose,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import NoImage from "../../../../public/no_image.png";
import { useCategoryStore } from "@/hooks/zustand/categories";
import { type Category } from "@/functions/categories";
import { type CloudinarySuccess } from "@/types/cloudinary";
import {
  DeleteCategoryImageModal,
  DeleteCategoryModal,
  DiscardCategoryChangesModal,
} from "@/components/modals/administration/categories";
import { Sheet, SheetContent } from "@/components/shadcn/sheet";
import { mqs, useMediaQueries } from "@/hooks/screen";
import { cn } from "@/utils/lib";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export function CategoryDataAside() {
  const { selected_category, category_select, category_remove } =
    useCategoryStore();

  const queryClient = useQueryClient();
  const mq = useMediaQueries();

  const [image, setImage] = useState<File>();
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isDeleteCategoryImageModalOpen, setIsDeleteCategoryImageModalOpen] =
    useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);

  function checkChange() {
    const values = getValues();
    return (
      values.code !== selected_category?.code ||
      values.name !== selected_category.name
    );
  }

  function resetInputData() {
    reset({ code: selected_category?.code, name: selected_category?.name });
  }

  function resetImage() {
    setImage(undefined);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  function handleCancel() {
    if (!image && !checkChange()) {
      category_remove();
      return;
    }
    setIsDiscardChangesModalOpen(true);
  }

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    values: {
      code: selected_category?.code ?? "",
      name: selected_category?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (checkChange() || image) {
      if (checkChange()) dataMutation.mutate(data);
      if (image) imageMutation.mutate();
      return;
    }
    resetInputData();
    category_remove();
  };

  const dataMutation = useMutation<ServerSuccess<Category>, ServerError, Input>(
    {
      mutationFn: async (data) => {
        return axios.put(
          `${vars.serverUrl}/api/v1/categories/${selected_category?.id}`,
          data,
          { withCredentials: true }
        );
      },
      onSuccess: (c) => {
        toast.success("Categoría actualizada");
        category_select(c.data);
        if (!image) {
          refreshQuery();
          category_remove();
        }
      },
    }
  );

  const imageMutation = useMutation<
    ServerSuccess<CloudinarySuccess>,
    ServerError,
    void
  >({
    mutationFn: async () => {
      return axios.post(
        `${vars.serverUrl}/api/v1/categories/${selected_category?.id}/image`,
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
      toast.success("Imagen subida");
      refreshQuery();
      resetImage();
      if (selected_category) {
        category_select({
          ...selected_category,
          image: res.data.Response.secure_url,
        });
      }
      if (checkChange()) category_remove();
    },
  });

  return (
    <Sheet open={!!selected_category}>
      <SheetContent
        side={mq < mqs.sm ? "bottom" : "left"}
        className="w-full border-t border-secondary/20 bg-base-100 sm:w-1/3 sm:min-w-screen-sm sm:border-r sm:border-t-0"
      >
        {/* HEADER */}
        <div className="mb-8 flex h-fit w-full items-center justify-between gap-4">
          <div className="flex w-full items-center gap-4 truncate">
            <button
              onClick={handleCancel}
              className="btn btn-outline border border-secondary/30 shadow-sm"
            >
              <>
                <PanelBottomClose className="size-6 sm:hidden" />
                <PanelLeftClose className="hidden size-6 sm:block" />
              </>
            </button>
            <span className="truncate whitespace-nowrap text-xl sm:text-2xl">
              {selected_category?.name}
            </span>
          </div>
          <button
            onClick={() => setIsDeleteCategoryModalOpen(true)}
            className="btn btn-error w-12 flex-row flex-nowrap items-center justify-end gap-4 overflow-hidden whitespace-nowrap rounded-md px-3 text-white transition-all hover:w-56"
          >
            <span>Eliminar categoría</span>
            <div className="min-w-6">
              <AlertCircle className="size-6" />
            </div>
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-end gap-4"
        >
          <div className="flex w-full items-center gap-8">
            {/* DATA */}
            <section className="flex w-full flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="name"
                  className="text-md text-primary sm:text-lg"
                >
                  <MandatoryMark /> Nombre:
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  defaultValue={selected_category?.name}
                  className="input input-bordered w-full shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
                />
                <ErrorSpan message={errors.name?.message} />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="code"
                  className="text-md text-primary sm:text-lg"
                >
                  Código:
                </label>
                <input
                  id="code"
                  type="text"
                  {...register("code")}
                  defaultValue={selected_category?.code}
                  className="input input-bordered w-full shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
                />
                <ErrorSpan message={errors.code?.message} />
              </div>
            </section>

            {/* IMAGE */}
            <section className="relative min-w-fit">
              <div className="flex size-40 items-center justify-center rounded-xl border border-secondary/50 hover:shadow-md sm:size-56">
                <div className="group relative size-11/12 overflow-hidden rounded-md">
                  {selected_category?.image && (
                    <button
                      type="button"
                      onClick={() => setIsDeleteCategoryImageModalOpen(true)}
                      className="btn btn-error btn-sm absolute bottom-2 right-2 z-40 size-10 p-0 text-white opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  )}
                  <label
                    htmlFor="update_image"
                    className="absolute left-0 top-0 z-30 flex size-full cursor-pointer items-center justify-center text-primary/80 opacity-0 backdrop-blur-sm transition-opacity hover:text-primary group-hover:bg-neutral/50 group-hover:opacity-100"
                  >
                    <Upload className="size-8 animate-bounce" />
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
                    alt={selected_category?.name ?? ""}
                    src={selected_category?.image ?? NoImage}
                    width={200}
                    height={200}
                    className="z-10 size-full select-none rounded-md bg-secondary/10 object-cover"
                  />
                </div>
              </div>
              {image && (
                <div className="absolute mt-1 flex w-full items-center justify-center gap-2 text-error">
                  <ErrorSpan message="Imagen no guardada" />
                </div>
              )}
            </section>
          </div>

          <ErrorAlert
            className="-mb-4"
            message={dataMutation.error?.response?.data.comment}
            showX
          />
          <ErrorAlert
            className="-mb-4"
            message={imageMutation.error?.response?.data.comment}
            showX
          />

          {/* ACTIONS */}
          <section
            className={cn(
              dataMutation.isError || imageMutation.isError ? "mt-0" : "mt-4",
              "flex gap-4"
            )}
          >
            <button
              type="button"
              className="btn btn-ghost w-32"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <LoadableButton
              type="submit"
              isPending={dataMutation.isPending || imageMutation.isPending}
              className="btn-primary w-32"
              animation="dots"
            >
              Guardar
            </LoadableButton>
          </section>
        </form>

        {selected_category && (
          <>
            <DiscardCategoryChangesModal
              isOpen={isDiscardChangesModalOpen}
              onClose={() => setIsDiscardChangesModalOpen(false)}
              onConfirm={() => {
                resetInputData();
                resetImage();
                category_remove();
              }}
            />
            <DeleteCategoryModal
              isOpen={isDeleteCategoryModalOpen}
              onClose={() => setIsDeleteCategoryModalOpen(false)}
              onSuccess={() => category_remove()}
              category={selected_category}
            />
            <DeleteCategoryImageModal
              isOpen={isDeleteCategoryImageModalOpen}
              onClose={() => setIsDeleteCategoryImageModalOpen(false)}
              category={selected_category}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
