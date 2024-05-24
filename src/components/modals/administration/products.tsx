import { LoadableButton } from "@/components/forms";
import { Modal } from "@/components/layouts/modal";
import { type Product } from "@/functions/products";
import { vars } from "@/utils/vars";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function DiscardProductChangesModal({
  isOpen,
  onClose: onCloseProp,
  onConfirm: onConfirmProp,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  function onClose() {
    onCloseProp();
  }

  function onConfirm() {
    onConfirmProp();
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
        <button className="btn btn-primary w-28" onClick={onConfirm}>
          Confirmar
        </button>
      </div>
    </Modal>
  );
}

export function DeleteProductModal({
  isOpen,
  product,
  onClose: onCloseProp,
  onSuccess: onSuccessProp,
}: {
  isOpen: boolean;
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  function onClose() {
    onCloseProp();
  }

  function onSuccess() {
    toast.success("Producto eliminado exitosamente");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    onSuccessProp();
    onCloseProp();
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/products/${product.id}`;
      return axios.delete(url, { withCredentials: true });
    },
    onSuccess: onSuccess,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar producto"
      description={
        <span>
          ¿Está seguro de que desea eliminar el producto <b>{product.name}</b>?
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
          animation="dots"
        >
          Confirmar
        </LoadableButton>
      </div>
    </Modal>
  );
}
