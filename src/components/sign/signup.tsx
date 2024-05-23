import { type Session } from "@/functions/session";
import type { ServerError, ServerSuccess, WithClassName } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorSpan, FormInput, LoadableButton } from "../forms";
import { Redo2, Undo } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

type NameInputs = z.infer<typeof nameInputSchema>;
const nameInputSchema = z.object({
  name: z.string().min(1, { message: "Nombre requerido" }),
  surname: z.string().min(1, { message: "Apellido Requerido" }),
  email: z.string().email({ message: "Email inválido" }),
});
type PasswordsInputs = z.infer<typeof passwordsInputSchema>;
const passwordsInputSchema = z
  .object({
    password: z.string().min(8, { message: "Al menos 8 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export function SignupForm({
  isLogging,
  switchSide: switchSideProp,
  className,
}: { isLogging: boolean; switchSide?: () => void } & WithClassName) {
  const { theme } = useTheme();

  const [stage, setStage] = useState<"name" | "password">("name");
  const [signNameData, setSignNameData] = useState<NameInputs>();

  const {
    register: nameRegister,
    handleSubmit: handleNameSubmit,
    formState: { errors: nameErrors },
    reset: nameReset,
    getValues: getNameValues,
  } = useForm<NameInputs>({
    resolver: zodResolver(nameInputSchema),
  });

  const onNameSubmit: SubmitHandler<NameInputs> = (data) => {
    setStage("password");
    setSignNameData(data);
  };

  const {
    register: passwordRegister,
    handleSubmit: passwordHandleSubmit,
    formState: { errors: passwordErrors },
    reset: passwordReset,
    watch: passwordWatch,
    setError: setPasswordErrors,
    clearErrors: clearPasswordErrors,
  } = useForm<PasswordsInputs>({
    resolver: zodResolver(passwordsInputSchema),
  });

  const mutation = useMutation<
    ServerSuccess<Session>,
    ServerError<string>,
    NameInputs & PasswordsInputs
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/signup`;
      return axios.post(url, data, { withCredentials: true });
    },
    onError: () => setStage("name"),
  });

  const onPasswordSubmit: SubmitHandler<PasswordsInputs> = (data) => {
    if (!signNameData) return;
    mutation.mutate({
      ...signNameData,
      ...data,
    });
  };

  passwordWatch((value, { type, name }) => {
    if (type === "change" && name === "confirmPassword") {
      const match = value.password === value.confirmPassword;
      const hasError = passwordErrors.confirmPassword?.type === "noMatch";

      if (match && hasError) {
        clearPasswordErrors("confirmPassword");
      }

      if (!match && !hasError) {
        setPasswordErrors("confirmPassword", {
          message: "Las contraseñas no coinciden",
          type: "noMatch",
        });
      }
    }
  });

  function switchSide() {
    nameReset();
    mutation.reset();
    switchSideProp && switchSideProp();
  }

  if (mutation.isSuccess)
    return (
      <div className="absolute flex h-screen w-screen items-center justify-center px-4 text-base">
        <div
          className={cn(
            theme === "dark" ? "border-l-info" : "border-l-primary",
            "flex h-fit w-full max-w-xl flex-col items-center gap-2 rounded-lg border border-l-4 border-secondary/20 bg-base-100 p-4 shadow-lg"
          )}
        >
          <span className="text-2xl text-primary">Verificación de email</span>

          <p className="w-full text-center text-secondary">
            Le enviamos un mail de verificación a{" "}
            <b>{getNameValues("email")}</b>. Por favor compruebe su bandeja de
            entrada y de spam.
          </p>

          <Link
            href="/showroom"
            className="btn btn-outline btn-primary mt-4 w-36 self-center"
          >
            Ir al showroom
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className={cn(
        isLogging ? "opacity-0" : "opacity-100",
        "relative h-full w-full p-12 transition-opacity duration-1000",
        "border border-secondary/20 shadow-lg",
        !!className && className
      )}
    >
      <form
        onSubmit={handleNameSubmit(onNameSubmit)}
        className="flex h-full w-full flex-col justify-between gap-8"
      >
        <div className="flex w-full flex-row gap-4 border-b border-b-secondary/20">
          <h3 className="w-full pb-1 text-left text-xl tracking-wide text-primary">
            CREAR CUENTA
          </h3>

          <button
            type="button"
            onClick={switchSide}
            className="flex items-center gap-1.5 whitespace-nowrap text-base text-secondary underline underline-offset-4 md:hidden"
          >
            <Redo2 className="size-4" />
            Iniciar Sesión
          </button>
        </div>

        <div className="flex w-full flex-col gap-8">
          <FormInput className="relative">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/60">Nombre</label>
            </div>
            <input
              {...nameRegister("name")}
              type="text"
              className={cn(
                !!nameErrors.name ? "border-error" : "border-secondary/30",
                "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
              )}
            />
            <div
              className={cn(
                !!nameErrors.name && "opacity-100",
                "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
              )}
            >
              <ErrorSpan message={nameErrors.name?.message} />
            </div>
          </FormInput>

          <FormInput className="relative">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/60">Apellido</label>
            </div>
            <input
              {...nameRegister("surname")}
              type="text"
              className={cn(
                !!nameErrors.surname ? "border-error" : "border-secondary/30",
                "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
              )}
            />
            <div
              className={cn(
                !!nameErrors.surname && "opacity-100",
                "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
              )}
            >
              <ErrorSpan message={nameErrors.surname?.message} />
            </div>
          </FormInput>

          <FormInput className="relative">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/60">Email</label>
            </div>
            <input
              {...nameRegister("email")}
              type="text"
              className={cn(
                !!nameErrors.email ? "border-error" : "border-secondary/30",
                "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
              )}
            />
            <div
              className={cn(
                !!nameErrors.email && "opacity-100",
                "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
              )}
            >
              <ErrorSpan message={nameErrors.email?.message} />
            </div>
          </FormInput>
        </div>

        <div className="flex w-full flex-col gap-4">
          {mutation.isError && (
            <div className="flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 text-base font-medium text-primary">
              Ese email ya está en uso
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full">
            Siguiente
          </button>
        </div>
      </form>

      <form
        onSubmit={passwordHandleSubmit(onPasswordSubmit)}
        className={cn(
          stage === "password"
            ? "bottom-0 opacity-100"
            : "pointer-events-none bottom-16 opacity-0",
          "absolute left-0 right-0 flex h-full flex-col items-center justify-between bg-base-100 p-12 transition-all duration-500 ease-in-out"
        )}
      >
        <h3 className="flex w-full items-center gap-3 border-b border-b-secondary/20 pb-1 text-left text-xl tracking-wide text-primary">
          <Undo
            className="size-6 cursor-pointer"
            onClick={() => {
              passwordReset();
              setStage("name");
            }}
          />
          SEGURIDAD
        </h3>

        <div className="flex w-full flex-col gap-8">
          <FormInput className="relative">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/60">Contraseña</label>
            </div>
            <input
              {...passwordRegister("password")}
              type="password"
              className={cn(
                !!passwordErrors.password
                  ? "border-error"
                  : "border-secondary/30",
                "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
              )}
            />
            <div
              className={cn(
                !!passwordErrors.password && "opacity-100",
                "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
              )}
            >
              <ErrorSpan message={passwordErrors.password?.message} />
            </div>
          </FormInput>

          <FormInput className="relative">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/60">Reingresar contraseña</label>
            </div>
            <input
              id="re-password"
              {...passwordRegister("confirmPassword")}
              type="password"
              className={cn(
                !!passwordErrors.confirmPassword
                  ? "border-error"
                  : "border-secondary/30",
                "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
              )}
            />
            <div
              className={cn(
                !!passwordErrors.confirmPassword && "opacity-100",
                "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
              )}
            >
              <ErrorSpan message={passwordErrors.confirmPassword?.message} />
            </div>
          </FormInput>
        </div>

        <LoadableButton
          isPending={mutation.isPending}
          className="btn btn-primary w-full"
          animation="dots"
        >
          Registrarse
        </LoadableButton>
      </form>
    </div>
  );
}
