import { LoadingSpinner } from "@/components/loading";
import { verifyEmail } from "@/functions/auth";
import { leaveIfVerified } from "@/functions/session";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import { type ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { useQuery } from "@tanstack/react-query";
import { Check, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { z } from "zod";

function VerifyEmail() {
  const { theme } = useTheme();
  const router = useRouter();
  const routerRef = useRef(router);

  const token = z
    .string()
    .optional()
    .catch(undefined)
    .parse(router.query.token);

  const verifyEmailQuery = useQuery<
    Awaited<ReturnType<typeof verifyEmail>>,
    ServerError
  >({
    queryKey: ["verify"],
    queryFn: () => verifyEmail(token ?? ""),
    retry: false,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (verifyEmailQuery.isSuccess) {
      setTimeout(() => {
        routerRef.current.push("/showroom");
      }, 3000);
    }
  }, [verifyEmailQuery.isSuccess]);

  return (
    <GeneralLayout
      title="Verificación de email"
      description="Verificación de email"
    >
      <div className="absolute flex h-screen w-screen items-center justify-center">
        <div
          className={cn(
            theme === "dark"
              ? verifyEmailQuery.isPending
                ? "border-l-info"
                : verifyEmailQuery.error
                ? "border-l-error"
                : "border-l-success"
              : verifyEmailQuery.isError
              ? "border-l-error"
              : "border-l-primary",
            "flex h-fit w-full max-w-xl flex-col items-center gap-2 rounded-lg border border-l-4 border-secondary/20 bg-base-100 p-4 shadow-lg"
          )}
        >
          {verifyEmailQuery.isPending ? (
            <>
              <span className="text-2xl">Verificación de email</span>

              <p>Por favor aguarde mientras verificamos su email...</p>

              <div className="mt-4 flex w-full justify-end">
                <div className="flex items-center gap-3 rounded-lg border border-secondary/30 px-4 py-2">
                  <span>Verificando</span>
                  <LoadingSpinner className="size-4" />
                </div>
              </div>
            </>
          ) : verifyEmailQuery.isError ? (
            <>
              <span className="text-2xl">Error al verificar</span>

              <div className="flex gap-3">
                <p>El token de verificación expiró o no existe</p>
                <Link href="/sign/verifyEmail" className="underline">
                  Reintentar
                </Link>
              </div>

              <div className="mt-4 flex w-full justify-end">
                <div className="flex items-center gap-3 rounded-lg border border-secondary/30 bg-error px-4 py-2 text-black">
                  <span>Algo salió mal</span>
                  <XCircle className="size-4" />
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl">Email verificado</span>

              <p>Hemos verificado su email. Será redirigido al showroom</p>

              <div className="mt-4 flex w-full justify-end">
                <div className="flex items-center gap-3 rounded-lg border border-secondary/30 bg-success px-4 py-2 text-black">
                  <span>Verificado</span>
                  <Check className="size-4" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </GeneralLayout>
  );
}

export default VerifyEmail;
export const getServerSideProps = leaveIfVerified;
