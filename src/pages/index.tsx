import { VerticalImageMarquee } from "@/components/verticalImageMarquee";
import Logo from "../../public/logoNB.png";
import Image from "next/image";
import Link from "next/link";
import { GeneralLayout } from "src/layouts/GeneralLayout";
import { useSession } from "@/hooks/session";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  function signOut() {
    Cookies.remove("ec_session", {
      path: "/",
    });
    router.reload();
  }

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
          />

          <VerticalImageMarquee
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
              {session ? (
                <div className="flex w-full flex-col gap-4 [&>*]:hover:shadow-lg">
                  <Link
                    href="/administration/categories"
                    className="btn btn-primary"
                  >
                    Administration
                  </Link>
                  <Link href="/showroom" className="btn btn-primary">
                    Go to Showroom
                  </Link>
                  <hr />
                  <button onClick={signOut} className="btn btn-outline">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-4 [&>*]:hover:shadow-lg">
                  <Link href="/login" className="btn btn-primary">
                    Login
                  </Link>
                  <Link href="/showroom" className="btn btn-primary">
                    Go to Showroom
                  </Link>
                </div>
              )}
            </div>

            {/* <div className="w-full text-lg">
              {session ? (
                <section className="flex flex-col gap-4">
                  <p className="text-secondary">
                    Welcome{" "}
                    <b className="text-primary/90">
                      {session.first_name} {session.last_name}
                    </b>
                  </p>

                  {session.role === "admin" && (
                    <div
                      className="btn btn-outline"
                    >
                      Administration
                    </div>
                  )}

                  <div onClick={signOut} className="btn btn-outline">
                    Sign out
                  </div>
                </section>
              ) : (
                <section className="flex w-full flex-col items-center gap-3 text-center">
                  <Link href="/login" className="btn btn-primary w-full">
                    Login
                  </Link>
                  <Link
                    href="/auth/create-account"
                    className="btn btn-outline w-full"
                  >
                    Sign up
                  </Link>
                </section>
              )}
            </div> */}

            {/* <Link href="/showroom" className="btn btn-primary w-full">
              Go to Showroom
            </Link> */}
          </div>
        </div>
      </div>
    </GeneralLayout>
  );
}
