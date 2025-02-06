import {
  ErrorAlert,
  ErrorSpan,
  LoadableButton,
  MandatoryMark,
} from "@/components/forms";
import { DiscardCategoryChangesModal } from "@/components/modals/administration/categories";
import { Sheet, SheetContent } from "@/components/shadcn/sheet";
import { type Category } from "@/functions/categories";
import { mqs, useMediaQueries } from "@/hooks/screen";
import { useCategoryStore } from "@/hooks/zustand/categories";
import { type CloudinarySuccess } from "@/types/cloudinary";
import type { ServerError, ServerSuccess } from "@/types/types";
import { checkMimetype, cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  PanelBottomClose,
  PanelRightClose,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, { message: "Debe tener un nombre" }),
});

export function CategoryCreateAside() {
  const queryClient = useQueryClient();
  const mq = useMediaQueries();

  const {
    create_isOpen,
    create_close,
    create_modal_discardChanges_isOpen,
    create_modal_discardChanges_change,
  } = useCategoryStore();

  const [image, setImage] = useState<File>();

  function checkChange() {
    const values = getValues();
    return values.code !== "" || values.name !== "";
  }

  function resetInputData() {
    reset();
  }

  function resetImage() {
    setImage(undefined);
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  function handleCancel() {
    if (!image && !checkChange()) {
      create_close();
      return;
    }
    create_modal_discardChanges_change(true);
  }

  function loadImage(image?: File) {
    if (!image) return;
    if (!checkMimetype(image.type, ["image/png", "image/jpeg"])) return;
    setImage(image);
  }

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    defaultValues: { code: "", name: "" },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (checkChange()) {
      dataMutation.mutate(data);
      return;
    }
    resetInputData();
  };

  const dataMutation = useMutation<ServerSuccess<Category>, ServerError, Input>(
    {
      mutationFn: async (data) => {
        const url = `${vars.serverUrl}/api/v1/categories`;
        return axios.post(url, data, { withCredentials: true });
      },
      onSuccess: (res) => {
        if (image) {
          imageMutation.mutate(res.data.id);
          return;
        }
        toast.success("Categoría creada exitosamente");
        resetInputData();
        refreshQuery();
        create_close();
      },
    }
  );

  const imageMutation = useMutation<
    ServerSuccess<CloudinarySuccess>,
    ServerError,
    number
  >({
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
      toast.success("Imagen subida");
      resetInputData();
      refreshQuery();
      resetImage();
      create_close();
    },
  });

  return (
    <Sheet open={create_isOpen}>
      <SheetContent
        side={mq < mqs.sm ? "bottom" : "right"}
        className="w-full border-t border-secondary/20 bg-base-100 sm:w-1/3 sm:min-w-screen-sm sm:border-l sm:border-t-0"
      >
        <div className="mb-8 flex h-12 w-full items-center justify-end gap-4">
          <span className="whitespace-nowrap text-xl sm:text-2xl">
            Crear nueva categoría
          </span>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-outline border border-secondary/30 shadow-sm"
          >
            <>
              <PanelBottomClose className="size-6 sm:hidden" />
              <PanelRightClose className="hidden size-6 sm:block" />
            </>
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-end gap-8"
        >
          <div className="flex w-full items-center gap-4">
            {/* IMAGE */}
            <section className="relative min-w-fit">
              <div className="flex size-40 items-center justify-center rounded-xl border border-secondary/50 sm:size-56">
                <div className="group relative size-11/12 overflow-hidden rounded-md">
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage(undefined)}
                      className="btn btn-error btn-sm absolute bottom-2 right-2 z-40 size-10 p-0 text-white opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  )}
                  <label
                    htmlFor="new_image"
                    className={cn(
                      image ? "opacity-0" : "opacity-100",
                      "absolute left-0 top-0 z-10 flex size-full cursor-pointer items-center justify-center bg-secondary/20 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                    )}
                  >
                    <Upload className="size-8 animate-bounce text-primary" />
                  </label>
                  <input
                    id="new_image"
                    type="file"
                    className="hidden"
                    onChange={(e) => loadImage(e.target.files?.[0])}
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
                <div className="absolute mt-1 flex w-fit items-center justify-center gap-2 text-error">
                  <ErrorSpan message="Imagen no guardada" />
                </div>
              )}
            </section>

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
                  placeholder="Nuevo nombre"
                  {...register("name")}
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
                  placeholder="Nuevo código"
                  {...register("code")}
                  className="input input-bordered w-full shadow-inner-sm focus:shadow-inner-sm focus:outline-none"
                />
                <ErrorSpan message={errors.code?.message} />
              </div>
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
              Crear
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
          deselectCategory
        />
      </SheetContent>
    </Sheet>
  );
}
