import {
  ErrorAlert,
  ErrorSpan,
  LoadableButton,
  MandatoryMark,
} from "@/components/forms";
import { DiscardSupplierChangesModal } from "@/components/modals/administration/suppliers";
import { Sheet, SheetContent } from "@/components/shadcn/sheet";
import { type Category } from "@/functions/categories";
import { mqs, useMediaQueries } from "@/hooks/screen";
import { useSupplierStore } from "@/hooks/zustand/suppliers";
import type { ServerError, ServerSuccess } from "@/types/types";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PanelBottomClose, PanelRightClose } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  // code: z.string().optional(),
  name: z.string().min(1, { message: "Debe tener un nombre" }),
});

export function SupplierCreateAside() {
  const queryClient = useQueryClient();
  const mq = useMediaQueries();

  const {
    create_isOpen,
    create_close,
    create_modal_discardChanges_isOpen,
    create_modal_discardChanges_change,
  } = useSupplierStore();

  function checkChange() {
    const values = getValues();
    return values.name !== "";
  }

  function resetInputData() {
    reset();
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
  }

  function handleCancel() {
    if (!checkChange()) {
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
    getValues,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    defaultValues: { name: "" },
    // defaultValues: { code: "", name: "" },
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
        const url = `${vars.serverUrl}/api/v1/suppliers`;
        return axios.post(url, data, { withCredentials: true });
      },
      onSuccess: () => {
        toast.success("Proveedor creado exitosamente");
        resetInputData();
        refreshQuery();
        create_close();
      },
    }
  );

  return (
    <Sheet open={create_isOpen}>
      <SheetContent
        side={mq < mqs.xs ? "bottom" : "right"}
        className="w-full border-t border-secondary/20 bg-base-100 xs:w-1/3 xs:min-w-screen-xxs xs:border-l xs:border-t-0"
      >
        <div className="mb-8 flex h-12 w-full items-center justify-end gap-4">
          <span className="whitespace-nowrap text-xl sm:text-2xl">
            Crear nuevo proveedor
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
            <section className="flex w-full flex-col gap-4">
              {/* <div className="flex flex-col gap-1">
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
            </div> */}
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
            </section>
          </div>

          <ErrorAlert
            className="-mb-4"
            message={dataMutation.error?.response?.data.comment}
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
              isPending={dataMutation.isPending}
              className="btn-primary w-32"
              animation="dots"
            >
              Crear
            </LoadableButton>
          </section>
        </form>

        <DiscardSupplierChangesModal
          isOpen={create_modal_discardChanges_isOpen}
          onClose={() => create_modal_discardChanges_change(false)}
          onConfirm={() => {
            resetInputData();
            create_close();
          }}
          deselectSupplier
        />
      </SheetContent>
    </Sheet>
  );
}
