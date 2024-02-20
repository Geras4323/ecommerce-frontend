import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle, PanelRightClose } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useSupplierStore } from "@/hooks/states/suppliers";
import { type Supplier } from "@/functions/suppliers";
import {
  DeleteSupplierModal,
  DiscardSupplierChangesModal,
} from "@/components/modals/administration/suppliers";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  // code: z.string(),
  name: z.string(),
});

export function SupplierDataAside() {
  const { supplier, supplier_select, supplier_remove, create_isOpen } =
    useSupplierStore();

  const queryClient = useQueryClient();

  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);

  function checkChange() {
    const values = getValues();
    return values.name !== supplier?.name;
    // return values.code !== supplier?.code || values.name !== supplier?.name;
  }

  function resetInputData() {
    reset({ name: supplier?.name });
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
      name: supplier?.name ?? "",
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
          `${vars.serverUrl}/api/v1/suppliers/${supplier?.id}`,
          data,
          { withCredentials: true }
        );
      },
      onSuccess: (c) => {
        supplier_select(c.data);
        toast.success("Actualizado");
        refreshQuery();
        supplier_remove();
      },
    }
  );

  return (
    <section
      className={cn(
        supplier && !create_isOpen
          ? "h-full w-1/2 border-l border-l-secondary/20 px-4 opacity-100 2xl:w-1/3"
          : "w-0 overflow-hidden border-l border-l-transparent px-0 opacity-0",
        "flex flex-col py-4 transition-all duration-300"
      )}
    >
      {/* HEADER */}
      <div className="mb-8 flex h-12 w-full items-center justify-between gap-4">
        <div className="flex w-full items-center gap-4 truncate">
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-outline border border-secondary/30"
          >
            <PanelRightClose className="size-6" />
          </button>
          <span className="truncate text-2xl">{supplier?.name}</span>
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
        className="flex flex-col items-end gap-4"
      >
        <div className="flex w-full items-center gap-4">
          {/* FIELDS */}
          <section className="flex w-full flex-col gap-4">
            {/* <div className="flex flex-col gap-1">
              <label htmlFor="code" className="text-lg text-secondary">
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
              <label htmlFor="name" className="text-lg text-secondary">
                <MandatoryMark /> Nombre:
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                defaultValue={supplier?.name}
                className="input input-bordered w-full focus:outline-none"
              />
              <ErrorSpan message={errors.name?.message} />
            </div>
          </section>
        </div>

        {/* ACTIONS */}
        <section className="mt-8 flex gap-4">
          <button
            type="button"
            className="btn btn-ghost w-32"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <LoadableButton
            type="submit"
            isLoading={dataMutation.isPending}
            className="btn-primary w-32"
            animation="loading-dots"
          >
            Guardar
          </LoadableButton>
        </section>
      </form>

      {supplier && (
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
            supplier={supplier}
          />
        </>
      )}
    </section>
  );
}
