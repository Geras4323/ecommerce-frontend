import { ErrorSpan, LoadableButton } from "@/components/forms";
import { leaveIfVerified } from "@/functions/session";
import { useSession } from "@/hooks/session";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import { type ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useTheme } from "next-themes";

function VerifyEmail() {
  const { session } = useSession();
  const { theme } = useTheme();

  const mutation = useMutation<void, ServerError, void>({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/auth/signup/verify/restart`;
      return axios.post(url, null, { withCredentials: true });
    },
  });

  return (
    <GeneralLayout
      title="Verificación de email"
      description="Verificación de email"
    >
      <div className="absolute flex h-screen w-screen items-center justify-center">
        <div
          className={cn(
            theme === "dark" ? "border-l-info" : "border-l-primary",
            "flex h-fit w-full max-w-xl flex-col items-center gap-2 rounded-lg border border-l-4 border-secondary/20 bg-base-100 p-4 shadow-lg"
          )}
        >
          <span className="text-2xl">Verificación de email</span>

          {mutation.isSuccess ? (
            <p className="w-full text-center text-secondary">
              Le enviamos un mail de verificación a <b>{session.data?.email}</b>
              . Por favor compruebe su bandeja de entrada y de spam.
            </p>
          ) : (
            <p className="w-full text-center text-secondary">
              Para verificar su email, haga click en el botón{" "}
              <span className="italic text-primary underline underline-offset-2">
                Verificar Email
              </span>{" "}
              de abajo. Le enviaremos un mail a <b>{session.data?.email}</b>{" "}
              para validar su cuenta.
            </p>
          )}

          {!mutation.isSuccess && (
            <LoadableButton
              onClick={() => mutation.mutate()}
              animation="dots"
              isPending={mutation.isPending}
              className="btn btn-outline btn-primary mt-4 w-36 self-center"
            >
              Verificar Email
            </LoadableButton>
          )}

          {mutation.isError && (
            <ErrorSpan message="Ocurrió un error inesperado" className="mt-2" />
          )}
        </div>
      </div>
    </GeneralLayout>
  );
}

export default VerifyEmail;
export const getServerSideProps = leaveIfVerified;
