import { cn } from "@/utils/lib";
import { ErrorSpan, FormInput, LoadableButton } from "../forms";
import { useMutation } from "@tanstack/react-query";
import type { ServerError, ServerSuccess } from "@/types/types";
import { type Session } from "@/functions/session";
import { z } from "zod";
import { vars } from "@/utils/vars";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";

type Inputs = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  email: z.string().min(1, { message: "Email requerido" }),
  password: z.string().min(1, { message: "Contraseña requerida" }),
});

export function LoginForm({ isLogging }: { isLogging: boolean }) {
  const router = useRouter();

  const mutation = useMutation<
    ServerSuccess<Session>,
    ServerError<string>,
    Inputs
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/login`;
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: (res) => {
      reset();
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        isLogging ? "opacity-100" : "opacity-0",
        "flex h-full w-full flex-col items-center justify-between p-12 transition-opacity duration-1000"
      )}
    >
      <h3 className="w-full border-b border-b-secondary/20 pb-1 text-left text-2xl">
        Iniciar sesión
      </h3>

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
              "h-12 rounded-md border bg-base-100 px-4 shadow-inner transition-colors focus:outline-none"
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
              "h-12 rounded-md border bg-base-100 px-4 shadow-inner transition-colors focus:outline-none"
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

      {mutation.isError && (
        <div className="col-span-2 flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-medium text-primary">
          {mutation.error?.response?.data === "Invalid credentials"
            ? "Email o contraseña incorrectos"
            : "Se ha producido un error"}
        </div>
      )}

      <LoadableButton
        isPending={mutation.isPending}
        className="btn btn-primary mt-2 w-full"
      >
        Iniciar sesión
      </LoadableButton>
    </form>
  );
}
