import { LoadableButton } from "@/components/forms";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/shadcn/drawer";
import { type ProductImage } from "@/functions/images";
import { type Product } from "@/functions/products";
import { type ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { type UseMutationResult } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const drawerRef = useRef<HTMLButtonElement>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<{
    image?: ProductImage;
    position: number;
  }>();

  useEffect(() => {
    if (!product) return;

    drawerRef.current?.click();
    setSelectedImage({ image: product.images[0], position: 0 });
  }, [product]);

  return (
    <Drawer onClose={() => setSelectedProduct(undefined)}>
      <DrawerTrigger ref={drawerRef} />
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 pb-6 pt-0">
          <DrawerHeader className="flex h-fit flex-col gap-6">
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
                      "aspect-square h-full w-full rounded-md object-cover"
                    )}
                    onClick={() => setSelectedImage({ image, position: i })}
                  />
                  <div className="pointer-events-none absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-base-300 font-semibold text-primary opacity-80">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative h-full w-full rounded-md border-none outline-none">
              <Image
                alt={product?.name ?? ""}
                width={260}
                height={260}
                src={selectedImage?.image?.url ?? ""}
                className="h-full w-full rounded-md border-none object-cover outline-none"
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
                  className="flex h-12 w-8 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0"
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
                  className="flex h-12 w-8 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0"
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
                      quantity: 0,
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
      </DrawerContent>
    </Drawer>
  );
};
