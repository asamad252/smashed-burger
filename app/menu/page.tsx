"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

import { supabase } from "@/lib/supabase";

import {
  LoadingBreadcrumb,
} from "@/components/ui/animated-loading-svg-text-shimmer";

import SlideTextButton from "@/components/ui/slide-text-button";

/* =========================================================
   DATABASE TYPES
========================================================= */

type MenuCategory =
  | "burger"
  | "fries"
  | "drink";

type MenuItem = {
  id: string;

  name: string;

  category: MenuCategory;

  price: number | string;

  description: string | null;

  storage_bucket: string;

  image_name: string;

  available: boolean;

  sort_order: number;
};

/* =========================================================
   CAROUSEL TYPE
========================================================= */

type Slide = {
  id: string;

  src: string;

  alt: string;

  title: string;

  price: number;

  description?: string | null;
};

/* =========================================================
   CREATE PUBLIC STORAGE URL
========================================================= */

function getImageUrl(
  item: MenuItem
) {
  const { data } =
    supabase.storage
      .from(
        item.storage_bucket
      )
      .getPublicUrl(
        item.image_name
      );

  return data.publicUrl;
}

/* =========================================================
   DATABASE ITEM -> SLIDE
========================================================= */

function menuItemToSlide(
  item: MenuItem
): Slide {
  return {
    id:
      item.id,

    src:
      getImageUrl(
        item
      ),

    alt:
      item.name,

    title:
      item.name,

    price:
      Number(
        item.price
      ),

    description:
      item.description,
  };
}

/* =========================================================
   COVERFLOW CAROUSEL
========================================================= */

function CoverflowCarousel({
  slides,

  rotate = 44,

  depth = 0.6,

  perspective = 3,

  falloff = 0.56,

  fade = 0.1,

  cardWidth =
    "clamp(190px, 24vw, 330px)",

  gap = 0.06,

  loop = true,

  onAddToCart,

  addingItemId,

  addedItemId,
}: {
  slides: Slide[];

  rotate?: number;

  depth?: number;

  perspective?: number;

  falloff?: number;

  fade?: number;

  cardWidth?: string;

  gap?: number;

  loop?: boolean;

  onAddToCart: (
    slide: Slide
  ) => void;

  addingItemId:
    | string
    | null;

  addedItemId:
    | string
    | null;
}) {
  const count =
    slides.length;

  const frameRef =
    React.useRef<HTMLDivElement>(
      null
    );

  const cardRefs =
    React.useRef<
      (
        | HTMLDivElement
        | null
      )[]
    >([]);

  const posRef =
    React.useRef(0);

  const targetRef =
    React.useRef(0);

  const widthRef =
    React.useRef(0);

  const rafRef =
    React.useRef<
      number | null
    >(null);

  const dragRef =
    React.useRef<{
      id: number;
      x: number;
      pos: number;
      v: number;
      t: number;
    } | null>(null);

  const [
    selected,
    setSelected,
  ] =
    React.useState(0);

  /* =======================================================
     RESET WHEN SLIDES CHANGE
  ======================================================= */

  React.useEffect(() => {
    posRef.current =
      0;

    targetRef.current =
      0;

    setSelected(
      0
    );
  }, [slides]);

  /* =======================================================
     INDEX
  ======================================================= */

  const indexAt =
    React.useCallback(
      (
        pos: number
      ) => {
        if (!count) {
          return 0;
        }

        return (
          ((Math.round(
            pos
          ) %
            count) +
            count) %
          count
        );
      },
      [count]
    );

  /* =======================================================
     POSITION CARDS
  ======================================================= */

  const paint =
    React.useCallback(
      () => {
        const width =
          widthRef.current;

        if (
          !width ||
          !count
        ) {
          return;
        }

        const pitch =
          width *
          (1 + gap);

        const pos =
          posRef.current;

        cardRefs.current.forEach(
          (
            card,
            index
          ) => {
            if (!card) {
              return;
            }

            let offset =
              index -
              pos;

            if (loop) {
              offset =
                ((offset %
                  count) +
                  count) %
                count;

              if (
                offset >
                count / 2
              ) {
                offset -=
                  count;
              }
            }

            const distance =
              Math.abs(
                offset
              );

            const ramp =
              Math.pow(
                distance,
                falloff
              );

            const tilt =
              Math.min(
                rotate *
                  ramp,
                82
              ) *
              Math.sign(
                offset
              );

            card.style.transform =
              `translateX(calc(-50% + ${
                offset *
                pitch
              }px)) ` +
              `translateZ(${
                -depth *
                width *
                ramp
              }px) ` +
              `rotateY(${
                -tilt
              }deg)`;

            const edge =
              loop
                ? Math.min(
                    1,
                    Math.max(
                      0,
                      count /
                        2 -
                        distance
                    )
                  )
                : 1;

            card.style.opacity =
              String(
                Math.max(
                  0,
                  1 -
                    fade *
                      distance
                ) *
                  edge
              );

            card.style.zIndex =
              String(
                100 -
                  Math.round(
                    distance
                  )
              );
          }
        );
      },
      [
        count,
        depth,
        fade,
        falloff,
        gap,
        loop,
        rotate,
      ]
    );

  /* =======================================================
     SETTLE
  ======================================================= */

  const settle =
    React.useCallback(
      (
        target: number
      ) => {
        if (
          rafRef.current !==
          null
        ) {
          cancelAnimationFrame(
            rafRef.current
          );
        }

        targetRef.current =
          target;

        setSelected(
          indexAt(
            target
          )
        );

        const step =
          () => {
            const remaining =
              target -
              posRef.current;

            if (
              Math.abs(
                remaining
              ) <
              0.0004
            ) {
              posRef.current =
                target;

              paint();

              rafRef.current =
                null;

              return;
            }

            posRef.current +=
              remaining *
              0.16;

            paint();

            rafRef.current =
              requestAnimationFrame(
                step
              );
          };

        rafRef.current =
          requestAnimationFrame(
            step
          );
      },
      [
        indexAt,
        paint,
      ]
    );

  /* =======================================================
     CLAMP
  ======================================================= */

  const clamp =
    React.useCallback(
      (
        pos: number
      ) => {
        if (!count) {
          return 0;
        }

        if (loop) {
          return pos;
        }

        return Math.max(
          0,
          Math.min(
            count - 1,
            pos
          )
        );
      },
      [
        count,
        loop,
      ]
    );

  /* =======================================================
     GO TO
  ======================================================= */

  const goTo =
    React.useCallback(
      (
        index: number
      ) => {
        if (!count) {
          return;
        }

        const target =
          loop
            ? index +
              Math.round(
                (targetRef.current -
                  index) /
                  count
              ) *
                count
            : index;

        settle(
          clamp(
            target
          )
        );
      },
      [
        clamp,
        count,
        loop,
        settle,
      ]
    );

  /* =======================================================
     NEXT / PREVIOUS
  ======================================================= */

  const nudge =
    React.useCallback(
      (
        amount: number
      ) => {
        if (!count) {
          return;
        }

        settle(
          clamp(
            Math.round(
              targetRef.current
            ) +
              amount
          )
        );
      },
      [
        clamp,
        count,
        settle,
      ]
    );

  /* =======================================================
     DRAG START
  ======================================================= */

  function onPointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      rafRef.current !==
      null
    ) {
      cancelAnimationFrame(
        rafRef.current
      );

      rafRef.current =
        null;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    targetRef.current =
      posRef.current;

    dragRef.current = {
      id:
        event.pointerId,

      x:
        event.clientX,

      pos:
        posRef.current,

      v:
        0,

      t:
        performance.now(),
    };
  }

  /* =======================================================
     DRAG MOVE
  ======================================================= */

  function onPointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const drag =
      dragRef.current;

    if (
      !drag ||
      drag.id !==
        event.pointerId
    ) {
      return;
    }

    const pitch =
      widthRef.current *
      (1 + gap);

    if (!pitch) {
      return;
    }

    const now =
      performance.now();

    const previous =
      posRef.current;

    posRef.current =
      clamp(
        drag.pos -
          (event.clientX -
            drag.x) /
            pitch
      );

    drag.v =
      ((posRef.current -
        previous) /
        Math.max(
          now -
            drag.t,
          1
        )) *
      1000;

    drag.t =
      now;

    const index =
      indexAt(
        posRef.current
      );

    if (
      index !==
      selected
    ) {
      setSelected(
        index
      );
    }

    paint();
  }

  /* =======================================================
     DRAG END
  ======================================================= */

  function endDrag(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const drag =
      dragRef.current;

    if (
      !drag ||
      drag.id !==
        event.pointerId
    ) {
      return;
    }

    dragRef.current =
      null;

    const carried =
      Math.max(
        -2,
        Math.min(
          2,
          drag.v *
            0.18
        )
      );

    settle(
      clamp(
        Math.round(
          posRef.current +
            carried
        )
      )
    );
  }

  /* =======================================================
     MEASURE
  ======================================================= */

  React.useLayoutEffect(
    () => {
      const frame =
        frameRef.current;

      if (!frame) {
        return;
      }

      const measure =
        () => {
          const card =
            cardRefs.current[
              0
            ];

          if (!card) {
            return;
          }

          widthRef.current =
            card.offsetWidth;

          paint();
        };

      measure();

      const observer =
        new ResizeObserver(
          measure
        );

      observer.observe(
        frame
      );

      return () => {
        observer.disconnect();
      };
    },
    [
      paint,
      slides,
    ]
  );

  /* =======================================================
     CLEANUP
  ======================================================= */

  React.useEffect(
    () => {
      return () => {
        if (
          rafRef.current !==
          null
        ) {
          cancelAnimationFrame(
            rafRef.current
          );
        }
      };
    },
    []
  );

  /* =======================================================
     ACTIVE PRODUCT
  ======================================================= */

  const active =
    slides[selected];

  if (!count) {
    return null;
  }

  return (
    <div
      className="w-full"
      style={
        {
          "--cf-card":
            cardWidth,
        } as React.CSSProperties
      }
    >
      {/* =================================================
          CAROUSEL
      ================================================= */}

      <div className="relative">
        <div
          ref={
            frameRef
          }
          tabIndex={
            0
          }
          onPointerDown={
            onPointerDown
          }
          onPointerMove={
            onPointerMove
          }
          onPointerUp={
            endDrag
          }
          onPointerCancel={
            endDrag
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "ArrowLeft"
            ) {
              event.preventDefault();

              nudge(-1);
            }

            if (
              event.key ===
              "ArrowRight"
            ) {
              event.preventDefault();

              nudge(1);
            }
          }}
          className="
            cursor-grab
            overflow-hidden
            py-10
            outline-none
            active:cursor-grabbing
          "
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction:
              "pan-y",
          }}
        >
          <div
            className="
              relative
              select-none
            "
            style={{
              height:
                "calc(var(--cf-card) * 1.2)",

              transformStyle:
                "preserve-3d",
            }}
          >
            {slides.map(
              (
                slide,
                index
              ) => (
                <div
                  key={
                    slide.id
                  }
                  ref={(
                    node
                  ) => {
                    cardRefs.current[
                      index
                    ] =
                      node;
                  }}
                  role="group"
                  aria-label={`${
                    index +
                    1
                  } of ${count}`}
                  className="
                    absolute
                    left-1/2
                    top-0
                    aspect-[5/6]
                    overflow-hidden
                    rounded-[28px]
                    bg-[#F1E5A1]
                    shadow-[0_18px_60px_rgba(0,0,0,0.3)]
                    will-change-transform
                  "
                  style={{
                    width:
                      "var(--cf-card)",
                  }}
                >
                  <img
                    src={
                      slide.src
                    }
                    alt={
                      slide.alt
                    }
                    draggable={
                      false
                    }
                    className="
                      h-full
                      w-full
                      select-none
                      object-cover
                    "
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* PREVIOUS */}

        {count >
          1 && (
          <button
            type="button"
            aria-label="Previous item"
            onClick={() =>
              nudge(
                -1
              )
            }
            className="
              absolute
              left-3
              top-1/2
              z-[200]
              flex
              h-11
              w-11
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-[#F1E5A1]
              text-[#8B2626]
              shadow-xl
              transition-all
              duration-200
              hover:scale-110
              hover:bg-[#EF6905]
              hover:text-[#F1E5A1]
            "
          >
            <ChevronLeft
              size={
                22
              }
            />
          </button>
        )}

        {/* NEXT */}

        {count >
          1 && (
          <button
            type="button"
            aria-label="Next item"
            onClick={() =>
              nudge(
                1
              )
            }
            className="
              absolute
              right-3
              top-1/2
              z-[200]
              flex
              h-11
              w-11
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-[#F1E5A1]
              text-[#8B2626]
              shadow-xl
              transition-all
              duration-200
              hover:scale-110
              hover:bg-[#EF6905]
              hover:text-[#F1E5A1]
            "
          >
            <ChevronRight
              size={
                22
              }
            />
          </button>
        )}
      </div>

      {/* =================================================
          PRODUCT INFO
      ================================================= */}

      {active && (
        <div
          key={
            active.id
          }
          className="
            mx-auto
            mt-1
            flex
            max-w-[480px]
            flex-col
            items-center
            px-5
            text-center
          "
        >
          {/* NAME */}

          <h3
            className="
              text-2xl
              font-black
              uppercase
              tracking-[-0.035em]
              text-[#F1E5A1]
            "
          >
            {
              active.title
            }
          </h3>

          {/* PRICE */}

          <p
            className="
              mt-1
              text-lg
              font-black
              text-[#EF6905]
            "
          >
            Rs.{" "}
            {active.price.toLocaleString()}
          </p>

          {/* DESCRIPTION */}

          {active.description && (
            <p
              className="
                mt-3
                text-sm
                leading-6
                text-[#F1E5A1]/60
              "
            >
              {
                active.description
              }
            </p>
          )}

          {/* =================================================
              ADD TO CART
          ================================================= */}

          <div className="mt-5">
            <SlideTextButton
              text={
                addingItemId ===
                active.id
                  ? "ADDING..."
                  : addedItemId ===
                      active.id
                    ? "ADDED!"
                    : "ADD TO CART"
              }
              hoverText={
                addingItemId ===
                active.id
                  ? "PLEASE WAIT"
                  : "CHECKOUT NOW"
              }
              disabled={
                addingItemId ===
                active.id
              }
              onClick={() =>
                onAddToCart(
                  active
                )
              }
              className="
                bg-[#EF6905]
                text-[#F1E5A1]
                shadow-[0_8px_24px_rgba(239,105,5,0.22)]
                hover:bg-[#d95d04]
              "
            />
          </div>
        </div>
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {count >
        1 && (
        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
          "
        >
          {slides.map(
            (
              slide,
              index
            ) => (
              <button
                key={
                  slide.id
                }
                type="button"
                aria-label={`Go to ${slide.title}`}
                onClick={() =>
                  goTo(
                    index
                  )
                }
                className={`
                  h-2
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    selected ===
                    index
                      ? "w-7 bg-[#EF6905]"
                      : "w-2 bg-[#F1E5A1]/25 hover:bg-[#F1E5A1]/60"
                  }
                `}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CATEGORY TITLE
========================================================= */

function CategoryTitle({
  small,
  title,
}: {
  small: string;
  title: string;
}) {
  return (
    <div
      className="
        mx-auto
        mb-3
        max-w-[1300px]
        text-center
      "
    >
      <p
        className="
          text-[10px]
          font-black
          tracking-[0.25em]
          text-[#EF6905]
        "
      >
        {small}
      </p>

      <h2
        className="
          mt-1
          text-4xl
          font-black
          uppercase
          tracking-[-0.045em]
          text-[#F1E5A1]
          md:text-5xl
        "
      >
        {title}
      </h2>
    </div>
  );
}

/* =========================================================
   MENU PAGE
========================================================= */

export default function MenuPage() {
  const router =
    useRouter();

  const [
    menuItems,
    setMenuItems,
  ] =
    React.useState<
      MenuItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    React.useState(
      true
    );

  const [
    error,
    setError,
  ] =
    React.useState<
      string | null
    >(null);

  /* =======================================================
     CART STATES
  ======================================================= */

  const [
    loginDialogOpen,
    setLoginDialogOpen,
  ] =
    React.useState(
      false
    );

  const [
    addingItemId,
    setAddingItemId,
  ] =
    React.useState<
      string | null
    >(null);

  const [
    addedItemId,
    setAddedItemId,
  ] =
    React.useState<
      string | null
    >(null);

  const [
    cartError,
    setCartError,
  ] =
    React.useState<
      string | null
    >(null);

  /* =======================================================
     FETCH MENU
  ======================================================= */

  React.useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(
          true
        );

        setError(
          null
        );

        const {
          data,
          error:
            databaseError,
        } =
          await supabase
            .from(
              "menu_items"
            )
            .select(`
              id,
              name,
              category,
              price,
              description,
              storage_bucket,
              image_name,
              available,
              sort_order
            `)
            .eq(
              "available",
              true
            )
            .order(
              "sort_order",
              {
                ascending:
                  true,
              }
            );

        if (
          databaseError
        ) {
          throw databaseError;
        }

        setMenuItems(
          (data ||
            []) as MenuItem[]
        );
      } catch (
        err
      ) {
        console.error(
          "Menu loading error:",
          err
        );

        if (
          err instanceof Error
        ) {
          setError(
            err.message
          );
        } else {
          setError(
            "Could not load menu."
          );
        }
      } finally {
        setLoading(
          false
        );
      }
    }

    loadMenu();
  }, []);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  async function handleAddToCart(
    item: Slide
  ) {
    setCartError(
      null
    );

    /* CHECK LOGGED IN USER */

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      setLoginDialogOpen(
        true
      );

      return;
    }

    try {
      setAddingItemId(
        item.id
      );

      /* =====================================
         CALL DATABASE FUNCTION
      ===================================== */

      const {
        data:
          cartCount,

        error:
          cartDatabaseError,
      } =
        await supabase.rpc(
          "add_to_cart",
          {
            p_menu_item_id:
              item.id,
          }
        );

      if (
        cartDatabaseError
      ) {
        throw cartDatabaseError;
      }

      /* =====================================
         TELL NAVBAR CART CHANGED

         Navbar will use this in the next step.
      ===================================== */

      window.dispatchEvent(
        new CustomEvent(
          "smashed-cart-updated",
          {
            detail: {
              count:
                Number(
                  cartCount
                ),
            },
          }
        )
      );

      /* BUTTON FEEDBACK */

      setAddedItemId(
        item.id
      );

      setTimeout(() => {
        setAddedItemId(
          null
        );
      }, 1200);
    } catch (
      err
    ) {
      console.error(
        "Add to cart error:",
        err
      );

      setCartError(
        "Could not add this item to your cart."
      );
    } finally {
      setAddingItemId(
        null
      );
    }
  }

  /* =======================================================
     FILTER CATEGORIES
  ======================================================= */

  const burgers =
    React.useMemo(
      () =>
        menuItems.filter(
          (item) =>
            item.category ===
            "burger"
        ),
      [menuItems]
    );

  const fries =
    React.useMemo(
      () =>
        menuItems.filter(
          (item) =>
            item.category ===
            "fries"
        ),
      [menuItems]
    );

  const drinks =
    React.useMemo(
      () =>
        menuItems.filter(
          (item) =>
            item.category ===
            "drink"
        ),
      [menuItems]
    );

  /* =======================================================
     CREATE SLIDES
  ======================================================= */

  const burgerSlides =
    React.useMemo(
      () =>
        burgers.map(
          menuItemToSlide
        ),
      [burgers]
    );

  const friesSlides =
    React.useMemo(
      () =>
        fries.map(
          menuItemToSlide
        ),
      [fries]
    );

  const drinkSlides =
    React.useMemo(
      () =>
        drinks.map(
          menuItemToSlide
        ),
      [drinks]
    );

  return (
    <main
      className="
        min-h-screen
        bg-[#8B2626]
      "
    >
      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          MENU HERO
      ================================================= */}

      <section
        className="
          px-6
          pb-8
          pt-12
          text-center
          md:pt-16
        "
      >
        <p
          className="
            text-[11px]
            font-black
            tracking-[0.3em]
            text-[#EF6905]
          "
        >
          SMASHED
        </p>

        <h1
          className="
            mt-2
            text-5xl
            font-black
            tracking-[-0.065em]
            text-[#F1E5A1]
            sm:text-6xl
            md:text-7xl
          "
        >
          OUR MENU
        </h1>

        <p
          className="
            mx-auto
            mt-4
            max-w-md
            text-sm
            leading-6
            text-[#F1E5A1]/60
          "
        >
          Pick your smash.
          Swipe through the
          menu.
        </p>
      </section>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <section
          className="
            flex
            min-h-[420px]
            items-center
            justify-center
          "
        >
          <LoadingBreadcrumb
            text="Preparing Menu"
            variant="dark"
          />
        </section>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading &&
        error && (
          <section
            className="
              mx-auto
              max-w-lg
              px-6
              py-20
            "
          >
            <div
              className="
                rounded-[24px]
                bg-[#F1E5A1]
                p-8
                text-center
              "
            >
              <h2
                className="
                  text-xl
                  font-black
                  text-[#8B2626]
                "
              >
                MENU COULD
                NOT LOAD
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  text-[#8B2626]/60
                "
              >
                {error}
              </p>
            </div>
          </section>
        )}

      {/* =================================================
          MENU CONTENT
      ================================================= */}

      {!loading &&
        !error && (
          <>
            {/* =============================================
                BURGERS
            ============================================= */}

            {burgerSlides.length >
              0 && (
              <section
                className="
                  overflow-hidden
                  px-3
                  py-12
                  md:py-16
                "
              >
                <CategoryTitle
                  small="OUR SMASHES"
                  title="BURGERS"
                />

                <div
                  className="
                    mx-auto
                    max-w-[1400px]
                  "
                >
                  <CoverflowCarousel
                    slides={
                      burgerSlides
                    }
                    cardWidth="clamp(210px, 25vw, 350px)"
                    rotate={
                      44
                    }
                    depth={
                      0.6
                    }
                    perspective={
                      3
                    }
                    gap={
                      0.06
                    }
                    loop={
                      burgerSlides.length >
                      2
                    }
                    onAddToCart={
                      handleAddToCart
                    }
                    addingItemId={
                      addingItemId
                    }
                    addedItemId={
                      addedItemId
                    }
                  />
                </div>
              </section>
            )}

            {/* =============================================
                FRIES
            ============================================= */}

            {friesSlides.length >
              0 && (
              <section
                className="
                  overflow-hidden
                  bg-[#7A2020]
                  px-3
                  py-12
                  md:py-16
                "
              >
                <CategoryTitle
                  small="GET LOADED"
                  title="FRIES"
                />

                <div
                  className="
                    mx-auto
                    max-w-[1400px]
                  "
                >
                  <CoverflowCarousel
                    slides={
                      friesSlides
                    }
                    cardWidth="clamp(210px, 25vw, 350px)"
                    rotate={
                      44
                    }
                    depth={
                      0.6
                    }
                    perspective={
                      3
                    }
                    gap={
                      0.06
                    }
                    loop={
                      friesSlides.length >
                      2
                    }
                    onAddToCart={
                      handleAddToCart
                    }
                    addingItemId={
                      addingItemId
                    }
                    addedItemId={
                      addedItemId
                    }
                  />
                </div>
              </section>
            )}

            {/* =============================================
                DRINKS
            ============================================= */}

            {drinkSlides.length >
              0 && (
              <section
                className="
                  overflow-hidden
                  px-3
                  py-12
                  md:py-16
                "
              >
                <CategoryTitle
                  small="KEEP IT COLD"
                  title="DRINKS"
                />

                <div
                  className="
                    mx-auto
                    max-w-[1400px]
                  "
                >
                  <CoverflowCarousel
                    slides={
                      drinkSlides
                    }
                    cardWidth="clamp(210px, 25vw, 350px)"
                    rotate={
                      44
                    }
                    depth={
                      0.6
                    }
                    perspective={
                      3
                    }
                    gap={
                      0.06
                    }
                    loop={
                      drinkSlides.length >
                      2
                    }
                    onAddToCart={
                      handleAddToCart
                    }
                    addingItemId={
                      addingItemId
                    }
                    addedItemId={
                      addedItemId
                    }
                  />
                </div>
              </section>
            )}

            {/* =============================================
                EMPTY DATABASE
            ============================================= */}

            {menuItems.length ===
              0 && (
              <section
                className="
                  px-6
                  py-24
                  text-center
                "
              >
                <h2
                  className="
                    text-3xl
                    font-black
                    text-[#F1E5A1]
                  "
                >
                  NO MENU ITEMS
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    text-[#F1E5A1]/50
                  "
                >
                  Your menu_items
                  table is empty.
                </p>
              </section>
            )}
          </>
        )}

      {/* =================================================
          CART ERROR
      ================================================= */}

      {cartError && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            z-[900]
            -translate-x-1/2
            rounded-full
            bg-[#F1E5A1]
            px-5
            py-3
            text-xs
            font-black
            text-[#8B2626]
            shadow-2xl
          "
        >
          {cartError}
        </div>
      )}

      {/* =================================================
          LOGIN REQUIRED DIALOG
      ================================================= */}

      {loginDialogOpen && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/60
            px-5
            backdrop-blur-sm
          "
          onClick={() =>
            setLoginDialogOpen(
              false
            )
          }
        >
          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            className="
              relative
              w-full
              max-w-[430px]
              rounded-[28px]
              bg-[#F1E5A1]
              p-8
              text-center
              shadow-[0_30px_100px_rgba(0,0,0,0.35)]
            "
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setLoginDialogOpen(
                  false
                )
              }
              aria-label="Close"
              className="
                absolute
                right-5
                top-5
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#8B2626]/10
                text-[#8B2626]
                transition
                hover:bg-[#8B2626]
                hover:text-[#F1E5A1]
              "
            >
              <X
                size={
                  17
                }
              />
            </button>

            {/* CART ICON */}

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-[#EF6905]
                text-[#F1E5A1]
              "
            >
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="9"
                  cy="20"
                  r="1"
                />

                <circle
                  cx="19"
                  cy="20"
                  r="1"
                />

                <path d="M3 4h2l2.6 10.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
              </svg>
            </div>

            {/* BRAND */}

            <p
              className="
                mt-5
                text-[10px]
                font-black
                tracking-[0.22em]
                text-[#EF6905]
              "
            >
              SMASHED
            </p>

            {/* TITLE */}

            <h2
              className="
                mt-2
                text-3xl
                font-black
                tracking-[-0.04em]
                text-[#8B2626]
              "
            >
              LOGIN TO ORDER
            </h2>

            {/* TEXT */}

            <p
              className="
                mx-auto
                mt-3
                max-w-[320px]
                text-sm
                leading-6
                text-[#8B2626]/60
              "
            >
              You need to be
              logged in before
              adding items to
              your cart.
            </p>

            {/* LOGIN */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/auth"
                )
              }
              className="
                mt-7
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#EF6905]
                text-xs
                font-black
                tracking-[0.1em]
                text-[#F1E5A1]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#d95d04]
              "
            >
              LOGIN

              <ArrowRight
                size={
                  17
                }
              />
            </button>

            {/* CONTINUE */}

            <button
              type="button"
              onClick={() =>
                setLoginDialogOpen(
                  false
                )
              }
              className="
                mt-4
                text-xs
                font-bold
                text-[#8B2626]/50
                transition
                hover:text-[#8B2626]
              "
            >
              Continue browsing
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />
    </main>
  );
}