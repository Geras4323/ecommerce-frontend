import { GeneralLayout } from "@/layouts/GeneralLayout";
import type { WithChildren } from "@/types/types";
import { cn } from "@/utils/lib";
import {
  type LucideIcon,
  Boxes,
  ClipboardList,
  CreditCard,
  Package,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

type Section = {
  name: string;
  url: string;
  icon: LucideIcon;
};

type SectionName = (typeof sections)[number]["name"];

const sections = [
  {
    name: "Proveedores",
    url: "/administration/suppliers",
    icon: ClipboardList,
  },
  {
    name: "Categorías",
    url: "/administration/categories",
    icon: Boxes,
  },
  {
    name: "Productos",
    url: "/administration/products",
    icon: Package,
  },
  {
    name: "Usuarios",
    url: "/administration/users",
    icon: UsersRound,
  },
  {
    name: "Pedidos",
    url: "/administration/orders",
    icon: CreditCard,
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
        <div className="flex min-h-screen w-full">
          <article className="relative z-10 h-auto w-20 min-w-20 bg-red-200/20">
            <section className="sticky left-0 top-16 flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden border-r border-r-secondary/20 bg-base-100 transition-all hover:w-72">
              {sections.map((section) => (
                <SectionItem
                  key={section.name}
                  section={section}
                  active={section.name === active}
                />
              ))}
            </section>
          </article>

          <article className="h-full w-full px-4 pb-4 pt-20">
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
      href={section.url}
      className={cn(
        active && "bg-secondary/20",
        "flex h-16 w-auto cursor-pointer select-none items-center justify-start gap-8 px-6 text-xl text-primary/80 transition-all hover:bg-secondary/20"
      )}
    >
      <section.icon className="size-8 min-w-fit" />
      {section.name}
    </Link>
  );
};
