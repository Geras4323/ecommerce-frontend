import { GeneralLayout } from "@/layouts/general";
import type { WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";
import {
  type LucideIcon,
  ClipboardList,
  UsersRound,
  WalletCards,
  Tags,
  Boxes,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

type Section = {
  name: string;
  url: string;
  icon: LucideIcon;
  disabled: boolean;
  separator: boolean;
};

export type SectionName = (typeof sections)[number]["name"];
export const sections = [
  // {
  //   name: "Inicio",
  //   url: "/administration",
  //   icon: SlidersHorizontal,
  //   disabled: false,
  // },
  {
    name: "Proveedores",
    url: "/administration/suppliers",
    icon: ClipboardList,
    disabled: false,
    separator: false,
  },
  {
    name: "Categorías",
    url: "/administration/categories",
    icon: Tags,
    disabled: false,
    separator: false,
  },
  {
    name: "Productos",
    url: "/administration/products",
    icon: Boxes,
    disabled: false,
    separator: true,
  },
  {
    name: "Usuarios",
    url: "/administration/users",
    icon: UsersRound,
    disabled: true,
    separator: false,
  },
  {
    name: "Pedidos",
    url: "/administration/orders",
    icon: WalletCards,
    disabled: false,
    separator: false,
  },
] as const satisfies readonly Section[];

export function AdministrationLayout({
  children,
  active,
}: WithChildren & { active: SectionName }) {
  return (
    <>
      <Toaster richColors />
      <GeneralLayout title="Dashboard" description="This is the dashboard">
        <div className="relative flex w-full xs:pl-20">
          <section className="fixed left-0 top-0 z-10 hidden h-full w-20 flex-col overflow-hidden border-r border-r-secondary/30 bg-base-100 pt-16 transition-all delay-300 hover:w-72 xs:flex">
            <>
              <SectionItem
                section={{
                  name: "Inicio",
                  url: "/administration",
                  icon: SlidersHorizontal,
                  disabled: false,
                  separator: false,
                }}
                active={false}
              />
              <hr className="border-secondary/30" />
            </>
            {sections.map((section) => {
              if (!section.disabled)
                return (
                  <>
                    <SectionItem
                      key={section.name}
                      section={section}
                      active={section.name === active}
                    />
                    {section.separator && (
                      <hr className="border-secondary/30" />
                    )}
                  </>
                );
            })}
          </section>

          <article className="flex w-full flex-col px-0.5 pt-16">
            <div className="mb-2 mt-4 flex h-fit w-full justify-center px-4 xs:hidden">
              <div className="grid h-fit w-full grid-cols-2 gap-3 border-b border-secondary/30 pb-4">
                {sections.map((section) => {
                  if (!section.disabled)
                    return (
                      <Link
                        key={section.name}
                        href={section.url}
                        className={cn(
                          section.name === active
                            ? "border-b-4 border-b-primary text-primary"
                            : "text-primary/80",
                          "flex h-14 w-full select-none items-center justify-center gap-3 rounded-lg border border-secondary/30 shadow-sm"
                        )}
                      >
                        <section.icon className="size-6 min-w-6" />
                        <span className="text-sm uppercase">
                          {section.name}
                        </span>
                      </Link>
                    );
                })}
              </div>
            </div>

            {children}
          </article>
        </div>
      </GeneralLayout>
    </>
  );
}

const SectionItem = ({
  section,
  active,
}: {
  section: Section;
  active: boolean;
}) => {
  return (
    <Link
      href={section.disabled ? "" : section.url}
      className={cn(
        active && "bg-secondary/20",
        section.disabled
          ? "cursor-default text-secondary"
          : "cursor-pointer text-primary hover:bg-secondary/20",
        "flex h-16 w-auto select-none items-center justify-start gap-8 px-6 text-xl transition-all"
      )}
    >
      <section.icon className="size-8 min-w-fit stroke-1 text-primary/80" />
      {section.name}
    </Link>
  );
};
