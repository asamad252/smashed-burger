"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  Beef,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

import { supabase } from "@/lib/supabase";

import {
  LoadingBreadcrumb,
} from "@/components/ui/animated-loading-svg-text-shimmer";

import type {
  BurgerLayer,
  Ingredient,
  IngredientType,
} from "@/types/ingredient";

/* =========================================================
   CATEGORY CONFIG
========================================================= */

const categories: {
  label: string;
  value: IngredientType;
}[] = [
  {
    label: "PATTIES",
    value: "patty",
  },
  {
    label: "CHEESE",
    value: "cheese",
  },
  {
    label: "VEGETABLES",
    value: "vegetable",
  },
  {
    label: "SAUCES",
    value: "sauce",
  },
  {
    label: "EXTRAS",
    value: "extra",
  },
  {
    label: "BUNS",
    value: "bun",
  },
];

/* =========================================================
   GET INGREDIENT IMAGE URL
========================================================= */

function getIngredientImageUrl(
  imageUrl: string | null
) {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  const cleanPath =
    imageUrl.startsWith("/")
      ? imageUrl.slice(1)
      : imageUrl;

  const storagePath =
    cleanPath.startsWith("ingredients/")
      ? cleanPath.replace(
          "ingredients/",
          ""
        )
      : cleanPath;

  const { data } =
    supabase.storage
      .from("ingredients")
      .getPublicUrl(storagePath);

  return data.publicUrl;
}

/* =========================================================
   INGREDIENT CARD
========================================================= */

function IngredientCard({
  ingredient,
  quantity,
  onAdd,
  onRemove,
}: {
  ingredient: Ingredient;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const image =
    getIngredientImageUrl(
      ingredient.image_url
    );

  const isBun =
    ingredient.ingredient_type ===
    "bun";

  const reachedMaximum =
    quantity >=
    ingredient.max_quantity;

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-[#8B2626]/10
        bg-[#F8EDB6]
        p-3
        shadow-[0_8px_24px_rgba(82,32,22,0.07)]
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[#EF6905]/40
        hover:shadow-[0_16px_35px_rgba(82,32,22,0.12)]
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          flex
          aspect-[1.12/1]
          items-center
          justify-center
          overflow-hidden
          rounded-[17px]
          bg-[#8B2626]/5
          p-3
        "
      >
        {image ? (
          <img
            src={image}
            alt={ingredient.name}
            draggable={false}
            className="
              h-full
              w-full
              select-none
              object-contain
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              text-[#8B2626]/20
            "
          >
            <Beef size={40} />
          </div>
        )}

        {/* CONTROLS */}

        {!isBun ? (
          <div
            className="
              absolute
              right-2
              top-2
              flex
              items-center
              gap-1
              rounded-full
              bg-[#8B2626]
              p-1
              shadow-lg
            "
          >
            {quantity > 0 && (
              <>
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label={`Remove ${ingredient.name}`}
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    text-[#F1E5A1]
                    transition
                    hover:bg-[#F1E5A1]/10
                  "
                >
                  <Minus size={13} />
                </button>

                <span
                  className="
                    min-w-4
                    text-center
                    text-[11px]
                    font-black
                    text-[#F1E5A1]
                  "
                >
                  {quantity}
                </span>
              </>
            )}

            <button
              type="button"
              onClick={onAdd}
              disabled={reachedMaximum}
              aria-label={`Add ${ingredient.name}`}
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                bg-[#EF6905]
                text-[#F1E5A1]
                transition

                hover:scale-105

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Plus size={13} />
            </button>
          </div>
        ) : (
          <div
            className="
              absolute
              right-2
              top-2
              rounded-full
              bg-[#8B2626]
              px-3
              py-1.5
              text-[8px]
              font-black
              tracking-[0.1em]
              text-[#F1E5A1]
            "
          >
            AUTO
          </div>
        )}
      </div>

      {/* INFORMATION */}

      <div className="pt-3">
        <p
          className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.17em]
            text-[#EF6905]
          "
        >
          {ingredient.ingredient_type}
        </p>

        <h3
          className="
            mt-1
            min-h-[38px]
            text-[15px]
            font-black
            uppercase
            leading-[1.15]
            tracking-[-0.03em]
            text-[#8B2626]
          "
        >
          {ingredient.name}
        </h3>

        <div
          className="
            mt-3
            flex
            items-end
            justify-between
            gap-2
          "
        >
          <div>
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-[#8B2626]/40
              "
            >
              {isBun
                ? "INCLUDED"
                : "ADD FOR"}
            </p>

            <p
              className="
                mt-0.5
                text-sm
                font-black
                text-[#EF6905]
              "
            >
              {isBun
                ? "FREE"
                : `Rs. ${Number(
                    ingredient.price
                  ).toLocaleString()}`}
            </p>
          </div>

          {!isBun && (
            <div
              className={`
                rounded-full
                px-2.5
                py-1.5
                text-[8px]
                font-black
                tracking-[0.06em]

                ${
                  reachedMaximum
                    ? `
                      bg-[#EF6905]
                      text-[#F1E5A1]
                    `
                    : `
                      bg-[#8B2626]/8
                      text-[#8B2626]/55
                    `
                }
              `}
            >
              {reachedMaximum
                ? "MAXED"
                : `MAX ${ingredient.max_quantity}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BURGER PREVIEW
========================================================= */

function BurgerPreview({
  ingredients,
  burgerLayers,
}: {
  ingredients: Ingredient[];
  burgerLayers: BurgerLayer[];
}) {
  const bottomBun =
    ingredients.find(
      (ingredient) =>
        ingredient.slug ===
        "bottom-bun"
    );

  const topBun =
    ingredients.find(
      (ingredient) =>
        ingredient.slug ===
        "top-bun"
    );

  const bottomBunImage =
    getIngredientImageUrl(
      bottomBun?.image_url ?? null
    );

  const topBunImage =
    getIngredientImageUrl(
      topBun?.image_url ?? null
    );

  const layerGap = 22;

  /*
   * Burger moved slightly further
   * down as requested.
   */

  const layerBaseBottom = 28;

  const bottomBunBottom = -6;

  const topBunBottom =
    layerBaseBottom +
    10 +
    burgerLayers.length *
      layerGap;

  return (
    <div
      className="
        relative
        mx-auto
        h-[430px]
        w-full
        max-w-[400px]
      "
    >
      {/* GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[62%]
          h-[260px]
          w-[260px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#EF6905]/10
          blur-3xl
        "
      />

      {/* BOTTOM BUN */}

      {bottomBunImage && (
        <motion.img
          src={bottomBunImage}
          alt="Bottom Bun"
          draggable={false}
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="
            absolute
            left-1/2
            z-10
            w-[290px]
            max-w-[88%]
            -translate-x-1/2
            select-none
            object-contain
            drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)]
          "
          style={{
            bottom:
              bottomBunBottom,
          }}
        />
      )}

      {/* SELECTED LAYERS */}

      <AnimatePresence>
        {burgerLayers.map(
          (layer, index) => (
            <motion.img
              key={layer.layerId}
              src={layer.imageUrl}
              alt={layer.name}
              draggable={false}
              initial={{
                opacity: 0,
                y: -110,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -25,
                scale: 0.92,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 20,
              }}
              className="
                absolute
                left-1/2
                w-[290px]
                max-w-[88%]
                -translate-x-1/2
                select-none
                object-contain
                drop-shadow-[0_8px_10px_rgba(0,0,0,0.16)]
              "
              style={{
                bottom:
                  layerBaseBottom +
                  index *
                    layerGap,

                zIndex:
                  20 +
                  index,
              }}
            />
          )
        )}
      </AnimatePresence>

      {/* TOP BUN */}

      {topBunImage && (
        <motion.img
          src={topBunImage}
          alt="Top Bun"
          draggable={false}
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
            bottom:
              topBunBottom,
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 22,
          }}
          className="
            absolute
            left-1/2
            z-[100]
            w-[290px]
            max-w-[88%]
            -translate-x-1/2
            select-none
            object-contain
            drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)]
          "
        />
      )}

      {burgerLayers.length ===
        0 && (
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="
            absolute
            bottom-0
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            text-[9px]
            font-black
            tracking-[0.18em]
            text-[#F1E5A1]/30
          "
        >
        </motion.p>
      )}
    </div>
  );
}

/* =========================================================
   SLIDING ADD TO CART BUTTON
========================================================= */

function SlideTextCartButton({
  onClick,
  disabled,
  loading,
  added,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  added: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.98,
            }
      }
      className="
        group
        relative
        mt-5
        h-14
        w-full
        overflow-hidden
        rounded-full
        bg-[#EF6905]
        shadow-[0_10px_28px_rgba(239,105,5,0.22)]
        transition-colors
        duration-300

        hover:bg-[#8B2626]

        disabled:cursor-not-allowed
        disabled:opacity-45
      "
    >
      {loading ? (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            gap-3
            text-[#F1E5A1]
          "
        >
          <span
            className="
              h-4
              w-4
              animate-spin
              rounded-full
              border-2
              border-[#F1E5A1]/30
              border-t-[#F1E5A1]
            "
          />

          <span
            className="
              text-[11px]
              font-black
              tracking-[0.1em]
            "
          >
            ADDING...
          </span>
        </div>
      ) : added ? (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            gap-3
            text-[#F1E5A1]
          "
        >
          <Check size={17} />

          <span
            className="
              text-[11px]
              font-black
              tracking-[0.1em]
            "
          >
            ADDED TO CART
          </span>
        </div>
      ) : (
        <div
          className="
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              gap-3
              text-[#F1E5A1]
              transition-transform
              duration-300
              ease-out

              group-hover:-translate-y-full
            "
          >
            <ShoppingCart size={17} />

            <span
              className="
                text-[11px]
                font-black
                tracking-[0.1em]
              "
            >
              ADD TO CART
            </span>
          </div>

          <div
            className="
              absolute
              inset-0
              flex
              translate-y-full
              items-center
              justify-center
              gap-3
              text-[#F1E5A1]
              transition-transform
              duration-300
              ease-out

              group-hover:translate-y-0
            "
          >
            <ShoppingCart size={17} />

            <span
              className="
                text-[11px]
                font-black
                tracking-[0.1em]
              "
            >
              CHECKOUT
            </span>
          </div>
        </div>
      )}
    </motion.button>
  );
}

/* =========================================================
   SELECTED INGREDIENTS + PRICE + ADD TO CART
========================================================= */

function SelectedIngredientsPanel({
  burgerLayers,
  clearBurger,
  removeIngredient,
  burgerTotal,
  addingToCart,
  addedToCart,
  cartError,
  onAddToCart,
}: {
  burgerLayers: BurgerLayer[];

  clearBurger: () => void;

  removeIngredient: (
    ingredientId: string
  ) => void;

  burgerTotal: number;

  addingToCart: boolean;

  addedToCart: boolean;

  cartError: string | null;

  onAddToCart: () => void;
}) {
  return (
    <div
      className="
        mt-5
        rounded-[26px]
        border
        border-[#8B2626]/10
        bg-[#F8EDB6]
        p-5
        shadow-[0_12px_30px_rgba(82,32,22,0.08)]
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          
          <h2
            className="
              mt-1
              text-2xl
              font-black
              tracking-[-0.04em]
              text-[#8B2626]
            "
          >
            SELECTED INGREDIENTS
          </h2>
        </div>

        {burgerLayers.length >
          0 && (
          <button
            type="button"
            onClick={clearBurger}
            className="
              rounded-full
              border
              border-[#8B2626]/15
              px-4
              py-2
              text-[8px]
              font-black
              tracking-[0.1em]
              text-[#8B2626]/55
              transition

              hover:border-[#EF6905]
              hover:bg-[#EF6905]
              hover:text-[#F1E5A1]
            "
          >
            CLEAR
          </button>
        )}
      </div>

      {/* BUNS INCLUDED */}

      

      {/* EMPTY */}

      {burgerLayers.length ===
      0 ? (
        <div
          className="
            mt-4
            rounded-[18px]
          
            
            px-4
            py-7
            text-center
          "
        >
        </div>
      ) : (
        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-2

            sm:grid-cols-2
          "
        >
          {burgerLayers.map(
            (layer, index) => (
              <motion.div
                key={layer.layerId}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-[15px]
                  bg-[#8B2626]/5
                  px-4
                  py-3
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      text-[7px]
                      font-black
                      tracking-[0.12em]
                      text-[#EF6905]
                    "
                  >
                    LAYER{" "}
                    {index + 1}
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[12px]
                      font-black
                      text-[#8B2626]
                    "
                  >
                    {layer.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeIngredient(
                      layer.ingredientId
                    )
                  }
                  aria-label={`Remove ${layer.name}`}
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#8B2626]
                    text-[#F1E5A1]
                    transition

                    hover:bg-[#EF6905]
                  "
                >
                  <Minus size={13} />
                </button>
              </motion.div>
            )
          )}
        </div>
      )}

      {/* =================================================
          PRICE
      ================================================= */}

      <div
        className="
          mt-5
         
          border-[#8B2626]/10
          pt-5
        "
      >
        <div
          className="
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                tracking-[0.14em]
                text-[#8B2626]/40
                py-2
              "
            >
              YOUR TOTAL (BUNS INCLUDED)
            </p>

          
          </div>

          <p
            className="
              text-3xl
              font-black
              tracking-[-0.05em]
              text-[#8B2626]
            "
          >
            Rs.{" "}
            {burgerTotal.toLocaleString()}
          </p>
        </div>

        {/* ERROR */}

        <AnimatePresence>
          {cartError && (
            <motion.div
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 5,
              }}
              className="
                mt-4
                rounded-[14px]
                bg-[#8B2626]/8
                px-4
                py-3
                text-xs
                font-bold
                leading-5
                text-[#8B2626]
              "
            >
              {cartError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADD TO CART */}

        <SlideTextCartButton
          onClick={onAddToCart}
          disabled={
            addingToCart ||
            burgerLayers.length === 0
          }
          loading={addingToCart}
          added={addedToCart}
        />
      </div>
    </div>
  );
}

/* =========================================================
   BUILD PAGE
========================================================= */

export default function BuildPage() {
  const router = useRouter();

  const [
    ingredients,
    setIngredients,
  ] =
    React.useState<
      Ingredient[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    React.useState(true);

  const [
    error,
    setError,
  ] =
    React.useState<
      string | null
    >(null);

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    React.useState<IngredientType>(
      "patty"
    );

  const [
    burgerLayers,
    setBurgerLayers,
  ] =
    React.useState<
      BurgerLayer[]
    >([]);

  const [
    addingToCart,
    setAddingToCart,
  ] =
    React.useState(false);

  const [
    addedToCart,
    setAddedToCart,
  ] =
    React.useState(false);

  const [
    cartError,
    setCartError,
  ] =
    React.useState<
      string | null
    >(null);

  const [
    loginDialogOpen,
    setLoginDialogOpen,
  ] =
    React.useState(false);

  /* =======================================================
     FETCH INGREDIENTS
  ======================================================= */

  React.useEffect(() => {
    async function loadIngredients() {
      try {
        setLoading(true);
        setError(null);

        const {
          data,
          error:
            databaseError,
        } =
          await supabase
            .from(
              "ingredients"
            )
            .select(`
              id,
              name,
              slug,
              ingredient_type,
              price,
              image_url,
              layer_position,
              max_quantity,
              available,
              created_at,
              updated_at
            `)
            .eq(
              "available",
              true
            )
            .order(
              "layer_position",
              {
                ascending:
                  true,
              }
            );

        if (
          databaseError
        ) {
          throw new Error(
            databaseError.message
          );
        }

        setIngredients(
          (data ??
            []) as Ingredient[]
        );
      } catch (err) {
        console.error(
          "Ingredient loading error:",
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
            "Could not load ingredients."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadIngredients();
  }, []);

  /* =======================================================
     FILTER CATEGORY
  ======================================================= */

  const filteredIngredients =
    React.useMemo(
      () =>
        ingredients.filter(
          (ingredient) =>
            ingredient.ingredient_type ===
            selectedCategory
        ),
      [
        ingredients,
        selectedCategory,
      ]
    );

  /* =======================================================
     LIVE TOTAL
  ======================================================= */

  const burgerTotal =
    React.useMemo(() => {
      return burgerLayers.reduce(
        (
          total,
          layer
        ) =>
          total +
          Number(
            layer.unitPrice
          ),
        0
      );
    }, [burgerLayers]);

  /* =======================================================
     CATEGORY COUNT
  ======================================================= */

  function categoryCount(
    type: IngredientType
  ) {
    return ingredients.filter(
      (ingredient) =>
        ingredient.ingredient_type ===
        type
    ).length;
  }

  /* =======================================================
     SELECTED QUANTITY
  ======================================================= */

  function getSelectedQuantity(
    ingredientId: string
  ) {
    return burgerLayers.filter(
      (layer) =>
        layer.ingredientId ===
        ingredientId
    ).length;
  }

  /* =======================================================
     ADD INGREDIENT
  ======================================================= */

  function addIngredient(
    ingredient: Ingredient
  ) {
    if (
      ingredient.ingredient_type ===
      "bun"
    ) {
      return;
    }

    const quantity =
      getSelectedQuantity(
        ingredient.id
      );

    if (
      quantity >=
      ingredient.max_quantity
    ) {
      return;
    }

    const imageUrl =
      getIngredientImageUrl(
        ingredient.image_url
      );

    if (!imageUrl) {
      return;
    }

    const newLayer: BurgerLayer =
      {
        layerId:
          crypto.randomUUID(),

        ingredientId:
          ingredient.id,

        name:
          ingredient.name,

        ingredientType:
          ingredient.ingredient_type,

        imageUrl,

        unitPrice:
          Number(
            ingredient.price
          ),

        layerPosition:
          ingredient.layer_position,
      };

    setBurgerLayers(
      (current) => [
        ...current,
        newLayer,
      ]
    );

    /*
     * Hide previous success/error
     * if burger changes.
     */

    setAddedToCart(false);
    setCartError(null);
  }

  /* =======================================================
     REMOVE ONE INSTANCE
  ======================================================= */

  function removeIngredient(
    ingredientId: string
  ) {
    setBurgerLayers(
      (current) => {
        let indexToRemove =
          -1;

        for (
          let index =
            current.length -
            1;
          index >= 0;
          index--
        ) {
          if (
            current[index]
              .ingredientId ===
            ingredientId
          ) {
            indexToRemove =
              index;

            break;
          }
        }

        if (
          indexToRemove ===
          -1
        ) {
          return current;
        }

        return current.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            indexToRemove
        );
      }
    );

    setAddedToCart(false);
    setCartError(null);
  }

  /* =======================================================
     CLEAR BURGER
  ======================================================= */

  function clearBurger() {
    setBurgerLayers([]);

    setAddedToCart(false);

    setCartError(null);
  }

  /* =======================================================
     ADD CUSTOM BURGER TO CART
  ======================================================= */

  async function handleAddCustomBurgerToCart() {
    setCartError(null);
    setAddedToCart(false);

    /*
     * Require at least one patty.
     */

    const hasPatty =
      burgerLayers.some(
        (layer) =>
          layer.ingredientType ===
          "patty"
      );

    if (!hasPatty) {
      setCartError(
        "Add at least one patty before adding your burger to the cart."
      );

      return;
    }

    /*
     * Check user login.
     */

    const {
      data: {
        user,
      },
      error:
        authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      setLoginDialogOpen(
        true
      );

      return;
    }

    try {
      setAddingToCart(
        true
      );

      /*
       * Only send ingredient IDs.
       *
       * Prices are calculated again
       * inside Supabase.
       */

      const layers =
        burgerLayers.map(
          (
            layer,
            index
          ) => ({
            ingredient_id:
              layer.ingredientId,

            position:
              index,
          })
        );

      const {
        data:
          cartCount,
        error:
          databaseError,
      } =
        await supabase.rpc(
          "add_custom_burger_to_cart",
          {
            p_layers:
              layers,
          }
        );

      if (
        databaseError
      ) {
        throw new Error(
          databaseError.message
        );
      }

      /*
       * Update navbar cart
       * badge immediately.
       */

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

      setAddedToCart(
        true
      );

      setTimeout(
        () => {
          setAddedToCart(
            false
          );
        },
        1800
      );
    } catch (err) {
      console.error(
        "Custom burger cart error:",
        err
      );

      if (
        err instanceof Error
      ) {
        setCartError(
          err.message
        );
      } else {
        setCartError(
          "Could not add your custom burger to the cart."
        );
      }
    } finally {
      setAddingToCart(
        false
      );
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#F1E5A1]
      "
    >
      {/* NAVBAR */}

      <Navbar />

      {/* LOADING */}

      {loading && (
        <section
          className="
            flex
            min-h-[650px]
            items-center
            justify-center
          "
        >
          <LoadingBreadcrumb
            text="Preparing Ingredients"
            variant="light"
          />
        </section>
      )}

      {/* ERROR */}

      {!loading &&
        error && (
          <section
            className="
              mx-auto
              max-w-xl
              px-6
              py-20
            "
          >
            <div
              className="
                rounded-[28px]
                bg-[#8B2626]
                p-8
                text-center
              "
            >
              <h2
                className="
                  text-2xl
                  font-black
                  text-[#F1E5A1]
                "
              >
                INGREDIENTS
                COULD NOT LOAD
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  text-[#F1E5A1]/60
                "
              >
                {error}
              </p>
            </div>
          </section>
        )}

      {/* =================================================
          BUILDER
      ================================================= */}

      {!loading &&
        !error && (
          <section
            className="
              mx-auto
              max-w-[1500px]
              px-4
              py-5

              sm:px-5

              md:px-6

              lg:px-8
              lg:py-6
            "
          >
            <div
              className="
                grid
                items-start
                gap-6

                lg:grid-cols-[minmax(0,1fr)_390px]

                xl:grid-cols-[minmax(0,1fr)_420px]
              "
            >
              {/* =================================================
                  LEFT SIDE
              ================================================= */}

              <div className="min-w-0">
                {/* HEADER */}

                <div>
                  <p
                    className="
                      text-[9px]
                      font-black
                      tracking-[0.22em]
                      text-[#EF6905]
                    "
                  >
                    BUILD YOUR BURGER
                  </p>

                  <h1
                    className="
                      mt-1
                      text-4xl
                      font-black
                      leading-[0.95]
                      tracking-[-0.055em]
                      text-[#8B2626]

                      sm:text-5xl
                    "
                  >
                    PICK YOUR
                    INGREDIENTS
                  </h1>
                </div>

                {/* CATEGORY TABS */}

                <div
                  className="
                    mt-5
                    flex
                    gap-2
                    overflow-x-auto
                    pb-2
                  "
                >
                  {categories.map(
                    (
                      category
                    ) => {
                      const active =
                        selectedCategory ===
                        category.value;

                      const count =
                        categoryCount(
                          category.value
                        );

                      return (
                        <button
                          key={
                            category.value
                          }
                          type="button"
                          onClick={() =>
                            setSelectedCategory(
                              category.value
                            )
                          }
                          className={`
                            flex
                            shrink-0
                            items-center
                            gap-2
                            rounded-full
                            px-4
                            py-2.5
                            text-[9px]
                            font-black
                            tracking-[0.08em]
                            transition-all
                            duration-200

                            ${
                              active
                                ? `
                                  bg-[#8B2626]
                                  text-[#F1E5A1]
                                  shadow-md
                                `
                                : `
                                  bg-[#8B2626]/8
                                  text-[#8B2626]/55

                                  hover:bg-[#8B2626]/15
                                  hover:text-[#8B2626]
                                `
                            }
                          `}
                        >
                          {
                            category.label
                          }

                          <span
                            className={`
                              flex
                              h-5
                              min-w-5
                              items-center
                              justify-center
                              rounded-full
                              px-1
                              text-[8px]

                              ${
                                active
                                  ? `
                                    bg-[#EF6905]
                                    text-[#F1E5A1]
                                  `
                                  : `
                                    bg-[#8B2626]/10
                                    text-[#8B2626]/45
                                  `
                              }
                            `}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* INGREDIENT GRID */}

                {filteredIngredients.length >
                0 ? (
                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-3

                      sm:grid-cols-3

                      xl:grid-cols-4
                    "
                  >
                    {filteredIngredients.map(
                      (
                        ingredient
                      ) => (
                        <IngredientCard
                          key={
                            ingredient.id
                          }
                          ingredient={
                            ingredient
                          }
                          quantity={getSelectedQuantity(
                            ingredient.id
                          )}
                          onAdd={() =>
                            addIngredient(
                              ingredient
                            )
                          }
                          onRemove={() =>
                            removeIngredient(
                              ingredient.id
                            )
                          }
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      mt-5
                      rounded-[24px]
                      border
                      border-dashed
                      border-[#8B2626]/20
                      py-14
                      text-center
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-black
                        text-[#8B2626]/40
                      "
                    >
                      NO INGREDIENTS
                      IN THIS CATEGORY
                    </p>
                  </div>
                )}

                {/* =============================================
                    SELECTED + TOTAL + CART
                ============================================= */}

                <SelectedIngredientsPanel
                  burgerLayers={
                    burgerLayers
                  }
                  clearBurger={
                    clearBurger
                  }
                  removeIngredient={
                    removeIngredient
                  }
                  burgerTotal={
                    burgerTotal
                  }
                  addingToCart={
                    addingToCart
                  }
                  addedToCart={
                    addedToCart
                  }
                  cartError={
                    cartError
                  }
                  onAddToCart={
                    handleAddCustomBurgerToCart
                  }
                />
              </div>

              {/* =================================================
                  RIGHT SIDE
              ================================================= */}

              <aside
                className="
                  lg:sticky
                  lg:top-4
                  lg:self-start
                "
              >
                <div
                  className="
                    overflow-hidden
                    rounded-[30px]
                    bg-[#8B2626]
                    shadow-[0_20px_55px_rgba(82,32,22,0.20)]
                  "
                >
                  {/* HEADER */}

                  <div
                    className="
                      px-5
                      pt-5
                    "
                  >
                    <h2
                      className="
                        text-3xl
                        font-black
                        tracking-[-0.05em]
                        text-[#F1E5A1]
                      "
                    >
                      YOUR SMASH
                    </h2>
                  </div>

                  {/* BURGER */}

                  <div
                    className="
                      relative
                      px-2
                      pb-3
                    "
                  >
                    <BurgerPreview
                      ingredients={
                        ingredients
                      }
                      burgerLayers={
                        burgerLayers
                      }
                    />
                  </div>

                  {/* FOOTER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-t
                      border-[#F1E5A1]/10
                      bg-black/5
                      px-5
                      py-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[7px]
                          font-black
                          tracking-[0.14em]
                          text-[#F1E5A1]/35
                        "
                      >
                        TOTAL
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-lg
                          font-black
                          text-[#F1E5A1]
                        "
                      >
                        Rs.{" "}
                        {burgerTotal.toLocaleString()}
                      </p>
                    </div>

                    {burgerLayers.length >
                      0 && (
                      <button
                        type="button"
                        onClick={
                          clearBurger
                        }
                        className="
                          rounded-full
                          border
                          border-[#F1E5A1]/15
                          px-3
                          py-2
                          text-[8px]
                          font-black
                          tracking-[0.08em]
                          text-[#F1E5A1]/50
                          transition

                          hover:border-[#EF6905]
                          hover:bg-[#EF6905]
                          hover:text-[#F1E5A1]
                        "
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

      {/* =================================================
          LOGIN DIALOG
      ================================================= */}

      <AnimatePresence>
        {loginDialogOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              z-[200]
              flex
              items-center
              justify-center
              bg-black/60
              px-4
              backdrop-blur-sm
            "
            onClick={() =>
              setLoginDialogOpen(
                false
              )
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              className="
                relative
                w-full
                max-w-[420px]
                rounded-[30px]
                bg-[#F1E5A1]
                p-7
                shadow-2xl
              "
            >
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
                  bg-[#8B2626]/8
                  text-[#8B2626]
                  transition

                  hover:bg-[#8B2626]
                  hover:text-[#F1E5A1]
                "
              >
                <X size={17} />
              </button>

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EF6905]
                  text-[#F1E5A1]
                "
              >
                <ShoppingCart
                  size={21}
                />
              </div>

              <p
                className="
                  mt-6
                  text-[9px]
                  font-black
                  tracking-[0.2em]
                  text-[#EF6905]
                "
              >
                SMASHED
              </p>

              <h2
                className="
                  mt-1
                  text-3xl
                  font-black
                  tracking-[-0.05em]
                  text-[#8B2626]
                "
              >
                LOGIN TO ORDER
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-[#8B2626]/55
                "
              >
                Sign in before adding
                your custom burger to
                the cart.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/auth"
                  )
                }
                className="
                  mt-6
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-[#8B2626]
                  text-[10px]
                  font-black
                  tracking-[0.12em]
                  text-[#F1E5A1]
                  transition

                  hover:bg-[#EF6905]
                "
              >
                LOGIN
              </button>

              <button
                type="button"
                onClick={() =>
                  setLoginDialogOpen(
                    false
                  )
                }
                className="
                  mt-3
                  w-full
                  text-center
                  text-[9px]
                  font-black
                  tracking-[0.1em]
                  text-[#8B2626]/40
                "
              >
                CONTINUE BUILDING
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}

      <Footer />
    </main>
  );
}