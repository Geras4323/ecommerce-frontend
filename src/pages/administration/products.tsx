import { AdministrationLayout } from "@/components/layouts/administration";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import { type Product, getProducts } from "@/functions/products";
import { withAuth } from "@/functions/session";
import type { CloudinaryError, CloudinarySuccess } from "@/types/cloudinary";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { PanelRightClose } from "lucide-react";
import { useState } from "react";
import { Toaster, toast } from "sonner";

const columnHelper = createColumnHelper<Product>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("name", {
    header: "Nombre",
  }),
  columnHelper.accessor("price", {
    header: "Precio",
    cell: (info) => <span>$ {info.getValue()}</span>,
  }),
  columnHelper.accessor("description", {
    header: "Descripción",
  }),
];

function Products() {
  // const [image, setImage] = useState<File | undefined>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const productsQuery = useQuery<
    Awaited<ReturnType<typeof getProducts>>,
    ServerError
  >({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const table = useReactTable({
    columns,
    data: productsQuery.data ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  const numberOfColumns = table.getAllLeafColumns().length;

  return (
    <AdministrationLayout active="Productos">
      <div className="flex h-full w-full">
        <section
          className={cn(
            !!selectedProduct ? "w-1/2 2xl:w-2/3" : "w-full",
            "h-full overflow-y-auto"
          )}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="cursor-default bg-secondary/10 hover:bg-secondary/10"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="text-primary"
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
                    onClick={() => setSelectedProduct(row.original)}
                    className={cn(
                      row.original.id === selectedProduct?.id &&
                        "bg-secondary/20"
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
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section
          className={cn(
            selectedProduct
              ? "relative h-full w-1/2 border-l border-l-secondary/20 pl-7 2xl:w-1/3"
              : "hidden"
          )}
        >
          <div className="sticky top-20 h-fit py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="btn btn-ghost"
              >
                <PanelRightClose className="size-6" />
              </button>
              <span className="text-2xl">{selectedProduct?.name}</span>
            </div>
          </div>
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Products;

// const uploadMutation = useMutation<
//   ServerSuccess<CloudinarySuccess>,
//   ServerError<CloudinaryError>,
//   File | undefined
// >({
//   mutationFn: async (data) => {
//     return axios.post(
//       `${vars.serverUrl}/api/v1/categories/1/image`,
//       {
//         file: data,
//       },
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//   },
//   onSuccess: (res) => {
//     if (res.data.error.message) {
//       toast.error("Error en la subida");
//       return;
//     }
//     toast.success("Foto subida exitosamente");
//   },
//   onError: (err) => {
//     console.log(err.response?.data.Response.message);
//   },
// });

// const deleteMutation = useMutation<
//   ServerSuccess<CloudinarySuccess>,
//   ServerError<CloudinaryError>,
//   void
// >({
//   mutationFn: async () => {
//     return axios.delete(`${vars.serverUrl}/api/v1/categories/1/image`);
//   },
//   onSuccess: (res) => {
//     if (res.data.error.message) {
//       toast.error(res.data.error.message);
//       return;
//     }
//     toast.success("Foto eliminada exitosamente");
//   },
//   onError: (err) => {
//     console.log(err.response?.data.Response.message);
//   },
// });
