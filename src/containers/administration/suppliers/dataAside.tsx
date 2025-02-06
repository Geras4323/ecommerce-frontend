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
import { AlertCircle, PanelBottomClose, PanelLeftClose } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSupplierStore } from "@/hooks/zustand/suppliers";
import { type Supplier } from "@/functions/suppliers";
import {
  DeleteSupplierModal,
  DiscardSupplierChangesModal,
} from "@/components/modals/administration/suppliers";
import { Sheet, SheetContent } from "@/components/shadcn/sheet";
import { mqs, useMediaQueries } from "@/hooks/screen";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  // code: z.string(),
  name: z.string(),
});

export function SupplierDataAside() {
  const { selected_supplier, supplier_select, supplier_remove } =
    useSupplierStore();

  const queryClient = useQueryClient();
  const mq = useMediaQueries();

  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);

  function checkChange() {
    const values = getValues();
    return values.name !== selected_supplier?.name;
    // return values.code !== supplier?.code || values.name !== supplier?.name;
  }

  function resetInputData() {
    reset({ name: selected_supplier?.name });
    // reset({ code: supplier?.code, name: supplier?.name });
  }

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
  }

  function handleCancel() {
    if (!checkChange()) {
      supplier_remove();
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
      // code: category?.code ?? "",
      name: selected_supplier?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (checkChange()) {
      dataMutation.mutate(data);
      return;
    }
    resetInputData();
    supplier_remove();
  };

  const dataMutation = useMutation<ServerSuccess<Supplier>, ServerError, Input>(
    {
      mutationFn: async (data) => {
        return axios.put(
          `${vars.serverUrl}/api/v1/suppliers/${selected_supplier?.id}`,
          data,
          { withCredentials: true }
        );
      },
      onSuccess: (c) => {
        toast.success("Proveedor actualizado");
        supplier_select(c.data);
        refreshQuery();
        supplier_remove();
      },
    }
  );

  return (
    <Sheet open={!!selected_supplier}>
      <SheetContent
        side={mq < mqs.xs ? "bottom" : "left"}
        className="w-full border-t border-secondary/20 bg-base-100 xs:w-1/3 xs:min-w-screen-xxs xs:border-r xs:border-t-0"
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
              {selected_supplier?.name}
            </span>
          </div>
          <button
            onClick={() => setIsDeleteCategoryModalOpen(true)}
            className="btn btn-error w-12 flex-row flex-nowrap items-center justify-end gap-4 overflow-hidden whitespace-nowrap rounded-md px-3 text-white transition-all hover:w-56"
          >
            <span>Eliminar proveedor</span>
            <div className="min-w-6">
              <AlertCircle className="size-6" />
            </div>
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-end gap-8"
        >
          <div className="flex w-full items-center gap-4">
            {/* FIELDS */}
            <section className="flex w-full flex-col gap-4">
              {/* <div className="flex flex-col gap-1">
              <label htmlFor="code" className="text-md text-primary sm:text-lg">
                Código:
              </label>
              <input
                id="code"
                type="text"
                {...register("code")}
                defaultValue={supplier?.code}
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
                  {...register("name")}
                  defaultValue={selected_supplier?.name}
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

          {/* ACTIONS */}
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
              Guardar
            </LoadableButton>
          </section>
        </form>

        {selected_supplier && (
          <>
            <DiscardSupplierChangesModal
              isOpen={isDiscardChangesModalOpen}
              onClose={() => setIsDiscardChangesModalOpen(false)}
              onConfirm={() => {
                resetInputData();
                supplier_remove();
              }}
            />
            <DeleteSupplierModal
              isOpen={isDeleteCategoryModalOpen}
              onClose={() => setIsDeleteCategoryModalOpen(false)}
              onSuccess={() => supplier_remove()}
              supplier={selected_supplier}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
