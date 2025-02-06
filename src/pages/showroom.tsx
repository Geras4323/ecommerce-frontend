import { type Category, getCategories } from "@/functions/categories";
import { GeneralLayout } from "@/layouts/general";
import { type UseMutationResult, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useState } from "react";
import { type Product, getProducts } from "@/functions/products";
import { cn, withCbk } from "@/utils/lib";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Tags,
} from "lucide-react";
import { useShoppingCart } from "@/hooks/cart";
import type { ServerError } from "@/types/types";
import Link from "next/link";
import { useSession } from "@/hooks/session";
import { useRouter } from "next/router";
import { ErrorSpan, LoadableButton } from "@/components/forms";
import NoImage from "../../public/no_image.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/shadcn/carousel";
import { mqs, useMediaQueries } from "@/hooks/screen";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { ProductDataDrawer } from "src/containers/showroom/products/dataDrawer";
import { vars } from "@/utils/vars";
import { ImageVisualizer } from "@/components/showroom";
import { getState } from "@/functions/states";
import { VacationAlertModal } from "@/components/modals/administration/states";
import { useUnits } from "@/hooks/states";
import { type MeasurementUnitsValue } from "@/utils/measurement";

export default function Showroom() {
  const { session } = useSession();
  const cart = useShoppingCart();
  const mq = useMediaQueries();

  const unitsState = useUnits();

  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedProduct, setSelectedProduct] = useState<Product>();

  const [visualizedProduct, setVisualizedProduct] = useState<Product>();

  const [isVacationAlertOpen, setIsVacationAlertOpen] = useState(false);

  const vacationStateQuery = useQuery<
    Awaited<ReturnType<typeof getState>>,
    ServerError
  >({
    queryKey: ["vacation", "showroom"],
    queryFn: withCbk({
      queryFn: () => getState("vacation"),
      onSuccess: (res) => setIsVacationAlertOpen(res.active),
    }),
    retry: false,
    staleTime: 1000,
    refetchOnWindowFocus: true,
  });

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const productsQuery = useQuery<
    Awaited<ReturnType<typeof getProducts>>,
    ServerError
  >({
    queryKey: ["products"],
    queryFn: () => getProducts(),
    refetchOnWindowFocus: true,
    retry: false,
  });

  return (
    <GeneralLayout title="Showroom" description="Our showroom">
      <div className="mx-auto flex h-fit flex-col gap-8 px-4 pt-24 lg:flex-row">
        {/* CATEGORIES */}
        <section className="relative h-auto w-full min-w-80 lg:w-80">
          <div className="sticky top-24 flex h-fit w-full flex-col gap-4">
            <div className="flex h-fit items-center gap-4 border-b border-b-secondary/20 py-2 text-primary">
              <Tags className="size-6" />
              <h2 className="text-xl font-medium tracking-wide">CATEGORÍAS</h2>
            </div>

            <div className="block lg:hidden">
              {categoriesQuery.isPending ? (
                <div className="flex h-12 w-full animate-pulse rounded-md bg-secondary/20" />
              ) : categoriesQuery.isError ? (
                <div className="flex w-full justify-center">
                  <ErrorSpan
                    message={categoriesQuery.error.response?.data.comment}
                    className="gap-3 text-lg"
                  />
                </div>
              ) : (
                <Select
                  onValueChange={(v) =>
                    setSelectedCategory(() => {
                      if (v === "all") return undefined;
                      return categoriesQuery.data?.find(
                        (cat) => cat.name === v
                      );
                    })
                  }
                  value={selectedCategory?.name ?? "all"}
                >
                  <SelectTrigger className="flex h-12 w-full cursor-pointer overflow-hidden rounded-md border border-secondary/10 bg-secondary/10 shadow-md transition-colors duration-100 hover:bg-secondary/20 focus:outline-none data-[state=open]:rounded-b-none">
                    <SelectValue defaultValue="all" />
                  </SelectTrigger>
                  <SelectContent className="w-[calc(100%-2px)] data-[state=open]:rounded-t-none">
                    <SelectOption value="all" className="h-11">
                      Todas las categorías
                    </SelectOption>
                    {categoriesQuery.data.map((category) => (
                      <SelectOption key={category.id} value={category.name}>
                        <div className="flex items-center gap-3">
                          <Image
                            alt={category.name}
                            src={category.image ?? ""}
                            className={cn(
                              category.id === selectedCategory?.id
                                ? "saturate-100"
                                : "saturate-0",
                              "size-8 rounded-md object-cover"
                            )}
                            width={40}
                            height={40}
                          />
                          {category.name}
                        </div>
                      </SelectOption>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* PC */}
            <div className="hidden w-full flex-col gap-3 lg:flex">
              {categoriesQuery.isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <CategoryItemSkeleton key={i} />
                ))
              ) : categoriesQuery.isError ? (
                <ErrorSpan
                  message={categoriesQuery.error.response?.data.comment}
                  className="gap-3 text-lg"
                />
              ) : (
                categoriesQuery.data.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="mb-8 flex w-full flex-col gap-4 md:w-screen md:max-w-2xl lg:max-w-xl xl:max-w-2xl 2xl:max-w-6xl">
          <div className="flex h-fit items-center gap-4 border-b border-b-secondary/20 py-2 text-primary">
            <Boxes className="size-6" />
            <h2 className="text-xl font-medium tracking-wide">PRODUCTOS</h2>
          </div>
          <div className="grid h-auto w-full grid-cols-1 gap-4 2xl:grid-cols-2">
            {productsQuery.isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductItemSkeleton key={i} />
              ))
            ) : productsQuery.isError ? (
              <div className="col-span-2 flex justify-center">
                <ErrorSpan
                  message={productsQuery.error.response?.data.comment}
                  className="text-lg"
                />
              </div>
            ) : (
              productsQuery.data?.map((product) => {
                if (
                  !selectedCategory ||
                  selectedCategory?.id === product.categoryID
                )
                  return (
                    <ProductItem
                      key={product.id}
                      product={product}
                      addToCart={cart.addCartItem}
                      logged={!!session.data}
                      verified={!!session.data?.verified}
                      inCart={
                        cart.cartItems.data?.findIndex(
                          (cI) => cI.productID === product.id
                        ) !== -1
                      }
                      vacationLocked={vacationStateQuery.data?.active ?? false}
                      unitsEnabled={unitsState.data?.active}
                      mediaQuery={mq}
                      selectProduct={(p: Product) => setSelectedProduct(p)}
                      openImageVisualizer={(p: Product) =>
                        setVisualizedProduct(p)
                      }
                    />
                  );
              })
            )}
          </div>
        </section>
      </div>

      <ProductDataDrawer
        product={selectedProduct}
        addToCart={cart.addCartItem}
        logged={!!session.data}
        verified={!!session.data?.verified}
        inCart={
          cart.cartItems.data?.findIndex(
            (cI) => cI.productID === selectedProduct?.id
          ) !== -1
        }
        vacationLocked={vacationStateQuery.data?.active ?? false}
        setSelectedProduct={setSelectedProduct}
        isVisualizingProduct={!!visualizedProduct}
        setVisualizedProduct={setVisualizedProduct}
      />
      <ImageVisualizer
        isOpen={!!visualizedProduct}
        onClose={() => setVisualizedProduct(undefined)}
        data={{
          title: visualizedProduct?.name,
          images: visualizedProduct?.images ?? [],
        }}
      />
      {vacationStateQuery.data && (
        <VacationAlertModal
          isOpen={isVacationAlertOpen}
          onClose={() => setIsVacationAlertOpen(false)}
          endDate={vacationStateQuery.data.to}
        />
      )}
    </GeneralLayout>
  );
}

function CategoryItemSkeleton() {
  return (
    <div className="flex h-16 w-full min-w-72 animate-pulse overflow-hidden rounded-md border border-secondary/10 bg-secondary/10 shadow-md">
      {/* Image */}
      <div className="min-w-fit">
        <div className="h-full w-24 border-r border-r-secondary/10 bg-secondary/10" />
      </div>
      {/* Name */}
      <div className="flex h-full w-full items-center p-6">
        <div className="h-6 w-32 rounded-md bg-secondary/10" />
      </div>
    </div>
  );
}

function CategoryItem({
  category,
  selectedCategory,
  setSelectedCategory,
}: {
  category: Category;
  selectedCategory?: Category;
  setSelectedCategory: Dispatch<SetStateAction<Category | undefined>>;
}) {
  return (
    <div
      onClick={() => {
        window.scrollTo({ top: 0 });
        category.id === selectedCategory?.id
          ? setSelectedCategory(undefined)
          : setSelectedCategory(category);
      }}
      className={cn(
        category.id === selectedCategory?.id
          ? "bg-secondary/30 hover:bg-secondary/30"
          : "bg-secondary/10",
        "flex h-16 w-full min-w-72 cursor-pointer overflow-hidden rounded-md border border-secondary/10 shadow-md transition-colors duration-100 hover:bg-secondary/20"
      )}
    >
      <div className="min-w-fit">
        <Image
          alt="category"
          src={category.image ?? NoImage}
          width={200}
          height={200}
          className={cn(
            !category.image
              ? "object-contain opacity-20 scale-90"
              : "object-cover",
            category.id === selectedCategory?.id
              ? "saturate-100"
              : "saturate-0",
            "h-full w-24 border-r border-r-secondary/10 bg-secondary/20 transition-all"
          )}
        />
      </div>
      <div className="flex h-full w-full items-center truncate p-6">
        <span
          className={cn(
            category.id === selectedCategory?.id
              ? "text-primary"
              : "text-primary/80",
            "truncate font-semibold"
          )}
        >
          {category.name}
        </span>
      </div>
    </div>
  );
}

function ProductItemSkeleton() {
  return (
    <div className="flex h-fit w-full animate-pulse flex-col gap-4 overflow-hidden rounded-lg bg-secondary/10 p-3 shadow-md md:h-52 md:flex-row">
      {/* Images */}
      <div className="flex h-52 w-full flex-nowrap gap-2 overflow-hidden md:w-44 md:min-w-44">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="size-52 min-w-52 rounded-lg bg-secondary/20 md:size-44 md:min-w-44"
          />
        ))}
      </div>

      <div className="flex w-full flex-col justify-between gap-4 md:gap-2">
        <div className="flex items-start justify-between gap-10">
          {/* Name */}
          <div className="flex w-full flex-col gap-2">
            <div className="h-6 w-full rounded-md bg-secondary/20" />
            <div className="h-6 w-3/5 rounded-md bg-secondary/20" />
          </div>
          {/* Price */}
          <div className="h-7 w-36 rounded-md bg-secondary/20" />
        </div>

        {/* Description */}
        <div className="flex w-full flex-col gap-2">
          <div className="h-6 w-full rounded-md bg-secondary/20" />
          <div className="h-6 w-2/3 rounded-md bg-secondary/20" />
        </div>

        <div className="flex w-full justify-between gap-4">
          {/* Quantity */}
          <div className="flex h-8 w-24 items-center rounded-lg bg-secondary/20" />
          {/* Cart Button */}
          <div className="flex h-8 w-48 items-center rounded-lg bg-secondary/20" />
        </div>
      </div>
    </div>
  );
}

function ProductItem({
  product,
  logged,
  verified,
  inCart,
  vacationLocked,
  unitsEnabled = false,
  addToCart,
  mediaQuery,
  selectProduct,
  openImageVisualizer,
}: {
  product: Product;
  logged: boolean;
  verified: boolean;
  inCart: boolean;
  vacationLocked: boolean;
  unitsEnabled?: boolean;
  addToCart: UseMutationResult<
    any,
    ServerError,
    {
      productID: number;
      quantity: number;
      unit: MeasurementUnitsValue;
    },
    unknown
  >;
  mediaQuery: number | undefined;
  selectProduct: (p: Product) => void;
  openImageVisualizer: (p: Product) => void;
}) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);

  function openDrawer() {
    selectProduct(product);
  }

  return (
    <div
      onClick={openDrawer}
      className="flex h-fit w-full cursor-pointer flex-col gap-4 overflow-hidden rounded-lg border border-secondary/10 bg-secondary/10 p-3 shadow-md md:h-52 md:flex-row"
    >
      <Carousel
        opts={{
          axis: "x",
          watchDrag: mediaQuery && mediaQuery >= mqs.xxl ? false : true,
          duration: 20,
          align: "center",
        }}
        className="mb-2 h-52 self-center md:mb-0 md:aspect-square md:h-full"
      >
        <CarouselContent
          onClick={(e) => {
            e.stopPropagation();
            openImageVisualizer(product);
          }}
          className="-ml-2 h-full"
        >
          {product.images.map((image) => (
            <CarouselItem key={image.id} className="pl-2 md:basis-full">
              <Image
                alt="Product Image"
                className={cn(
                  // !product.images[0] && "scale-90 opacity-20",
                  "h-full w-52 rounded-lg border border-secondary/10 object-cover md:w-full"
                )}
                src={image.url ?? NoImage}
                height={208}
                width={208}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute bottom-2 left-2 z-10 flex size-7 items-center justify-center rounded-lg bg-base-100 transition-opacity disabled:pointer-events-none disabled:opacity-0">
          <ChevronLeft className="size-5" />
        </CarouselPrevious>
        <CarouselNext className="absolute bottom-2 right-2 z-10 flex size-7 items-center justify-center rounded-lg bg-base-100 transition-opacity disabled:pointer-events-none disabled:opacity-0">
          <ChevronRight className="size-5" />
        </CarouselNext>
      </Carousel>

      <div className="flex w-full flex-col justify-between gap-4 md:gap-2">
        <div className="flex items-start justify-between gap-6">
          <span className="text-lg font-semibold text-primary">
            {product.name}
          </span>
          {!unitsEnabled && (
            <div className="flex items-end gap-1">
              <span className="text-xl text-primary/70">$</span>
              <span className="text-2xl text-primary">
                {product.price?.toLocaleString(vars.region)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5 text-base text-primary/80">
          {product.description.split("\n").map((t, i) => {
            if (i < 2) return <p key={i}>{t}</p>;
          })}
        </div>

        <div className="flex w-full justify-end gap-4">
          {!inCart && !vacationLocked && !unitsEnabled && (
            <div className="flex h-8 w-full items-center rounded-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((prev) => (prev > 1 ? --prev : prev));
                }}
                className="flex h-8 w-8 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
              >
                <Minus className="size-4" />
              </button>
              <input
                value={quantity}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  if (!isNaN(num)) setQuantity(num);
                }}
                className="btn-sm m-0 h-8 w-full max-w-10 rounded-none border-y-2 border-y-secondary/20 bg-base-100/70 p-1 text-center font-semibold outline-none"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((prev) => ++prev);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0 transition-all duration-200 hover:bg-secondary/25"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}

          {!inCart || !logged ? (
            <LoadableButton
              onClick={(e) => {
                e.stopPropagation();

                if (unitsEnabled) {
                  openDrawer();
                  return;
                }

                if (!logged) {
                  router.push("/sign");
                  return;
                }
                if (!verified) {
                  router.push("/sign/verifyEmail");
                  return;
                }
                addToCart.mutate({
                  productID: product.id,
                  quantity,
                  unit: "u",
                });
              }}
              className="btn btn-primary btn-sm flex min-w-48 items-center gap-3"
              isPending={addToCart.isPending}
              disabled={addToCart.isPending || vacationLocked}
              animation="dots"
            >
              {unitsEnabled ? (
                <>
                  <Package className="size-5" />
                  Ver producto
                </>
              ) : (
                <>
                  <ShoppingCart className="size-5" />
                  Añadir al carrito
                </>
              )}
            </LoadableButton>
          ) : (
            <Link
              onClick={(e) => e.stopPropagation()}
              href="/account/cart"
              className="btn btn-outline btn-secondary btn-sm flex min-w-48 items-center gap-3"
            >
              Ver en el carrito
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
