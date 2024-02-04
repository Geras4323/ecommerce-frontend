import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import { DiscardCategoryChangesModal } from "@/components/modals/administration/categories";
import { type Category } from "@/functions/categories";
import { useCategoyStore } from "@/hooks/states/categories";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, PanelLeftClose, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  code: z.string().optional(),
  name: z.string(),
});

export function CategoryCreateAside() {
  const queryClient = useQueryClient();

  const {
    create_isOpen,
    create_close,
    create_isChanged,
    create_change,
    create_modal_discardChanges_isOpen,
    create_modal_discardChanges_change,
  } = useCategoyStore();

  const [image, setImage] = useState<File>();

  function resetInputData() {
    reset({ code: "", name: "" });
    create_change(false);
  }

  function resetImage() {
    setImage(undefined);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
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
    watch,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    defaultValues: { code: "", name: "" },
  });

  watch((value, { type }) => {
    if (type !== "change") return;
    create_change(value.name !== "" || value.code !== "");
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (create_isChanged) dataMutation.mutate(data);
  };

  const dataMutation = useMutation<ServerSuccess<Category>, ServerError, Input>(
    {
      mutationFn: async (data) => {
        const url = `${vars.serverUrl}/api/v1/categories`;
        return axios.post(url, data, { withCredentials: true });
      },
      onSuccess: (category) => {
        if (image) {
          imageMutation.mutate(category.data.id);
          return;
        }
        toast.success("Categoría creada exitosamente");
        resetInputData();
        refreshQuery();
        create_close();
      },
    }
  );

  const imageMutation = useMutation<any, ServerError, number>({
    mutationFn: async (catID) => {
      return axios.post(
        `${vars.serverUrl}/api/v1/categories/${catID}/image`,
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
      resetInputData();
      refreshQuery();
      resetImage();
      create_close();
    },
  });

  return (
    <section
      className={cn(
        create_isOpen
          ? "mr-6 h-full w-1/2 border-r border-r-secondary/20 pr-6 opacity-100 2xl:w-1/3"
          : "w-0 overflow-hidden border-r border-r-transparent opacity-0",
        "transition-all duration-300"
      )}
    >
      <div className="mb-8 flex h-12 w-full items-center justify-end gap-4">
        <span className="whitespace-nowrap text-2xl">
          Crear nueva categoría
        </span>
        <button
          onClick={handleCancel}
          className="btn btn-ghost btn-outline border border-secondary/30"
        >
          <PanelLeftClose className="size-6" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-end gap-4"
      >
        <div className="flex w-full items-center gap-4">
          <section className="relative min-w-fit">
            <div className="flex size-56 items-center justify-center rounded-xl border border-secondary/50">
              <div className="group relative size-11/12 overflow-hidden rounded-md">
                <label
                  htmlFor="new_image"
                  className={cn(
                    image ? "opacity-0" : "opacity-100",
                    "absolute left-0 top-0 z-10 flex size-full cursor-pointer items-center justify-center bg-secondary/20 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  )}
                >
                  <Upload className="size-8 animate-bounce text-white" />
                </label>
                <input
                  id="new_image"
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
              </div>
            </div>
            {image && (
              <div className="absolute mt-1 flex w-full items-center justify-center gap-2 text-error">
                <AlertCircle className="size-4" />
                <ErrorSpan message="Imagen no guardada" />
              </div>
            )}
          </section>

          <section className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="code" className="text-lg text-secondary">
                Código:
              </label>
              <input
                id="code"
                type="text"
                placeholder="Nuevo código"
                {...register("code")}
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
                placeholder="Nuevo nombre"
                {...register("name")}
                className="input input-bordered w-full focus:outline-none"
              />
              <ErrorSpan message={errors.name?.message} />
            </div>
          </section>
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
            isLoading={dataMutation.isPending || imageMutation.isPending}
            disabled={!create_isChanged && !image}
            className="btn-primary w-32"
            animation="loading-dots"
          >
            Guardar
          </LoadableButton>
        </section>
      </form>

      <DiscardCategoryChangesModal
        isOpen={create_modal_discardChanges_isOpen}
        onClose={() => create_modal_discardChanges_change(false)}
        onConfirm={() => {
          resetInputData();
          resetImage();
          create_close();
        }}
      />
    </section>
  );
}
