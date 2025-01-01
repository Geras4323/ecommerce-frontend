import type { WithClassName, WithChildren } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog";
import { type ReactNode } from "react";

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
      // onOpenChange={() => !locked && onClose && !closeDelay && onClose()}
      onOpenChange={() => onClose && onClose()}
      modal
    >
      <DialogContent
        showXButton={!!onClose}
        // showXButton={!!onClose || !closeDelay}
        // closeDelay={closeDelay}
        className={className}
      >
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
