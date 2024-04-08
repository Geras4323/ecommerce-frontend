import Logo from "../../public/logoNB.png";
import Image from "next/image";
import Link from "next/link";
import { GeneralLayout } from "src/layouts/GeneralLayout";
import { useSession } from "@/hooks/session";
import { useQuery } from "@tanstack/react-query";
import { getImages } from "@/functions/images";
import { type ServerError } from "@/types/types";
import { VerticalImageMarquee } from "@/components/verticalImageMarquee";

export default function Home() {
  const { session, logoutMutation } = useSession();

  const imagesQuery = useQuery<
    Awaited<ReturnType<typeof getImages>>,
    ServerError
  >({
    queryKey: ["images"],
    queryFn: getImages,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const firstMarqueeUrls = imagesQuery.data?.map((image) => image.url);
  const secondMarqueeUrls = firstMarqueeUrls?.toReversed();

  return (
    <GeneralLayout title="Home" description="This is the home">
      <div className="flex h-screen w-screen flex-row items-center justify-between">
        <div className="relative hidden h-full w-1/4 flex-row gap-4 overflow-hidden px-3 shadow-2xl md:flex">
          {/* <VerticalImageMarquee
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
          /> */}
          {firstMarqueeUrls && (
            <VerticalImageMarquee speed={"slow"} urls={firstMarqueeUrls} />
          )}

          {secondMarqueeUrls && (
            <VerticalImageMarquee speed={"medium"} urls={secondMarqueeUrls} />
          )}
          {/* <VerticalImageMarquee
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
          /> */}
        </div>

        <div className="flex h-auto w-full flex-row justify-center md:w-3/4">
          <div className="flex w-full max-w-sm flex-col items-center">
            <Image
              alt="logo"
              src={Logo}
              width={700}
              height={300}
              draggable={false}
              className="w-screen max-w-xl select-none"
            />

            <div className="flex w-full flex-col">
              {session.data ? (
                <div className="flex w-full flex-col gap-4 [&>*]:hover:shadow-lg">
                  {session.data.role === "admin" && (
                    <Link
                      href="/administration/categories"
                      className="btn btn-primary"
                    >
                      Administración
                    </Link>
                  )}
                  <Link href="/showroom" className="btn btn-primary">
                    Ir al showroom
                  </Link>
                  <hr className="border-b border-t-0 border-b-secondary/30" />
                  <button
                    onClick={() => logoutMutation.mutate()}
                    className="btn btn-outline"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-4 [&>*]:hover:shadow-lg">
                  <Link href="/sign" className="btn btn-primary">
                    Iniciar sesión
                  </Link>
                  <Link href="/sign?action=signup" className="btn btn-outline">
                    Registrarse
                  </Link>
                  <hr className="border-b border-t-0 border-b-secondary/30" />
                  <Link href="/showroom" className="btn btn-outline">
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
