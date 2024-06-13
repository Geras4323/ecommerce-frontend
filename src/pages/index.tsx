import Link from "next/link";
import { GeneralLayout } from "src/layouts/general";
import { useSession } from "@/hooks/session";
import { useQuery } from "@tanstack/react-query";
import { getImages } from "@/functions/images";
import { type ServerError } from "@/types/types";
import { VerticalImageMarquee } from "@/components/verticalImageMarquee";
import { cn } from "@/utils/lib";
import { Arizonia } from "next/font/google";
import {
  AlertTriangle,
  LogIn,
  LogOut,
  Package,
  Table2,
  UserRoundPlus,
} from "lucide-react";
import { LoadableButton } from "@/components/forms";

const arizonia = Arizonia({ weight: ["400"], subsets: ["latin"] });

const IMAGES_LIMIT = 16;

export default function Home() {
  const { session, logoutMutation } = useSession();

  const imagesQuery = useQuery<
    Awaited<ReturnType<typeof getImages>>,
    ServerError
  >({
    queryKey: ["images"],
    queryFn: () => getImages(IMAGES_LIMIT),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const imagesUrls = imagesQuery.data?.map((image) => image.url);

  const firstMarqueeUrls = imagesUrls?.slice(0, IMAGES_LIMIT / 2);
  const secondMarqueeUrls = imagesUrls?.slice(IMAGES_LIMIT / 2, IMAGES_LIMIT);

  return (
    <GeneralLayout title="Home" description="This is the home">
      <div className="flex h-screen w-screen flex-row items-center justify-between">
        <div className="relative hidden h-full w-1/4 flex-row items-center justify-center gap-4 overflow-hidden px-3 shadow-2xl md:flex">
          {imagesQuery.isError ? (
            <div className="relative flex w-full flex-col items-center justify-center gap-4 px-4 text-error">
              <AlertTriangle className="absolute mb-8 size-48 min-w-48 opacity-15" />
              <p className="w-full truncate whitespace-pre-wrap text-center text-xl text-error">
                {imagesQuery.error.response?.data.comment}
              </p>
            </div>
          ) : (
            <>
              <VerticalImageMarquee
                speed={"slow"}
                urls={
                  firstMarqueeUrls ??
                  Array.from({ length: IMAGES_LIMIT / 2 }).map(() => "")
                }
              />

              <VerticalImageMarquee
                speed={"medium"}
                urls={
                  secondMarqueeUrls ??
                  Array.from({ length: IMAGES_LIMIT / 2 }).map(() => "")
                }
              />
            </>
          )}
        </div>

        <div className="flex h-auto w-full flex-row justify-center md:w-3/4">
          <div className="flex w-full flex-col items-center">
            <h1
              className={cn(
                arizonia.className,
                "mb-12 select-none text-5xl text-primary md:text-6xl xl:text-7xl"
              )}
            >
              Mis Ideas Pintadas
            </h1>

            <div className="flex w-full max-w-sm flex-col px-8 sm:px-0">
              {session.data ? (
                <div className="flex w-full flex-col gap-4">
                  {session.data.role === "admin" && (
                    <Link
                      href="/administration"
                      className="btn btn-primary gap-3 shadow-button"
                    >
                      <Table2 className="size-5" />
                      Administración
                    </Link>
                  )}
                  <Link
                    href="/showroom"
                    className="btn btn-primary gap-3 shadow-button"
                    style={{
                      boxShadow:
                        "0 3px 5px rgba(0,0,0, .2), 0 5px 10px rgba(0,0,0, .1)",
                    }}
                  >
                    <Package className="size-5" />
                    Ir al showroom
                  </Link>
                  <hr className="border-b border-t-0 border-b-secondary/30" />
                  <LoadableButton
                    onClick={() => logoutMutation.mutate()}
                    isPending={logoutMutation.isPending}
                    className="btn btn-outline btn-secondary w-96 gap-3 shadow-button"
                  >
                    <LogOut className="size-5" />
                    Cerrar sesión
                  </LoadableButton>
                </div>
              ) : (
                <div className="group flex w-full flex-col gap-4">
                  <Link
                    href="/sign"
                    className="btn btn-primary gap-3 shadow-button"
                  >
                    <LogIn className="size-5" />
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/sign?action=signup"
                    className="btn btn-outline btn-secondary gap-3 shadow-button"
                  >
                    <UserRoundPlus className="size-5" />
                    Registrarse
                  </Link>
                  <hr className="border-b border-t-0 border-b-secondary/30" />
                  <Link
                    href="/showroom"
                    className="btn btn-outline btn-secondary gap-3 shadow-button"
                  >
                    <Package className="size-5" />
                    Ir al showroom
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
}

{
  /* <VerticalImageMarquee
    speed={"slow"}
    urls={[
      "https://5.imimg.com/data5/LW/GN/MY-4990337/bath-soap-500x500.jpg",
      "https://ae01.alicdn.com/kf/He1a1c6a2db39447f9e9e33e7a21351a13.jpg",
      "https://m.media-amazon.com/images/I/71TawoxTk6L._UY500_.jpg",
      "https://m.media-amazon.com/images/I/71AVijzvhNL._UX569_.jpg",
      "https://indyschild.com/wp-content/uploads/2016/12/AdobeStock_96977357.jpeg",
      "https://m.media-amazon.com/images/I/41vbmwe7e4L._SY450_.jpg",
      "https://www.ikea.com/us/en/images/products/arkelstorp-desk-black__0735967_pe740301_s5.jpg?f=s",
      "https://cdn-learn.adafruit.com/assets/assets/000/001/161/medium800/led_strips_digitalledstrip.jpg?1396769336",
    ]}
  /> */
}

{
  /* <VerticalImageMarquee
    speed={"medium"}
    urls={[
      "https://i5.walmartimages.ca/images/Large/735/328/6000196735328.jpg",
      "https://m.media-amazon.com/images/I/41Glq0rVOvS._SY445_.jpg",
      "https://beardoi.s3.ap-south-1.amazonaws.com/uploads/3642-compact-sheesham-beard-comb-512x512.jpg",
      "https://i0.wp.com/recargasrafaela.com.ar/wp-content/uploads/2022/01/fox_relok_m6pro.jpg",
      "https://m.media-amazon.com/images/I/418QpEn9JKL._SX425_.jpg",
      "https://www.collinsdictionary.com/images/full/sock_99256316_1000.jpg",
      "https://images.fravega.com/f300/c453eec4f43bd55572ef32816f0dc7de.jpg",
      "https://secure.img1-fg.wfcdn.com/im/64150170/resize-h310-w310%5Ecompr-r85/1591/159162856/floral-single-shower-curtain-hooks.jpg",
    ]}
  /> */
}
