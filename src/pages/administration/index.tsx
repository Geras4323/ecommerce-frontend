import { withAuth } from "@/functions/session";
import { getVacationState } from "@/functions/states";
import { sections } from "@/layouts/administration";
import { GeneralLayout } from "@/layouts/general";
import { vars } from "@/utils/vars";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { TreePalm } from "lucide-react";
import Link from "next/link";

export default function Administration() {
  const queryClient = useQueryClient();

  const vacationStateQuery = useQuery({
    queryKey: ["vacation"],
    queryFn: getVacationState,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const updateVacationStateMutation = useMutation({
    mutationFn: async () => {
      const url = `${vars.serverUrl}/api/v1/states/vacation`;
      return axios.patch(
        url,
        { active: !vacationStateQuery.data?.active },
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacation"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_showroom"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_header"] });
      queryClient.invalidateQueries({ queryKey: ["vacation_cart"] });
    },
  });

  return (
    <GeneralLayout title="Administración" description="Administración">
      <div className="mx-auto flex h-screen w-screen max-w-screen-sm flex-col place-content-start gap-4 px-12 pt-24 lg:max-w-screen-lg">
        <h1 className="text-xl font-medium tracking-wide">ADMINISTRACIÓN</h1>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {sections.map(
            (section) =>
              !section.disabled && (
                <Link
                  key={section.name}
                  href={section.url}
                  className="flex aspect-square size-full flex-col items-center justify-center gap-4 rounded-lg border-4 border-double border-secondary/20 text-secondary transition-all hover:border-solid hover:border-primary/10 hover:text-primary"
                  style={{
                    boxShadow:
                      "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
                  }}
                >
                  <section.icon className="size-7 sm:size-8 md:size-9" />
                  <span className="text-md xxs:text-lg xs:text-xl">
                    {section.name}
                  </span>
                </Link>
              )
          )}
          <div
            className="flex aspect-square size-full flex-col items-center justify-center gap-4 rounded-lg border-4 border-double border-secondary/20 text-secondary transition-all hover:border-solid hover:border-primary/10 hover:text-primary"
            style={{
              boxShadow:
                "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
            }}
          >
            <TreePalm className="size-7 sm:size-8 md:size-9" />
            <span className="text-md w-fit text-center xxs:text-lg xs:text-xl">
              Modo Vacaciones
            </span>
            <input
              type="checkbox"
              className="checkbox"
              readOnly
              checked={vacationStateQuery.data?.active}
              disabled={updateVacationStateMutation.isPending}
              onChange={() => updateVacationStateMutation.mutate()}
            />
          </div>
        </section>
      </div>
    </GeneralLayout>
  );
}

export const getServerSideProps = withAuth("admin");
