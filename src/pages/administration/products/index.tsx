import { AdministrationLayout } from "@/components/layouts/administration";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Filter, Package, Search, Tag, X } from "lucide-react";
import { getProducts, type Product } from "@/functions/products";
import { useProductStore } from "@/hooks/states/products";
import { ProductCreateAside } from "src/containers/administration/products/createAside";
import { type Category, getCategories } from "@/functions/categories";
import { type Supplier, getSuppliers } from "@/functions/suppliers";
import { useState } from "react";
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

function Products() {
  const { create_open } = useProductStore();
  const mq = useMediaQueries();

  const [nameFilter, setNameFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

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
    queryFn: getProducts,
    refetchOnWindowFocus: true,
    retry: false,
  });

  let filteredProducts: Product[] = productsQuery.data ?? [];

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
                        <Search className="size-5 text-secondary" />
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
                            ) ?? null
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
                            ) ?? null
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
                  <div className="h-12 w-36 animate-pulse rounded-md bg-secondary/20" />
                ) : (
                  <button
                    className="btn btn-primary col-span-4 w-36 whitespace-nowrap transition-all duration-300"
                    onClick={create_open}
                  >
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
                        onClick={() => setSelectedCategory(null)}
                        className="size-5 cursor-pointer text-secondary"
                      />
                    </div>
                  )}
                  {!!selectedSupplier && (
                    <div className="flex h-8 w-fit items-center gap-1 rounded-lg bg-secondary/30 px-2 py-1">
                      <ClipboardList className="mr-1 size-4 text-secondary" />
                      {selectedSupplier?.name}
                      <X
                        onClick={() => setSelectedSupplier(null)}
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
                    />
                  ))}
            </div>
          )}

          {anyError && (
            <div className="flex w-full flex-col gap-2">
              {productsQuery.isError && (
                <ErrorSpan message="Ocurrió un error durante la carga de los productos" />
              )}
              {categoriesQuery.isError && (
                <ErrorSpan message="Ocurrió un error durante la carga de las categorías" />
              )}
              {suppliersQuery.isError && (
                <ErrorSpan message="Ocurrió un error durante la carga de los proveedores" />
              )}
            </div>
          )}
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Products;
