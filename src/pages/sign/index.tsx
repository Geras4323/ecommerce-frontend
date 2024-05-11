import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useEffect, useState } from "react";
import { leaveIfLoggedIn } from "@/functions/session";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/sign/login";
import { SignupForm } from "@/components/sign/signup";
import { SwitchCard } from "@/components/sign/switch";

function Sign() {
  const searchParams = useSearchParams();

  const [isLogging, setIsLogging] = useState(true);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "signup") {
      setIsLogging(false);
    }
  }, [searchParams]);

  function switchSide() {
    // signupNameReset();
    // loginReset();
    setIsLogging((prev) => !prev);
  }

  return (
    <GeneralLayout title="Iniciar" description="Iniciar sesión o registrarse">
      <div className="flex h-screen w-screen items-center justify-center px-4">
        <div
          className="relative grid h-120 w-screen max-w-4xl grid-cols-2 overflow-hidden rounded-xl border border-secondary/20"
          style={{
            boxShadow: "0 4px 6px rgba(0,0,0, .3), 0 5px 20px rgba(0,0,0, .1)",
          }}
        >
          {/* Switch card */}
          <SwitchCard isLogging={isLogging} switchSide={switchSide} />

          {/* SIGNUP */}
          <SignupForm isLogging={isLogging} />

          {/* LOGIN */}
          <LoginForm isLogging={isLogging} />
        </div>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = leaveIfLoggedIn;
export default Sign;
