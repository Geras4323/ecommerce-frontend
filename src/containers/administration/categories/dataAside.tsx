import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, PanelRightClose, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import NoImage from "../../../../public/no_image.png";
import {
  DeleteCategoryImageModal,
  DeleteCategoryModal,
  DiscardCategoryChangesModal,
} from "@/components/modals/administration/categories";
import { useCategoryStore } from "@/hooks/states/categories";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export function CategoryDataAside() {
  const {
    category,
    category_remove,
    create_isOpen,
    update_isChanged,
    update_change,
  } = useCategoryStore();

  const queryClient = useQueryClient();

  const [image, setImage] = useState<File>();
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isDeleteCategoryImageModalOpen, setIsDeleteCategoryImageModalOpen] =
    useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);

  function resetInputData() {
    reset({ code: category?.code, name: category?.name });
    update_change(false);
  }

  function resetImage() {
    setImage(undefined);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  function handleCancel() {
    if (!image && !update_isChanged) {
      update_change(false);
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
    watch,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    values: {
      code: category?.code ?? "",
      name: category?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (update_isChanged) dataMutation.mutate(data);
    if (image) imageMutation.mutate();
  };

  watch((value, { type }) => {
    if (type !== "change") return;
    update_change(
      value.name !== category?.name || value.code !== category?.code
    );
  });

  const dataMutation = useMutation<ServerSuccess, ServerError, Input>({
    mutationFn: async (data) => {
      return axios.put(
        `${vars.serverUrl}/api/v1/categories/${category?.id}`,
        data,
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      toast.success("Actualizado");
      refreshQuery();
      resetInputData();
    },
  });

  const imageMutation = useMutation<any, ServerError, void>({
    mutationFn: async () => {
      return axios.post(
        `${vars.serverUrl}/api/v1/categories/${category?.id}/image`,
        { file: image },
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
      resetImage();
    },
  });

  return (
    <section
      className={cn(
        category && !create_isOpen
          ? "ml-6 h-full w-1/2 border-l border-l-secondary/20 pl-6 opacity-100 2xl:w-1/3"
          : "w-0 overflow-hidden border-l border-l-transparent opacity-0",
        "transition-all duration-300"
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
          <span className="text-2xl">{category?.name}</span>
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
        <div className="flex w-full items-center gap-4">
          {/* FIELDS */}
          <section className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="code" className="text-lg text-secondary">
                Código:
              </label>
              <input
                id="code"
                type="text"
                {...register("code")}
                defaultValue={category?.code}
                className="input input-bordered w-full focus:outline-none"
              />
              <ErrorSpan message={errors.code?.message} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-lg text-secondary">
                <MandatoryMark /> Nombre:
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                defaultValue={category?.name}
                className="input input-bordered w-full focus:outline-none"
              />
              <ErrorSpan message={errors.name?.message} />
            </div>
          </section>

          {/* IMAGE */}
          <section className="relative min-w-fit">
            <div className="flex size-56 items-center justify-center rounded-xl border border-secondary/50">
              <div className="group relative size-11/12 overflow-hidden rounded-md">
                {category?.image && (
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
                  alt={category?.name ?? ""}
                  src={category?.image ?? NoImage}
                  width={200}
                  height={200}
                  className="z-10 size-full select-none rounded-md bg-secondary/10 object-cover"
                />
              </div>
            </div>
            {image && (
              <div className="absolute mt-1 flex w-full items-center justify-center gap-2 text-error">
                <AlertCircle className="size-4" />
                <ErrorSpan message="Imagen no guardada" />
              </div>
            )}
          </section>
        </div>

        {/* ACTIONS */}
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
            isLoading={dataMutation.isPending || imageMutation.isPending}
            disabled={!update_isChanged && !image}
            className="btn-primary w-32"
            animation="loading-dots"
          >
            Guardar
          </LoadableButton>
        </section>
      </form>

      {category && (
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
            category={category}
          />
          <DeleteCategoryImageModal
            isOpen={isDeleteCategoryImageModalOpen}
            onClose={() => setIsDeleteCategoryImageModalOpen(false)}
            category={category}
          />
        </>
      )}
    </section>
  );
}
