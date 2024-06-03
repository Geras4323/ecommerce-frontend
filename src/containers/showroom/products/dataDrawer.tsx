import { LoadableButton } from "@/components/forms";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/shadcn/drawer";
import { type ProductImage } from "@/functions/images";
import { type Product } from "@/functions/products";
import { mqs, useMediaQueries } from "@/hooks/screen";
import { type ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { type UseMutationResult } from "@tanstack/react-query";
import { Minus, PanelRightClose, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Drawer as DrawerPrimitive } from "vaul";
import { Comfortaa } from "next/font/google";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export const ProductDataDrawer = ({
  product,
  logged,
  verified,
  inCart,
  addToCart,
  setSelectedProduct,
}: {
  product?: Product;
  logged: boolean;
  verified: boolean;
  inCart: boolean;
  addToCart: UseMutationResult<
    any,
    ServerError,
    {
      productID: number;
      quantity: number;
    },
    unknown
  >;
  setSelectedProduct: (p?: Product) => void;
}) => {
  const mq = useMediaQueries();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<{
    image?: ProductImage;
    position: number;
  }>();

  const deselectProduct = useCallback(() => {
    setSelectedProduct(undefined);
  }, [setSelectedProduct]);

  useEffect(() => {
    if (!product) {
      deselectProduct;
      return;
    }

    setSelectedImage({ image: product.images[0], position: 0 });
  }, [product, deselectProduct]);

  return (
    <>
      {mq >= mqs.xxs && (
        // I know there's a component for this, but the overlay component does not have the "onClick" prop :(
        <SheetPrimitive.Root open={!!product}>
          <SheetPrimitive.Portal>
            <SheetPrimitive.Overlay
              className={cn(
                "fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              )}
              onClick={deselectProduct}
            />
            <SheetPrimitive.Content
              className={cn(
                comfortaa.className,
                "fixed z-50 gap-4 p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
                "inset-y-0 right-0 h-full data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                "w-full max-w-screen-xxs border-l border-secondary/20 bg-base-100"
              )}
            >
              <div className="flex w-full flex-col gap-4 pb-6 pt-0">
                {/* Header */}
                <div className="mb-2 flex w-full items-center justify-between">
                  <button
                    onClick={deselectProduct}
                    className="btn btn-ghost btn-outline border border-secondary/30 shadow-sm focus:outline-none"
                  >
                    <PanelRightClose className="size-6" />
                  </button>
                  <div className="flex w-full items-end justify-end gap-1">
                    <span className="text-2xl text-primary/70">$</span>
                    <span className="text-3xl text-primary">
                      {product?.price.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                <DrawerTitle className="text-xl font-semibold">
                  {product?.name}
                </DrawerTitle>

                <div className="flex h-fit max-h-104 flex-col gap-4 overflow-y-auto overflow-x-hidden xl:max-h-128 2xl:max-h-152">
                  <DrawerDescription className="my-1 whitespace-pre-wrap text-secondary">
                    {product?.description}
                  </DrawerDescription>

                  {/* Image */}
                  <div className="flex w-full flex-row gap-2">
                    <div className="flex h-full max-h-80 w-28 min-w-28 flex-col gap-2 overflow-y-auto pr-1">
                      {product?.images.map((image, i) => (
                        <div
                          key={image.id}
                          className={cn(
                            selectedImage?.image?.id === image.id &&
                              "border-2 border-primary",
                            "relative aspect-square w-full rounded-lg object-cover"
                          )}
                        >
                          <Image
                            alt={`${image.id}`}
                            src={image.url}
                            width={70}
                            height={70}
                            className={cn(
                              "aspect-square h-full w-full cursor-pointer rounded-md object-cover"
                            )}
                            onClick={() =>
                              setSelectedImage({ image, position: i })
                            }
                          />
                          <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="relative aspect-square h-80 max-h-80 w-full rounded-lg border-none outline-none">
                      <Image
                        alt={product?.name ?? ""}
                        width={260}
                        height={260}
                        src={selectedImage?.image?.url ?? ""}
                        className="aspect-square h-80 max-h-80 w-full rounded-lg border-none object-cover outline-none"
                      />
                      {selectedImage && (
                        <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                          {selectedImage.position + 1}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2 flex w-full flex-row justify-between gap-4">
                  {!inCart && (
                    <div className="flex h-12 w-24 min-w-24">
                      <button
                        onClick={() =>
                          setQuantity((prev) => (prev > 1 ? --prev : prev))
                        }
                        className="flex h-12 w-8 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        value={quantity}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          if (!isNaN(num)) setQuantity(num);
                        }}
                        className="btn-sm m-0 h-12 w-full max-w-10 rounded-none border-y-2 border-y-secondary/20 bg-base-100/70 p-1 text-center text-base font-semibold outline-none"
                      />
                      <button
                        onClick={() => setQuantity((prev) => ++prev)}
                        className="flex h-12 w-8 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="h-12 w-full">
                    {!inCart || !logged ? (
                      <LoadableButton
                        onClick={() => {
                          if (!product) return;
                          if (!logged) {
                            // router.push("/sign");
                            return;
                          }
                          if (!verified) {
                            // router.push("/sign/verifyEmail");
                            return;
                          }
                          addToCart.mutate({
                            productID: product.id,
                            quantity: quantity,
                          });
                        }}
                        className="btn btn-primary w-full items-center gap-3"
                        isPending={addToCart.isPending}
                        animation="dots"
                      >
                        <ShoppingCart className="size-5" />
                        Añadir al carrito
                      </LoadableButton>
                    ) : (
                      <Link
                        href="/cart"
                        className="btn btn-outline btn-secondary w-full items-center gap-3"
                      >
                        Ver en el carrito
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </SheetPrimitive.Content>
          </SheetPrimitive.Portal>
        </SheetPrimitive.Root>
      )}

      {mq < mqs.xxs && (
        <Drawer open={!!product} onClose={deselectProduct}>
          <DrawerPrimitive.Portal>
            <DrawerPrimitive.Overlay
              onClick={deselectProduct}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[2px]"
            />
            <DrawerPrimitive.Content
              className={cn(
                comfortaa.className,
                "fixed inset-x-0 bottom-0 z-50 flex h-auto flex-col rounded-t-xl border-t border-secondary/30 bg-base-100 focus:outline-none"
              )}
            >
              <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 pb-6 pt-0">
                <DrawerHeader className="flex h-fit flex-col gap-6 pt-6">
                  <div className="mx-auto h-1.5 w-2/5 rounded-full bg-secondary/30" />

                  <div className="flex w-full items-end justify-end gap-1">
                    <span className="text-2xl text-primary/70">$</span>
                    <span className="text-3xl text-primary">
                      {product?.price.toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 whitespace-pre-wrap">
                    <DrawerTitle className="text-xl font-semibold">
                      {product?.name}
                    </DrawerTitle>
                    <DrawerDescription className="text-secondary">
                      {product?.description}
                    </DrawerDescription>
                  </div>
                </DrawerHeader>

                {/* Image */}
                <div className="flex h-64 max-h-64 w-full flex-row gap-2">
                  <div className="flex h-full max-h-64 w-20 min-w-20 flex-col gap-2 overflow-y-auto pr-1">
                    {product?.images.map((image, i) => (
                      <div
                        key={image.id}
                        className={cn(
                          selectedImage?.image?.id === image.id &&
                            "border-2 border-primary",
                          "relative aspect-square w-full rounded-lg object-cover"
                        )}
                      >
                        <Image
                          alt={`${image.id}`}
                          src={image.url}
                          width={70}
                          height={70}
                          className={cn(
                            "aspect-square h-full w-full cursor-pointer rounded-md object-cover"
                          )}
                          onClick={() =>
                            setSelectedImage({ image, position: i })
                          }
                        />
                        <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative h-full w-full rounded-lg border-none outline-none">
                    <Image
                      alt={product?.name ?? ""}
                      width={260}
                      height={260}
                      src={selectedImage?.image?.url ?? ""}
                      className="h-full w-full rounded-lg border-none object-cover outline-none"
                    />
                    {selectedImage && (
                      <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                        {selectedImage.position + 1}
                      </div>
                    )}
                  </div>
                </div>

                <DrawerFooter className="mt-2 flex w-full flex-row justify-between gap-4">
                  {!inCart && (
                    <div className="flex h-12 w-24 min-w-24">
                      <button
                        onClick={() =>
                          setQuantity((prev) => (prev > 1 ? --prev : prev))
                        }
                        className="flex h-12 w-8 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        value={quantity}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          if (!isNaN(num)) setQuantity(num);
                        }}
                        className="btn-sm m-0 h-12 w-full max-w-10 rounded-none border-y-2 border-y-secondary/20 bg-base-100/70 p-1 text-center text-base font-semibold outline-none"
                      />
                      <button
                        onClick={() => setQuantity((prev) => ++prev)}
                        className="flex h-12 w-8 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="h-12 w-full">
                    {!inCart || !logged ? (
                      <LoadableButton
                        onClick={() => {
                          if (!product) return;
                          if (!logged) {
                            // router.push("/sign");
                            return;
                          }
                          if (!verified) {
                            // router.push("/sign/verifyEmail");
                            return;
                          }
                          addToCart.mutate({
                            productID: product.id,
                            quantity: quantity,
                          });
                        }}
                        className="btn btn-primary w-full items-center gap-3"
                        isPending={addToCart.isPending}
                        animation="dots"
                      >
                        <ShoppingCart className="size-5" />
                        Añadir al carrito
                      </LoadableButton>
                    ) : (
                      <Link
                        href="/cart"
                        className="btn btn-outline btn-secondary w-full items-center gap-3"
                      >
                        Ver en el carrito
                      </Link>
                    )}
                  </div>
                </DrawerFooter>
              </div>
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Portal>
        </Drawer>
      )}
    </>
  );
};
