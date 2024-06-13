import { ErrorAlert, LoadableButton } from "@/components/forms";
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
import { vars } from "@/utils/vars";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export const ProductDataDrawer = ({
  product,
  logged,
  verified,
  inCart,
  addToCart,
  setSelectedProduct,
  isVisualizingProduct,
  setVisualizedProduct,
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
  isVisualizingProduct: boolean;
  setVisualizedProduct: (p?: Product) => void;
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
    if (!product) return;

    setSelectedImage({ image: product.images[0], position: 0 });
  }, [product, deselectProduct]);

  return (
    <>
      {mq >= mqs.xxs && (
        // I know there's a component for this, but the overlay component does not have the "onClick" prop :(
        <SheetPrimitive.Root open={!!product && !isVisualizingProduct}>
          <SheetPrimitive.Portal>
            <SheetPrimitive.Overlay
              className={cn(
                isVisualizingProduct && "pointer-events-none",
                "fixed inset-0 z-20 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              )}
              onClick={deselectProduct}
            />
            <SheetPrimitive.Content
              className={cn(
                comfortaa.className,
                isVisualizingProduct && "pointer-events-none",
                "fixed z-20 gap-4 p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
                "inset-y-0 right-0 h-full data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                "w-full max-w-screen-xxs border-l border-secondary/20 bg-base-100 focus-visible:outline-none"
              )}
            >
              <div className="flex h-full w-full flex-col gap-6">
                {/* Price */}
                <div className="flex flex-col gap-6">
                  <div className="flex h-12 min-h-12 w-full items-baseline justify-between">
                    <button
                      onClick={deselectProduct}
                      className="btn btn-ghost btn-outline border border-secondary/30 shadow-sm focus:outline-none"
                    >
                      <PanelRightClose className="size-6" />
                    </button>
                    <div className="flex w-full items-end justify-end gap-1">
                      <span className="text-2xl text-primary/70">$</span>
                      <span className="text-3xl text-primary">
                        {product?.price.toLocaleString(vars.region)}
                      </span>
                    </div>
                  </div>
                  <DrawerTitle className="text-2xl font-semibold">
                    {product?.name}
                  </DrawerTitle>
                </div>

                {/* Content */}
                <div className="flex h-fit w-full flex-col gap-4 overflow-y-auto">
                  <DrawerDescription className="flex flex-col gap-2">
                    <div className="relative w-full text-end">
                      <span className="text-lg">DESCRIPCIÓN</span>
                      <div className="absolute bottom-0 h-px w-full bg-gradient-to-l from-secondary via-secondary/70 to-transparent" />
                    </div>
                    <p className="whitespace-pre-wrap text-secondary">
                      {product?.description}
                    </p>
                  </DrawerDescription>

                  <div className="flex flex-col gap-2">
                    <div className="relative w-full text-end">
                      <span className="text-lg">IMÁGENES</span>
                      <div className="absolute bottom-0 h-px w-full bg-gradient-to-l from-secondary via-secondary/70 to-transparent" />
                    </div>
                    <div className="flex w-full flex-row gap-2">
                      <div className="flex h-full max-h-80 w-full flex-col gap-2 overflow-y-auto pr-1">
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
                          className="aspect-square h-80 max-h-80 w-full min-w-80 max-w-80 cursor-pointer rounded-lg border-none object-cover outline-none"
                          onClick={() => setVisualizedProduct(product)}
                        />
                        {selectedImage && (
                          <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                            {selectedImage.position + 1}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <ErrorAlert
                  className="-mb-2 w-full"
                  message={addToCart.error?.response?.data.comment}
                />

                {/* Add to cart */}
                <div className="flex h-12 min-h-12 w-full flex-row justify-between gap-2">
                  {!inCart && (
                    <div className="flex h-12 w-full">
                      <button
                        onClick={() =>
                          setQuantity((prev) => (prev > 1 ? --prev : prev))
                        }
                        className="flex h-12 w-7 min-w-7 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
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
                        className="flex h-12 w-7 min-w-7 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="h-12 min-h-12 w-full">
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
                        className="btn btn-primary w-full min-w-80 max-w-80 items-center gap-3"
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
        <Drawer
          open={!!product && !isVisualizingProduct}
          onClose={() => !isVisualizingProduct && deselectProduct()}
        >
          <DrawerPrimitive.Portal>
            <DrawerPrimitive.Overlay
              onClick={deselectProduct}
              className="fixed inset-0 z-20 bg-black/80 backdrop-blur-[2px]"
            />
            <DrawerPrimitive.Content
              className={cn(
                comfortaa.className,
                "fixed inset-x-0 bottom-0 z-20 flex h-auto max-h-192 flex-col rounded-t-xl border-t border-secondary/30 bg-base-100 p-4 focus:outline-none"
              )}
            >
              <div className="flex flex-col gap-4">
                <DrawerHeader className="flex h-fit min-h-fit w-full flex-col justify-between gap-4">
                  <div className="mx-auto h-1.5 w-2/5 rounded-full bg-secondary/30" />
                  {/* Price */}
                  <div className="mt-2 flex w-full items-end justify-end gap-1">
                    <span className="text-2xl text-primary/70">$</span>
                    <span className="text-3xl text-primary">
                      {product?.price.toLocaleString(vars.region)}
                    </span>
                  </div>
                  <DrawerTitle className="text-2xl font-semibold">
                    {product?.name}
                  </DrawerTitle>
                </DrawerHeader>

                {/* Content */}
                <div className="flex h-96 min-h-96 w-full flex-col gap-4 overflow-y-auto pt-2">
                  <DrawerDescription className="flex flex-col gap-2">
                    <div className="relative w-full text-end">
                      <span className="text-lg">DESCRIPCIÓN</span>
                      <div className="absolute bottom-0 h-px w-full bg-gradient-to-l from-secondary via-secondary/70 to-transparent" />
                    </div>
                    <p className="whitespace-pre-wrap text-secondary">
                      {product?.description}
                    </p>
                  </DrawerDescription>

                  <div className="flex flex-col gap-2">
                    <div className="relative w-full text-end">
                      <span className="text-lg">IMÁGENES</span>
                      <div className="absolute bottom-0 h-px w-full bg-gradient-to-l from-secondary via-secondary/70 to-transparent" />
                    </div>

                    <div className="flex h-64 max-h-64 w-full flex-row gap-2">
                      <div className="flex h-full max-h-64 w-full flex-col gap-2 overflow-y-auto pr-1">
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

                      <div className="relative aspect-square h-full w-64 min-w-64 rounded-lg border-none outline-none">
                        <Image
                          alt={product?.name ?? ""}
                          width={260}
                          height={260}
                          src={selectedImage?.image?.url ?? ""}
                          className="aspect-square h-full w-full rounded-lg border-none object-cover outline-none"
                          onClick={() => setVisualizedProduct(product)}
                        />
                        {selectedImage && (
                          <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                            {selectedImage.position + 1}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DrawerFooter className="flex w-full flex-row justify-between gap-3">
                  {!inCart && (
                    <div className="flex h-12 w-full">
                      <button
                        onClick={() =>
                          setQuantity((prev) => (prev > 1 ? --prev : prev))
                        }
                        className="flex h-12 w-7 min-w-7 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
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
                        className="flex h-12 w-7 min-w-7 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="h-12 min-h-12 w-full">
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
                        className="btn btn-primary w-full min-w-64 items-center gap-3"
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
