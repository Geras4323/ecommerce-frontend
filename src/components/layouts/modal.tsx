import { type WithChildren } from "@/types/types";
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
}: ModalProps & WithChildren) {
  return (
    <Dialog open={isOpen} onOpenChange={() => !!onClose && onClose}>
      <DialogContent showXButton={!!onClose} className="pt-2">
        <DialogHeader className="flex flex-col gap-2">
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
