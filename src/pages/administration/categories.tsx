import { AdministrationLayout } from "@/components/layouts/administration";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import { type Category, getCategories } from "@/functions/categories";
import { withAuth } from "@/functions/session";
import type { ServerError } from "@/types/types";
import { cn } from "@/utils/lib";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import NoImage from "../../../public/no_image.png";
import { CategoryDataAside } from "src/containers/administration/categories/dataAside";
import { CategoryCreateAside } from "src/containers/administration/categories/createAside";

const columnHelper = createColumnHelper<Category>();

const columns = [
  columnHelper.display({
    id: `image_`,
    header: "CATEGORÍAS",
    cell: (info) => (
      <div className="mr-4 min-w-24">
        <Image
          alt={info.row.original.name}
          src={info.row.original.image ?? NoImage}
          width={100}
          height={100}
          className="size-24 rounded-md object-cover"
        />
      </div>
    ),
  }),
  columnHelper.accessor("code", {
    header: "Código",
    cell: (info) => (
      <span className="mr-4 text-base text-secondary">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => <span className="mr-4 text-lg">{info.getValue()}</span>,
  }),
  columnHelper.accessor("image", {
    header: "Imagen",
    cell: (info) => (
      <span className="w-24 truncate text-sm text-secondary">
        {info.getValue()}
      </span>
    ),
    enableGlobalFilter: false,
  }),
];

function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const table = useReactTable({
    columns,
    data: categoriesQuery.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getColumnCanGlobalFilter: () => true,
  });
  const numberOfColumns = table.getTotalSize();

  useEffect(() => {
    setSelectedCategory((prev) => {
      const updateCat = categoriesQuery.data?.find(
        (category) => category.id === selectedCategory?.id
      );
      if (updateCat) return updateCat;
      return prev;
    });
  }, [categoriesQuery.data, selectedCategory?.id]);

  return (
    <AdministrationLayout active="Categorías">
      <div className="flex h-full w-full">
        {/* CREATE */}
        <CategoryCreateAside
          isOpen={isCreateCategoryOpen}
          setIsOpen={setIsCreateCategoryOpen}
        />

        {/* MAIN TABLE */}
        <section
          className={cn(
            !!selectedCategory || isCreateCategoryOpen
              ? "w-1/2 2xl:w-2/3"
              : "w-full",
            "flex h-full flex-col transition-all duration-300"
          )}
        >
          <div className="mb-8 flex min-h-12 w-full items-center justify-start">
            {/* <span className="text-2xl">Categorías</span> */}

            <button
              className={cn(
                isCreateCategoryOpen
                  ? "mr-0 w-0 overflow-hidden border-none p-0"
                  : "mr-8 w-40",
                "btn btn-primary whitespace-nowrap transition-all duration-300"
              )}
              onClick={() => setIsCreateCategoryOpen(true)}
            >
              Crear categoría
            </button>

            <div className="input flex w-96 items-center justify-start border border-secondary/30 p-0">
              <div className="flex h-full w-12 items-center justify-center border-r border-r-secondary/30">
                <Search className="size-6 text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por código o nombre"
                className="h-full w-full bg-transparent px-3"
                onChange={(event) => table.setGlobalFilter(event.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-secondary/20 hover:bg-secondary/20"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="cursor-default"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedCategory(row.original)}
                    className={cn(
                      row.original.id === selectedCategory?.id &&
                        "bg-secondary/20 hover:bg-secondary/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  {" "}
                  <TableCell
                    colSpan={numberOfColumns}
                    className="h-12 text-center"
                  >
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        {/* DATA ASIDE */}
        <CategoryDataAside
          category={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Categories;
