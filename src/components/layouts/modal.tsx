import type { WithClassName, WithChildren } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog";
import { type ReactNode } from "react";
import { cn } from "@/utils/lib";

export type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: ReactNode;
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps & WithChildren & WithClassName) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        !!onClose && onClose();
      }}
    >
      <DialogContent showXButton={!!onClose}>
        <DialogHeader
          className={cn(
            !!className && className,
            !(title || description) && "hidden",
            "flex flex-col gap-2"
          )}
        >
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
