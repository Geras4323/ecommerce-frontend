import type { WithClassName, WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";
import { AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import type { MouseEventHandler, ReactNode } from "react";
import { LoadingSpinner } from "./loading";

export function ErrorSpan({
  message,
  className,
}: { message?: string } & WithClassName) {
  if (!message) return;
  return (
    <div
      className={cn(
        !!className && className,
        "flex items-center gap-2 text-base text-error"
      )}
    >
      <AlertCircle className="mb-0.5 size-4 min-w-4" />
      <span className="italic">{message}</span>
    </div>
  );
}

export function SuccessAlert({
  message,
  showRedirect = false,
}: {
  message?: string;
  showRedirect?: boolean;
}) {
  const { theme } = useTheme();
  if (!message) return;
  return (
    <div
      className={cn(
        theme === "dark" ? "bg-success text-black" : "bg-secondary text-white",
        "flex h-12 w-full items-center justify-between rounded-lg px-3 py-1"
      )}
    >
      <span>{message}</span>
      {showRedirect && (
        <div className="flex animate-pulse items-center gap-2">
          <span>Redirigiendo...</span>
          <LoadingSpinner className="size-5 min-w-5" />
        </div>
      )}
    </div>
  );
}

export function FormInput({
  children,
  className,
}: WithChildren & WithClassName) {
  return (
    <section className={cn(!!className && className, "flex flex-col gap-2")}>
      {children}
    </section>
  );
}

export function MandatoryMark({ className }: WithClassName) {
  return <span className={cn(!!className && className, "text-error")}>*</span>;
}

type Animation = keyof typeof animations;
const animations = {
  spinner: "loading-spinner",
  dots: "loading-dots",
  ring: "loading-ring",
  ball: "loading-ball",
  bars: "loading-bars",
  infinity: "loading-infinity",
};

export const LoadableButton = ({
  type,
  isPending,
  className,
  disabled,
  children,
  animation = "dots",
  onClick,
}: {
  type?: "button" | "reset" | "submit";
  isPending: boolean;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  animation?: Animation;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button
      onClick={(e) => {
        if (isPending || !onClick) return;
        onClick(e);
      }}
      type={isPending ? "button" : type}
      className={cn(
        "btn",
        !!className && className,
        isPending && "no-animation cursor-default"
      )}
      disabled={disabled}
    >
      {isPending ? (
        <span className={cn("loading", !!animation && animations[animation])} />
      ) : (
        children
      )}
    </button>
  );
};
