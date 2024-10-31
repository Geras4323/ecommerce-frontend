import type { OrderItem } from "@/functions/orders";
import { Modal, type ModalProps } from "../layouts/modal";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, PackageCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/utils/lib";

export function OrderConfirmationModal({
  isOpen,
  order,
  email,
}: ModalProps & { order: OrderItem; email: string }) {
  const { theme } = useTheme();

  return (
    <Modal isOpen={isOpen}>
      <div className="flex h-full w-full items-center gap-6">
        <div
          className={cn(
            theme === "dark" ? "bg-success/10" : "bg-primary/10",
            "size-12 min-w-12 rounded-full p-2 sm:size-16 sm:min-w-16"
          )}
        >
          <CheckCircle2
            className={cn(
              theme === "dark" ? "text-success" : "text-primary",
              "size-full"
            )}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl text-primary">Recibimos tu pedido</h3>
          <p className="w-full text-secondary">
            Te enviamos un mail a{" "}
            <span className="font-semibold text-primary/70">{email}</span> con
            los detalles de tu orden
          </p>
          <p className="flex w-full items-center gap-2 text-secondary">
            <AlertTriangle
              className={cn(
                theme === "dark" ? "text-warning" : "text-primary",
                "size-4 min-w-4"
              )}
            />
            <span>
              Por favor comprobá tu bandeja de{" "}
              <u className="underline-offset-2">spam</u>.
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex h-auto w-full items-center justify-end gap-2">
        <Link href="/showroom" className="btn btn-ghost">
          Volver al showroom
        </Link>
        <Link href={`/account/orders/${order.id}`} className="btn btn-primary">
          <PackageCheck className="size-5" />
          Ver pedido
        </Link>
      </div>
    </Modal>
  );
}
