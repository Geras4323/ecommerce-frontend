import { GeneralLayout } from "@/layouts/GeneralLayout";
import { cn } from "@/utils/lib";
import { useEffect, useState } from "react";
import LoginGIF from "../../public/gifs/loginGIF.json";
import SignupGIF from "../../public/gifs/signupGIF.json";
import dynamic from "next/dynamic";
import { ErrorSpan, FormInput, LoadableButton } from "@/components/forms";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import type { ServerError, ServerSuccess } from "@/types/types";
import { leaveIfLoggedIn, type Session } from "@/functions/session";
import { z } from "zod";
import { vars } from "@/utils/vars";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Undo } from "lucide-react";
import { useSearchParams } from "next/navigation";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type LoginInputs = z.infer<typeof loginInputSchema>;
const loginInputSchema = z.object({
  email: z.string().min(1, { message: "Email requerido" }),
  password: z.string().min(1, { message: "Contraseña requerida" }),
});

type SignupNameInput = z.infer<typeof signupNameInputSchema>;
const signupNameInputSchema = z.object({
  name: z.string().min(1, { message: "Nombre requerido" }),
  surname: z.string().min(1, { message: "Apellido Requerido" }),
  email: z.string().email({ message: "Email inválido" }),
});
type SignupPasswordsInput = z.infer<typeof signupPasswordsInputSchema>;
const signupPasswordsInputSchema = z
  .object({
    password: z.string().min(8, { message: "Al menos 8 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

function Sign() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLogging, setIsLogging] = useState(true);
  const [signNameData, setSignNameData] = useState<SignupNameInput>();

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "signup") {
      setIsLogging(false);
    }
  }, [searchParams]);

  const {
    register: loginRegister,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
    reset: loginReset,
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginInputSchema),
  });

  const onLoginSubmit: SubmitHandler<LoginInputs> = (data) =>
    loginMutation.mutate(data);

  const {
    register: signupNameRegister,
    handleSubmit: signupNameHandleSubmit,
    formState: { errors: signupNameErrors },
    reset: signupNameReset,
  } = useForm<SignupNameInput>({
    resolver: zodResolver(signupNameInputSchema),
  });

  const onSignupNameSubmit: SubmitHandler<SignupNameInput> = (data) =>
    setSignNameData(data);

  const {
    register: signupPassRegister,
    handleSubmit: signupPassHandleSubmit,
    formState: { errors: signupPassErrors },
    reset: signupPassReset,
    watch: signupPassWatch,
    setError: setSignupPassErrors,
    clearErrors: clearSignupPassErrors,
  } = useForm<SignupPasswordsInput>({
    resolver: zodResolver(signupPasswordsInputSchema),
  });

  const onSignupPassSubmit: SubmitHandler<SignupPasswordsInput> = (data) => {
    if (!signNameData) return;
    signupMutation.mutate({
      ...signNameData,
      ...data,
    });
  };

  signupPassWatch((value, { type, name }) => {
    if (type === "change" && name === "confirmPassword") {
      const match = value.password === value.confirmPassword;
      const hasError = signupPassErrors.confirmPassword?.type === "noMatch";

      if (match && hasError) {
        clearSignupPassErrors("confirmPassword");
      }

      if (!match && !hasError) {
        setSignupPassErrors("confirmPassword", {
          message: "Las contraseñas no coinciden",
          type: "noMatch",
        });
      }
    }
  });

  const loginMutation = useMutation<
    ServerSuccess<Session>,
    ServerError<string>,
    LoginInputs
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/login`;
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: (res) => {
      loginReset();
      res.data.role === "admin" ? router.push("/") : router.push("/showroom");
    },
  });

  const signupMutation = useMutation<
    ServerSuccess<Session>,
    ServerError<string>,
    SignupNameInput & SignupPasswordsInput
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/signup`;
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: () => setIsLogging(true),
  });

  function switchSide() {
    signupNameReset();
    loginReset();
    setIsLogging((prev) => !prev);
  }

  return (
    <GeneralLayout title="Iniciar" description="Iniciar sesión o registrarse">
      <div className="relative mx-auto my-auto grid h-120 w-screen max-w-4xl grid-cols-2 overflow-hidden rounded-xl border border-secondary/20">
        <div
          className={cn(
            isLogging ? "left-0 border-r" : "left-1/2 border-l",
            "absolute z-50 h-full w-1/2 border-x-secondary/20 bg-base-100 transition-all duration-1000 ease-in-out"
          )}
        >
          <div
            className={cn(
              isLogging ? "opacity-100" : "opacity-0",
              "absolute flex h-full items-center transition-opacity delay-300 duration-500"
            )}
          >
            <Lottie animationData={LoginGIF} />
          </div>
          <div
            className={cn(
              isLogging ? "opacity-0" : "opacity-100",
              "absolute flex h-full items-center p-16 transition-opacity delay-300 duration-500"
            )}
          >
            <Lottie animationData={SignupGIF} />
          </div>

          <div
            className={cn(
              isLogging ? "opacity-100" : "opacity-0",
              "absolute bottom-0 mb-6 flex w-full justify-center gap-1 transition-opacity delay-300 duration-1000"
            )}
          >
            <p className="text-secondary">¿Aún no tiene cuenta?</p>
            <button onClick={switchSide} className="text-primary">
              Registrarse
            </button>
          </div>
          <div
            className={cn(
              isLogging ? "opacity-0" : "opacity-100",
              "absolute bottom-0 mb-6 flex w-full justify-center gap-1 transition-opacity delay-300 duration-1000"
            )}
          >
            <p className="text-secondary">¿Ya tiene una cuenta?</p>
            <button onClick={switchSide} className="text-primary">
              Iniciar sesión
            </button>
          </div>
        </div>

        {/* SIGNUP */}
        <div
          className={cn(
            isLogging ? "opacity-0" : "opacity-100",
            "relative h-full w-full p-12 transition-opacity duration-1000"
          )}
        >
          <form
            onSubmit={signupNameHandleSubmit(onSignupNameSubmit)}
            className="flex h-full w-full flex-col justify-between gap-8"
          >
            <h3 className="w-full border-b border-b-secondary/20 pb-1 text-left text-2xl">
              Registrarse
            </h3>
            <FormInput className="relative">
              <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                <label className="text-primary/60">Nombre</label>
              </div>
              <input
                {...signupNameRegister("name")}
                type="text"
                className={cn(
                  !!signupNameErrors.name
                    ? "border-error"
                    : "border-secondary/30",
                  "h-12 rounded-md border bg-base-100 px-4 transition-colors focus:outline-none"
                )}
              />
              <div
                className={cn(
                  !!signupNameErrors.name && "opacity-100",
                  "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                )}
              >
                <ErrorSpan message={signupNameErrors.name?.message} />
              </div>
            </FormInput>

            <FormInput className="relative">
              <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                <label className="text-primary/60">Apellido</label>
              </div>
              <input
                {...signupNameRegister("surname")}
                type="text"
                className={cn(
                  !!signupNameErrors.surname
                    ? "border-error"
                    : "border-secondary/30",
                  "h-12 rounded-md border bg-base-100 px-4 transition-colors focus:outline-none"
                )}
              />
              <div
                className={cn(
                  !!signupNameErrors.surname && "opacity-100",
                  "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                )}
              >
                <ErrorSpan message={signupNameErrors.surname?.message} />
              </div>
            </FormInput>

            <FormInput className="relative">
              <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                <label className="text-primary/60">Email</label>
              </div>
              <input
                {...signupNameRegister("email")}
                type="text"
                className={cn(
                  !!signupNameErrors.email
                    ? "border-error"
                    : "border-secondary/30",
                  "h-12 rounded-md border bg-base-100 px-4 transition-colors focus:outline-none"
                )}
              />
              <div
                className={cn(
                  !!signupNameErrors.email && "opacity-100",
                  "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                )}
              >
                <ErrorSpan message={signupNameErrors.email?.message} />
              </div>
            </FormInput>

            {signupMutation.isError && (
              <div className="flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-medium text-primary">
                Ese email ya está en uso
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full">
              Siguiente
            </button>
          </form>

          <form
            onSubmit={signupPassHandleSubmit(onSignupPassSubmit)}
            className={cn(
              signNameData
                ? "bottom-0 opacity-100"
                : "pointer-events-none bottom-16 opacity-0",
              "absolute left-0 right-0 flex h-full flex-col items-center justify-between bg-base-100 p-12 transition-all duration-500 ease-in-out"
            )}
          >
            <h3 className="flex w-full items-center gap-3 border-b border-b-secondary/20 pb-1 text-left text-2xl">
              <Undo
                className="size-6 cursor-pointer"
                onClick={() => {
                  signupPassReset();
                  setSignNameData(undefined);
                }}
              />
              Seguridad
            </h3>

            <div className="flex w-full flex-col gap-8">
              <FormInput className="relative">
                <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                  <label className="text-primary/60">Contraseña</label>
                </div>
                <input
                  {...signupPassRegister("password")}
                  type="password"
                  className={cn(
                    !!signupPassErrors.password
                      ? "border-error"
                      : "border-secondary/30",
                    "h-12 rounded-md border bg-base-100 px-4 transition-colors focus:outline-none"
                  )}
                />
                <div
                  className={cn(
                    !!signupPassErrors.password && "opacity-100",
                    "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                  )}
                >
                  <ErrorSpan message={signupPassErrors.password?.message} />
                </div>
              </FormInput>

              <FormInput className="relative">
                <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                  <label className="text-primary/60">
                    Reingresar contraseña
                  </label>
                </div>
                <input
                  id="re-password"
                  {...signupPassRegister("confirmPassword")}
                  type="password"
                  className={cn(
                    !!signupPassErrors.confirmPassword
                      ? "border-error"
                      : "border-secondary/30",
                    "h-12 rounded-md border bg-base-100 px-4 transition-colors focus:outline-none"
                  )}
                />
                <div
                  className={cn(
                    !!signupPassErrors.confirmPassword && "opacity-100",
                    "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                  )}
                >
                  <ErrorSpan
                    message={signupPassErrors.confirmPassword?.message}
                  />
                </div>
              </FormInput>
            </div>

            <LoadableButton
              isPending={signupMutation.isPending}
              className="btn btn-primary w-full"
            >
              Registrarse
            </LoadableButton>
          </form>
        </div>

        {/* LOGIN */}
        <form
          onSubmit={loginHandleSubmit(onLoginSubmit)}
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
                {...loginRegister("email")}
                type="text"
                className={cn(
                  !!loginErrors.email ? "border-error" : "border-secondary/30",
                  "h-12 rounded-md border bg-base-100 px-4 transition-colors focus:outline-none"
                )}
              />
              <div
                className={cn(
                  !!loginErrors.email && "opacity-100",
                  "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                )}
              >
                <ErrorSpan message={loginErrors.email?.message} />
              </div>
            </FormInput>

            <FormInput className="relative col-span-2">
              <div className="absolute -top-2.5 left-3 flex items-center justify-between bg-base-100 px-2 text-sm">
                <label className="text-primary/60">Contraseña</label>
              </div>
              <input
                {...loginRegister("password")}
                type="password"
                className={cn(
                  !!loginErrors.password
                    ? "border-error"
                    : "border-secondary/30",
                  "h-12 rounded-md border bg-base-100 px-4 transition-colors focus:outline-none"
                )}
              />
              <div
                className={cn(
                  !!loginErrors.password && "opacity-100",
                  "absolute -bottom-2.5 right-3 bg-base-100 px-2 opacity-0 transition-all"
                )}
              >
                <ErrorSpan message={loginErrors.password?.message} />
              </div>
            </FormInput>
          </div>

          {loginMutation.isError && (
            <div className="col-span-2 flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-medium text-primary">
              {loginMutation.error.response?.data === "Invalid credentials"
                ? "Email o contraseña incorrectos"
                : "Se ha producido un error"}
            </div>
          )}

          <LoadableButton
            isPending={loginMutation.isPending}
            className="btn btn-primary mt-2 w-full"
          >
            Iniciar sesión
          </LoadableButton>
        </form>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = leaveIfLoggedIn;
export default Sign;
