import { type Category, getCategories } from "@/functions/categories";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import { type UseMutationResult, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useState } from "react";
import { type Product, getProducts } from "@/functions/products";
import { cn } from "@/utils/lib";
import { Boxes, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { useShoppingCart } from "@/hooks/cart";
import type { ServerError } from "@/types/types";
import Link from "next/link";
import { useSession } from "@/hooks/session";
import { useRouter } from "next/router";

function Showroom() {
  const { session } = useSession();
  const cart = useShoppingCart();

  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchOnWindowFocus: true,
    retry: false,
  });

  if (categoriesQuery.isPending) return <>Categories loading</>;
  if (categoriesQuery.isError) return <>Categories error</>;

  if (productsQuery.isPending) return <>Products loading</>;
  if (productsQuery.isError) return <>Products error</>;

  return (
    <GeneralLayout title="Showroom" description="Our showroom">
      <div className="mx-auto flex h-fit gap-8 pt-24">
        {/* CATEGORIES */}
        <section className="relative h-auto min-w-80">
          <div className="sticky top-24 flex h-fit w-full flex-col gap-4">
            <div className="flex h-fit items-center gap-4 border-b border-b-secondary/20 py-2">
              <Boxes className="size-6" />
              <h2 className="text-xl font-medium">CATEGORÍAS</h2>
            </div>
            <div className="flex w-full flex-col gap-4">
              {categoriesQuery.data.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="mb-8 flex w-screen max-w-6xl flex-col gap-4">
          <div className="flex h-fit items-center gap-4 border-b border-b-secondary/20 py-2">
            <Package className="size-6" />
            <h2 className="text-xl font-medium">PRODUCTOS</h2>
          </div>
          <div className="grid h-auto w-full grid-cols-1 gap-6 xl:grid-cols-2">
            {productsQuery.data?.map((product) => {
              if (!selectedCategory)
                return (
                  <ProductItem
                    key={product.id}
                    product={product}
                    addToCart={cart.addCartItem}
                    logged={!!session.data}
                    inCart={
                      cart.cartItems.data?.findIndex(
                        (cI) => cI.productID === product.id
                      ) !== -1
                    }
                  />
                );
              if (selectedCategory?.id === product.categoryID)
                return (
                  <ProductItem
                    key={product.id}
                    product={product}
                    addToCart={cart.addCartItem}
                    logged={!!session.data}
                    inCart={
                      cart.cartItems.data?.findIndex(
                        (cI) => cI.productID === product.id
                      ) !== -1
                    }
                  />
                );
            })}
          </div>
        </section>
      </div>
    </GeneralLayout>
  );
}

export default Showroom;

function CategoryItem({
  category,
  selectedCategory,
  setSelectedCategory,
}: {
  category: Category;
  selectedCategory?: Category;
  setSelectedCategory?: Dispatch<SetStateAction<Category | undefined>>;
}) {
  return (
    <div
      onClick={() => {
        if (setSelectedCategory)
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
          src={category.image ?? ""}
          width={200}
          height={200}
          className={cn(
            category.id === selectedCategory?.id
              ? "saturate-100"
              : "saturate-0",
            "h-full w-24 border-r border-r-secondary/10 bg-secondary/20 object-cover transition-all"
          )}
        />
      </div>
      <div className="flex h-full w-full items-center truncate p-6">
        <span
          className={cn(
            category.id === selectedCategory?.id
              ? "text-primary"
              : "text-primary/60",
            "truncate font-semibold"
          )}
        >
          {category.name}
        </span>
      </div>
    </div>
  );
}

function ProductItem({
  product,
  logged,
  inCart,
  addToCart,
}: {
  product: Product;
  logged: boolean;
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
}) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex w-full gap-4 overflow-hidden rounded-lg border border-secondary/10 bg-secondary/10 shadow-md">
      <div className="h-52 min-w-52 p-3">
        <img
          alt="Product Image"
          className="h-full w-full rounded-lg border border-secondary/10 object-cover"
          src={product.images[0]?.url ?? ""}
          // height="200"
          // width="200"
        />
      </div>
      <div className="flex w-full flex-col justify-between gap-2 p-4 pl-0">
        <div className="flex items-start justify-between gap-6">
          <span className="text-lg font-semibold text-primary/80">
            {product.name}
          </span>
          <div className="flex items-end gap-1">
            <span className="text-xl text-primary/70">$</span>
            <span className="text-2xl text-primary">
              {product.price?.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 text-primary/60">
          {product.description.split("\n").map((t, i) => {
            if (i < 2) return <p key={i}>{t}</p>;
          })}
        </div>

        <div className="flex w-full justify-end gap-4">
          {!inCart && (
            <div className="flex h-8 w-full items-center rounded-lg">
              <button
                onClick={() =>
                  setQuantity((prev) => (prev > 1 ? --prev : prev))
                }
                className="flex h-8 w-8 items-center justify-center rounded-l-lg rounded-r-none border-2 border-secondary/20 bg-base-100/70 p-0"
              >
                <Minus className="size-4" />
              </button>
              <input
                value={quantity}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  if (!isNaN(num)) setQuantity(num);
                }}
                className="btn-sm m-0 h-8 w-full max-w-10 rounded-none border-y-2 border-y-secondary/20 bg-base-100/70 p-1 text-center font-semibold outline-none"
              />
              <button
                onClick={() => setQuantity((prev) => ++prev)}
                className="flex h-8 w-8 items-center justify-center rounded-l-none rounded-r-lg border-2 border-secondary/20 bg-base-100/70 p-0"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}

          {!inCart || !logged ? (
            <button
              onClick={() => {
                if (!logged) {
                  router.push("/login");
                  return;
                }
                addToCart.mutate({ productID: product.id, quantity });
              }}
              className="btn btn-primary btn-sm flex min-w-48 items-center gap-3"
            >
              <ShoppingCart className="size-5" />
              Añadir al carrito
            </button>
          ) : (
            <Link
              href="/cart"
              className="btn btn-outline btn-sm flex min-w-48 items-center gap-3"
            >
              Ver en el carrito
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
