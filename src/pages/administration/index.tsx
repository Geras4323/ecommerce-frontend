import { withAuth } from "@/functions/session";
import { sections } from "@/layouts/administration";
import { GeneralLayout } from "@/layouts/general";
import {
  AlarmClock,
  AlarmClockOff,
  AlertCircle,
  CalendarDays,
  Handshake,
  Scale,
  TreePalm,
  Weight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  DisableVacationStateModal,
  EnableVacationStateModal,
  MercadopagoStateModal,
  UnitsStateModal,
} from "@/components/modals/administration/states";
import { cn } from "@/utils/lib";
import { format } from "date-fns";
import MercadoPago from "public/mercado_pago.svg";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { vars } from "@/utils/vars";
import { useMercadopago, useUnits, useVacation } from "@/hooks/states";

export default function Administration() {
  const vacationState = useVacation();
  const mercadopagoState = useMercadopago();
  const unitsState = useUnits();

  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [isMercadopagoModalOpen, setIsMercadopagoModalOpen] = useState(false);
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);

  const vacation = vacationState.data;
  const mercadopago = mercadopagoState.data;
  const units = unitsState.data;

  const vacationIsActiveOrProgrammed =
    vacation?.active || (!vacation?.active && vacation?.from);

  return (
    <GeneralLayout title="Administración" description="Administración">
      <div className="mx-auto flex w-screen max-w-screen-sm flex-col place-content-start gap-4 px-8 pb-8 pt-24 lg:max-w-screen-lg">
        <h1 className="text-xl font-medium tracking-wide">ADMINISTRACIÓN</h1>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* SECTIONS */}
          {sections.map(
            (section) =>
              !section.disabled && (
                <Link
                  key={section.name}
                  href={section.url}
                  className="flex aspect-square size-full flex-col items-center justify-center gap-4 rounded-lg border-4 border-double border-secondary/20 text-secondary transition-all hover:border-solid hover:border-primary/10 hover:text-primary"
                  style={{
                    boxShadow:
                      "0 1px 3px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
                  }}
                >
                  <section.icon className="size-7 sm:size-8 md:size-9" />
                  <span className="text-md xxs:text-lg xs:text-xl">
                    {section.name}
                  </span>
                </Link>
              )
          )}

          {/* STATES - Vacation Mode */}
          <div
            className={cn(
              vacationIsActiveOrProgrammed
                ? "border-solid border-primary/20"
                : "border-double border-secondary/20",
              "col-span-2 flex size-full h-52 flex-col items-center justify-center gap-4 rounded-lg border-4 text-secondary transition-all"
            )}
            style={{
              boxShadow:
                "0 1px 3px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
            }}
          >
            <TreePalm
              className={cn(
                vacationIsActiveOrProgrammed
                  ? "text-primary/80"
                  : "text-secondary",
                "size-7 sm:size-8 md:size-9"
              )}
            />
            <span className="text-md w-fit text-center xxs:text-lg xs:text-xl">
              Modo Vacaciones
            </span>

            <div>
              {vacation?.active && !vacation.from && (
                <span className="-mt-2 flex items-center gap-2 text-primary/80">
                  <AlarmClockOff className="size-5 min-w-5" />
                  Activo indefinidamente
                </span>
              )}
              {vacation?.active && vacation.from && vacation.to && (
                <span className="-mt-2 flex items-center gap-2">
                  <AlarmClock className="mb-1 size-5 min-w-5 text-secondary" />
                  Activo hasta{" "}
                  <span className="text-primary/80">
                    {format(vacation?.to ?? new Date(), "dd-MM-yyyy")}
                  </span>
                </span>
              )}
              {/* {vacation?.active && vacation.from && vacation.to && (
                <span className="-mt-2">
                  {format(vacation?.from ?? new Date(), "dd-MM-yyyy")} -{" "}
                  {format(vacation?.to ?? new Date(), "dd-MM-yyyy")}
                </span>
              )} */}
              {!vacation?.active && vacation?.from && vacation?.to && (
                <span className="-mt-2 flex items-center gap-2">
                  <CalendarDays className="mb-1 size-5 min-w-5 text-secondary" />
                  Programado desde{" "}
                  <span className="text-primary/80">
                    {format(vacation?.from ?? new Date(), "dd-MM-yyyy")}
                  </span>
                  {" hasta "}
                  <span className="text-primary/80">
                    {format(vacation?.to ?? new Date(), "dd-MM-yyyy")}
                  </span>
                </span>
              )}
            </div>

            <button
              onClick={() => setIsVacationModalOpen(true)}
              className={cn(
                vacationIsActiveOrProgrammed
                  ? "btn-outline"
                  : "btn-primary -mt-4",
                "btn btn-sm"
              )}
            >
              {vacationIsActiveOrProgrammed ? "Desactivar" : "Activar"}
            </button>
          </div>

          {/* STATES - MercadoPago */}
          <div
            className={cn(
              mercadopago?.active
                ? "border-solid border-primary/20"
                : "border-double border-secondary/20",
              "relative col-span-2 flex size-full h-52 flex-col items-center justify-center gap-4 rounded-lg border-4 text-secondary transition-all"
            )}
            style={{
              boxShadow:
                "0 1px 3px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
            }}
          >
            {!vars.mp_access_token && (
              <Tooltip>
                <TooltipTrigger className="absolute right-2.5 top-2.5">
                  <AlertCircle className="size-5 min-w-5 text-error" />
                  <TooltipContent
                    side="left"
                    align="center"
                    sideOffset={5}
                    className="flex h-8 w-fit items-center rounded-md border border-error bg-base-100 px-3 text-sm font-semibold"
                  >
                    Sin Access Token de MP
                  </TooltipContent>
                </TooltipTrigger>
              </Tooltip>
            )}

            <Image
              alt="mp"
              src={MercadoPago}
              className={cn("size-7 sm:size-8 md:size-10")}
              unoptimized
            />

            <span className="text-md -mt-1 w-fit text-center xxs:text-lg xs:text-xl">
              Aceptar MercadoPago
            </span>

            <div>
              {mercadopago?.active && (
                <div className="flex w-full items-start justify-center gap-2 text-primary/80">
                  <Handshake className="size-5 min-w-5" />
                  <span className="w-48 text-center xxs:w-fit">
                    Aceptando pagos por MercadoPago
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMercadopagoModalOpen(true)}
              className={cn(
                mercadopago?.active ? "btn-outline" : "btn-primary -mt-4",
                "btn btn-sm"
              )}
            >
              {mercadopago?.active ? "Desactivar" : "Activar"}
            </button>
          </div>

          {/* STATES - Units */}
          <div
            className={cn(
              units?.active
                ? "border-solid border-primary/20"
                : "border-double border-secondary/20",
              "relative col-span-2 flex size-full h-52 flex-col items-center justify-center gap-4 rounded-lg border-4 text-secondary transition-all"
            )}
            style={{
              boxShadow:
                "0 1px 3px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
            }}
          >
            <Scale
              className={cn(
                vacationIsActiveOrProgrammed
                  ? "text-primary/80"
                  : "text-secondary",
                "size-7 sm:size-8 md:size-9"
              )}
            />
            <span className="text-md w-fit text-center xxs:text-lg xs:text-xl">
              Unidades de medida
            </span>

            <div>
              {units?.active && (
                <span className="-mt-2 flex items-center gap-2 text-primary/80">
                  <Weight className="size-5 min-w-5" />
                  Unidades de medida activas
                </span>
              )}
            </div>

            <button
              onClick={() => setIsUnitsModalOpen(true)}
              className={cn(
                units?.active ? "btn-outline" : "btn-primary -mt-4",
                "btn btn-sm"
              )}
            >
              {units?.active ? "Desactivar" : "Activar"}
            </button>
          </div>
        </section>
      </div>

      {!vacationIsActiveOrProgrammed && (
        <EnableVacationStateModal
          isOpen={isVacationModalOpen}
          onClose={() => setIsVacationModalOpen(false)}
        />
      )}
      {vacationIsActiveOrProgrammed && (
        <DisableVacationStateModal
          isOpen={isVacationModalOpen}
          onClose={() => setIsVacationModalOpen(false)}
        />
      )}
      <MercadopagoStateModal
        isOpen={isMercadopagoModalOpen}
        onClose={() => setIsMercadopagoModalOpen(false)}
        active={mercadopago?.active ?? false}
      />
      <UnitsStateModal
        isOpen={isUnitsModalOpen}
        onClose={() => setIsUnitsModalOpen(false)}
        active={units?.active ?? false}
      />
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("admin");
