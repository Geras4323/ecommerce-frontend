import { type PaymentStatus } from "@/functions/payments";
import { Modal, type ModalProps } from "../layouts/modal";
import { LoadingSpinner } from "../loading";
import { ErrorAlert, SuccessAlert } from "../forms";
import { Info } from "lucide-react";

const statusInfo: Record<
  PaymentStatus,
  { title: string; description: string }
> = {
  pending: {
    title: "Esperando Pago",
    description: "Realice el pago a travez de MercadoPago",
  },
  accepted: {
    title: "Pago Recibido",
    description: "Hemos recibido el pago exitosamente!",
  },
  rejected: {
    title: "Pago Rechazado",
    description: "Algo ha salido mal durante el pago",
  },
} as const;

export function AwaitingPaymentModal({
  isOpen,
  onClose,
  paymentStatus,
}: ModalProps & { paymentStatus: PaymentStatus }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={statusInfo[paymentStatus].title}
      description={statusInfo[paymentStatus].description}
      className="max-w-lg"
    >
      {paymentStatus === "pending" ? (
        <div className="my-4 flex w-full flex-col items-center gap-4 text-secondary">
          <LoadingSpinner className="size-10" />
          <p>Una vez realizado, podrá ver su comprobante</p>
        </div>
      ) : paymentStatus === "accepted" ? (
        <div className="flex w-full flex-col gap-3">
          <SuccessAlert message="Pago recibido!" />
          <div className="flex items-center gap-1.5 text-secondary">
            <Info className="size-4 min-w-4" />
            <p className="text-sm">Ya puede cerrar este aviso</p>
          </div>
        </div>
      ) : (
        <ErrorAlert message="Ocurrió un error durante el pago" />
      )}
    </Modal>
  );
}
