import { cn } from "@/utils/lib";
import LoginGIF from "../../../public/gifs/loginGIF.json";
import SignupGIF from "../../../public/gifs/signupGIF.json";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function SwitchCard({
  isLogging,
  switchSide,
}: {
  isLogging: boolean;
  switchSide: () => void;
}) {
  return (
    <div
      className={cn(
        isLogging ? "left-0 border-r" : "left-1/2 border-l",
        "absolute z-50 h-full w-1/2 border-x-secondary/20 bg-secondary/10 transition-all duration-1000 ease-in-out"
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
        <button
          onClick={switchSide}
          className="text-primary no-underline underline-offset-2 hover:underline"
        >
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
        <button
          onClick={switchSide}
          className="text-primary no-underline underline-offset-2 hover:underline"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
