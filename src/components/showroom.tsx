import { cn } from "@/utils/lib";
import { type ModalProps } from "./layouts/modal";
import { useEffect } from "react";
import { type ProductImage } from "@/functions/images";
import { Carousel, CarouselContent, CarouselItem } from "./shadcn/carousel";
import Image from "next/image";
import { removeScroll, restoreScroll } from "@/utils/miscellaneous";
import { Package } from "lucide-react";

export const ImageVisualizer = ({
  isOpen,
  onClose,
  data,
}: ModalProps & { data: { title?: string; images: ProductImage[] } }) => {
  useEffect(() => {
    if (isOpen) {
      removeScroll();
      return;
    }
    restoreScroll();

    return () => restoreScroll();
  }, [isOpen]);

  return (
    <div
      onClick={onClose}
      className={cn(
        isOpen ? "opacity-100" : "pointer-events-none opacity-0 duration-200",
        "fixed z-50 flex h-screen w-screen flex-col items-start justify-center gap-4 bg-black/80 px-4 backdrop-blur-[2px] transition-opacity sm:px-8"
      )}
    >
      <div className="flex items-center gap-3 text-white">
        <Package className="size-7 min-w-7 sm:size-8 sm:min-w-8" />
        <span className="text-xl lg:text-2xl">{data.title}</span>
      </div>
      <Carousel
        opts={{
          axis: "x",
          duration: 20,
          align: "center",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="w-full hover:cursor-grab active:cursor-grabbing">
          {data.images.map((image) => (
            <CarouselItem
              key={image.id}
              onClick={(e) => e.stopPropagation()}
              className="size-80 select-none border-x border-transparent shadow-xl sm:size-104 xl:size-120 2xl:size-128"
            >
              <Image
                alt={`${image.id}`}
                src={image.url}
                width={400}
                height={400}
                className="aspect-square w-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
