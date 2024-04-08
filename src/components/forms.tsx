import type { WithClassName, WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";
import { AlertCircle } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";

export function ErrorSpan({ message }: { message?: string }) {
  if (!message) return;
  return (
    <div className="flex items-center gap-1 text-error">
      <AlertCircle className="mb-0.5 size-4" />
      <span className="text-base italic">{message}</span>
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

export const LoadableButton = ({
  type,
  isPending,
  className,
  disabled,
  children,
  animation = "loading-spinner",
  onClick,
}: {
  type?: "button" | "reset" | "submit";
  isPending: boolean;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  animation?:
    | "loading-spinner"
    | "loading-dots"
    | "loading-ring"
    | "loading-ball"
    | "loading-bars"
    | "loading-infinity";
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
      {isPending ? <span className={cn("loading", animation)} /> : children}
    </button>
  );
};
