import { create } from "zustand";

type ProductStore = {
  create_isOpen: boolean;
  create_open: () => void;
  create_close: () => void;
  // create_isChanged: boolean;
  // create_change: (state: boolean) => void;
  create_modal_discardChanges_isOpen: boolean;
  create_modal_discardChanges_change: (state: boolean) => void;

  update_isOpen: boolean;
  update_open: () => void;
  update_close: () => void;
  // update_isChanged: boolean;
  // update_change: (state: boolean) => void;
};

export const useProductStore = create<ProductStore>()((set) => ({
  create_isOpen: false,
  create_open: () => set({ create_isOpen: true }),
  create_close: () => set({ create_isOpen: false }),
  // create_isChanged: false,
  // create_change: (state: boolean) => set({ create_isChanged: state }),
  create_modal_discardChanges_isOpen: false,
  create_modal_discardChanges_change: (state: boolean) =>
    set({ create_modal_discardChanges_isOpen: state }),

  update_isOpen: false,
  // update_isChanged: true,
  // update_change: (state: boolean) => set({ update_isChanged: state }),
  update_open: () => set({ update_isOpen: true }),
  update_close: () => set({ update_isOpen: false }),
}));
