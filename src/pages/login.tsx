import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ServerSuccess, ServerError } from "@/types/types";
import { Toaster } from "sonner";
import { ErrorSpan, FormInput } from "@/components/forms";
import Image from "next/image";
import Logo from "../../public/logoNB.png";
import { type Session } from "@/types/session";
import { useRouter } from "next/router";
import { leaveIfLoggedIn } from "@/functions/session";

type Inputs = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  email: z.string().min(1, { message: "Campo requerido" }),
  password: z.string().min(1, { message: "Campo requerido" }),
});

function Login() {
  const router = useRouter();

  const loginMutation = useMutation<
    ServerSuccess<Session>,
    ServerError,
    Inputs
  >({
    mutationFn: async (data) => {
      const url = "http://localhost:1323/api/v1/auth/login";
      return axios.post(url, data, { withCredentials: true });
    },
    onSuccess: (res) =>
      res.data.role === "admin" ? router.push("/") : router.push("/showroom"),
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
          className="mx-auto flex h-screen w-full max-w-sm flex-col justify-center gap-4"
        >
          <Image
            width={700}
            height={300}
            src={Logo}
            alt="logo"
            className="-ml-1 w-full"
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
            <label htmlFor="email">Password</label>
            <input
              {...register("password")}
              type="text"
              className="input input-bordered"
              placeholder="Password"
            />
            {errors.password && <ErrorSpan message={errors.password.message} />}
          </FormInput>

          <button className="btn btn-primary mt-2">Sumbit</button>
        </form>
      </GeneralLayout>
    </>
  );
}

export const getServerSideProps = leaveIfLoggedIn;
export default Login;
