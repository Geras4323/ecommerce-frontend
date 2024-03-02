import { LoadableButton } from "@/components/forms";
import { Modal } from "@/components/layouts/modal";
import type { Category } from "@/functions/categories";
import { useCategoryStore } from "@/hooks/states/categories";
import type { CloudinaryError, CloudinarySuccess } from "@/types/cloudinary";
import type { ServerError, ServerSuccess } from "@/types/types";
import { vars } from "@/utils/vars";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function DiscardCategoryChangesModal({
  isOpen,
  onClose: onCloseProp,
  onConfirm,
  deselectCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deselectCategory?: boolean;
}) {
  const { category_remove } = useCategoryStore();

  function onClose() {
    if (deselectCategory) category_remove();
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

export function DeleteCategoryModal({
  isOpen,
  category,
  onClose: onCloseProp,
  onSuccess: onSuccessProp,
}: {
  isOpen: boolean;
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  function onClose() {
    onCloseProp();
  }

  function onSuccess() {
    toast.success("Categoría eliminada exitosamente");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    onSuccessProp();
    onCloseProp();
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/categories/${category.id}`;
      return axios.delete(url, { withCredentials: false });
    },
    onSuccess: onSuccess,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar categoría"
      description={
        <span>
          ¿Está seguro de que desea eliminar la categoría <b>{category.name}</b>
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

export function DeleteCategoryImageModal({
  isOpen,
  onClose: onCloseProp,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}) {
  const { category_select } = useCategoryStore();

  const queryClient = useQueryClient();

  function onClose() {
    toast.success("Foto eliminada exitosamente");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    onCloseProp();
  }

  const mutation = useMutation<
    ServerSuccess<CloudinarySuccess>,
    ServerError<CloudinaryError>,
    void
  >({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/categories/${category.id}/image`;
      return axios.delete(url, { withCredentials: true });
    },
    onSuccess: () => {
      category_select({ ...category, image: undefined });
      onClose();
    },
    onError: (err) => {
      console.log(err.response?.data.Response.message);
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar imagen"
      description={
        <span>
          ¿Está seguro de que desea eliminar la imagen de la categoría{" "}
          <b>{category.name}</b>?
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
