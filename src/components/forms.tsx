import { WithClassName, type WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";

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
