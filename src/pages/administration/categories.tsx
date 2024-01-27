import { ErrorSpan, MandatoryMark } from "@/components/forms";
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
import type { CloudinaryError, CloudinarySuccess } from "@/types/cloudinary";
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { AlertCircle, PanelRightClose, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import { z } from "zod";
import Placeholder from "../../../public/placeholder.svg";
import NoImage from "../../../public/no_image.png";

const columnHelper = createColumnHelper<Category>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("name", {
    header: "Nombre",
  }),
  columnHelper.accessor("image", {
    header: "Imagen",
  }),
];

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  // code: z.string(),
  name: z.string(),
});

function Categories() {
  const queryClient = useQueryClient();

  const [image, setImage] = useState<File>();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const categoriesQuery = useQuery<
    Awaited<ReturnType<typeof getCategories>>,
    ServerError
  >({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const table = useReactTable({
    columns,
    data: categoriesQuery.data ?? [],
    getCoreRowModel: getCoreRowModel(),
  });
  // const numberOfColumns = table.getAllLeafColumns().length;
  const numberOfColumns = table.getTotalSize();

  function resetInputData() {
    setImage(undefined);
    reset({
      name: selectedCategory?.name,
    });
    setIsSubmitEnabled(false);
  }

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    values: {
      name: selectedCategory?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => mutation.mutate(data);

  watch((value, { type }) => {
    if (type !== "change") return;
    setIsSubmitEnabled(value.name !== selectedCategory?.name);
  });

  const mutation = useMutation<any, ServerError, Input>({
    mutationFn: async (data) => {
      const options = { withCredentials: true };
      return Promise.all([
        isSubmitEnabled &&
          axios.put(
            `${vars.serverUrl}/api/v1/categories/${selectedCategory?.id}`,
            { name: data.name },
            options
          ),
        !!image &&
          axios.post(
            `${vars.serverUrl}/api/v1/categories/${selectedCategory?.id}/image`,
            { file: image },
            {
              withCredentials: true,
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          ),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Uploaded");
      resetInputData();
    },
  });

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
      <div className="flex h-full w-full gap-8 border border-secondary/5">
        <section className={cn(!!selectedCategory && "max-w-4xl", "w-full")}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="cursor-default bg-secondary/20 hover:bg-secondary/20"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section
          className={cn(
            selectedCategory
              ? "relative h-full w-full border-l border-l-secondary/20 pl-7"
              : "hidden"
          )}
        >
          {/* DATA ASIDE */}
          <div className="sticky top-20 h-fit">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="btn btn-ghost"
              >
                <PanelRightClose className="size-6" />
              </button>
              <span className="text-2xl">{selectedCategory?.name}</span>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col items-end gap-4"
            >
              <div className="flex w-full items-center gap-4">
                {/* FIELDS */}
                <section className="flex w-full flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="code" className="text-lg text-secondary">
                      Código:
                    </label>
                    <input
                      id="code"
                      type="text"
                      defaultValue={selectedCategory?.name}
                      className="input input-bordered w-full focus:outline-none"
                    />
                    {/* <ErrorSpan message={errors.code?.message} /> */}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-lg text-secondary">
                      <MandatoryMark /> Nombre:
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register("name")}
                      defaultValue={selectedCategory?.name}
                      className="input input-bordered w-full focus:outline-none"
                    />
                    <ErrorSpan message={errors.name?.message} />
                  </div>
                </section>

                {/* IMAGE */}
                <section className="relative min-w-fit">
                  <div className="flex size-56 items-center justify-center rounded-xl border border-secondary/50">
                    <div className="relative size-11/12 overflow-hidden rounded-md">
                      <label
                        htmlFor="image"
                        className="absolute left-0 top-0 z-30 flex size-full cursor-pointer items-center justify-center opacity-0 backdrop-blur-sm transition-opacity hover:bg-neutral/50 hover:opacity-100"
                      >
                        <Upload className="size-8 animate-bounce text-primary" />
                      </label>
                      <input
                        id="image"
                        type="file"
                        className="hidden"
                        onChange={(e) => setImage(e.target.files?.[0])}
                      />
                      {image && (
                        <Image
                          alt="preview"
                          width={200}
                          height={200}
                          src={URL.createObjectURL(image)}
                          className="absolute size-full rounded-md"
                        />
                      )}
                      <Image
                        alt={selectedCategory?.name ?? ""}
                        src={selectedCategory?.image ?? NoImage}
                        width={200}
                        height={200}
                        className="z-10 size-full select-none rounded-md bg-secondary/10 object-cover"
                      />
                    </div>
                  </div>
                  {image && (
                    <div className="absolute mt-1 flex w-full items-center justify-center gap-2 text-error">
                      <AlertCircle className="size-4" />
                      <ErrorSpan message="Imagen no guardada" />
                    </div>
                  )}
                </section>
              </div>

              <section className="mt-8 flex gap-4">
                <button
                  type="button"
                  disabled={!isSubmitEnabled && !image}
                  className="btn btn-ghost w-32"
                  onClick={resetInputData}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isSubmitEnabled && !image}
                  className="btn btn-primary w-32"
                >
                  Guardar
                </button>
              </section>
            </form>
          </div>
        </section>
      </div>
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Categories;

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
