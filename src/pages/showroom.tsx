import { type Category, getCategories } from "@/functions/categories";
import { GeneralLayout } from "@/layouts/GeneralLayout";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useState } from "react";
// import Placeholder from "../../public/placeholder.svg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/shadcn/carousel";
import { type Product, getProducts } from "@/functions/products";

function Showroom() {
  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (categoriesQuery.isLoading) return <>Categories loading</>;
  if (categoriesQuery.isError) return <>Categories error</>;

  if (productsQuery.isLoading) return <>Products loading</>;
  if (productsQuery.isError) return <>Products error</>;

  return (
    <GeneralLayout title="Showroom" description="Our showroom">
      <div className="mx-auto flex h-auto w-full max-w-7xl flex-col gap-8 pt-16">
        {/* CATEGORIES */}
        <section className="mt-4 flex w-full flex-col gap-4">
          <div className="flex h-20 items-center border-b border-b-secondary/20">
            <h2 className="text-4xl">Categories</h2>
          </div>
          <Carousel
            opts={{
              align: "start",
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <CarouselContent className="pb-2 pl-4">
              {/* <CarouselItem
                className="-ml-4 basis-1/4"
                onClick={() => setSelectedCategory(undefined)}
              >
                <CategoryItem
                  category={{
                    id: -1,
                    name: "All products",
                    image: "",
                  }}
                />
              </CarouselItem> */}
              {categoriesQuery.data?.map((category) => (
                <CarouselItem key={category.id} className="-ml-4 basis-1/3">
                  <CategoryItem
                    category={category}
                    setSelectedCategory={setSelectedCategory}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* PRODUCTS */}
        <section className="mb-8 flex w-full flex-col gap-4">
          <div className="flex h-20 items-center border-b border-b-secondary/20">
            <h2 className="text-4xl">Products</h2>
          </div>
          <div className="grid h-auto w-full grid-cols-1 gap-8 xl:grid-cols-2">
            {productsQuery.data?.map((product) => {
              if (!selectedCategory)
                return <ProductItem key={product.id} product={product} />;
              if (selectedCategory?.id === product.categoryID)
                return <ProductItem key={product.id} product={product} />;
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
  setSelectedCategory,
}: {
  category: Category;
  setSelectedCategory?: Dispatch<SetStateAction<Category | undefined>>;
}) {
  return (
    <div
      onClick={() => {
        if (setSelectedCategory) setSelectedCategory(category);
      }}
      className="flex h-24 w-72 min-w-72 overflow-hidden rounded-md border border-secondary/10 bg-secondary/20 shadow-md"
    >
      <div className="min-w-fit">
        <Image
          alt="category"
          src={category.image ?? ""}
          width={200}
          height={200}
          className="h-full w-24 border-r border-r-secondary/10 bg-secondary/20 object-cover"
        />
      </div>
      <div className="flex h-full w-full items-center truncate p-6">
        <span className="truncate font-semibold">{category.name}</span>
      </div>
    </div>
  );
}

function ProductItem({ product }: { product: Product }) {
  return (
    <div className="flex w-full gap-4 overflow-hidden rounded-lg border border-secondary/10 bg-secondary/10 shadow-md">
      <img
        alt="Product Image"
        className="h-52 min-w-52 border-r border-r-secondary/10 object-cover"
        src={product.images[0]?.url ?? ""}
        // height="200"
        // width="200"
      />
      <div className="flex w-full flex-col justify-between p-4 pl-0">
        <div className="flex flex-col gap-2">
          <span className="text-xl font-semibold text-primary/80">
            {product.name}
          </span>
          {/* <p className="text-primary/60">{product.description}</p> */}
        </div>
        <span className="text-3xl text-primary dark:text-gray-400">
          ${product.price}
        </span>
        <button className="btn btn-primary w-full">Add to Cart</button>
      </div>
    </div>
  );
}
