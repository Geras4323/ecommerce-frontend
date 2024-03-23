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
import { getSuppliers, type Supplier } from "@/functions/suppliers";
import { useSupplierStore } from "@/hooks/states/suppliers";
import { SupplierCreateAside } from "src/containers/administration/suppliers/createAside";
import { SupplierDataAside } from "src/containers/administration/suppliers/dataAside";

const columnHelper = createColumnHelper<Supplier>();

const columns = [
  // columnHelper.accessor("code", {
  //   header: "Código",
  //   cell: (info) => (
  //     <p className="mr-4 h-8 w-16 text-base text-secondary">
  //       {info.getValue()}
  //     </p>
  //   ),
  // }),
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => <div className="mr-4 text-lg">{info.getValue()}</div>,
  }),
];

function Suppliers() {
  const { selected_supplier, supplier_select, create_isOpen, create_open } =
    useSupplierStore();

  const suppliersQuery = useQuery<
    Awaited<ReturnType<typeof getSuppliers>>,
    ServerError
  >({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const table = useReactTable({
    columns,
    data: suppliersQuery.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getColumnCanGlobalFilter: () => true,
  });
  const numberOfColumns = table.getTotalSize();

  return (
    <AdministrationLayout active="Proveedores">
      <div className="flex h-full w-full">
        {/* CREATE */}
        <SupplierCreateAside />

        {/* MAIN TABLE */}
        <section className="relative flex h-full w-full flex-col p-4 transition-all duration-300">
          <div className="mb-8 flex min-h-12 w-full items-center justify-start">
            <button
              className="btn btn-primary mr-8 whitespace-nowrap transition-all duration-300"
              onClick={create_open}
              disabled={!!selected_supplier}
            >
              Crear proveedor
            </button>

            <div className="input flex w-96 items-center justify-start border border-secondary/30 p-0">
              <div className="flex h-full min-w-12 items-center justify-center border-r border-r-secondary/30">
                <Search className="size-6 text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Filtrar por nombre"
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
                      if (selected_supplier || create_isOpen) return;

                      supplier_select(row.original);
                    }}
                    className={cn(
                      selected_supplier || create_isOpen
                        ? `cursor-default ${
                            row.original.id === selected_supplier?.id &&
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
        <SupplierDataAside />
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Suppliers;
