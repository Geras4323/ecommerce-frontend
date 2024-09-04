import { CalendarDays, CheckCheck, Palmtree } from "lucide-react";
import { Modal, type ModalProps } from "../layouts/modal";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { cn } from "@/utils/lib";

export function VacationAlertModal({ isOpen, onClose }: ModalProps) {
  const { theme } = useTheme();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atención">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Palmtree
            className={cn(
              theme === "dark" ? "text-warning" : "text-primary",
              "mt-0.5 size-5 min-w-5"
            )}
          />
          <p className="text-primary/80">
            Actualmente nos encontramos de vacaciones, por lo que{" "}
            <span className="text-primary underline underline-offset-2">
              no estaremos tomando pedidos
            </span>
            .
          </p>
        </div>
        <div className="flex items-start gap-3">
          <CalendarDays
            className={cn(
              theme === "dark" ? "text-warning" : "text-primary",
              "mt-0.5 size-5 min-w-5"
            )}
          />
          <p className="text-primary/80">
            Volveremos a estar activos el día{" "}
            <span className="text-nowrap text-primary">
              {/* {format(new Date(), "dd-MM-yyyy")} */}
              20-09-2024
            </span>
          </p>
        </div>
      </div>
      <div className="flex h-auto w-full items-center justify-end gap-2">
        <button onClick={onClose} className="btn btn-primary">
          <CheckCheck className="size-5" />
          Aceptar
        </button>
      </div>
    </Modal>
  );
}
