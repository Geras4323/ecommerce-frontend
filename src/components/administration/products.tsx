import type { Category } from "@/functions/categories";
import type { Product } from "@/functions/products";
import type { Supplier } from "@/functions/suppliers";
import { Barcode, ClipboardList, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ProductsItemSkeleton() {
  return (
    <div
      className="flex h-fit w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-secondary/10 shadow-md hover:bg-secondary/15 hover:shadow-lg sm:flex-row 2xl:h-44 2xl:min-h-44"
      style={{
        boxShadow: "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
      }}
    >
      <div className="sm:w-2/5">
        {/* Image */}
        <div
          className="h-48 w-full bg-secondary/20 object-cover xs:h-full"
          style={{
            aspectRatio: "600/300",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Data */}
      <div className="flex flex-col gap-4 p-6 sm:w-3/5">
        <div className="flex flex-col items-start gap-2 text-primary xl:justify-between 2xl:flex-row 2xl:gap-6">
          {/* Name */}
          <div className="mb-1 h-6 w-full rounded-md bg-secondary/20 xl:h-14" />
          {/* Price */}
          <div className="h-7 w-28 rounded-md bg-secondary/20" />
        </div>
        <article className="flex flex-col justify-between gap-3 text-sm 2xl:flex-row 2xl:items-center 2xl:gap-6">
          <section className="flex items-center gap-1.5 font-semibold">
            <Barcode className="size-4 text-secondary" />
            <div className="h-5 w-28 rounded-md bg-secondary/20" />
          </section>
          <section className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Tag className="mb-0.5 size-4 text-secondary" />
              <div className="h-5 w-20 rounded-md bg-secondary/20" />
            </div>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="mb-1 size-4 text-secondary" />
              <div className="h-5 w-20 rounded-md bg-secondary/20" />
            </div>
          </section>
        </article>
        <div className="h-6 w-full rounded-md bg-secondary/20" />
      </div>
    </div>
  );
}

export function ProductsItem({
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
      style={{
        boxShadow: "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
      }}
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