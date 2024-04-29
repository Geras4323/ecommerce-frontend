import { ErrorSpan, FormInput, LoadableButton } from "@/components/forms";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import Image from "next/image";
import Logo from "../../public/logoNB.png";
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { type ServerSuccess, type ServerError } from "@/types/types";
import { vars } from "@/utils/vars";
import axios from "axios";
import { type Session } from "@/functions/session";
import { useRouter } from "next/router";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  name: z.string().min(1, { message: "Nombre requerido" }),
  surname: z.string().min(1, { message: "Apellido Requerido" }),
  email: z.string().min(1, { message: "Email requerido" }),
  password: z.string().min(8, { message: "Mínimo 8 caracteres" }),
});

export default function Signup() {
  const router = useRouter();

  const signupMutation = useMutation<
    ServerSuccess<Session>,
    ServerError<string>,
    Input
  >({
    mutationFn: async (data) => {
      const url = `${vars.serverUrl}/api/v1/auth/signup`;
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: () => router.push("/login"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
  });

  const onSubmit: SubmitHandler<Input> = (data) => signupMutation.mutate(data);

  return (
    <GeneralLayout title="Crear cuenta" description="Crear cuenta">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto my-auto grid h-fit w-full max-w-2xl flex-col justify-center gap-4 rounded-xl p-12 shadow-lg"
      >
        <Image
          width={700}
          height={300}
          src={Logo}
          alt="logo"
          className="col-span-2 -ml-1 w-full max-w-md place-self-center"
          unoptimized
        />

        <FormInput>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            {...register("name")}
            type="text"
            className="input input-bordered"
            placeholder="Nombre"
          />
          {<ErrorSpan message={errors.email?.message} />}
        </FormInput>

        <FormInput>
          <label htmlFor="surname">Apellido</label>
          <input
            id="surname"
            {...register("surname")}
            type="text"
            className="input input-bordered"
            placeholder="Apellido"
          />
          {<ErrorSpan message={errors.email?.message} />}
        </FormInput>

        <FormInput className="col-span-2">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            {...register("email")}
            type="text"
            className="input input-bordered"
            placeholder="Email"
          />
          {<ErrorSpan message={errors.email?.message} />}
        </FormInput>

        <FormInput className="col-span-2">
          <label htmlFor="email">Contraseña</label>
          <input
            {...register("password")}
            type="password"
            className="input input-bordered"
            placeholder="Contraseña"
          />
          {<ErrorSpan message={errors.password?.message} />}
        </FormInput>

        {/* <FormInput>
          <label htmlFor="email">Contraseña</label>
          <input
            // {...register("password")}
            type="password"
            className="input input-bordered"
            placeholder="Contraseña"
          />
          {errors.password && <ErrorSpan message={errors.password.message} />}
        </FormInput> */}

        {signupMutation.isError && (
          <div className="col-span-2 flex h-12 w-full items-center rounded-lg bg-error px-4 py-2 font-medium text-primary">
            {/* {loginMutation.error.response?.data === "Invalid credentials"
            ? "Email o contraseña incorrectos"
            : "Se ha producido un error"} */}
            Ese email ya está en uso
          </div>
        )}

        <LoadableButton
          isPending={signupMutation.isPending}
          className="btn btn-primary col-span-2 mt-4"
        >
          Crear cuenta
        </LoadableButton>
      </form>
    </GeneralLayout>
  );
}
