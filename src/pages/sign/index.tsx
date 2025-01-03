import { GeneralLayout } from "@/layouts/general";
import { useEffect, useState } from "react";
import { leaveIfLoggedIn } from "@/functions/session";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/sign/login";
import { SignupForm } from "@/components/sign/signup";
import { SwitchCard } from "@/components/sign/switch";
import { cn } from "@/utils/lib";

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
    setIsLogging((prev) => !prev);
  }

  return (
    <GeneralLayout title="Iniciar" description="Iniciar sesión o registrarse">
      <div className="flex h-dvh w-screen flex-col items-center justify-center gap-8 px-4">
        <div
          className="relative mt-8 hidden h-120 w-full max-w-4xl grid-cols-2 overflow-hidden rounded-xl border border-secondary/20 md:grid 2xl:mt-0"
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

        {/* Flip container */}
        <div className="perspective-1000 h-120 w-full max-w-lg md:hidden">
          {/* Card */}
          <div
            className={cn(
              !isLogging && "rotate-y-180",
              "transform-style-3d relative size-full duration-1000"
            )}
          >
            {/* Front */}
            <div className="backface-hidden absolute flex size-full items-center justify-center rounded-xl border border-secondary/20 text-2xl text-white shadow-lg">
              <LoginForm
                isLogging={isLogging}
                className="p-6"
                switchSide={switchSide}
              />
            </div>
            {/* Back */}
            <div className="rotate-y-180 backface-hidden absolute flex size-full items-center justify-center rounded-xl text-2xl text-white">
              <SignupForm
                isLogging={isLogging}
                className="p-6"
                switchSide={switchSide}
              />
            </div>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = leaveIfLoggedIn;
export default Sign;
