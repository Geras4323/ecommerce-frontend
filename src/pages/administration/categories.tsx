import { AdministrationLayout } from "@/components/layouts/administration";
import { getCategories } from "@/functions/categories";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { useQuery } from "@tanstack/react-query";
import { Barcode, Search } from "lucide-react";
import Image from "next/image";
import { CategoryDataAside } from "src/containers/administration/categories/dataAside";
import { CategoryCreateAside } from "src/containers/administration/categories/createAside";
import { useCategoryStore } from "@/hooks/states/categories";
import { useState } from "react";

function Categories() {
  const { selected_category, category_select, create_isOpen, create_open } =
    useCategoryStore();

  const [filter, setFilter] = useState<string>();

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: true,
    retry: false,
  });

  return (
    <AdministrationLayout active="Categorías">
      <div className="flex h-full w-full">
        {/* CREATE */}
        <CategoryCreateAside />

        {/* MAIN TABLE */}
        <section
          className={cn(
            // !!selected_category || create_isOpen ? "w-1/2 2xl:w-2/3" : "w-full",
            "relative mx-auto flex h-full w-full max-w-screen-2xl flex-col p-4 transition-all duration-300"
          )}
        >
          <div className="mb-4 flex min-h-12 w-full items-center justify-end gap-4 border-b border-secondary/30 pb-4">
            <div className="input input-bordered flex items-center justify-start gap-3 px-4 py-2 shadow-inner focus:shadow-inner focus:outline-none">
              <Search className="size-5 text-secondary" />
              <input
                type="text"
                placeholder="Buscar categoría"
                value={filter ?? ""}
                className="h-full w-full bg-transparent"
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>

            <button
              className="btn btn-primary whitespace-nowrap transition-all duration-300"
              onClick={create_open}
              disabled={!!selected_category}
            >
              Crear categoría
            </button>
          </div>

          {/* CATEGORY LIST */}
          <div className="mx-auto flex w-fit flex-row flex-wrap justify-center gap-3">
            {categoriesQuery.data
              ?.filter((category) =>
                filter
                  ? category.name.toLowerCase().includes(filter.toLowerCase())
                  : category
              )
              .map((category) => (
                <div
                  key={category.id}
                  onClick={() => {
                    if (selected_category || create_isOpen) return;

                    category_select(category);
                  }}
                  className="flex h-24 w-full cursor-pointer gap-4 overflow-hidden rounded-md border border-secondary/10 bg-secondary/10 shadow-md transition-colors duration-100 hover:bg-secondary/20 xs:w-80 xs:max-w-80"
                  style={{
                    boxShadow:
                      "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
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
              ))}
          </div>
        </section>

        {/* DATA ASIDE */}
        <CategoryDataAside />
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Categories;
