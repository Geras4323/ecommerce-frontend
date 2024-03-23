import { AdministrationLayout } from "@/components/layouts/administration";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
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
import NoImage from "../../../public/no_image.png";
import { getProducts, type Product } from "@/functions/products";
import { useProductStore } from "@/hooks/states/products";
import { ProductCreateAside } from "src/containers/administration/products/createAside";
import { ProductDataAside } from "src/containers/administration/products/dataAside";
import { getCategories } from "@/functions/categories";
import { getSuppliers } from "@/functions/suppliers";

const columnHelper = createColumnHelper<Product>();

function Products() {
  const { selected_product, product_select, create_isOpen, create_open } =
    useProductStore();

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

  const columns = [
    columnHelper.display({
      id: `image_`,
      cell: (info) => (
        <div className="mr-4 min-w-24">
          <Image
            alt={info.row.original.name}
            src={info.row.original.images?.[0]?.url ?? NoImage}
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
    columnHelper.accessor("price", {
      header: "Precio",
      cell: (info) => (
        <div className="mr-4 w-28 whitespace-nowrap text-2xl">
          $ {info.getValue().toLocaleString("es-AR")}
        </div>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Nombre",
      cell: (info) => (
        <div className="mr-4 w-32 text-lg">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("categoryID", {
      header: "Categoría",
      cell: (info) => (
        <div className="mr-4 w-28 text-lg">
          {categoriesQuery.data?.find((c) => c.id === info.getValue())?.name}
        </div>
      ),
    }),
    columnHelper.accessor("supplierID", {
      header: "Proveedor",
      cell: (info) => {
        const value = info.getValue();
        return value ? (
          <div className="mr-4 w-32 text-lg">
            {suppliersQuery.data?.find((s) => s.id === value)?.name}
          </div>
        ) : (
          <span className="mr-4 w-32 text-base italic text-secondary">
            Sin proveedor
          </span>
        );
      },
    }),
    columnHelper.accessor("description", {
      header: "Descripción",
      cell: (info) => (
        <span className="w-24 truncate text-base text-secondary">
          {info.getValue()}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    columns,
    data: productsQuery.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getColumnCanGlobalFilter: () => true,
  });
  const numberOfColumns = table.getTotalSize();

  return (
    <AdministrationLayout active="Productos">
      <div className="flex h-full w-full">
        {/* CREATE */}
        <ProductCreateAside />

        {/* MAIN TABLE */}
        <section className="relative flex h-full w-full flex-col p-4 transition-all duration-300">
          <div className="mb-8 flex min-h-12 w-full items-center justify-start">
            <button
              className="btn btn-primary mr-8 whitespace-nowrap transition-all duration-300"
              onClick={create_open}
              disabled={!!selected_product}
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
                    onClick={() => {
                      if (selected_product || create_isOpen) return;

                      product_select(row.original);
                    }}
                    className={cn(
                      selected_product || create_isOpen
                        ? `cursor-default ${
                            row.original.id === selected_product?.id &&
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
          </Table>
        </section>

        {/* DATA ASIDE */}
        <ProductDataAside />
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Products;
