import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ServerSuccess, ServerError } from "@/types/types";
import { Toaster } from "sonner";
import { ErrorSpan, FormInput, LoadableButton } from "@/components/forms";
import Image from "next/image";
import Logo from "../../public/logoNB.png";
import { useRouter } from "next/router";
import { type Session, leaveIfLoggedIn } from "@/functions/session";
import { vars } from "@/utils/vars";

type Inputs = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  email: z.string().min(1, { message: "Email requerido" }),
  password: z.string().min(1, { message: "Contraseña requerida" }),
});

function Login() {
  const router = useRouter();

  const loginMutation = useMutation<
    ServerSuccess<Session>,
    ServerError<string>,
    Inputs
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/login`;
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: (res) => {
      res.data.role === "admin" ? router.push("/") : router.push("/showroom");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(inputSchema),
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => loginMutation.mutate(data);

  return (
    <>
      <Toaster richColors />

      <GeneralLayout title="Login" description="Login">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto my-auto flex h-fit w-full max-w-lg flex-col justify-center gap-4 rounded-xl p-12 shadow-xl"
        >
          <Image
            width={700}
            height={300}
            src={Logo}
            alt="logo"
            className="-ml-1 w-full max-w-md"
            unoptimized
          />

          <FormInput>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              {...register("email")}
              type="text"
              className="input input-bordered"
              placeholder="Email"
            />
            {errors.email && <ErrorSpan message={errors.email.message} />}
          </FormInput>

          <FormInput>
            <label htmlFor="email">Contraseña</label>
            <input
              {...register("password")}
              type="password"
              className="input input-bordered"
              placeholder="Contraseña"
            />
            {errors.password && <ErrorSpan message={errors.password.message} />}
          </FormInput>

          {loginMutation.isError && (
            <div className="col-span-2 flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-medium text-primary">
              {loginMutation.error.response?.data === "Invalid credentials"
                ? "Email o contraseña incorrectos"
                : "Se ha producido un error"}
            </div>
          )}

          <LoadableButton
            isPending={loginMutation.isPending}
            className="btn btn-primary mt-2"
          >
            Iniciar sesión
          </LoadableButton>
        </form>
      </GeneralLayout>
    </>
  );
}

export const getServerSideProps = leaveIfLoggedIn;
export default Login;
