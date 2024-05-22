import type { Category } from "@/functions/categories";
import { Barcode } from "lucide-react";
import Image from "next/image";

export function CategoriesItemSkeleton() {
  return (
    <div
      className="flex h-24 w-full animate-pulse gap-4 rounded-md bg-secondary/10 transition-colors xs:w-80 xs:max-w-80"
      style={{
        boxShadow: "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
      }}
    >
      {/* Image */}
      <div className="h-full w-24 min-w-24 border-r border-r-secondary/10 bg-secondary/20" />

      {/* Data */}
      <div className="flex h-full w-full flex-col items-start justify-center gap-2 truncate">
        <div className="h-6 w-32 truncate rounded-md bg-secondary/20 text-lg font-semibold text-primary" />
        <div className="flex items-center gap-1.5 text-sm">
          <div className="h-5 w-24 rounded-md bg-secondary/20" />
        </div>
      </div>
    </div>
  );
}

export function CategoriesItem({
  category,
  selected_category,
  create_isOpen,
  category_select,
}: {
  category: Category;
  selected_category: Category | null;
  create_isOpen: boolean;
  category_select: (c: Category) => void;
}) {
  return (
    <div
      onClick={() => {
        if (selected_category || create_isOpen) return;

        category_select(category);
      }}
      className="flex h-24 w-full cursor-pointer gap-4 overflow-hidden rounded-md border border-secondary/10 bg-secondary/10 shadow-md transition-colors duration-100 hover:bg-secondary/20 xs:w-80 xs:max-w-80"
      style={{
        boxShadow: "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
      }}
    >
      <div className="min-w-fit">
        <Image
          alt="categoryImage"
          src={category.image ?? ""}
          width={200}
          height={200}
          className="h-full w-24 border-r border-r-secondary/10 bg-secondary/20 object-cover transition-all"
          unoptimized
        />
      </div>
      <div className="flex h-full w-full flex-col items-start justify-center gap-2 truncate">
        <span className="truncate text-lg font-semibold text-primary">
          {category.name}
        </span>
        {category.code && (
          <div className="flex items-center gap-1.5 text-sm text-primary/70">
            <Barcode className="mb-1 size-4" />
            <span>{category.code}</span>
          </div>
        )}
      </div>
    </div>
  );
}
