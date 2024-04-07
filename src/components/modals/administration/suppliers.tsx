import { LoadableButton } from "@/components/forms";
import { Modal } from "@/components/layouts/modal";
import { type Supplier } from "@/functions/suppliers";
import { useSupplierStore } from "@/hooks/states/suppliers";
import { vars } from "@/utils/vars";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function DiscardSupplierChangesModal({
  isOpen,
  onClose: onCloseProp,
  onConfirm,
  deselectSupplier,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deselectSupplier?: boolean;
}) {
  const { supplier_remove } = useSupplierStore();

  function onClose() {
    if (deselectSupplier) supplier_remove();
    onCloseProp();
  }

  function handleConfirm() {
    onConfirm();
    onCloseProp();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Descartar cambios"
      description={
        <span>
          Tiene cambios sin guardar ¿Está seguro de que desea descartarlos?
        </span>
      }
    >
      <div className="flex h-auto w-full items-center justify-end gap-2">
        <button className="btn btn-ghost w-28" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-primary w-28" onClick={handleConfirm}>
          Confirmar
        </button>
      </div>
    </Modal>
  );
}

export function DeleteSupplierModal({
  isOpen,
  supplier,
  onClose: onCloseProp,
  onSuccess: onSuccessProp,
}: {
  isOpen: boolean;
  supplier: Supplier;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  function onClose() {
    onCloseProp();
  }

  function onSuccess() {
    toast.success("Proveedor eliminado exitosamente");
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    onSuccessProp();
    onCloseProp();
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/suppliers/${supplier.id}`;
      return axios.delete(url, { withCredentials: true });
    },
    onSuccess: onSuccess,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar proveedor"
      description={
        <span>
          ¿Está seguro de que desea eliminar el proveedor <b>{supplier.name}</b>
          ?
        </span>
      }
    >
      <div className="flex h-auto w-full items-center justify-end gap-2">
        <button className="btn btn-ghost w-28" onClick={onClose}>
          Cancelar
        </button>
        <LoadableButton
          className="btn btn-primary w-28"
          onClick={() => mutation.mutate()}
          isPending={mutation.isPending}
          animation="loading-dots"
        >
          Confirmar
        </LoadableButton>
      </div>
    </Modal>
  );
}
