import { AdministrationLayout } from "@/components/layouts/administration";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Barcode, ClipboardList, Search, Tag } from "lucide-react";
import Image from "next/image";
import { getProducts, type Product } from "@/functions/products";
import { useProductStore } from "@/hooks/states/products";
import { ProductCreateAside } from "src/containers/administration/products/createAside";
import { type Category, getCategories } from "@/functions/categories";
import { type Supplier, getSuppliers } from "@/functions/suppliers";
import { useState } from "react";
import Link from "next/link";

function Products() {
  const { create_open } = useProductStore();

  const [filter, setFilter] = useState<string | null>(null);

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

  let filteredProducts: Product[] = [];
  if (productsQuery.isSuccess) {
    if (filter) {
      filteredProducts = productsQuery.data?.filter(
        (product) =>
          product.name.toLowerCase().includes(filter.toLowerCase()) ||
          product.code.toLowerCase().includes(filter.toLowerCase())
      );
    } else {
      filteredProducts = productsQuery.data;
    }
  }

  return (
    <AdministrationLayout active="Productos">
      <div className="flex h-full w-full">
        {/* CREATE */}
        <ProductCreateAside />

        {/* MAIN TABLE */}
        <section className="relative h-full w-full flex-col p-4 transition-all duration-300">
          <div className="mb-8 flex min-h-12 w-full items-center justify-start">
            <button
              className="btn btn-primary mr-8 whitespace-nowrap transition-all duration-300"
              onClick={create_open}
            >
              Crear producto
            </button>

            <div className="input flex w-96 items-center justify-start border border-secondary/30 p-0">
              <div className="flex h-full min-w-12 items-center justify-center border-r border-r-secondary/30">
                <Search className="size-6 text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por cualquier campo"
                className="h-full w-full bg-transparent px-3"
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>
          </div>

          <div className="mx-auto grid w-fit grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredProducts.map((product) => (
              <Item
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
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Products;

function Item({
  product,
  category,
  supplier,
}: {
  product: Product;
  category?: Category;
  supplier?: Supplier;
}) {
  return (
    <Link
      href={`/administration/products/${product.id}`}
      className="flex h-fit w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-secondary/10 shadow-md hover:bg-secondary/15 hover:shadow-lg sm:flex-row 2xl:h-44 2xl:min-h-44"
    >
      <div className="sm:w-2/5">
        <Image
          alt={product.name}
          className="h-48 w-full object-cover xs:h-full"
          width={600}
          height={300}
          src={product.images[0]?.url ?? ""}
          style={{
            aspectRatio: "600/300",
            objectFit: "cover",
          }}
        />
      </div>
      <div className="flex flex-col gap-4 p-6 sm:w-3/5">
        <div className="flex flex-col items-start gap-2 text-primary xl:justify-between 2xl:flex-row 2xl:gap-6">
          <span className="h-fit truncate whitespace-pre-line text-xl font-semibold xl:h-14">
            {product.name}
          </span>
          <span className="whitespace-nowrap text-2xl font-bold">
            $ {product.price.toLocaleString("es-AR")}
          </span>
        </div>
        <article className="flex flex-col justify-between gap-3 text-sm 2xl:flex-row 2xl:items-center 2xl:gap-6">
          <section className="flex gap-1.5 font-semibold text-primary">
            <Barcode className="mb-1 size-4" />
            {product.code ? (
              <span>{product.code}</span>
            ) : (
              <span className="italic">Sin código</span>
            )}
          </section>
          <section className="flex items-center gap-6 text-primary/70">
            <div className="flex items-center gap-1.5">
              <Tag className="mb-0.5 size-4" />
              <span>{category?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="mb-1 size-4" />
              {supplier ? (
                <span>{supplier.name}</span>
              ) : (
                <span className="italic">Sin proveedor</span>
              )}
            </div>
          </section>
        </article>
        <p className="truncate text-base text-secondary">
          {product.description}
        </p>
      </div>
    </Link>
  );
}
