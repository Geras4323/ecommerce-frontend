import { AdministrationLayout } from "@/layouts/administration";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownUp,
  ClipboardList,
  Filter,
  Package,
  PackagePlus,
  Search,
  Tag,
  X,
} from "lucide-react";
import { getProducts } from "@/functions/products";
import { useProductStore } from "@/hooks/zustand/products";
import { ProductCreateAside } from "src/containers/administration/products/createAside";
import { type Category, getCategories } from "@/functions/categories";
import { type Supplier, getSuppliers } from "@/functions/suppliers";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
} from "@/components/shadcn/select";
import { cn } from "@/utils/lib";
import { mqs, useMediaQueries } from "@/hooks/screen";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/shadcn/dropdown";
import {
  ProductsItem,
  ProductsItemSkeleton,
} from "@/components/administration/products";
import { ErrorSpan } from "@/components/forms";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Products() {
  const router = useRouter();
  const routerRef = useRef(router);
  const searchParams = useSearchParams();

  const { create_open } = useProductStore();
  const mq = useMediaQueries();

  const [nameFilter, setNameFilter] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier>();

  const filterURLRef = useRef("");

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const suppliersQuery = useQuery<
    Awaited<ReturnType<typeof getSuppliers>>,
    ServerError
  >({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
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

  // One timer
  useEffect(() => {
    const rawName = searchParams.get("name");
    if (rawName) setNameFilter(rawName);

    const rawCategoryID = searchParams.get("categoryID");
    if (rawCategoryID && !isNaN(parseInt(rawCategoryID))) {
      setSelectedCategory(
        categoriesQuery.data?.find(
          (category) => category.id === parseInt(rawCategoryID)
        )
      );
    }

    const rawSupplierID = searchParams.get("supplierID");
    if (rawSupplierID && !isNaN(parseInt(rawSupplierID))) {
      setSelectedSupplier(
        suppliersQuery.data?.find(
          (supplier) => supplier.id === parseInt(rawSupplierID)
        )
      );
    }
  }, [searchParams, categoriesQuery.data, suppliersQuery.data]);

  // Each timer
  useEffect(() => {
    filterURLRef.current = "?";

    if (!!nameFilter) {
      filterURLRef.current += `name=${nameFilter}&`;
    }
    if (!!selectedCategory) {
      filterURLRef.current += `categoryID=${selectedCategory.id}&`;
    }
    if (!!selectedSupplier) {
      filterURLRef.current += `supplierID=${selectedSupplier.id}&`;
    }

    filterURLRef.current = filterURLRef.current.slice(0, -1);
    routerRef.current.push(
      `/administration/products${filterURLRef.current}`,
      undefined,
      {
        shallow: true,
      }
    );
  }, [nameFilter, selectedCategory, selectedSupplier]);

  let filteredProducts = productsQuery.data ?? [];

  if (nameFilter) {
    filteredProducts = filteredProducts?.filter(
      (product) =>
        product.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        product.code.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.categoryID === selectedCategory.id
    );
  }

  if (selectedSupplier) {
    filteredProducts = filteredProducts.filter(
      (product) => product.supplierID === selectedSupplier.id
    );
  }

  const anyError =
    productsQuery.isError || categoriesQuery.isError || suppliersQuery.isError;

  return (
    <AdministrationLayout active="Productos">
      <div className="flex w-full">
        {/* CREATE */}
        <ProductCreateAside />

        {/* MAIN TABLE */}
        <section className="relative w-full flex-col p-4 transition-all duration-300">
          {!anyError && (
            <div className="mx-auto mb-4 flex h-fit w-full max-w-screen-md flex-col items-end justify-center gap-4 border-b border-secondary/30 pb-4 xl:w-full xl:max-w-screen-2xl">
              <div className="flex items-center gap-4">
                {productsQuery.isPending ? (
                  <div className="h-12 w-14 animate-pulse rounded-md bg-secondary/20 xxs:w-32 md:w-52" />
                ) : (
                  <Link
                    href="/administration/products/sort"
                    className="btn btn-outline btn-primary focus:outline-none"
                  >
                    <ArrowDownUp className="size-5" />
                    <span className="hidden xxs:block">Ordenar</span>
                    <span className="-ml-1 hidden md:block">productos</span>
                  </Link>
                )}

                {categoriesQuery.isPending || suppliersQuery.isPending ? (
                  <div className="h-12 w-24 animate-pulse rounded-md bg-secondary/20" />
                ) : (
                  <Dropdown>
                    <DropdownTrigger className="btn btn-outline btn-primary focus:outline-none">
                      <Filter className="size-5" />
                      <span>Filtro</span>
                    </DropdownTrigger>
                    <DropdownContent
                      sideOffset={5}
                      side={mq ? (mq < mqs.md ? "bottom" : "left") : "left"}
                      align={mq ? (mq < mqs.md ? "center" : "start") : "start"}
                      className="flex h-fit w-72 min-w-72 flex-col gap-3 rounded-lg border border-secondary/30 bg-base-100 p-3 shadow-md"
                    >
                      {/* Name */}
                      <div className="input input-bordered flex h-10 items-center justify-start gap-3 px-4 py-2 shadow-inner focus:shadow-inner focus:outline-none">
                        <Search className="size-5 min-w-5 text-secondary" />
                        <input
                          type="text"
                          placeholder="Buscar producto"
                          value={nameFilter ?? ""}
                          className="h-full w-full bg-transparent"
                          onChange={(event) =>
                            setNameFilter(event.target.value)
                          }
                        />
                      </div>

                      {/* Category */}
                      <Select
                        value={`${selectedCategory?.id}`}
                        onValueChange={(v) =>
                          setSelectedCategory(
                            categoriesQuery.data.find(
                              (c) => c.id === parseInt(v)
                            ) ?? undefined
                          )
                        }
                      >
                        <SelectTrigger className="input input-bordered flex h-10 w-full items-center justify-between gap-4 rounded-md px-4 py-2 shadow-inner focus:outline-none">
                          <span
                            className={cn(
                              "flex items-center gap-3",
                              !selectedCategory && "italic text-secondary"
                            )}
                          >
                            <Tag className="size-4 min-w-4" />
                            {selectedCategory?.name ?? "Categoría"}
                          </span>
                        </SelectTrigger>
                        <SelectContent sideOffset={0} align="start">
                          <SelectOption
                            value={`${-1}`}
                            className="rounded-lg italic text-secondary"
                          >
                            Sin filtro
                          </SelectOption>
                          {categoriesQuery.data?.map((category) => (
                            <SelectOption
                              key={category.id}
                              value={`${category.id}`}
                              className="rounded-lg"
                            >
                              {category.name}
                            </SelectOption>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Supplier */}
                      <Select
                        onValueChange={(v) =>
                          setSelectedSupplier(
                            suppliersQuery.data.find(
                              (s) => s.id === parseInt(v)
                            ) ?? undefined
                          )
                        }
                      >
                        <SelectTrigger className="input input-bordered flex h-10 w-full items-center justify-between gap-4 rounded-md px-4 py-2 shadow-inner focus:outline-none">
                          <span
                            className={cn(
                              "flex items-center gap-3",
                              !selectedSupplier && "italic text-secondary"
                            )}
                          >
                            <ClipboardList className="mb-0.5 size-4 min-w-4" />
                            {selectedSupplier?.name ?? "Proveedor"}
                          </span>
                        </SelectTrigger>
                        <SelectContent sideOffset={0} align="end">
                          <SelectOption
                            value={`${-1}`}
                            className="rounded-lg italic text-secondary"
                          >
                            Sin filtro
                          </SelectOption>
                          {suppliersQuery.data?.map((supplier) => (
                            <SelectOption
                              key={supplier.id}
                              value={`${supplier.id}`}
                              className="rounded-lg"
                            >
                              {supplier.name}
                            </SelectOption>
                          ))}
                        </SelectContent>
                      </Select>
                    </DropdownContent>
                  </Dropdown>
                )}

                {productsQuery.isPending ? (
                  <div className="h-12 w-44 animate-pulse rounded-md bg-secondary/20" />
                ) : (
                  <button
                    className="btn btn-primary col-span-4 whitespace-nowrap transition-all duration-300"
                    onClick={create_open}
                  >
                    <PackagePlus className="size-5" />
                    Crear producto
                  </button>
                )}
              </div>

              {(nameFilter || selectedCategory || selectedSupplier) && (
                <section className="flex flex-wrap items-center justify-end gap-2">
                  {nameFilter && (
                    <div className="flex h-8 w-fit items-center gap-1 rounded-lg bg-secondary/30 px-2 py-1">
                      <Package className="mr-1 size-4 text-secondary" />
                      {nameFilter}
                      <X
                        onClick={() => setNameFilter("")}
                        className="size-5 cursor-pointer text-secondary"
                      />
                    </div>
                  )}
                  {!!selectedCategory && (
                    <div className="flex h-8 w-fit items-center gap-1 rounded-lg bg-secondary/30 px-2 py-1">
                      <Tag className="mr-1 size-4 text-secondary" />
                      {selectedCategory?.name}
                      <X
                        onClick={() => setSelectedCategory(undefined)}
                        className="size-5 cursor-pointer text-secondary"
                      />
                    </div>
                  )}
                  {!!selectedSupplier && (
                    <div className="flex h-8 w-fit items-center gap-1 rounded-lg bg-secondary/30 px-2 py-1">
                      <ClipboardList className="mr-1 size-4 text-secondary" />
                      {selectedSupplier?.name}
                      <X
                        onClick={() => setSelectedSupplier(undefined)}
                        className="size-5 cursor-pointer text-secondary"
                      />
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {!anyError && (
            <div className="mx-auto grid w-full max-w-screen-md grid-cols-1 gap-4 xl:max-w-screen-2xl xl:grid-cols-2">
              {productsQuery.isPending
                ? Array.from({ length: 4 }).map((_, i) => (
                    <ProductsItemSkeleton key={i} />
                  ))
                : filteredProducts.map((product) => (
                    <ProductsItem
                      key={product.id}
                      product={product}
                      category={categoriesQuery.data?.find(
                        (c) => c.id === product?.categoryID
                      )}
                      supplier={suppliersQuery.data?.find(
                        (s) => s.id === product?.supplierID
                      )}
                      filterURL={filterURLRef.current}
                    />
                  ))}
            </div>
          )}

          {anyError && (
            <div className="flex w-full flex-col gap-2">
              <ErrorSpan
                message={productsQuery.error?.response?.data.comment}
              />
              <ErrorSpan
                message={categoriesQuery.error?.response?.data.comment}
              />
              <ErrorSpan
                message={suppliersQuery.error?.response?.data.comment}
              />
            </div>
          )}
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Products;
