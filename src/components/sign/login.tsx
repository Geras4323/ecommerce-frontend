import { cn } from "@/utils/lib";
import { ErrorAlert, ErrorSpan, FormInput, LoadableButton } from "../forms";
import { useMutation } from "@tanstack/react-query";
import type { ServerError, ServerSuccess, WithClassName } from "@/types/types";
import { type Session } from "@/functions/session";
import { z } from "zod";
import { vars } from "@/utils/vars";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { KeyRound, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PasswordResetModal } from "../modals/auth";

type Inputs = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  email: z.string().min(1, { message: "Email requerido" }),
  password: z.string().min(1, { message: "Contraseña requerida" }),
});

export function LoginForm({
  isLogging,
  switchSide: switchSideProp,
  className,
}: { isLogging: boolean; switchSide?: () => void } & WithClassName) {
  const router = useRouter();

  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] =
    useState(false);

  const mutation = useMutation<ServerSuccess<Session>, ServerError, Inputs>({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/login`;
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: (res) => {
      res.data.verified
        ? res.data.role === "admin"
          ? router.push("/")
          : router.push("/showroom")
        : router.push("/sign/verifyEmail");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(inputSchema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => mutation.mutate(data);

  function switchSide() {
    reset();
    mutation.reset();
    switchSideProp && switchSideProp();
  }

  useEffect(() => {
    reset();
  }, [isLogging, reset]);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          isLogging ? "opacity-100" : "opacity-0",
          "flex h-full w-full flex-col items-center justify-between p-12 transition-opacity duration-1000",
          !!className && className
        )}
      >
        <div className="flex w-full flex-row items-baseline gap-4 border-b border-b-secondary/20">
          <h3 className="w-full pb-1 text-left text-lg tracking-wide text-primary xxs:text-xl">
            INICIAR SESIÓN
          </h3>

          <button
            type="button"
            onClick={switchSide}
            className="flex items-center gap-1.5 whitespace-nowrap text-base text-secondary underline underline-offset-4 md:hidden"
          >
            <Undo2 className="size-4" />
            Crear Cuenta
          </button>
        </div>

        <div className="flex w-full flex-col gap-8">
          <FormInput className="relative col-span-2">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/60">Email</label>
            </div>
            <input
              {...register("email")}
              type="text"
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

          <FormInput className="relative col-span-2">
            <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
              <label className="text-primary/60">Contraseña</label>
            </div>
            <input
              {...register("password")}
              type="password"
              className={cn(
                !!errors.password ? "border-error" : "border-secondary/30",
                "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
              )}
            />
            <div
              className={cn(
                !!errors.password && "opacity-100",
                "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
              )}
            >
              <ErrorSpan message={errors.password?.message} />
            </div>
          </FormInput>
        </div>

        <div className="flex w-full flex-col">
          <ErrorAlert
            className="mb-4 w-full"
            message={mutation.error?.response?.data.comment}
          />

          <div
            onClick={() => setIsPasswordResetModalOpen(true)}
            className="flex select-none items-center justify-center gap-2 text-base text-secondary underline-offset-2 hover:cursor-pointer hover:underline"
          >
            <KeyRound className="size-4 min-w-4" />
            <span>Olvidé mi contraseña</span>
          </div>

          <LoadableButton
            isPending={mutation.isPending}
            className="btn btn-primary mt-2 w-full"
            animation="dots"
          >
            Iniciar sesión
          </LoadableButton>
        </div>
      </form>

      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
      />
    </>
  );
}
