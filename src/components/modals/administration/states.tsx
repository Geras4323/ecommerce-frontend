import { CalendarDays, CheckCheck, Palmtree, Timer } from "lucide-react";
import { Modal, type ModalProps } from "../../layouts/modal";
import { useTheme } from "next-themes";
import { cn } from "@/utils/lib";
import "react-day-picker/style.css";
import { DateRangePicker } from "../../datePicker/date-picker";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ServerError } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { ErrorSpan, LoadableButton } from "@/components/forms";

export function EnableVacationStateModal({ isOpen, onClose }: ModalProps) {
  const queryClient = useQueryClient();

  const [selectedMode, setSelectedMode] = useState<"now" | "programmed">("now");
  const [range, setRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  useEffect(() => {
    setSelectedMode("now");
  }, [isOpen]);

  const updateVacationStateMutation = useMutation<
    void,
    ServerError,
    { active?: boolean; dates?: DateRange }
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/states/vacation`;

      let payload;
      if (data.active !== undefined) {
        payload = { active: true };
      } else if (data.dates) {
        payload = {
          from: data.dates?.from,
          to: new Date(data.dates?.to?.setHours(23, 59, 59, 59) ?? new Date()),
        };
      }

      return axios.patch(url, payload, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacation"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_showroom"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_header"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_cart"] });
      onClose && onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modo Vacaciones"
      description={
        <span>
          Seleccione los días de las vacaciones. Después del último día, los
          usuarios podrán volver a hacer pedidos con normalidad.
        </span>
      }
      className="w-full max-w-screen-sm md:min-w-screen-xxs"
    >
      <div className="flex flex-col gap-2 ">
        <div
          onClick={() => setSelectedMode("now")}
          className={cn(
            selectedMode === "now"
              ? "border-primary/80"
              : "cursor-pointer border-secondary/30 opacity-50",
            "flex items-center gap-4 rounded-lg border p-3"
          )}
        >
          <span className="flex items-center gap-2">
            <Timer className="size-5 min-w-5 text-secondary" />
            Desde ahora, indefinidamente
          </span>
        </div>
        <div
          onClick={() => setSelectedMode("programmed")}
          className={cn(
            selectedMode === "programmed"
              ? "border-primary/80"
              : "cursor-pointer border-secondary/30 opacity-50 [&>*]:pointer-events-none",
            "flex flex-col items-start gap-2 rounded-lg border border-secondary/30 p-3 pr-0 xl:flex-row xl:items-center"
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="size-5 min-w-5 text-secondary" />
            Programar vacaciones:
          </span>
          <DateRangePicker
            showCompare={false}
            showDates={false}
            showPresets={false}
            locale="es-AR"
            onUpdate={(v) => setRange(v.range)}
            align="center"
          />
        </div>
      </div>

      {updateVacationStateMutation.isError && (
        <div className="-mb-3 flex w-full justify-end">
          <ErrorSpan
            message={updateVacationStateMutation.error?.response?.data.comment}
          />
        </div>
      )}

      <div className="flex h-auto w-full items-center justify-end gap-2">
        <button className="btn btn-ghost w-28" onClick={onClose}>
          Cancelar
        </button>
        <LoadableButton
          isPending={updateVacationStateMutation.isPending}
          className={cn(
            selectedMode === "now" ? "w-48" : "w-56",
            "btn btn-primary"
          )}
          onClick={() =>
            updateVacationStateMutation.mutate(
              selectedMode === "now" ? { active: true } : { dates: range }
            )
          }
        >
          {selectedMode === "now" ? (
            <>
              <Palmtree className="size-5 min-w-5" />
              Iniciar vacaiones
            </>
          ) : (
            <>
              <CalendarDays className="size-5 min-w-5" />
              Programar vacaiones
            </>
          )}
        </LoadableButton>
      </div>
    </Modal>
  );
}

export function DisableVacationStateModal({ isOpen, onClose }: ModalProps) {
  const queryClient = useQueryClient();

  const endVacationMutation = useMutation<void, ServerError, void>({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/states/vacation`;
      return axios.patch(url, { active: false }, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacation"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_showroom"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_header"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_cart"] });
      onClose && onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finalizar vacaciones"
      description="¿Está seguro de que desea finalizar las vacaciones?"
    >
      <div className="flex h-auto w-full min-w-screen-xxs items-center justify-end gap-2">
        <button className="btn btn-ghost w-28" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="btn btn-primary w-28"
          onClick={() => endVacationMutation.mutate()}
        >
          Finalizar
        </button>
      </div>
    </Modal>
  );
}

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
