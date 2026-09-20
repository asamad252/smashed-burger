"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

import { supabase } from "@/lib/supabase";

import {
  LoadingBreadcrumb,
} from "@/components/ui/animated-loading-svg-text-shimmer";

/* =========================================================
   TYPES
========================================================= */

type CartMenuItem = {
  id: string;
  name: string;
  price: number | string;
  storage_bucket: string;
  image_name: string;
};

type CartItem = {
  id: string;
  user_id: string;
  menu_item_id: string;
  quantity: number;

  menu_items:
    | CartMenuItem
    | null;
};

/* =========================================================
   CART PAGE
========================================================= */

export default function CartPage() {
  const router = useRouter();

  const [
    cartItems,
    setCartItems,
  ] =
    React.useState<
      CartItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    React.useState(true);

  const [
    loggedIn,
    setLoggedIn,
  ] =
    React.useState(false);

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
     STORAGE IMAGE URL
  ======================================================= */

  function getImageUrl(
    item: CartMenuItem
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

  /* =======================================================
     CART TOTAL QUANTITY
  ======================================================= */

  function getTotalQuantity(
    items: CartItem[]
  ) {
    return items.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity
        ),
      0
    );
  }

  /* =======================================================
     UPDATE NAVBAR BADGE
  ======================================================= */

  function updateNavbar(
    items: CartItem[]
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "smashed-cart-updated",
        {
          detail: {
            count:
              getTotalQuantity(
                items
              ),
          },
        }
      )
    );
  }

  /* =======================================================
     LOAD CART
  ======================================================= */

  React.useEffect(() => {
    async function loadCart() {
      try {
        setLoading(
          true
        );

        setError(
          null
        );

        /* =====================================
           CHECK AUTH
        ===================================== */

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          setLoggedIn(
            false
          );

          setCartItems(
            []
          );

          return;
        }

        setLoggedIn(
          true
        );

        /* =====================================
           LOAD CART + MENU ITEM
        ===================================== */

        const {
          data,
          error:
            databaseError,
        } =
          await supabase
            .from(
              "cart_items"
            )
            .select(`
              id,
              user_id,
              menu_item_id,
              quantity,
              menu_items (
                id,
                name,
                price,
                storage_bucket,
                image_name
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

        if (
          databaseError
        ) {
          throw databaseError;
        }

        const items =
          (data ??
            []) as unknown as CartItem[];

        setCartItems(
          items
        );

        updateNavbar(
          items
        );
      } catch (
        err
      ) {
        console.error(
          "Cart loading error:",
          err
        );

        setError(
          "Could not load your cart."
        );
      } finally {
        setLoading(
          false
        );
      }
    }

    loadCart();
  }, []);

  /* =======================================================
     CHANGE QUANTITY
  ======================================================= */

  async function changeQuantity(
    cartItem: CartItem,
    change: number
  ) {
    try {
      setUpdatingId(
        cartItem.id
      );

      setError(
        null
      );

      const newQuantity =
        cartItem.quantity +
        change;

      /* =====================================
         IF QUANTITY BECOMES 0 -> REMOVE
      ===================================== */

      if (
        newQuantity <= 0
      ) {
        await removeItem(
          cartItem.id
        );

        return;
      }

      /* =====================================
         UPDATE DATABASE
      ===================================== */

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
              newQuantity,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            cartItem.id
          );

      if (
        updateError
      ) {
        throw updateError;
      }

      /* =====================================
         UPDATE UI
      ===================================== */

      const newCart =
        cartItems.map(
          (item) =>
            item.id ===
            cartItem.id
              ? {
                  ...item,

                  quantity:
                    newQuantity,
                }
              : item
        );

      setCartItems(
        newCart
      );

      updateNavbar(
        newCart
      );
    } catch (
      err
    ) {
      console.error(
        "Quantity update error:",
        err
      );

      setError(
        "Could not update quantity."
      );
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
    cartItemId: string
  ) {
    try {
      setUpdatingId(
        cartItemId
      );

      setError(
        null
      );

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
            cartItemId
          );

      if (
        deleteError
      ) {
        throw deleteError;
      }

      const newCart =
        cartItems.filter(
          (item) =>
            item.id !==
            cartItemId
        );

      setCartItems(
        newCart
      );

      updateNavbar(
        newCart
      );
    } catch (
      err
    ) {
      console.error(
        "Remove item error:",
        err
      );

      setError(
        "Could not remove item."
      );
    } finally {
      setUpdatingId(
        null
      );
    }
  }

  /* =======================================================
     CALCULATE TOTAL
  ======================================================= */

  const subtotal =
    cartItems.reduce(
      (
        total,
        item
      ) => {
        if (
          !item.menu_items
        ) {
          return total;
        }

        return (
          total +
          Number(
            item.menu_items
              .price
          ) *
            item.quantity
        );
      },
      0
    );

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
          HEADER
      ================================================= */}

      <section
        className="
          bg-[#8B2626]
          px-6
          pb-12
          pt-10
          text-center
        "
      >
        <p
          className="
            text-[10px]
            font-black
            tracking-[0.28em]
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
            tracking-[-0.055em]
            text-[#F1E5A1]
            md:text-6xl
          "
        >
          YOUR CART
        </h1>

        <p
          className="
            mx-auto
            mt-3
            max-w-md
            text-sm
            text-[#F1E5A1]/55
          "
        >
          Check your smash before
          we send it to the kitchen.
        </p>
      </section>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <section
          className="
            flex
            min-h-[450px]
            items-center
            justify-center
          "
        >
          <LoadingBreadcrumb
            text="Checking Your Order"
            variant="light"
          />
        </section>
      )}

      {/* =================================================
          NOT LOGGED IN
      ================================================= */}

      {!loading &&
        !loggedIn && (
          <section
            className="
              mx-auto
              flex
              min-h-[480px]
              max-w-[600px]
              items-center
              justify-center
              px-6
              py-14
            "
          >
            <div
              className="
                w-full
                rounded-[30px]
                bg-[#8B2626]
                p-9
                text-center
                shadow-[0_24px_60px_rgba(82,32,22,0.18)]
              "
            >
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
                <ShoppingBag
                  size={27}
                />
              </div>

              <h2
                className="
                  mt-6
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  text-[#F1E5A1]
                "
              >
                LOGIN TO VIEW CART
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-sm
                  text-sm
                  leading-6
                  text-[#F1E5A1]/60
                "
              >
                Sign in to access
                your saved cart and
                continue your order.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/auth"
                  )
                }
                className="
                  mt-7
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#EF6905]
                  px-8
                  text-xs
                  font-black
                  tracking-[0.1em]
                  text-[#F1E5A1]
                  transition
                  hover:-translate-y-0.5
                "
              >
                LOGIN

                <ArrowRight
                  size={
                    17
                  }
                />
              </button>
            </div>
          </section>
        )}

      {/* =================================================
          CART
      ================================================= */}

      {!loading &&
        loggedIn && (
          <section
            className="
              mx-auto
              max-w-[1250px]
              px-5
              py-10
              md:px-8
              md:py-14
            "
          >
            {/* =============================================
                ERROR
            ============================================= */}

            {error && (
              <div
                className="
                  mb-6
                  rounded-2xl
                  bg-[#8B2626]/10
                  px-5
                  py-4
                  text-sm
                  font-semibold
                  text-[#8B2626]
                "
              >
                {error}
              </div>
            )}

            {/* =============================================
                EMPTY CART
            ============================================= */}

            {cartItems.length ===
            0 ? (
              <div
                className="
                  py-20
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
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
                    size={
                      32
                    }
                  />
                </div>

                <h2
                  className="
                    mt-6
                    text-4xl
                    font-black
                    tracking-[-0.045em]
                    text-[#8B2626]
                  "
                >
                  YOUR CART IS EMPTY
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    text-[#8B2626]/55
                  "
                >
                  Your next smash is
                  waiting.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/menu"
                    )
                  }
                  className="
                    mt-7
                    inline-flex
                    h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#EF6905]
                    px-7
                    text-xs
                    font-black
                    tracking-[0.1em]
                    text-[#F1E5A1]
                    transition
                    hover:-translate-y-0.5
                  "
                >
                  <ArrowLeft
                    size={
                      17
                    }
                  />

                  BACK TO MENU
                </button>
              </div>
            ) : (
              /* =============================================
                 ITEMS + SUMMARY
              ============================================= */

              <div
                className="
                  grid
                  gap-8
                  lg:grid-cols-[1fr_360px]
                "
              >
                {/* =========================================
                    CART ITEMS
                ========================================= */}

                <div
                  className="
                    space-y-4
                  "
                >
                  {cartItems.map(
                    (
                      cartItem
                    ) => {
                      const product =
                        cartItem.menu_items;

                      if (
                        !product
                      ) {
                        return null;
                      }

                      const price =
                        Number(
                          product.price
                        );

                      const lineTotal =
                        price *
                        cartItem.quantity;

                      const isUpdating =
                        updatingId ===
                        cartItem.id;

                      return (
                        <div
                          key={
                            cartItem.id
                          }
                          className="
                            grid
                            gap-5
                            rounded-[26px]
                            bg-white/45
                            p-4
                            shadow-[0_12px_35px_rgba(82,32,22,0.08)]
                            sm:grid-cols-[140px_1fr_auto]
                            sm:items-center
                          "
                        >
                          {/* IMAGE */}

                          <div
                            className="
                              aspect-square
                              overflow-hidden
                              rounded-[20px]
                              bg-[#8B2626]
                            "
                          >
                            <img
                              src={getImageUrl(
                                product
                              )}
                              alt={
                                product.name
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />
                          </div>

                          {/* INFORMATION */}

                          <div>
                            <h2
                              className="
                                text-xl
                                font-black
                                uppercase
                                tracking-[-0.03em]
                                text-[#8B2626]
                              "
                            >
                              {
                                product.name
                              }
                            </h2>

                            <p
                              className="
                                mt-1
                                text-sm
                                font-black
                                text-[#EF6905]
                              "
                            >
                              Rs.{" "}
                              {price.toLocaleString()}
                            </p>

                            {/* QUANTITY */}

                            <div
                              className="
                                mt-5
                                inline-flex
                                items-center
                                rounded-full
                                bg-[#8B2626]
                                p-1
                              "
                            >
                              <button
                                type="button"
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  changeQuantity(
                                    cartItem,
                                    -1
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
                                  hover:bg-[#F1E5A1]
                                  hover:text-[#8B2626]
                                  disabled:opacity-40
                                "
                              >
                                <Minus
                                  size={
                                    15
                                  }
                                />
                              </button>

                              <span
                                className="
                                  min-w-[42px]
                                  text-center
                                  text-sm
                                  font-black
                                  text-[#F1E5A1]
                                "
                              >
                                {
                                  cartItem.quantity
                                }
                              </span>

                              <button
                                type="button"
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  changeQuantity(
                                    cartItem,
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
                                  hover:bg-[#F1E5A1]
                                  hover:text-[#8B2626]
                                  disabled:opacity-40
                                "
                              >
                                <Plus
                                  size={
                                    15
                                  }
                                />
                              </button>
                            </div>
                          </div>

                          {/* PRICE + REMOVE */}

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-4
                              sm:flex-col
                              sm:items-end
                            "
                          >
                            <p
                              className="
                                text-lg
                                font-black
                                text-[#8B2626]
                              "
                            >
                              Rs.{" "}
                              {lineTotal.toLocaleString()}
                            </p>

                            <button
                              type="button"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                removeItem(
                                  cartItem.id
                                )
                              }
                              className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-[#8B2626]/10
                                text-[#8B2626]
                                transition
                                hover:bg-[#8B2626]
                                hover:text-[#F1E5A1]
                                disabled:opacity-40
                              "
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}

                  {/* BACK TO MENU */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/menu"
                      )
                    }
                    className="
                      mt-4
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-black
                      tracking-[0.08em]
                      text-[#8B2626]
                      transition
                      hover:text-[#EF6905]
                    "
                  >
                    <ArrowLeft
                      size={
                        16
                      }
                    />

                    ADD MORE ITEMS
                  </button>
                </div>

                {/* =========================================
                    ORDER SUMMARY
                ========================================= */}

                <aside
                  className="
                    h-fit
                    rounded-[28px]
                    bg-[#8B2626]
                    p-7
                    shadow-[0_20px_55px_rgba(82,32,22,0.2)]
                    lg:sticky
                    lg:top-6
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-black
                      tracking-[0.22em]
                      text-[#EF6905]
                    "
                  >
                    SMASHED
                  </p>

                  <h2
                    className="
                      mt-2
                      text-3xl
                      font-black
                      tracking-[-0.04em]
                      text-[#F1E5A1]
                    "
                  >
                    ORDER SUMMARY
                  </h2>

                  <div
                    className="
                      my-6
                      h-px
                      bg-[#F1E5A1]/15
                    "
                  />

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      text-sm
                      text-[#F1E5A1]/65
                    "
                  >
                    <span>
                      Items
                    </span>

                    <span
                      className="
                        font-black
                        text-[#F1E5A1]
                      "
                    >
                      {getTotalQuantity(
                        cartItems
                      )}
                    </span>
                  </div>

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      text-sm
                      text-[#F1E5A1]/65
                    "
                  >
                    <span>
                      Subtotal
                    </span>

                    <span
                      className="
                        font-black
                        text-[#F1E5A1]
                      "
                    >
                      Rs.{" "}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="
                      my-6
                      h-px
                      bg-[#F1E5A1]/15
                    "
                  />

                  <div
                    className="
                      flex
                      items-end
                      justify-between
                    "
                  >
                    <span
                      className="
                        text-sm
                        font-black
                        text-[#F1E5A1]
                      "
                    >
                      TOTAL
                    </span>

                    <span
                      className="
                        text-2xl
                        font-black
                        text-[#EF6905]
                      "
                    >
                      Rs.{" "}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/checkout"
                      )
                    }
                    className="
                      mt-7
                      flex
                      h-14
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
                      hover:bg-[#f47617]
                    "
                  >
                    CHECKOUT

                    <ArrowRight
                      size={
                        17
                      }
                    />
                  </button>
                </aside>
              </div>
            )}
          </section>
        )}

      <Footer />
    </main>
  );
}