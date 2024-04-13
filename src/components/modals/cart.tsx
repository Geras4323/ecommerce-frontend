import type { OrderItem } from "@/functions/orders";
import { Modal, type ModalProps } from "../layouts/modal";
import Link from "next/link";
import { CheckCircle2, PackageCheck } from "lucide-react";

export function OrderConfirmationModal({
  isOpen,
  // onClose,
  order,
  email,
}: ModalProps & { order: OrderItem; email: string }) {
  return (
    <Modal isOpen={isOpen}>
      <div className="flex h-full w-full items-center gap-6">
        <div>
          <CheckCircle2 className="size-16 text-success" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl text-primary">Recibimos tu pedido</h3>
          <p className="w-full text-secondary">
            Te enviamos un mail a{" "}
            <span className="text-primary/70">{email}</span> con los detalles de
            tu orden
          </p>
        </div>
      </div>

      <div className="mt-4 flex h-auto w-full items-center justify-end gap-2">
        <Link href="/showroom" className="btn btn-ghost">
          Volver al showroom
        </Link>
        <Link href={`/orders/${order.id}`} className="btn btn-primary">
          <PackageCheck className="size-5" />
          Ver pedido
        </Link>
      </div>
    </Modal>
  );
}
