"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";

import { motion } from "motion/react";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

import { supabase } from "@/lib/supabase";

import {
  LoadingBreadcrumb,
} from "@/components/ui/animated-loading-svg-text-shimmer";

/* =========================================================
   TYPES
========================================================= */

interface MenuItemRelation {
  id: string;
  name: string;
  price: number;
  storage_bucket: string;
  image_name: string;
}

interface IngredientRelation {
  image_url: string | null;
  ingredient_type: string;
}

interface CustomBurgerIngredient {
  id: string;
  ingredient_id: string | null;
  ingredient_name: string;
  unit_price: number;
  position: number;

  ingredients:
    | IngredientRelation
    | IngredientRelation[]
    | null;
}

interface CustomBurgerRelation {
  id: string;
  name: string;
  total_price: number;

  custom_burger_ingredients:
    | CustomBurgerIngredient[]
    | null;
}

interface CartItem {
  id: string;
  user_id: string;

  menu_item_id: string | null;
  custom_burger_id: string | null;

  item_type: "menu" | "custom";

  quantity: number;

  created_at: string;

  menu_items:
    | MenuItemRelation
    | MenuItemRelation[]
    | null;

  custom_burgers:
    | CustomBurgerRelation
    | CustomBurgerRelation[]
    | null;
}

/* =========================================================
   RELATION HELPERS
========================================================= */

function getMenuItem(
  relation:
    | MenuItemRelation
    | MenuItemRelation[]
    | null
) {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

function getCustomBurger(
  relation:
    | CustomBurgerRelation
    | CustomBurgerRelation[]
    | null
) {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

function getIngredientRelation(
  relation:
    | IngredientRelation
    | IngredientRelation[]
    | null
) {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

/* =========================================================
   NORMAL MENU IMAGE
========================================================= */

function getMenuImageUrl(
  bucket: string,
  imageName: string
) {
  if (
    imageName.startsWith("http://") ||
    imageName.startsWith("https://")
  ) {
    return imageName;
  }

  const { data } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(imageName);

  return data.publicUrl;
}

/* =========================================================
   INGREDIENT IMAGE
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
   CUSTOM BURGER PREVIEW
========================================================= */

function CustomBurgerPreview({
  burger,
}: {
  burger: CustomBurgerRelation;
}) {
  const ingredients = [
    ...(burger.custom_burger_ingredients ?? []),
  ].sort(
    (a, b) =>
      a.position - b.position
  );

  const bottomBunImage =
    getIngredientImageUrl(
      "Bottom Bun.png"
    );

  const topBunImage =
    getIngredientImageUrl(
      "Top Bun.png"
    );

  const layerGap = 14;

  const layerBaseBottom = 50;

  const bottomBunBottom = 23;

  const topBunBottom =
    layerBaseBottom +
    8 +
    ingredients.length *
      layerGap;

  return (
    <div
      className="
        relative
        h-full
        min-h-[240px]
        w-full
        overflow-hidden
        rounded-[22px]
        bg-[#8B2626]
      "
    >
      {/* GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[53%]
          h-36
          w-36
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#EF6905]/15
          blur-3xl
        "
      />

      {/* BOTTOM BUN */}

      {bottomBunImage && (
        <img
          src={bottomBunImage}
          alt="Bottom Bun"
          draggable={false}
          className="
            absolute
            left-1/2
            z-10
            w-[190px]
            max-w-[92%]
            -translate-x-1/2
            select-none
            object-contain
            drop-shadow-[0_8px_10px_rgba(0,0,0,0.18)]
          "
          style={{
            bottom:
              bottomBunBottom,
          }}
        />
      )}

      {/* SELECTED LAYERS */}

      {ingredients.map(
        (
          ingredient,
          index
        ) => {
          const relation =
            getIngredientRelation(
              ingredient.ingredients
            );

          const image =
            getIngredientImageUrl(
              relation?.image_url ??
                null
            );

          if (!image) {
            return null;
          }

          return (
            <img
              key={ingredient.id}
              src={image}
              alt={
                ingredient.ingredient_name
              }
              draggable={false}
              className="
                absolute
                left-1/2
                w-[190px]
                max-w-[92%]
                -translate-x-1/2
                select-none
                object-contain
                drop-shadow-[0_7px_9px_rgba(0,0,0,0.16)]
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
          );
        }
      )}

      {/* TOP BUN */}

      {topBunImage && (
        <img
          src={topBunImage}
          alt="Top Bun"
          draggable={false}
          className="
            absolute
            left-1/2
            z-[100]
            w-[190px]
            max-w-[92%]
            -translate-x-1/2
            select-none
            object-contain
            drop-shadow-[0_8px_10px_rgba(0,0,0,0.18)]
          "
          style={{
            bottom:
              topBunBottom,
          }}
        />
      )}

      {/* LABEL */}

      <div
        className="
          absolute
          bottom-3
          left-1/2
          z-[120]
          -translate-x-1/2
          whitespace-nowrap
          rounded-full
          bg-[#F1E5A1]/10
          px-4
          py-1.5
          text-[7px]
          font-black
          tracking-[0.12em]
          text-[#F1E5A1]/70
        "
      >
        CUSTOM BUILD
      </div>
    </div>
  );
}

/* =========================================================
   CART PAGE
========================================================= */

export default function CartPage() {
  const router =
    useRouter();

  const [
    cartItems,
    setCartItems,
  ] =
    React.useState<CartItem[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    React.useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] =
    React.useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    React.useState<
      string | null
    >(null);

  /* =======================================================
     LOAD CART
  ======================================================= */

  const loadCart =
    React.useCallback(
      async () => {
        try {
          setLoading(true);

          setError(null);

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
            setCartItems([]);

            return;
          }

          const {
            data,
            error:
              cartError,
          } =
            await supabase
              .from(
                "cart_items"
              )
              .select(`
                id,
                user_id,
                menu_item_id,
                custom_burger_id,
                item_type,
                quantity,
                created_at,

                menu_items (
                  id,
                  name,
                  price,
                  storage_bucket,
                  image_name
                ),

                custom_burgers (
                  id,
                  name,
                  total_price,

                  custom_burger_ingredients (
                    id,
                    ingredient_id,
                    ingredient_name,
                    unit_price,
                    position,

                    ingredients (
                      image_url,
                      ingredient_type
                    )
                  )
                )
              `)
              .eq(
                "user_id",
                user.id
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              );

          if (cartError) {
            throw new Error(
              cartError.message
            );
          }

          setCartItems(
            (data ??
              []) as unknown as CartItem[]
          );
        } catch (err) {
          console.error(
            "Cart loading error:",
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
              "Could not load your cart."
            );
          }
        } finally {
          setLoading(false);
        }
      },
      []
    );

  React.useEffect(
    () => {
      loadCart();
    },
    [loadCart]
  );

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount =
    React.useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        ),
      [cartItems]
    );

  /* =======================================================
     UPDATE NAVBAR CART BADGE
  ======================================================= */

  function broadcastCartCount(
    count: number
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "smashed-cart-updated",
        {
          detail: {
            count,
          },
        }
      )
    );
  }

  /* =======================================================
     GET UNIT PRICE
  ======================================================= */

  function getUnitPrice(
    item: CartItem
  ) {
    if (
      item.item_type ===
      "custom"
    ) {
      const burger =
        getCustomBurger(
          item.custom_burgers
        );

      return Number(
        burger?.total_price ??
          0
      );
    }

    const menuItem =
      getMenuItem(
        item.menu_items
      );

    return Number(
      menuItem?.price ?? 0
    );
  }

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal =
    React.useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) => {
            const unitPrice =
              item.item_type ===
              "custom"
                ? Number(
                    getCustomBurger(
                      item.custom_burgers
                    )
                      ?.total_price ??
                      0
                  )
                : Number(
                    getMenuItem(
                      item.menu_items
                    )?.price ??
                      0
                  );

            return (
              total +
              unitPrice *
                item.quantity
            );
          },
          0
        ),
      [cartItems]
    );

  /* =======================================================
     CHANGE QUANTITY
  ======================================================= */

  async function changeQuantity(
    item: CartItem,
    nextQuantity: number
  ) {
    if (
      nextQuantity < 1
    ) {
      await removeItem(
        item.id
      );

      return;
    }

    try {
      setUpdatingId(
        item.id
      );

      setError(null);

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "cart_items"
          )
          .update({
            quantity:
              nextQuantity,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            item.id
          );

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      const nextCart =
        cartItems.map(
          (
            cartItem
          ) =>
            cartItem.id ===
            item.id
              ? {
                  ...cartItem,

                  quantity:
                    nextQuantity,
                }
              : cartItem
        );

      setCartItems(
        nextCart
      );

      const nextCount =
        nextCart.reduce(
          (
            total,
            cartItem
          ) =>
            total +
            cartItem.quantity,
          0
        );

      broadcastCartCount(
        nextCount
      );
    } catch (err) {
      console.error(
        "Quantity update error:",
        err
      );

      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      }
    } finally {
      setUpdatingId(
        null
      );
    }
  }

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  async function removeItem(
    id: string
  ) {
    try {
      setUpdatingId(id);

      setError(null);

      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "cart_items"
          )
          .delete()
          .eq(
            "id",
            id
          );

      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

      const nextCart =
        cartItems.filter(
          (
            item
          ) =>
            item.id !== id
        );

      setCartItems(
        nextCart
      );

      const nextCount =
        nextCart.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        );

      broadcastCartCount(
        nextCount
      );
    } catch (err) {
      console.error(
        "Remove cart item error:",
        err
      );

      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      }
    } finally {
      setUpdatingId(
        null
      );
    }
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#F1E5A1]
      "
    >
      <Navbar />

      {/* =================================================
          LOADING
      ================================================= */}

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
            text="Loading Cart"
            variant="light"
          />
        </section>
      )}

      {/* =================================================
          CART
      ================================================= */}

      {!loading && (
        <section
          className="
            mx-auto
            max-w-[1400px]
            px-4
            py-8

            sm:px-6

            lg:px-8
            lg:py-12
          "
        >
          {/* HEADER */}

          <div
            className="
              flex
              flex-col
              gap-5

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  tracking-[0.22em]
                  text-[#EF6905]
                "
              >
                SMASHED
              </p>

              <h1
                className="
                  mt-1
                  text-5xl
                  font-black
                  tracking-[-0.06em]
                  text-[#8B2626]

                  sm:text-6xl
                "
              >
                YOUR CART
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  font-bold
                  text-[#8B2626]/45
                "
              >
                {cartCount}{" "}
                {cartCount === 1
                  ? "ITEM"
                  : "ITEMS"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/menu"
                )
              }
              className="
                flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-[#8B2626]/15
                px-4
                py-2.5
                text-[9px]
                font-black
                tracking-[0.1em]
                text-[#8B2626]
                transition

                hover:border-[#8B2626]
                hover:bg-[#8B2626]
                hover:text-[#F1E5A1]
              "
            >
              <ChevronLeft
                size={14}
              />

              KEEP ORDERING
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                mt-6
                rounded-[18px]
                bg-[#8B2626]
                px-5
                py-4
                text-sm
                font-bold
                text-[#F1E5A1]
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              EMPTY CART
          ================================================= */}

          {cartItems.length ===
          0 ? (
            <div
              className="
                mt-10
                flex
                min-h-[440px]
                flex-col
                items-center
                justify-center
                rounded-[32px]
                border
                border-dashed
                border-[#8B2626]/20
                bg-[#F8EDB6]
                p-8
                text-center
              "
            >
              <div
                className="
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  bg-[#8B2626]
                  text-[#F1E5A1]
                "
              >
                <ShoppingBag
                  size={30}
                />
              </div>

              <h2
                className="
                  mt-6
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  text-[#8B2626]
                "
              >
                YOUR CART IS EMPTY
              </h2>

              <p
                className="
                  mt-3
                  max-w-sm
                  text-sm
                  leading-6
                  text-[#8B2626]/45
                "
              >
                Add one of our
                burgers or build
                your own smash.
              </p>

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  justify-center
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/menu"
                    )
                  }
                  className="
                    rounded-full
                    bg-[#8B2626]
                    px-6
                    py-3
                    text-[10px]
                    font-black
                    tracking-[0.1em]
                    text-[#F1E5A1]
                    transition

                    hover:bg-[#EF6905]
                  "
                >
                  VIEW MENU
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/build"
                    )
                  }
                  className="
                    rounded-full
                    bg-[#EF6905]
                    px-6
                    py-3
                    text-[10px]
                    font-black
                    tracking-[0.1em]
                    text-[#F1E5A1]
                    transition

                    hover:bg-[#8B2626]
                  "
                >
                  BUILD YOUR OWN
                </button>
              </div>
            </div>
          ) : (
            /* =================================================
               CART GRID
            ================================================= */

            <div
              className="
                mt-8
                grid
                items-start
                gap-6

                lg:grid-cols-[minmax(0,1fr)_360px]
              "
            >
              {/* =============================================
                  ITEMS
              ============================================= */}

              <div
                className="
                  space-y-4
                "
              >
                {cartItems.map(
                  (
                    item
                  ) => {
                    const isCustom =
                      item.item_type ===
                      "custom";

                    const menuItem =
                      getMenuItem(
                        item.menu_items
                      );

                    const customBurger =
                      getCustomBurger(
                        item.custom_burgers
                      );

                    const unitPrice =
                      getUnitPrice(
                        item
                      );

                    const lineTotal =
                      unitPrice *
                      item.quantity;

                    const menuImage =
                      menuItem
                        ? getMenuImageUrl(
                            menuItem.storage_bucket,
                            menuItem.image_name
                          )
                        : null;

                    const ingredients =
                      [
                        ...(customBurger
                          ?.custom_burger_ingredients ??
                          []),
                      ].sort(
                        (
                          a,
                          b
                        ) =>
                          a.position -
                          b.position
                      );

                    return (
                      <motion.article
                        key={
                          item.id
                        }
                        layout
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="
                          grid
                          gap-5
                          rounded-[28px]
                          border
                          border-[#8B2626]/10
                          bg-[#F8EDB6]
                          p-4
                          shadow-[0_10px_30px_rgba(82,32,22,0.07)]

                          sm:grid-cols-[190px_minmax(0,1fr)]
                        "
                      >
                        {/* =================================
                            IMAGE

                            NORMAL MENU:
                            image renders directly.

                            CUSTOM:
                            generated preview remains.
                        ================================= */}

                        {isCustom &&
                        customBurger ? (
                          <div
                            className="
                              min-h-[240px]
                              overflow-hidden
                              rounded-[22px]
                            "
                          >
                            <CustomBurgerPreview
                              burger={
                                customBurger
                              }
                            />
                          </div>
                        ) : menuImage ? (
                          <img
                            src={
                              menuImage
                            }
                            alt={
                              menuItem?.name ??
                              "Menu item"
                            }
                            draggable={
                              false
                            }
                            className="
                              mx-auto
                              block
                              h-auto
                              max-h-[240px]
                              w-auto
                              max-w-[190px]
                              self-center
                              object-contain
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex
                              min-h-[180px]
                              items-center
                              justify-center
                              text-[#8B2626]/25
                            "
                          >
                            <Utensils
                              size={
                                40
                              }
                            />
                          </div>
                        )}

                        {/* =================================
                            CONTENT
                        ================================= */}

                        <div
                          className="
                            flex
                            min-w-0
                            flex-col
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-4
                            "
                          >
                            <div>
                              <p
                                className="
                                  text-[8px]
                                  font-black
                                  tracking-[0.18em]
                                  text-[#EF6905]
                                "
                              >
                                {isCustom
                                  ? "CUSTOM BUILD"
                                  : "SMASHED MENU"}
                              </p>

                              <h2
                                className="
                                  mt-1
                                  text-2xl
                                  font-black
                                  uppercase
                                  leading-tight
                                  tracking-[-0.04em]
                                  text-[#8B2626]

                                  md:text-3xl
                                "
                              >
                                {isCustom
                                  ? customBurger?.name ??
                                    "CUSTOM SMASHED BURGER"
                                  : menuItem?.name ??
                                    "MENU ITEM"}
                              </h2>
                            </div>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                item.id
                              }
                              onClick={() =>
                                removeItem(
                                  item.id
                                )
                              }
                              aria-label="Remove item"
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[#8B2626]/7
                                text-[#8B2626]/45
                                transition

                                hover:bg-[#8B2626]
                                hover:text-[#F1E5A1]

                                disabled:opacity-40
                              "
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>

                          {/* CUSTOM INGREDIENTS */}

                          {isCustom &&
                            ingredients.length >
                              0 && (
                              <div
                                className="
                                  mt-5
                                  flex
                                  flex-wrap
                                  gap-2
                                "
                              >
                                {ingredients.map(
                                  (
                                    ingredient
                                  ) => (
                                    <span
                                      key={
                                        ingredient.id
                                      }
                                      className="
                                        rounded-full
                                        bg-[#8B2626]/7
                                        px-3
                                        py-2
                                        text-[8px]
                                        font-black
                                        uppercase
                                        tracking-[0.06em]
                                        text-[#8B2626]/60
                                      "
                                    >
                                      {
                                        ingredient.ingredient_name
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                          {/* BUNS LABEL */}

                         

                          {/* PRICE / QUANTITY */}

                          <div
                            className="
                              mt-auto
                              flex
                              flex-col
                              gap-4
                              pt-6

                              sm:flex-row
                              sm:items-end
                              sm:justify-between
                            "
                          >
                            <div>
                              <p
                                className="
                                  text-[8px]
                                  font-black
                                  tracking-[0.12em]
                                  text-[#8B2626]/35
                                "
                              >
                                UNIT PRICE
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-xl
                                  font-black
                                  text-[#EF6905]
                                "
                              >
                                Rs.{" "}
                                {unitPrice.toLocaleString()}
                              </p>
                            </div>

                            <div
                              className="
                                flex
                                items-center
                                gap-5
                              "
                            >
                              {/* QUANTITY */}

                              <div
                                className="
                                  flex
                                  items-center
                                  rounded-full
                                  bg-[#8B2626]
                                  p-1
                                "
                              >
                                <button
                                  type="button"
                                  disabled={
                                    updatingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    changeQuantity(
                                      item,
                                      item.quantity -
                                        1
                                    )
                                  }
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[#F1E5A1]
                                    transition

                                    hover:bg-[#F1E5A1]/10

                                    disabled:opacity-40
                                  "
                                >
                                  <Minus
                                    size={
                                      14
                                    }
                                  />
                                </button>

                                <span
                                  className="
                                    min-w-9
                                    text-center
                                    text-sm
                                    font-black
                                    text-[#F1E5A1]
                                  "
                                >
                                  {
                                    item.quantity
                                  }
                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    updatingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    changeQuantity(
                                      item,
                                      item.quantity +
                                        1
                                    )
                                  }
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#EF6905]
                                    text-[#F1E5A1]
                                    transition

                                    hover:scale-105

                                    disabled:opacity-40
                                  "
                                >
                                  <Plus
                                    size={
                                      14
                                    }
                                  />
                                </button>
                              </div>

                              {/* TOTAL */}

                              <div
                                className="
                                  min-w-[110px]
                                  text-right
                                "
                              >
                                <p
                                  className="
                                    text-[8px]
                                    font-black
                                    tracking-[0.1em]
                                    text-[#8B2626]/35
                                  "
                                >
                                  TOTAL
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-2xl
                                    font-black
                                    text-[#8B2626]
                                  "
                                >
                                  Rs.{" "}
                                  {lineTotal.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  }
                )}
              </div>

              {/* =============================================
                  ORDER SUMMARY
              ============================================= */}

              <aside
                className="
                  lg:sticky
                  lg:top-5
                "
              >
                <div
                  className="
                    overflow-hidden
                    rounded-[30px]
                    bg-[#8B2626]
                    p-6
                    shadow-[0_20px_55px_rgba(82,32,22,0.18)]
                  "
                >
                  <p
                    className="
                      text-[8px]
                      font-black
                      tracking-[0.22em]
                      text-[#EF6905]
                    "
                  >
                    YOUR ORDER
                  </p>

                  <h2
                    className="
                      mt-1
                      text-3xl
                      font-black
                      tracking-[-0.05em]
                      text-[#F1E5A1]
                    "
                  >
                    SUMMARY
                  </h2>

                  <div
                    className="
                      mt-6
                      space-y-3
                    "
                  >
                    {cartItems.map(
                      (
                        item
                      ) => {
                        const customBurger =
                          getCustomBurger(
                            item.custom_burgers
                          );

                        const menuItem =
                          getMenuItem(
                            item.menu_items
                          );

                        const name =
                          item.item_type ===
                          "custom"
                            ? customBurger?.name ??
                              "Custom Burger"
                            : menuItem?.name ??
                              "Menu Item";

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="
                              flex
                              items-start
                              justify-between
                              gap-4
                              text-xs
                            "
                          >
                            <p
                              className="
                                min-w-0
                                flex-1
                                font-bold
                                text-[#F1E5A1]/55
                              "
                            >
                              {
                                item.quantity
                              }
                              {" × "}
                              {name}
                            </p>

                            <p
                              className="
                                shrink-0
                                font-black
                                text-[#F1E5A1]
                              "
                            >
                              Rs.{" "}
                              {(
                                getUnitPrice(
                                  item
                                ) *
                                item.quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div
                    className="
                      my-6
                      h-px
                      bg-[#F1E5A1]/10
                    "
                  />

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-black
                        tracking-[0.08em]
                        text-[#F1E5A1]/50
                      "
                    >
                      SUBTOTAL
                    </p>

                    <p
                      className="
                        text-2xl
                        font-black
                        tracking-[-0.04em]
                        text-[#F1E5A1]
                      "
                    >
                      Rs.{" "}
                      {subtotal.toLocaleString()}
                    </p>
                  </div>

                  <p
                    className="
                      mt-2
                      text-[9px]
                      font-bold
                      text-[#F1E5A1]/30
                    "
                  >
                    Delivery fee will
                    be calculated at
                    checkout.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/checkout"
                      )
                    }
                    className="
                      mt-6
                      flex
                      h-14
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-[#EF6905]
                      text-[10px]
                      font-black
                      tracking-[0.12em]
                      text-[#F1E5A1]
                      transition

                      hover:bg-[#F1E5A1]
                      hover:text-[#8B2626]
                    "
                  >
                    CHECKOUT
                  </button>

                 
                </div>
              </aside>
            </div>
          )}
        </section>
      )}

      <Footer />
    </main>
  );
}