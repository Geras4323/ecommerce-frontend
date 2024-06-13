import { AdministrationLayout } from "@/layouts/administration";
import { getCategories } from "@/functions/categories";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Search, Tag } from "lucide-react";
import { CategoryDataAside } from "src/containers/administration/categories/dataAside";
import { CategoryCreateAside } from "src/containers/administration/categories/createAside";
import { useCategoryStore } from "@/hooks/states/categories";
import { useState } from "react";
import {
  CategoriesItem,
  CategoriesItemSkeleton,
} from "@/components/administration/categories";
import { ErrorSpan } from "@/components/forms";

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
        {/* DATA ASIDE */}
        <CategoryDataAside />

        {/* CREATE */}
        <CategoryCreateAside />

        {/* MAIN TABLE */}
        <section className="relative mx-auto flex h-full w-full max-w-screen-2xl flex-col p-4 transition-all duration-300">
          <div className="mb-4 flex h-fit w-full items-center justify-end gap-4 border-b border-secondary/30 pb-4">
            <div className="input input-bordered flex items-center justify-start gap-3 px-4 py-2 shadow-inner focus:shadow-inner focus:outline-none">
              <Search className="size-5 min-w-5 text-secondary" />
              <input
                type="text"
                placeholder="Buscar categoría"
                value={filter ?? ""}
                className="h-full w-full bg-transparent"
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>

            <button
              className="btn btn-primary gap-3 whitespace-nowrap transition-all duration-300"
              onClick={create_open}
              disabled={!!selected_category}
            >
              <Tag className="size-5" />
              Crear categoría
            </button>
          </div>

          {/* CATEGORY LIST */}
          <div className="mx-auto flex w-fit flex-row flex-wrap justify-center gap-3">
            {categoriesQuery.isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <CategoriesItemSkeleton key={i} />
              ))
            ) : categoriesQuery.isError ? (
              <ErrorSpan
                message={categoriesQuery.error.response?.data.comment}
              />
            ) : (
              categoriesQuery.data
                ?.filter((category) =>
                  filter
                    ? category.name.toLowerCase().includes(filter.toLowerCase())
                    : category
                )
                .map((category) => (
                  <CategoriesItem
                    key={category.id}
                    category={category}
                    selected_category={selected_category}
                    category_select={category_select}
                    create_isOpen={create_isOpen}
                  />
                ))
            )}
          </div>
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Categories;
