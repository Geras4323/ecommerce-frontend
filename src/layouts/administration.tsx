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
} from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

type Section = {
  name: string;
  url: string;
  icon: LucideIcon;
  disabled: boolean;
};

export type SectionName = (typeof sections)[number]["name"];
export const sections = [
  {
    name: "Proveedores",
    url: "/administration/suppliers",
    icon: ClipboardList,
    disabled: false,
  },
  {
    name: "Categorías",
    url: "/administration/categories",
    icon: Tags,
    disabled: false,
  },
  {
    name: "Productos",
    url: "/administration/products",
    icon: Boxes,
    disabled: false,
  },
  {
    name: "Usuarios",
    url: "/administration/users",
    icon: UsersRound,
    disabled: true,
  },
  {
    name: "Pedidos",
    url: "/administration/orders",
    icon: WalletCards,
    disabled: false,
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
          <section className="fixed left-0 top-0 z-20 hidden h-full w-20 flex-col overflow-hidden border-r border-r-secondary/20 bg-base-100 pt-16 transition-all delay-300 hover:w-72 xs:flex">
            {sections.map((section, i) => {
              if (i < 3)
                return (
                  <SectionItem
                    key={section.name}
                    section={section}
                    active={section.name === active}
                  />
                );
            })}
            <hr className="border-secondary/20" />
            {sections.map((section, i) => {
              if (i >= 3 && !section.disabled)
                return (
                  <SectionItem
                    key={section.name}
                    section={section}
                    active={section.name === active}
                  />
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
                        <section.icon className="size-6" />
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
      <section.icon className="size-8 min-w-fit text-primary/90" />
      {section.name}
    </Link>
  );
};
