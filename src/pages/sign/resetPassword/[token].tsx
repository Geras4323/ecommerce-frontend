import { ErrorSpan, FormInput, LoadableButton } from "@/components/forms";
import { LoadingSpinner } from "@/components/loading";
import { GeneralLayout } from "@/layouts/general";
import { type ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Save } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type PasswordsInput = z.infer<typeof passwordsSchema>;
const passwordsSchema = z
  .object({
    newPassword: z.string().min(8, { message: "Al menos 8 caracteres" }),
    confirmNewPassword: z.string(),
  })
  .refine((schema) => schema.newPassword === schema.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export default function ResetPassword() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const changePasswordMutation = useMutation<void, ServerError, string>({
    mutationFn: async (newPassword) => {
      const url = `${vars.serverUrl}/api/v1/auth/recover-password`;
      return axios.post(
        url,
        { token: params?.token, newPassword },
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      timeoutRef.current = setTimeout(() => router.push("/sign"), 3000);
    },
  });

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
    setError,
  } = useForm<PasswordsInput>({
    resolver: zodResolver(passwordsSchema),
  });

  const onSubmit: SubmitHandler<PasswordsInput> = (data) =>
    changePasswordMutation.mutate(data.newPassword);

  watch((value, { type }) => {
    if (type === "change") {
      const match = value.newPassword === value.confirmNewPassword;
      const hasError = errors.confirmNewPassword?.type === "noMatch";

      if (match && hasError) {
        setIsSubmitEnabled(true);
        clearErrors("confirmNewPassword");
      }

      if (!match && !hasError) {
        setIsSubmitEnabled(false);
        setError("confirmNewPassword", {
          message: "Las contraseñas no coinciden",
          type: "noMatch",
        });
      }
    }
  });

  return (
    <GeneralLayout
      title="Restablecer contraseña"
      description="Restablecer contraseña"
    >
      <div className="flex min-h-screen w-screen flex-row items-start justify-center px-4 pt-32">
        <div className="flex h-fit w-full max-w-xl flex-col gap-6 overflow-hidden">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-wide text-primary">
              Restablecer contraseña
            </h1>
            <p className="text-secondary">Cambia la contraseña de tu cuenta</p>
          </div>

          <div className="h-fit w-full">
            {/* Content */}
            <div className="h-fit w-full rounded-xl border border-secondary/30 p-4 pt-8">
              <>
                {/* Security */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className={cn(
                    // current !== "security" && "hidden",
                    "flex flex-col gap-8"
                  )}
                >
                  <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label className="text-primary/60">
                        Nueva contraseña
                      </label>
                    </div>
                    <input
                      id="re-password"
                      {...register("newPassword")}
                      type="password"
                      className={cn(
                        !!errors.newPassword
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!errors.newPassword && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan message={errors.newPassword?.message} />
                    </div>
                  </FormInput>

                  <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label htmlFor="re-password" className="text-primary/60">
                        Reingresar nueva contraseña
                      </label>
                    </div>
                    <input
                      id="re-password"
                      {...register("confirmNewPassword")}
                      type="password"
                      className={cn(
                        !!errors.confirmNewPassword
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!errors.confirmNewPassword && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan message={errors.confirmNewPassword?.message} />
                    </div>
                  </FormInput>

                  {changePasswordMutation.isSuccess ? (
                    <div
                      className={cn(
                        theme === "dark"
                          ? "bg-success text-black"
                          : "bg-secondary text-white",
                        "flex h-12 w-full items-center justify-between rounded-lg px-3 py-1"
                      )}
                    >
                      <span>Contraseña actualizada exitosamente!</span>
                      <div className="flex animate-pulse items-center gap-2">
                        <span>Redirigiendo...</span>
                        <LoadingSpinner className="size-5 min-w-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex w-full flex-col gap-3">
                      {changePasswordMutation.isError && (
                        <ErrorSpan
                          message={
                            changePasswordMutation.error?.response?.data
                              .error ===
                            "token has invalid claims: token is expired"
                              ? "Este link expiró. Vuelva al login para solicitar un nuevo link."
                              : "Error desconocido."
                          }
                        />
                      )}

                      <LoadableButton
                        isPending={changePasswordMutation.isPending}
                        disabled={!isSubmitEnabled}
                        className="btn btn-primary btn-sm w-48 self-end"
                      >
                        <Save className="size-5 min-w-5" />
                        Guardar cambios
                      </LoadableButton>
                    </div>
                  )}
                </form>
              </>
            </div>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
}
