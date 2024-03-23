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
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import Image from "next/image";
import NoImage from "../../../public/no_image.png";
import { CategoryDataAside } from "src/containers/administration/categories/dataAside";
import { CategoryCreateAside } from "src/containers/administration/categories/createAside";
import { useCategoryStore } from "@/hooks/states/categories";
import { Sheet, SheetContent } from "@/components/shadcn/sheet";

const columnHelper = createColumnHelper<Category>();

const columns = [
  columnHelper.display({
    id: `image_`,
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
      <p className="mr-4 h-8 w-16 text-base text-secondary">
        {info.getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => <div className="mr-4 w-32 text-lg">{info.getValue()}</div>,
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

  const table = useReactTable({
    columns,
    data: categoriesQuery.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getColumnCanGlobalFilter: () => true,
  });
  const numberOfColumns = table.getTotalSize();

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
                onChange={(event) => table.setGlobalFilter(event.target.value)}
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

          {/* <Table>
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
                    onClick={() => {
                      if (category || create_isOpen) return;

                      category_select(row.original);
                    }}
                    className={cn(
                      category || create_isOpen
                        ? `cursor-default ${
                            row.original.id === category?.id &&
                            "bg-secondary/20"
                          }`
                        : "cursor-pointer hover:bg-secondary/20"
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
          </Table> */}
        </section>

        {/* DATA ASIDE */}
        <CategoryDataAside />
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Categories;
