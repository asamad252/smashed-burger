"use client"
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Caveat, Patrick_Hand } from "next/font/google";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { supabase } from "@/lib/supabase";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import SpringCheck from "@/components/ui/SpringCheck";
import SlideCommit from "@/components/ui/SlideCommit";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  weight: ["600", "700"],
  subsets: ["latin"],
});

/*
 * Change this later if you calculate delivery
 * dynamically by area.
 */
const DELIVERY_FEE = 150;

type PaymentMethod =
  | "cod"
  | "card"
  | "bank_transfer";

type OrderItemType =
  | "signature"
  | "custom"
  | "side"
  | "drink"
  | "dessert";

interface MenuItemRelation {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
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

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  area: string;
  city: string;
  instructions: string;
  transactionReference: string;
}

interface SuccessfulOrder {
  id: string;
  orderNumber: string;
  total: number;
  paymentMethod: PaymentMethod;
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
  if (!relation) return null;

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
  if (!relation) return null;

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

function mapMenuCategory(
  category: string
): OrderItemType {
  switch (category) {
    case "fries":
      return "side";

    case "drink":
      return "drink";

    default:
      return "signature";
  }
}

/* =========================================================
   PAYMENT OPTION
========================================================= */

function PaymentOption({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        flex
        w-full
        items-center
        gap-4
        rounded-[20px]
        border
        px-4
        py-4
        text-left
        transition-all

        ${
          active
            ? `
              border-[#8B2626]
              bg-[#8B2626]
              shadow-[0_10px_30px_rgba(82,32,22,0.16)]
            `
            : `
              border-[#8B2626]/10
              bg-[#F8EDB6]
              hover:border-[#EF6905]/50
            `
        }
      `}
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          transition

          ${
            active
              ? `
                bg-[#EF6905]
                text-[#F1E5A1]
              `
              : `
                bg-[#8B2626]/7
                text-[#8B2626]
              `
          }
        `}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`
            text-[11px]
            font-black
            tracking-[0.08em]

            ${
              active
                ? "text-[#F1E5A1]"
                : "text-[#8B2626]"
            }
          `}
        >
          {title}
        </p>

        <p
          className={`
            mt-1
            text-[11px]
            leading-4

            ${
              active
                ? "text-[#F1E5A1]/55"
                : "text-[#8B2626]/45"
            }
          `}
        >
          {description}
        </p>
      </div>

      <div
        className={`
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-full
          border

          ${
            active
              ? `
                border-[#EF6905]
                bg-[#EF6905]
                text-[#F1E5A1]
              `
              : `
                border-[#8B2626]/20
                text-transparent
              `
          }
        `}
      >
        <Check size={13} />
      </div>
    </button>
  );
}

/* =========================================================
   INPUT
========================================================= */

function CheckoutInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span
        className="
          mb-2
          block
          text-[9px]
          font-black
          tracking-[0.14em]
          text-[#8B2626]/45
        "
      >
        {label}
        {required ? " *" : ""}
      </span>

      <div
        className="
          flex
          h-12
          items-center
          gap-3
          rounded-[16px]
          border
          border-[#8B2626]/10
          bg-[#F8EDB6]
          px-4
          transition

          focus-within:border-[#EF6905]/60
          focus-within:shadow-[0_0_0_3px_rgba(239,105,5,0.08)]
        "
      >
        <span className="text-[#8B2626]/35">
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="
            h-full
            min-w-0
            flex-1
            bg-transparent
            text-sm
            font-bold
            text-[#8B2626]
            outline-none

            placeholder:text-[#8B2626]/25
          "
        />
      </div>
    </label>
  );
}


/* =========================================================
   MORPHING ADDRESS BUTTON
========================================================= */

function MorphingAddressButton({
  form,
  updateField,
}: {
  form: CheckoutForm;
  updateField: (field: keyof CheckoutForm, value: string) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const addressRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const hasDetails = Boolean(form.address1.trim() && form.phone.trim());
  const springConfig = {
    type: "spring", stiffness: 240, damping: 18, mass: 1.1,
  } as const;

  React.useEffect(() => {
    function handleOutside(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  React.useEffect(() => {
    if (isExpanded) addressRef.current?.focus();
  }, [isExpanded]);

  function saveDetails() {
    if (!addressRef.current?.reportValidity() || !phoneRef.current?.reportValidity()) return;
    if (!hasDetails) return;
    updateField("address1", form.address1.trim());
    updateField("phone", form.phone.trim());
    setIsExpanded(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-[480px] justify-center py-3">
      <motion.div
        ref={containerRef}
        layout
        transition={springConfig}
        style={{ borderRadius: 32 }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsExpanded(false);
          if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            saveDetails();
          }
        }}
        className={`relative flex max-w-full items-center overflow-hidden border border-[#EF6905]/25 bg-[#F1E5A1] ${
          isExpanded ? "w-full p-1.5 shadow-sm" : "w-auto p-0"
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isExpanded && (
            <motion.div
              key="delivery-inputs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={springConfig}
              className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-2"
            >
              <label className="flex min-w-0 items-center gap-2">
                <MapPin size={16} className="shrink-0 text-[#EF6905]" aria-hidden="true" />
                <input
                  ref={addressRef}
                  type="text"
                  name="street-address"
                  autoComplete="street-address"
                  aria-label="Delivery address, including area"
                  placeholder="Address, including area"
                  required
                  value={form.address1}
                  onChange={(event) => updateField("address1", event.target.value)}
                  className="h-8 w-full min-w-0 bg-transparent text-sm font-semibold text-[#8B2626] outline-none placeholder:text-[#8B2626]/50 focus-visible:underline"
                />
              </label>
              <label className="flex min-w-0 items-center gap-2 border-t border-[#8B2626]/15 pt-1">
                <Phone size={16} className="shrink-0 text-[#EF6905]" aria-hidden="true" />
                <input
                  ref={phoneRef}
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  aria-label="Phone number"
                  placeholder="Phone number"
                  required
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="h-8 w-full min-w-0 bg-transparent text-sm font-semibold text-[#8B2626] outline-none placeholder:text-[#8B2626]/50 focus-visible:underline"
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          layout
          type="button"
          aria-expanded={isExpanded}
          onClick={() => isExpanded ? saveDetails() : setIsExpanded(true)}
          transition={springConfig}
          className={`relative flex shrink-0 items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap text-[#F1E5A1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B2626] ${
            isExpanded
              ? "bg-[#8B2626] px-4 py-3 hover:bg-[#EF6905]"
              : "bg-[#EF6905] px-6 py-4 hover:bg-[#8B2626]"
          }`}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!isExpanded && (
              <motion.span
                key="address-icon"
                layout
                initial={{ opacity: 0, scale: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0, filter: "blur(4px)" }}
                transition={springConfig}
              >
                <MapPin size={19} aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span layout="position" className="text-[11px] tracking-[0.08em]">
            {isExpanded ? "SAVE" : hasDetails ? "EDIT ADDRESS" : "ADD ADDRESS"}
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function CheckoutPage() {
  const router = useRouter();
  const orderInFlight = React.useRef(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const successTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => {
    if (successTimer.current) clearTimeout(successTimer.current);
  }, []);

  function finishOrderAnimation() {
    successTimer.current = setTimeout(() => {
      setShowSuccess(true);
      setCartItems([]);
    }, 1600);
  }

  const [
    cartItems,
    setCartItems,
  ] = React.useState<CartItem[]>([]);

  const [
    loading,
    setLoading,
  ] = React.useState(true);

  const [
    placingOrder,
    setPlacingOrder,
  ] = React.useState(false);

  const [
    error,
    setError,
  ] = React.useState<string | null>(
    null
  );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    React.useState<PaymentMethod>(
      "cod"
    );

  const [
    paymentModal,
    setPaymentModal,
  ] =
    React.useState<
      "card" | "bank_transfer" | null
    >(null);

  const [
    success,
    setSuccess,
  ] =
    React.useState<SuccessfulOrder | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    React.useState<CheckoutForm>({
      fullName: "",
      phone: "",
      email: "",
      address1: "",
      address2: "",
      area: "",
      city: "Karachi",
      instructions: "",
      transactionReference: "",
    });

  /* =======================================================
     LOAD USER + CART + DEFAULT ADDRESS
  ======================================================= */

  React.useEffect(() => {
    async function loadCheckout() {
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
          router.replace(
            "/auth"
          );

          return;
        }

        const [
          profileResult,
          addressResult,
          cartResult,
        ] =
          await Promise.all([
            supabase
              .from(
                "profiles"
              )
              .select(
                "full_name, phone"
              )
              .eq(
                "id",
                user.id
              )
              .maybeSingle(),

            supabase
              .from(
                "addresses"
              )
              .select(`
                address_line_1,
                address_line_2,
                area,
                city,
                phone
              `)
              .eq(
                "customer_id",
                user.id
              )
              .eq(
                "is_default",
                true
              )
              .limit(1)
              .maybeSingle(),

            supabase
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
                  category,
                  price,
                  description,
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
                    true,
                }
              ),
          ]);

        if (
          profileResult.error
        ) {
          console.warn(
            "Profile load warning:",
            profileResult.error.message
          );
        }

        if (
          addressResult.error
        ) {
          console.warn(
            "Address load warning:",
            addressResult.error.message
          );
        }

        if (
          cartResult.error
        ) {
          throw new Error(
            cartResult.error.message
          );
        }

        const profile =
          profileResult.data;

        const address =
          addressResult.data;

        setForm(
          (
            current
          ) => ({
            ...current,

            fullName:
              profile?.full_name ??
              user.user_metadata
                ?.full_name ??
              "",

            phone:
              address?.phone ??
              profile?.phone ??
              "",

            email:
              user.email ??
              "",

            address1:
              address
                ?.address_line_1 ??
              "",

            address2:
              address
                ?.address_line_2 ??
              "",

            area:
              address?.area ??
              "",

            city:
              address?.city ??
              "Karachi",
          })
        );

        setCartItems(
          (cartResult.data ??
            []) as unknown as CartItem[]
        );
      } catch (err) {
        console.error(
          "Checkout loading error:",
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
            "Could not load checkout."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [router]);

  /* =======================================================
     PRICE
  ======================================================= */

  function getUnitPrice(
    item: CartItem
  ) {
    if (
      item.item_type ===
      "custom"
    ) {
      return Number(
        getCustomBurger(
          item.custom_burgers
        )?.total_price ??
          0
      );
    }

    return Number(
      getMenuItem(
        item.menu_items
      )?.price ??
        0
    );
  }

  const subtotal =
    React.useMemo(
      () =>
        cartItems.reduce(
          (
            total,
            item
          ) =>
            total +
            getUnitPrice(
              item
            ) *
              item.quantity,
          0
        ),
      [cartItems]
    );

  const total =
    subtotal +
    DELIVERY_FEE;

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  function updateField(
    field: keyof CheckoutForm,
    value: string
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  }

  /* =======================================================
     PAYMENT SELECTION
  ======================================================= */

  function choosePayment(
    method: PaymentMethod
  ) {
    setPaymentMethod(
      method
    );

    if (
      method === "card" ||
      method === "bank_transfer"
    ) {
      setPaymentModal(
        method
      );
    } else {
      setPaymentModal(
        null
      );
    }
  }

  /* =======================================================
     PLACE ORDER
  ======================================================= */

  async function handlePlaceOrder() {
    if (orderInFlight.current || success) {
      throw new Error("Your order is already being processed.");
    }
    setError(null);

    if (
      cartItems.length ===
      0
    ) {
      setError(
        "Your cart is empty."
      );

      throw new Error("Your cart is empty.");
    }

    if (
      !form.phone.trim() ||
      !form.address1.trim() ||
      !form.city.trim()
    ) {
      setError(
        "Please add your phone number and complete delivery address, including area."
      );

      throw new Error("Please add your phone number and complete delivery address, including area.");
    }

    orderInFlight.current = true;
    try {
      setPlacingOrder(
        true
      );

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
        router.push(
          "/auth"
        );

        throw new Error("Please sign in to place your order.");
      }

      const paymentStatus =
        paymentMethod ===
        "bank_transfer"
          ? "awaiting_verification"
          : "pending";

      /*
       * 1. Create order.
       */

      const {
        data:
          order,
        error:
          orderError,
      } =
        await supabase
          .from(
            "orders"
          )
          .insert({
            customer_id:
              user.id,

            customer_name:
              form.fullName.trim(),

            customer_phone:
              form.phone.trim(),

            customer_email:
              form.email.trim() ||
              user.email ||
              null,

            address_line_1:
              form.address1.trim(),

            address_line_2:
              form.address2.trim() ||
              null,

            area:
              form.area.trim(),

            city:
              form.city.trim(),

            delivery_instructions:
              form.instructions.trim() ||
              null,

            subtotal,

            delivery_fee:
              DELIVERY_FEE,

            total,

            payment_method:
              paymentMethod,

            payment_status:
              paymentStatus,

            order_status:
              "pending",

            notes:
              null,
          })
          .select(
            "id, order_number"
          )
          .single();

      if (
        orderError ||
        !order
      ) {
        throw new Error(
          orderError?.message ??
            "Could not create order."
        );
      }

      /*
       * 2. Create order items.
       *
       * We insert one by one because custom burgers need
       * the generated order_item id for their ingredients.
       */

      for (
        const cartItem of
        cartItems
      ) {
        const isCustom =
          cartItem.item_type ===
          "custom";

        const menuItem =
          getMenuItem(
            cartItem.menu_items
          );

        const customBurger =
          getCustomBurger(
            cartItem.custom_burgers
          );

        const unitPrice =
          getUnitPrice(
            cartItem
          );

        const itemName =
          isCustom
            ? customBurger
                ?.name ??
              "Custom Smashed Burger"
            : menuItem
                ?.name ??
              "Menu Item";

        const itemType:
          OrderItemType =
          isCustom
            ? "custom"
            : mapMenuCategory(
                menuItem?.category ??
                  "burger"
              );

        const {
          data:
            orderItem,
          error:
            itemError,
        } =
          await supabase
            .from(
              "order_items"
            )
            .insert({
              order_id:
                order.id,

              product_id:
                null,

              item_type:
                itemType,

              item_name:
                itemName,

              quantity:
                cartItem.quantity,

              unit_price:
                unitPrice,

              special_instructions:
                null,
            })
            .select(
              "id"
            )
            .single();

        if (
          itemError ||
          !orderItem
        ) {
          throw new Error(
            itemError?.message ??
              `Could not save ${itemName}.`
          );
        }

        /*
         * Save the exact ingredient layers for custom burgers.
         */

        if (
          isCustom &&
          customBurger
            ?.custom_burger_ingredients
            ?.length
        ) {
          const ingredientRows =
            customBurger.custom_burger_ingredients.map(
              (
                ingredient
              ) => ({
                order_item_id:
                  orderItem.id,

                ingredient_id:
                  ingredient.ingredient_id,

                ingredient_name:
                  ingredient.ingredient_name,

                quantity:
                  1,

                unit_price:
                  Number(
                    ingredient.unit_price
                  ),

                is_extra:
                  true,
              })
            );

          const {
            error:
              ingredientError,
          } =
            await supabase
              .from(
                "order_item_ingredients"
              )
              .insert(
                ingredientRows
              );

          if (
            ingredientError
          ) {
            throw new Error(
              ingredientError.message
            );
          }
        }
      }

      /*
       * 3. Create payment record.
       *
       * Card is intentionally only marked pending here.
       * Do not collect raw card numbers in your own form.
       * Connect a payment gateway later and update this row
       * when the gateway confirms payment.
       */

      const {
        error:
          paymentError,
      } =
        await supabase
          .from(
            "payments"
          )
          .insert({
            order_id:
              order.id,

            method:
              paymentMethod,

            amount:
              total,

            status:
              paymentStatus,

            transaction_reference:
              paymentMethod ===
                "bank_transfer" &&
              form.transactionReference.trim()
                ? form.transactionReference.trim()
                : null,

            proof_url:
              null,

            gateway_payment_id:
              null,
          });

      if (
        paymentError
      ) {
        throw new Error(
          paymentError.message
        );
      }

      /*
       * 4. Clear cart.
       */

      const {
        error:
          clearCartError,
      } =
        await supabase
          .from(
            "cart_items"
          )
          .delete()
          .eq(
            "user_id",
            user.id
          );

      if (
        clearCartError
      ) {
        throw new Error(
          clearCartError.message
        );
      }

      window.dispatchEvent(
        new CustomEvent(
          "smashed-cart-updated",
          {
            detail: {
              count: 0,
            },
          }
        )
      );

      setSuccess({
        id:
          order.id,

        orderNumber:
          String(
            order.order_number
          ),

        total,

        paymentMethod,
      });

      // Keep the checkout mounted until the slider finishes its success animation.
    } catch (err) {
      console.error(
        "Checkout error:",
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
          "Could not place your order."
        );
      }
      throw err instanceof Error ? err : new Error("Could not place your order.");
    } finally {
      orderInFlight.current = false;
      setPlacingOrder(
        false
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F1E5A1]">
        <Navbar />

        <section
          className="
            flex
            min-h-[650px]
            items-center
            justify-center
          "
        >
          <LoadingBreadcrumb
            text="Preparing Checkout"
            variant="light"
          />
        </section>

        <Footer />
      </main>
    );
  }

  /* =======================================================
     SUCCESS
  ======================================================= */

  if (success && showSuccess) {
    const paymentText =
      success.paymentMethod ===
      "cod"
        ? "Cash on delivery selected."
        : success.paymentMethod ===
          "bank_transfer"
        ? "Account transfer is awaiting verification."
        : "Card payment is pending gateway confirmation.";

    return (
      <main className="min-h-screen bg-[#F1E5A1]">
        <Navbar />

        <section
          className="
            mx-auto
            flex
            min-h-[650px]
            max-w-[900px]
            items-center
            justify-center
            px-5
            py-12
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 14,
              rotate: -0.6,
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: -0.2,
            }}
            className="
              relative
              w-full
              max-w-[600px]
              overflow-hidden
              rounded-[8px]
              bg-[#FFFDF2]
              px-8
              py-10
              shadow-[0_25px_70px_rgba(82,32,22,0.20)]

              sm:px-12
            "
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(139,38,38,0.08) 34px)",
            }}
          >
            <div
              className="
                absolute
                bottom-0
                left-[54px]
                top-0
                w-px
                bg-[#EF6905]/35
              "
            />

            <div className="relative pl-7 text-center">
              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-[#486C2F]
                  text-[#F1E5A1]
                "
              >
                <CheckCircle2 size={28} />
              </div>

              <p
                className={`
                  ${patrickHand.className}
                  mt-5
                  text-lg
                  text-[#8B2626]/55
                `}
              >
                Order written down ✓
              </p>

              <h1
                className={`
                  ${caveat.className}
                  mt-1
                  text-5xl
                  font-bold
                  text-[#8B2626]

                  sm:text-6xl
                `}
              >
                Thanks!
              </h1>

              <p
                className={`
                  ${patrickHand.className}
                  mt-4
                  text-2xl
                  text-[#8B2626]
                `}
              >
                ORDER #{success.orderNumber}
              </p>

              <p
                className={`
                  ${patrickHand.className}
                  mt-3
                  text-lg
                  text-[#8B2626]/60
                `}
              >
                {paymentText}
              </p>

              <div
                className="
                  my-7
                  border-t-2
                  border-dashed
                  border-[#8B2626]/25
                "
              />

              <p
                className={`
                  ${caveat.className}
                  text-4xl
                  font-bold
                  text-[#8B2626]
                `}
              >
                Total: Rs.{" "}
                {success.total.toLocaleString()}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/menu"
                  )
                }
                className="
                  mt-8
                  rounded-full
                  bg-[#EF6905]
                  px-8
                  py-3
                  text-[10px]
                  font-black
                  tracking-[0.12em]
                  text-[#F1E5A1]
                  transition

                  hover:bg-[#8B2626]
                "
              >
                BACK TO MENU
              </button>
            </div>
          </motion.div>
        </section>

        <Footer />
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F1E5A1]">
      <Navbar />

      <section
        className="
          mx-auto
          max-w-[1100px]
          px-4
          py-8

          sm:px-6

          lg:px-8
          lg:py-12
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-4

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
                tracking-[0.25em]
                text-[#EF6905]
              "
            >
              FINAL STEP
            </p>

            <h1
              className="
                mt-1
                text-5xl
                font-black
                tracking-[-0.065em]
                text-[#8B2626]

                sm:text-6xl
              "
            >
              CHECKOUT
            </h1>

            <p
              className="
                mt-2
                max-w-xl
                text-sm
                leading-6
                text-[#8B2626]/45
              "
            >
              Review your kitchen ticket, add delivery details,
              choose how you want to pay, then place the order.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/cart"
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
            <ArrowLeft size={14} />
            BACK TO CART
          </button>
        </div>

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
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
          </motion.div>
        )}

        {cartItems.length ===
        0 ? (
          <div
            className="
              mt-8
              flex
              min-h-[420px]
              flex-col
              items-center
              justify-center
              rounded-[30px]
              bg-[#F8EDB6]
              px-6
              text-center
            "
          >
            <ReceiptText
              size={45}
              className="text-[#8B2626]/30"
            />

            <h2
              className="
                mt-5
                text-3xl
                font-black
                text-[#8B2626]
              "
            >
              NOTHING TO CHECK OUT
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-[#8B2626]/45
              "
            >
              Your cart is empty.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/menu"
                )
              }
              className="
                mt-6
                rounded-full
                bg-[#EF6905]
                px-6
                py-3
                text-[10px]
                font-black
                tracking-[0.1em]
                text-[#F1E5A1]
              "
            >
              GO TO MENU
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-7">
            {/* =================================================
                1. ORDER PAD
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                rotate: -0.4,
              }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: -0.15,
              }}
              className="
                relative
                mx-auto
                max-w-[650px]
                overflow-hidden
                rounded-[7px]
                bg-[#FFFDF2]
                px-6
                pb-12
                pt-9
                shadow-[0_24px_60px_rgba(82,32,22,0.18)]

                sm:px-8
              "
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(139,38,38,0.08) 34px)",
              }}
            >
              {/* red notebook margin */}

              <div
                className="
                  absolute
                  bottom-0
                  left-[48px]
                  top-0
                  w-px
                  bg-[#EF6905]/35

                  sm:left-[64px]
                "
              />

              {/* order pad holes */}

              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-3
                  flex
                  justify-around
                  px-8
                "
              >
                {Array.from({
                  length: 7,
                }).map(
                  (
                    _,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="
                        h-3
                        w-3
                        rounded-full
                        bg-[#8B2626]/8
                        shadow-inner
                      "
                    />
                  )
                )}
              </div>

              <div
                className="
                  relative
                  pl-9

                  sm:pl-10
                "
              >
                {/* pad header */}

                <div className="text-center">
                  <p
                    className={`
                      ${patrickHand.className}
                      text-lg
                      tracking-[0.18em]
                      text-[#EF6905]
                    `}
                  >
                    SMASHED
                  </p>

                  <h2
                    className={`
                      ${caveat.className}
                      -mt-1
                      text-2xl
                      font-bold
                      text-[#8B2626]
                    `}
                  >
                    Order Pad
                  </h2>

                  <p
                    className={`
                      ${patrickHand.className}
                      mt-1
                      text-base
                      text-[#8B2626]/45
                    `}
                  >
                    Karachi · kitchen copy
                  </p>
                </div>

                <div
                  className="
                    my-6
                    border-t-2
                    border-dashed
                    border-[#8B2626]/20
                  "
                />

                {/* order items */}

                <div
                  className={`
                    ${patrickHand.className}
                    space-y-5
                  `}
                >
                  {cartItems.map(
                    (
                      item,
                      itemIndex
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

                      const itemName =
                        isCustom
                          ? customBurger
                              ?.name ??
                            "Custom Smashed Burger"
                          : menuItem
                              ?.name ??
                            "Menu Item";

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
                        <motion.div
                          key={
                            item.id
                          }
                          initial={{
                            opacity: 0,
                            x: -8,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay:
                              itemIndex *
                              0.06,
                          }}
                        >
                          <div
                            className="
                              flex
                              items-baseline
                              gap-3
                            "
                          >
                            <span
                              className="
                                text-[18px]
                                text-[#486C2F]
                              "
                            >
                              ✓
                            </span>

                            <p
                              className="
                                min-w-0
                                flex-1
                                text-[18px]
                                leading-6
                                text-[#4B2B20]
                              "
                            >
                              {
                                item.quantity
                              }
                              x{" "}
                              {
                                itemName
                              }
                            </p>

                            <p
                              className="
                                shrink-0
                                text-[18px]
                                text-[#4B2B20]
                              "
                            >
                              {(
                                unitPrice *
                                item.quantity
                              ).toLocaleString()}
                            </p>
                          </div>

                          {isCustom &&
                            ingredients.length >
                              0 && (
                              <div
                                className="
                                  ml-9
                                  mt-2
                                  space-y-1
                                "
                              >
                                {ingredients.map(
                                  (
                                    ingredient
                                  ) => (
                                    <div
                                      key={
                                        ingredient.id
                                      }
                                      className="
                                        flex
                                        items-baseline
                                        justify-between
                                        gap-4
                                        text-[14px]
                                        text-[#4B2B20]/65
                                      "
                                    >
                                      <span>
                                        +{" "}
                                        {
                                          ingredient.ingredient_name
                                        }
                                      </span>

                                      {Number(
                                        ingredient.unit_price
                                      ) >
                                        0 && (
                                        <span>
                                          {
                                            Number(
                                              ingredient.unit_price
                                            ).toLocaleString()
                                          }
                                        </span>
                                      )}
                                    </div>
                                  )
                                )}

                                <p
                                  className="
                                    pt-1
                                    text-[14px]
                                    text-[#EF6905]/75
                                  "
                                >
                                  top + bottom bun included
                                </p>
                              </div>
                            )}

                          {!isCustom &&
                            menuItem
                              ?.description && (
                              <p
                                className="
                                  ml-9
                                  mt-1
                                  max-w-[80%]
                                  text-[16px]
                                  leading-5
                                  text-[#4B2B20]/50
                                "
                              >
                                {
                                  menuItem.description
                                }
                              </p>
                            )}
                        </motion.div>
                      );
                    }
                  )}
                </div>

                <div
                  className="
                    my-7
                    border-t-2
                    border-dashed
                    border-[#8B2626]/20
                  "
                />

                {/* receipt totals */}

                <div
                  className={`
                    ${patrickHand.className}
                    space-y-2
                    text-[18px]
                    text-[#4B2B20]
                  `}
                >
                  <div className="flex justify-between gap-4">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      Rs.{" "}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>
                      Delivery
                    </span>

                    <span>
                      Rs.{" "}
                      {DELIVERY_FEE.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div
                  className="
                    my-3
                    h-[3px]
                    rotate-[-0.5deg]
                    bg-[#8B2626]
                  "
                />

                <div
                  className={`
                    ${caveat.className}
                    flex
                    items-end
                    justify-between
                    gap-4
                    text-[#8B2626]
                  `}
                >
                  <span
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    TOTAL
                  </span>

                  <span
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    Rs.{" "}
                    {total.toLocaleString()}
                  </span>
                </div>

            {/* =================================================
                2. PAYMENT — INSIDE ORDER PAD
            ================================================= */}

            <div
              className="
                mx-auto
                w-full
                max-w-[800px]
                mt-8
                border-t-2
                border-dashed
                border-[#8B2626]/20
                pt-7
                pb-5
                text-center
              "
            >
              <p
                className="
                  text-[9px]
                  font-black
                  tracking-[0.22em]
                  text-[#EF6905]
                "
              >
                PAYMENT METHOD
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-black
                  tracking-[-0.04em]
                  text-[#8B2626]
                "
              >
                HOW WILL YOU PAY?
              </h2>

              <div
                className="
                  mx-auto
                  mt-5
                  flex
                  w-full
                  max-w-[320px]
                  flex-col
                  items-stretch
                  gap-3
                "
              >
                <SpringCheck
                  className="w-full justify-start"
                  ariaLabel="Cash on delivery"
                  label="CASH ON DELIVERY"
                  checked={
                    paymentMethod ===
                    "cod"
                  }
                  onChange={(
                    checked: boolean
                  ) => {
                    if (
                      checked
                    ) {
                      choosePayment(
                        "cod"
                      );
                    }
                  }}
                  color="#8B2626"
                  fillColor="#EF6905"
                  checkColor="#F1E5A1"
                  boxSize={28}
                  boxRadius={9}
                  fontSize={14}
                  bounce={0.28}
                  doneOpacity={1}
                  strike="none"
                />

                <SpringCheck
                  className="w-full justify-start"
                  ariaLabel="Pay by card"
                  label="PAY BY CARD"
                  checked={
                    paymentMethod ===
                    "card"
                  }
                  onChange={(
                    checked: boolean
                  ) => {
                    if (
                      checked
                    ) {
                      choosePayment(
                        "card"
                      );
                    }
                  }}
                  color="#8B2626"
                  fillColor="#EF6905"
                  checkColor="#F1E5A1"
                  boxSize={28}
                  boxRadius={9}
                  fontSize={14}
                  bounce={0.28}
                  doneOpacity={1}
                  strike="none"
                />

                <SpringCheck
                  className="w-full justify-start"
                  ariaLabel="Account transfer"
                  label="ACCOUNT TRANSFER — Opens transfer details and reference field."
                  checked={
                    paymentMethod ===
                    "bank_transfer"
                  }
                  onChange={(
                    checked: boolean
                  ) => {
                    if (
                      checked
                    ) {
                      choosePayment(
                        "bank_transfer"
                      );
                    }
                  }}
                  color="#8B2626"
                  fillColor="#486C2F"
                  checkColor="#F1E5A1"
                  boxSize={28}
                  boxRadius={9}
                  fontSize={14}
                  bounce={0.28}
                  doneOpacity={1}
                  strike="none"
                />
              </div>
            </div>

            {/* =================================================
                3. DELIVERY ADDRESS — MORPHING INLINE FORM
            ================================================= */}

            <MorphingAddressButton
              form={form}
              updateField={
                updateField
              }
            />

                <p
                  className={`
                    ${patrickHand.className}
                    mt-7
                    rotate-[-1deg]
                    text-right
                    text-lg
                    text-[#EF6905]
                  `}
                >
                  good burgers,
                  better days :)
                </p>
              </div>
            </motion.div>

            {/* =================================================
                4. PLACE ORDER
            ================================================= */}

            <div className="mx-auto flex w-full max-w-[420px] justify-center">
              <SlideCommit
                label={`Place Order · Rs. ${(success?.total ?? total).toLocaleString()}`}
                doneLabel="Order Placed"
                errorLabel="Try again"
                onConfirm={handlePlaceOrder}
                onDone={finishOrderAnimation}
                trackColor="#8B2626"
                handleColor="#EF6905"
                successColor="#F1E5A1"
                dangerColor="#EF6905"
                width={420}
                height={56}
                radius={28}
                holdMs={0}
                className="smashed-order-slide"
              />
            </div>
          </div>
        )}
      </section>



      {/* =================================================
          PAYMENT MODALS
      ================================================= */}

      <AnimatePresence>
        {paymentModal && (
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
              z-[250]
              flex
              items-center
              justify-center
              bg-black/60
              px-4
              backdrop-blur-sm
            "
            onClick={() =>
              setPaymentModal(
                null
              )
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 16,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 16,
              }}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              className="
                relative
                w-full
                max-w-[460px]
                rounded-[30px]
                bg-[#F1E5A1]
                p-6
                shadow-2xl

                sm:p-7
              "
            >
              <button
                type="button"
                onClick={() =>
                  setPaymentModal(
                    null
                  )
                }
                aria-label="Close payment modal"
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

              {paymentModal ===
                "card" ? (
                <>
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
                    <CreditCard
                      size={21}
                    />
                  </div>

                  <p
                    className="
                      mt-5
                      text-[9px]
                      font-black
                      tracking-[0.2em]
                      text-[#EF6905]
                    "
                  >
                    CARD PAYMENT
                  </p>

                  <h2
                    className="
                      mt-1
                      pr-10
                      text-3xl
                      font-black
                      tracking-[-0.05em]
                      text-[#8B2626]
                    "
                  >
                    PAY SECURELY
                  </h2>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-[#8B2626]/55
                    "
                  >
                    Card details should be collected by your payment gateway, not stored directly by SMASHED.
                  </p>

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      justify-between
                      rounded-[18px]
                      bg-[#8B2626]
                      px-4
                      py-4
                    "
                  >
                    <span
                      className="
                        text-[9px]
                        font-black
                        tracking-[0.1em]
                        text-[#F1E5A1]/45
                      "
                    >
                      AMOUNT
                    </span>

                    <span
                      className="
                        text-xl
                        font-black
                        text-[#F1E5A1]
                      "
                    >
                      Rs.{" "}
                      {total.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="
                      mt-4
                      flex
                      items-start
                      gap-3
                      rounded-[16px]
                      bg-[#486C2F]/10
                      p-4
                    "
                  >
                    <ShieldCheck
                      size={18}
                      className="
                        mt-0.5
                        shrink-0
                        text-[#486C2F]
                      "
                    />

                    <p
                      className="
                        text-[11px]
                        leading-5
                        text-[#8B2626]/55
                      "
                    >
                      Once your card gateway is connected, its secure checkout should open from this modal.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentModal(
                        null
                      )
                    }
                    className="
                      mt-5
                      h-12
                      w-full
                      rounded-full
                      bg-[#8B2626]
                      text-[10px]
                      font-black
                      tracking-[0.1em]
                      text-[#F1E5A1]
                      transition

                      hover:bg-[#EF6905]
                    "
                  >
                    USE CARD
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-[#486C2F]
                      text-[#F1E5A1]
                    "
                  >
                    <Landmark
                      size={21}
                    />
                  </div>

                  <p
                    className="
                      mt-5
                      text-[9px]
                      font-black
                      tracking-[0.2em]
                      text-[#486C2F]
                    "
                  >
                    ACCOUNT TRANSFER
                  </p>

                  <h2
                    className="
                      mt-1
                      pr-10
                      text-3xl
                      font-black
                      tracking-[-0.05em]
                      text-[#8B2626]
                    "
                  >
                    TRANSFER DETAILS
                  </h2>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-[#8B2626]/55
                    "
                  >
                    Add your real business bank/account details here before launch. The order will be marked as awaiting verification.
                  </p>

                  <div
                    className="
                      mt-5
                      rounded-[18px]
                      bg-[#8B2626]
                      p-4
                      text-[#F1E5A1]
                    "
                  >
                    <p
                      className="
                        text-[8px]
                        font-black
                        tracking-[0.12em]
                        text-[#EF6905]
                      "
                    >
                      TRANSFER AMOUNT
                    </p>

                    <p
                      className="
                        mt-1
                        text-2xl
                        font-black
                      "
                    >
                      Rs.{" "}
                      {total.toLocaleString()}
                    </p>

                    <div
                      className="
                        mt-4
                        border-t
                        border-[#F1E5A1]/10
                        pt-3
                        text-[10px]
                        leading-5
                        text-[#F1E5A1]/45
                      "
                    >
                      Bank name / account title / IBAN will go here.
                    </div>
                  </div>

                  <div className="mt-4">
                    <CheckoutInput
                      label="TRANSACTION REFERENCE"
                      icon={
                        <ReceiptText
                          size={16}
                        />
                      }
                      value={
                        form.transactionReference
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "transactionReference",
                          event.target
                            .value
                        )
                      }
                      placeholder="Reference / transaction ID"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentModal(
                        null
                      )
                    }
                    className="
                      mt-5
                      h-12
                      w-full
                      rounded-full
                      bg-[#486C2F]
                      text-[10px]
                      font-black
                      tracking-[0.1em]
                      text-[#F1E5A1]
                      transition

                      hover:bg-[#8B2626]
                    "
                  >
                    USE ACCOUNT TRANSFER
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
