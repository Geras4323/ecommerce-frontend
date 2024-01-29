import { ErrorSpan, LoadableButton, MandatoryMark } from "@/components/forms";
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
import type { ServerError, ServerSuccess } from "@/types/types";
import { cn } from "@/utils/lib";
import { vars } from "@/utils/vars";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import {
  AlertCircle,
  PanelRightClose,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import NoImage from "../../../public/no_image.png";
import {
  DeleteCategoryImageModal,
  DeleteCategoryModal,
} from "@/components/modals/administration/categories";

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

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  code: z.string(),
  name: z.string(),
});

function Categories() {
  const queryClient = useQueryClient();

  const [image, setImage] = useState<File>();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [hasDataChanged, setHasDataChanged] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);
  const [isDeleteCategoryImageModalOpen, setIsDeleteCategoryImageModalOpen] =
    useState(false);
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
  // const numberOfColumns = table.getAllLeafColumns().length;
  const numberOfColumns = table.getTotalSize();

  function resetInputData() {
    reset({
      code: selectedCategory?.code,
      name: selectedCategory?.name,
    });
    setHasDataChanged(false);
  }

  function resetImage() {
    setImage(undefined);
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
      code: selectedCategory?.code ?? "",
      name: selectedCategory?.name ?? "",
    },
  });

  const onSubmit: SubmitHandler<Input> = (data) => {
    if (hasDataChanged) dataMutation.mutate(data);
    if (image) imageMutation.mutate();
  };

  watch((value, { type }) => {
    if (type !== "change") return;
    setHasDataChanged(
      value.name !== selectedCategory?.name ||
        value.code !== selectedCategory?.code
    );
  });

  function refreshQuery() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  const dataMutation = useMutation<ServerSuccess, ServerError, Input>({
    mutationFn: async (data) => {
      return axios.put(
        `${vars.serverUrl}/api/v1/categories/${selectedCategory?.id}`,
        data,
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      toast.success("Actualizado");
      refreshQuery();
      resetInputData();
    },
  });

  const imageMutation = useMutation<any, ServerError, void>({
    mutationFn: async () => {
      return axios.post(
        `${vars.serverUrl}/api/v1/categories/${selectedCategory?.id}/image`,
        { file: image },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Subido");
      refreshQuery();
      resetImage();
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
      <div className="flex h-full w-full">
        <section
          className={cn(
            isCreateCategoryOpen
              ? "mr-6 h-full w-1/2 border-r border-r-secondary/20 pr-6 2xl:w-1/3"
              : "w-0 overflow-hidden border-r border-r-transparent",
            "transition-all duration-300"
          )}
        />

        <section
          className={cn(
            !!selectedCategory || isCreateCategoryOpen
              ? "w-1/2 2xl:w-2/3"
              : "w-full",
            "flex h-full flex-col transition-all duration-300"
          )}
        >
          <div className="mb-8 flex min-h-12 w-full items-center justify-start gap-8">
            {/* <span className="text-2xl">Categorías</span> */}

            <button
              className="btn btn-primary"
              onClick={() => setIsCreateCategoryOpen((prev) => !prev)}
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

        <section
          className={cn(
            selectedCategory
              ? "ml-6 h-full w-1/2 border-l border-l-secondary/20 pl-6 2xl:w-1/3"
              : "w-0 overflow-hidden border-l border-l-transparent",
            "transition-all duration-300"
          )}
        >
          {/* DATA ASIDE */}
          <div className="mb-8 flex h-12 w-full items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="btn btn-ghost btn-outline border border-secondary/30"
              >
                <PanelRightClose className="size-6" />
              </button>
              <span className="text-2xl">{selectedCategory?.name}</span>
            </div>
            <button
              onClick={() => setIsDeleteCategoryModalOpen(true)}
              className="btn btn-error w-12 flex-row flex-nowrap items-center justify-end gap-4 overflow-hidden whitespace-nowrap rounded-md px-3 text-primary transition-all hover:w-56"
            >
              <span>Eliminar categoría</span>
              <div className="min-w-6">
                <AlertCircle className="size-6" />
              </div>
            </button>
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
                    {...register("code")}
                    defaultValue={selectedCategory?.code}
                    className="input input-bordered w-full focus:outline-none"
                  />
                  <ErrorSpan message={errors.code?.message} />
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
                  <div className="group relative size-11/12 overflow-hidden rounded-md">
                    {selectedCategory?.image && (
                      <button
                        type="button"
                        onClick={() => setIsDeleteCategoryImageModalOpen(true)}
                        className="btn btn-error btn-sm absolute bottom-2 right-2 z-40 size-10 p-0 text-primary opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    )}
                    <label
                      htmlFor="image"
                      className="absolute left-0 top-0 z-30 flex size-full cursor-pointer items-center justify-center opacity-0 backdrop-blur-sm transition-opacity group-hover:bg-neutral/50 group-hover:opacity-100"
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
                disabled={!hasDataChanged && !image}
                className="btn btn-ghost w-32"
                onClick={resetInputData}
              >
                Cancelar
              </button>
              <LoadableButton
                type="submit"
                isLoading={dataMutation.isPending || imageMutation.isPending}
                disabled={!hasDataChanged && !image}
                className="btn-primary w-32"
                animation="loading-dots"
              >
                Guardar
              </LoadableButton>
            </section>
          </form>
        </section>
      </div>

      {selectedCategory && (
        <>
          <DeleteCategoryModal
            isOpen={isDeleteCategoryModalOpen}
            onClose={() => setIsDeleteCategoryModalOpen(false)}
            onSuccess={() => setSelectedCategory(null)}
            category={selectedCategory}
          />
          <DeleteCategoryImageModal
            isOpen={isDeleteCategoryImageModalOpen}
            onClose={() => setIsDeleteCategoryImageModalOpen(false)}
            category={selectedCategory}
          />
        </>
      )}
    </AdministrationLayout>
  );
}

export const getServerSideProps = withAuth("admin");
export default Categories;
