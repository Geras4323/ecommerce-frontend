import { GeneralLayout } from "@/layouts/GeneralLayout";
import type { WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";
import {
  type LucideIcon,
  Tag,
  ClipboardList,
  Package,
  UsersRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

type Section = {
  name: string;
  url: string;
  icon: LucideIcon;
  disabled: boolean;
};

type SectionName = (typeof sections)[number]["name"];

const sections = [
  {
    name: "Proveedores",
    url: "/administration/suppliers",
    icon: ClipboardList,
    disabled: false,
  },
  {
    name: "Categorías",
    url: "/administration/categories",
    icon: Tag,
    disabled: false,
  },
  {
    name: "Productos",
    url: "/administration/products",
    icon: Package,
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
        <div className="relative flex h-screen w-full pl-20">
          <section className="absolute left-0 top-0 z-20 flex h-full w-20 flex-col overflow-hidden border-r border-r-secondary/20 bg-base-100 pt-16 transition-all delay-300 hover:w-72">
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
            <hr className="my-2 border-secondary/20" />
            {sections.map((section, i) => {
              if (i >= 3)
                return (
                  <SectionItem
                    key={section.name}
                    section={section}
                    active={section.name === active}
                  />
                );
            })}
          </section>

          <article className="h-full w-full px-0.5 pt-16">{children}</article>
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
          : "cursor-pointer text-primary/80 hover:bg-secondary/20",
        "flex h-16 w-auto select-none items-center justify-start gap-8 px-6 text-xl transition-all"
      )}
    >
      <section.icon className="size-8 min-w-fit" />
      {section.name}
    </Link>
  );
};
