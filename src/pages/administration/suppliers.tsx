import { AdministrationLayout } from "@/layouts/administration";
import {
  Table,
  TableBody,
  TableCell,
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
import { ClipboardEdit, Search } from "lucide-react";
import { getSuppliers, type Supplier } from "@/functions/suppliers";
import { useSupplierStore } from "@/hooks/states/suppliers";
import { SupplierCreateAside } from "src/containers/administration/suppliers/createAside";
import { SupplierDataAside } from "src/containers/administration/suppliers/dataAside";
import { ErrorSpan } from "@/components/forms";

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
        {/* DATA ASIDE */}
        <SupplierDataAside />

        {/* CREATE ASIDE */}
        <SupplierCreateAside />

        {/* MAIN TABLE */}
        <section className="relative mx-auto flex h-full w-full max-w-screen-2xl flex-col p-4 transition-all duration-300">
          <div className="mb-4 flex h-fit w-full items-center justify-end gap-4 border-b border-secondary/30 pb-4">
            <div className="input input-bordered flex items-center justify-start gap-3 px-4 py-2 shadow-inner focus:shadow-inner focus:outline-none">
              <Search className="size-5 min-w-5 text-secondary" />
              <input
                type="text"
                placeholder="Buscar proveedor"
                className="h-full w-full bg-transparent"
                onChange={(event) => table.setGlobalFilter(event.target.value)}
              />
            </div>

            <button
              className="btn btn-primary whitespace-nowrap transition-all duration-300"
              onClick={create_open}
              disabled={!!selected_supplier}
            >
              <ClipboardEdit className="mb-0.5 size-5" />
              Crear proveedor
            </button>
          </div>

          {suppliersQuery.isError ? (
            <div className="flex w-full justify-center">
              <ErrorSpan
                message={suppliersQuery.error.response?.data.comment}
              />
            </div>
          ) : (
            <Table>
              {/* <TableHeader>
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
            </TableHeader> */}
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
          )}
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Suppliers;
