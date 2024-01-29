import type { WithClassName, WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";
import type { MouseEventHandler, ReactNode } from "react";

export function ErrorSpan({ message }: { message?: string }) {
  if (!message) return;
  return <span className="text-base text-error">{message}</span>;
}

export function FormInput({ children }: WithChildren) {
  return <section className="flex flex-col gap-2">{children}</section>;
}

export function MandatoryMark({ className }: WithClassName) {
  return <span className={cn(!!className && className, "text-error")}>*</span>;
}

export const LoadableButton = ({
  type,
  isLoading,
  className,
  disabled,
  children,
  animation = "loading-spinner",
  onClick,
}: {
  type?: "button" | "reset" | "submit";
  isLoading: boolean;
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
        if (isLoading || !onClick) return;
        onClick(e);
      }}
      type={isLoading ? "button" : type}
      className={cn(
        "btn",
        !!className && className,
        isLoading && "no-animation cursor-default"
      )}
      disabled={disabled}
    >
      {isLoading ? <span className={cn("loading", animation)} /> : children}
    </button>
  );
};
