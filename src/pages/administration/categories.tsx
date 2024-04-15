import { AdministrationLayout } from "@/components/layouts/administration";
import { getCategories } from "@/functions/categories";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Image from "next/image";
import { CategoryDataAside } from "src/containers/administration/categories/dataAside";
import { CategoryCreateAside } from "src/containers/administration/categories/createAside";
import { useCategoryStore } from "@/hooks/states/categories";

function Categories() {
  const { selected_category, category_select, create_isOpen, create_open } =
    useCategoryStore();

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
            "relative flex h-full flex-col p-4 transition-all duration-300"
          )}
        >
          <div className="mb-8 flex min-h-12 w-full items-center justify-start">
            <button
              className="btn btn-primary mr-8 whitespace-nowrap transition-all duration-300"
              onClick={create_open}
              disabled={!!selected_category}
            >
              Crear categoría
            </button>

            <div className="input flex w-96 items-center justify-start border border-secondary/30 p-0">
              <div className="flex h-full min-w-12 items-center justify-center border-r border-r-secondary/30">
                <Search className="size-6 text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por código o nombre"
                className="h-full w-full bg-transparent px-3"
                // onChange={(event) => table.setGlobalFilter(event.target.value)}
              />
            </div>
          </div>

          {/* CATEGORY LIST */}
          <div className="flex w-full flex-row flex-wrap gap-3">
            {categoriesQuery.data?.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  if (selected_category || create_isOpen) return;

                  category_select(category);
                }}
                className="flex h-24 w-80 min-w-72 cursor-pointer gap-4 overflow-hidden rounded-md border border-secondary/10 bg-secondary/10 shadow-md transition-colors duration-100 hover:bg-secondary/20"
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
                  />
                </div>
                <div className="flex h-full w-full flex-col items-start justify-center gap-2 truncate">
                  <span className="truncate text-lg font-semibold text-primary">
                    {category.name}
                  </span>
                  {category.code && (
                    <span className="text-primary/70">{category.code}</span>
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
