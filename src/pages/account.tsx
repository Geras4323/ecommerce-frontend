import {
  ErrorSpan,
  FormInput,
  LoadableButton,
  SuccessAlert,
} from "@/components/forms";
import { type Session, withAuth, getSession } from "@/functions/session";
import { GeneralLayout } from "@/layouts/general";
import { type ServerPage } from "@/types/session";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Save } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type GeneralInputs = z.infer<typeof nameInputSchema>;
const nameInputSchema = z.object({
  name: z.string().min(1, { message: "Nombre requerido" }),
  // email: z.string().email({ message: "Email inválido" }),
  phone: z.string().nullable(),
});
type PasswordsInputs = z.infer<typeof passwordsInputSchema>;
const passwordsInputSchema = z
  .object({
    newPassword: z.string(),
    currentPassword: z.string().min(8, { message: "Al menos 8 caracteres" }),
    confirmNewPassword: z.string(),
  })
  .refine((schema) => schema.newPassword === schema.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

type CurrentSection = "general" | "security";

const Account: ServerPage<typeof getServerSideProps> = () => {
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState<CurrentSection>("general");

  const [isGeneralSumbitEnabled, setIsGeneralSumbitEnabled] = useState(false);
  const [isPasswordsSumbitEnabled, setIsPasswordsSumbitEnabled] =
    useState(false);

  const myAccountQuery = useQuery({
    queryKey: ["myAccount"],
    queryFn: () => getSession(),
    retry: false,
  });

  const {
    register: generalRegister,
    handleSubmit: generalHandleSubmit,
    formState: { errors: generalErrors },
    reset: generalReset,
    watch: generalWatch,
  } = useForm<GeneralInputs>({
    resolver: zodResolver(nameInputSchema),
    values: {
      name: myAccountQuery.data?.name ?? "",
      // email: myAccountQuery.data?.email ?? "",
      phone: myAccountQuery.data?.phone ?? "",
    },
  });

  const changeGeneralMutation = useMutation<
    ServerSuccess<Session>,
    ServerError,
    GeneralInputs
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/users/update-data`;
      return axios.patch(url, data, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAccount"] });
      generalReset();
    },
  });

  const onGeneralSubmit: SubmitHandler<GeneralInputs> = (data) => {
    changeGeneralMutation.mutate(data);
  };

  generalWatch((value, { type }) => {
    if (type !== "change") return;
    if (
      value.name !== myAccountQuery.data?.name ||
      // value.email !== myAccountQuery.data?.email ||
      value.phone !== (myAccountQuery.data?.phone ?? "")
    ) {
      setIsGeneralSumbitEnabled(true);
      return;
    }
    setIsGeneralSumbitEnabled(false);
  });

  const {
    register: passwordsRegister,
    handleSubmit: passwordsHandleSubmit,
    formState: { errors: passwordsErrors },
    reset: passwordsReset,
    watch: passwordsWatch,
    setError: setPasswordsErrors,
    clearErrors: clearPasswordsErrors,
  } = useForm<PasswordsInputs>({
    resolver: zodResolver(passwordsInputSchema),
    values: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const changePasswordMutation = useMutation<
    ServerSuccess<Session>,
    ServerError,
    PasswordsInputs
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/change-password`;
      return axios.patch(url, data, { withCredentials: true });
    },
    onSuccess: () => passwordsReset(),
  });

  const onPasswordsSubmit: SubmitHandler<PasswordsInputs> = (data) => {
    changePasswordMutation.mutate(data);
  };

  passwordsWatch((value, { type }) => {
    if (type === "change") {
      const match = value.newPassword === value.confirmNewPassword;
      const hasError = passwordsErrors.confirmNewPassword?.type === "noMatch";

      if (match && hasError) {
        setIsPasswordsSumbitEnabled(true);
        clearPasswordsErrors("confirmNewPassword");
      }

      if (!match && !hasError) {
        setIsPasswordsSumbitEnabled(false);
        setPasswordsErrors("confirmNewPassword", {
          message: "Las contraseñas no coinciden",
          type: "noMatch",
        });
      }
    }
  });

  function switchCurrent(section: CurrentSection) {
    changeGeneralMutation.reset();
    changePasswordMutation.reset();
    generalReset();
    passwordsReset();
    setCurrent(section);
  }

  return (
    <GeneralLayout title="Mi cuenta" description="Información de mi cuenta">
      <div className="flex min-h-screen w-screen flex-row items-start justify-center px-4 pt-32">
        <div className="flex h-fit w-full max-w-xl flex-col gap-6 overflow-hidden">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-semibold uppercase tracking-wide text-primary">
              Ajustes de cuenta
            </h1>
            <p className="text-secondary">
              Administra la configuración de tu cuenta
            </p>
          </div>

          <div className="h-fit w-full">
            {/* Header */}
            <div className="relative flex h-12 min-h-12 w-full">
              <span
                onClick={() => switchCurrent("general")}
                className={cn(
                  current === "general"
                    ? "border-b-transparent border-r-transparent"
                    : "border-l-transparent border-t-transparent",
                  "flex h-full w-full cursor-pointer items-center justify-center rounded-br-lg rounded-tl-xl border border-secondary/30 text-lg font-semibold tracking-wide"
                )}
              >
                GENERAL
              </span>
              <span
                onClick={() => switchCurrent("security")}
                className={cn(
                  current === "general"
                    ? "border-r-transparent border-t-transparent"
                    : "border-b-transparent border-l-transparent",
                  "flex h-full w-full cursor-pointer items-center justify-center rounded-bl-xl rounded-tr-xl border border-secondary/30 text-lg font-semibold tracking-wide"
                )}
              >
                SEGURIDAD
              </span>
            </div>

            {/* Content */}
            <div className="h-fit w-full rounded-b-xl border-x border-b border-secondary/30 p-4 pt-8">
              <>
                {/* General */}
                <form
                  onSubmit={generalHandleSubmit(onGeneralSubmit)}
                  className={cn(
                    current !== "general" && "hidden",
                    "flex flex-col gap-8"
                  )}
                >
                  <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label className="text-primary/80">
                        Nombre y apellido
                      </label>
                    </div>
                    <input
                      {...generalRegister("name")}
                      type="text"
                      className={cn(
                        !!generalErrors.name
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!generalErrors.name && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan message={generalErrors.name?.message} />
                    </div>
                  </FormInput>

                  {/* <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label className="text-primary/80">Email</label>
                    </div>
                    <input
                      {...generalRegister("email")}
                      type="text"
                      className={cn(
                        !!generalErrors.email
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!generalErrors.email && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan message={generalErrors.email?.message} />
                    </div>
                  </FormInput> */}

                  <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label className="text-primary/80">
                        Teléfono{" "}
                        <span className="text-secondary">(opcional)</span>
                      </label>
                    </div>
                    <input
                      {...generalRegister("phone")}
                      type="number"
                      className={cn(
                        !!generalErrors.phone
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!generalErrors.phone && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan message={generalErrors.phone?.message} />
                    </div>
                  </FormInput>

                  <div className="flex w-full flex-col gap-3">
                    {changeGeneralMutation.isError ? (
                      <ErrorSpan
                        message={
                          changeGeneralMutation.error?.response?.data.comment
                        }
                      />
                    ) : (
                      changeGeneralMutation.isSuccess && (
                        <SuccessAlert message="Datos actualizados exitosamente!" />
                      )
                    )}

                    <LoadableButton
                      isPending={changeGeneralMutation.isPending}
                      disabled={!isGeneralSumbitEnabled}
                      className="btn btn-primary btn-sm w-48 self-end"
                    >
                      <Save className="size-5 min-w-5" />
                      Guardar cambios
                    </LoadableButton>
                  </div>
                </form>

                {/* Security */}
                <form
                  onSubmit={passwordsHandleSubmit(onPasswordsSubmit)}
                  className={cn(
                    current !== "security" && "hidden",
                    "flex flex-col gap-8"
                  )}
                >
                  <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label className="text-primary/80">
                        Contraseña actual
                      </label>
                    </div>
                    <input
                      {...passwordsRegister("currentPassword")}
                      type="password"
                      className={cn(
                        !!passwordsErrors.currentPassword
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!passwordsErrors.currentPassword && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan
                        message={passwordsErrors.currentPassword?.message}
                      />
                    </div>
                  </FormInput>

                  <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label className="text-primary/80">
                        Nueva contraseña
                      </label>
                    </div>
                    <input
                      id="re-password"
                      {...passwordsRegister("newPassword")}
                      type="password"
                      className={cn(
                        !!passwordsErrors.newPassword
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!passwordsErrors.newPassword && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan
                        message={passwordsErrors.newPassword?.message}
                      />
                    </div>
                  </FormInput>

                  <FormInput className="relative">
                    <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                      <label htmlFor="re-password" className="text-primary/80">
                        Reingresar nueva contraseña
                      </label>
                    </div>
                    <input
                      id="re-password"
                      {...passwordsRegister("confirmNewPassword")}
                      type="password"
                      className={cn(
                        !!passwordsErrors.confirmNewPassword
                          ? "border-error"
                          : "border-secondary/30",
                        "h-12 rounded-md border bg-base-100 px-4 text-base text-primary shadow-inner transition-colors focus:outline-none"
                      )}
                    />
                    <div
                      className={cn(
                        !!passwordsErrors.confirmNewPassword && "opacity-100",
                        "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                      )}
                    >
                      <ErrorSpan
                        message={passwordsErrors.confirmNewPassword?.message}
                      />
                    </div>
                  </FormInput>

                  <div className="flex w-full flex-col gap-3">
                    {changePasswordMutation.isError ? (
                      <ErrorSpan
                        message={
                          changePasswordMutation.error?.response?.data.comment
                        }
                      />
                    ) : (
                      changePasswordMutation.isSuccess && (
                        <SuccessAlert message="Contraseña actualizada exitosamente!" />
                      )
                    )}

                    <LoadableButton
                      isPending={changePasswordMutation.isPending}
                      disabled={!isPasswordsSumbitEnabled}
                      className="btn btn-primary btn-sm w-48 self-end"
                    >
                      <Save className="size-5 min-w-5" />
                      Guardar cambios
                    </LoadableButton>
                  </div>
                </form>
              </>
            </div>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
};

export default Account;
export const getServerSideProps = withAuth("noAdmin");
