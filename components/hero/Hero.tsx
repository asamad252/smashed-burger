"use client";
import {
  LoadingBreadcrumb,
} from "@/components/ui/animated-loading-svg-text-shimmer";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type HeroItem = {
  image: string;
  label: string;
  type: "burger" | "fries";
};

/* =========================================================
   SHUFFLE
========================================================= */

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/* =========================================================
   GET ALL IMAGES FROM SUPABASE BUCKET
========================================================= */

async function getBucketImages(bucketName: string) {
  const allFiles: any[] = [];

  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list("", {
        limit,
        offset,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (error) {
      console.error(`Error loading ${bucketName}:`, error);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    /* Only image files */
    const files = data.filter((file) =>
      /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name)
    );

    allFiles.push(...files);

    if (data.length < limit) {
      break;
    }

    offset += limit;
  }

  /* Convert file names into public URLs */
  return allFiles.map((file) => {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(file.name);

    return {
      name: file.name,
      url: data.publicUrl,
    };
  });
}

/* =========================================================
   HERO
========================================================= */

export default function Hero() {
  const router = useRouter();

  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD IMAGES
  ======================================================= */

  useEffect(() => {
    async function loadHeroImages() {
      try {
        setLoading(true);

        /* Get both buckets */

        const [burgerImages, friesImages] = await Promise.all([
          getBucketImages("burger"),
          getBucketImages("fries"),
        ]);

        console.log("Burger images:", burgerImages);
        console.log("Fries images:", friesImages);

        /* Randomize burger images */

        const shuffledBurgers = shuffleArray(burgerImages);
        const shuffledFries = shuffleArray(friesImages);

        /* Pick 4 random burgers */

        const selectedBurgers: HeroItem[] = shuffledBurgers
          .slice(0, 4)
          .map((item) => ({
            image: item.url,

            label: item.name
              .replace(/\.(jpg|jpeg|png|webp|gif|avif)$/i, "")
              .replaceAll("-", " ")
              .replaceAll("_", " ")
              .toUpperCase(),

            type: "burger",
          }));

        /* Pick 1 random fries */

        const selectedFries: HeroItem[] = shuffledFries
          .slice(0, 1)
          .map((item) => ({
            image: item.url,

            label: item.name
              .replace(/\.(jpg|jpeg|png|webp|gif|avif)$/i, "")
              .replaceAll("-", " ")
              .replaceAll("_", " ")
              .toUpperCase(),

            type: "fries",
          }));

        /*
          IMPORTANT:

          Randomize only the burgers.

          Fries is appended at the end,
          so fries will ALWAYS be panel #5.
        */

        const finalItems: HeroItem[] = [
          ...shuffleArray(selectedBurgers),
          ...selectedFries,
        ];

        console.log("Final Hero Items:", finalItems);

        setHeroItems(finalItems);

        /* Random expanded burger initially */

        if (finalItems.length > 0) {
          const burgerCount = selectedBurgers.length;

          if (burgerCount > 0) {
            setActiveIndex(
              Math.floor(Math.random() * burgerCount)
            );
          }
        }
      } catch (error) {
        console.error("Hero image error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHeroImages();
  }, []);

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#F1E5A1]
        px-6
        py-12
        lg:px-12
        lg:py-16
      "
    >
      <div
        className="
          mx-auto
          grid
          min-h-[calc(100vh-92px)]
          max-w-[1440px]
          grid-cols-1
          items-center
          gap-12
          lg:grid-cols-[0.85fr_1.15fr]
        "
      >
        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div className="relative z-10">

          {/* HEADING */}

          <motion.h1
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.6,
            }}
            className="
              text-[4rem]
              font-black
              leading-[0.84]
              tracking-[-0.065em]
              text-[#8B2626]
              sm:text-[5rem]
              lg:text-[6.5rem]
            "
          >
            YOUR
            <br />

            <span className="text-[#EF6905]">
              BURGER.
            </span>

            <br />

            YOUR RULES.
          </motion.h1>

          {/* DESCRIPTION */}

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
              duration: 0.6,
            }}
            className="
              mt-7
              max-w-[520px]
              text-base
              font-medium
              leading-7
              text-[#8B2626]/70
            "
          >
            Pick one of our signature smashed burgers or build your
            own from the bun up. Your toppings, your sauce, your rules.
          </motion.p>

          {/* BUTTONS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
              duration: 0.6,
            }}
            className="
              mt-9
              flex
              flex-wrap
              gap-3
            "
          >
            {/* BUILD */}

            <motion.button
              onClick={() => router.push("/build")}
              whileHover={{
                y: -3,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="
                flex
                items-center
                gap-3
                rounded-full
                bg-[#EF6905]
                px-7
                py-4
                text-sm
                font-black
                tracking-wide
                text-[#F1E5A1]
              "
            >
              BUILD YOUR BURGER

              <ArrowRight size={19} />
            </motion.button>

            {/* MENU */}

            <motion.button
              onClick={() => router.push("/menu")}
              whileHover={{
                backgroundColor: "#8B2626",
                color: "#F1E5A1",
                y: -3,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="
                rounded-full
                border-2
                border-[#8B2626]
                px-7
                py-4
                text-sm
                font-black
                tracking-wide
                text-[#8B2626]
              "
            >
              VIEW MENU
            </motion.button>
          </motion.div>
        </div>

        {/* =================================================
            RIGHT IMAGE GALLERY
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: 50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.7,
          }}
          className="
            relative
            h-[480px]
            w-full
            lg:h-[600px]
          "
        >
          {/* ===============================================
              LOADING
          =============================================== */}

        {loading && (
  <div
    className="
      flex
      h-full
      w-full
      items-center
      justify-center
      rounded-[24px]
      bg-[#8B2626]
    "
  >
    <LoadingBreadcrumb
      text="Cooking Something Good"
      variant="dark"
    />
  </div>
)}
          {/* ===============================================
              IMAGES
          =============================================== */}

          {!loading && heroItems.length > 0 && (
            <div
              className="
                flex
                h-full
                w-full
                gap-3
              "
            >
              {heroItems.map((item, index) => {
                const active = activeIndex === index;

                return (
                  <motion.div
                    key={`${item.type}-${item.image}`}

                    onMouseEnter={() =>
                      setActiveIndex(index)
                    }

                    onClick={() =>
                      setActiveIndex(index)
                    }

                    animate={{
                      flex: active ? 5 : 1,
                    }}

                    transition={{
                      type: "spring",
                      stiffness: 170,
                      damping: 22,
                    }}

                    className="
                      group
                      relative
                      min-w-0
                      cursor-pointer
                      overflow-hidden
                      rounded-[24px]
                      bg-[#8B2626]
                    "
                  >
                    {/* IMAGE */}

                    <img
                      src={item.image}
                      alt={
                        item.type === "burger"
                          ? "Smashed Burger"
                          : "Loaded Fries"
                      }
                      draggable={false}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-105
                      "
                    />

                    {/* DARK OVERLAY */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-[#8B2626]/55
                        via-transparent
                        to-black/5
                      "
                    />

                    {/* ===================================
                        TOP BADGE

                        No filename/product name below image.
                    =================================== */}

                    
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ===============================================
              NO IMAGES
          =============================================== */}

          {!loading && heroItems.length === 0 && (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                rounded-[24px]
                bg-[#8B2626]
              "
            >
              <div className="text-center">
                <p
                  className="
                    text-lg
                    font-black
                    text-[#F1E5A1]
                  "
                >
                  BURGER IMAGES
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    text-[#F1E5A1]/60
                  "
                >
                  Images will appear from Supabase here.
                </p>
              </div>
            </div>
          )}

          {/* GREEN DECORATION */}

          <div
            className="
              absolute
              -bottom-5
              -right-5
              -z-10
              h-[150px]
              w-[150px]
              rounded-full
              bg-[#486C2F]
            "
          />
        </motion.div>
      </div>
    </section>
  );
}