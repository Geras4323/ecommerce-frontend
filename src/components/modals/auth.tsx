import { Modal, type ModalProps } from "../layouts/modal";
import { AlertTriangle, CheckCircle2, KeyRound, Send } from "lucide-react";
import { cn } from "@/utils/lib";
import { ErrorSpan, FormInput, LoadableButton } from "../forms";
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { vars } from "@/utils/vars";
import { type ServerError } from "@/types/types";
import { LoginForm } from "../sign/login";
import { useRouter } from "next/router";

type Email = z.infer<typeof emailSchema>;
const emailSchema = z.object({
  email: z.string().email({ message: "Debe ser un email válido" }),
});

export function PasswordResetModal({
  isOpen,
  onClose: onCloseProp,
}: ModalProps) {
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<Email>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit: SubmitHandler<Email> = (data) =>
    sendResetPasswordEmailMutation.mutate(data);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const sendResetPasswordEmailMutation = useMutation<void, ServerError, Email>({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/recovery`;
      return axios.post(url, data, { withCredentials: true });
    },
  });

  function onClose() {
    sendResetPasswordEmailMutation.reset();
    onCloseProp && onCloseProp();
  }

  if (sendResetPasswordEmailMutation.isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="flex h-full w-full items-center gap-6">
          <div
            className={cn(
              theme === "dark" ? "bg-success/10" : "bg-primary/10",
              "size-12 min-w-12 rounded-full p-3 sm:size-16 sm:min-w-16"
            )}
          >
            <Send
              className={cn(
                theme === "dark" ? "text-success" : "text-primary",
                "mr-0.5 mt-0.5 size-full"
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl text-primary">Email enviado</h3>
            <p className="w-full text-secondary">
              Te enviamos un mail a{" "}
              <span className="font-semibold text-primary/70">
                {getValues("email")}
              </span>{" "}
              con los detalles para recuperar tu cuenta
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

        <div className="flex h-auto w-full items-center justify-end">
          <button onClick={onClose} className="btn btn-primary">
            <CheckCircle2 className="size-5" />
            Iniciar sesión
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex w-full flex-col gap-2">
        <h3 className="text-2xl text-primary">Restablecer tu contraseña</h3>
        <p className="w-full text-secondary">
          Te enviaremos un mail para que puedas recuperar tu cuenta
        </p>

        <p className="flex w-full items-center gap-2 text-sm text-secondary xs:text-base">
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

        <form
          className="mt-6 flex w-full flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput className="relative col-span-2 [&>*]:bg-base-300">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/80">
                Email usado para tu cuenta
              </label>
            </div>
            <input
              {...register("email")}
              type="email"
              className={cn(
                !!errors.email ? "border-error" : "border-secondary/30",
                "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
              )}
            />
            <div
              className={cn(
                !!errors.email && "opacity-100",
                "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
              )}
            >
              <ErrorSpan message={errors.email?.message} />
            </div>
          </FormInput>

          {sendResetPasswordEmailMutation.isError && (
            <div className="-mb-3 flex h-fit min-h-12 w-full items-center justify-between gap-2 rounded-lg bg-error px-3 py-1 text-white">
              <span className="max-w-64 truncate xxs:max-w-96">
                {sendResetPasswordEmailMutation.error.response?.data.comment}
              </span>
            </div>
          )}

          <div className="flex h-auto w-full items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancelar
            </button>
            <LoadableButton
              isPending={sendResetPasswordEmailMutation.isPending}
              className="btn btn-primary w-36"
            >
              <KeyRound className="size-5" />
              Restablecer
            </LoadableButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export function ReloginModal({
  isOpen,
  setIsOpen,
}: ModalProps & { setIsOpen: (s: boolean) => void }) {
  const router = useRouter();

  return (
    <Modal isOpen={isOpen} className="max-w-lg">
      <div className="flex h-96 flex-col gap-8">
        <LoginForm
          isLogging
          className="p-4"
          onSuccess={() => {
            setIsOpen(false);
            router.reload();
          }}
        />
      </div>
    </Modal>
  );
}
