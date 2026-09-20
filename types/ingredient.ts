export type IngredientType =
  | "bun"
  | "patty"
  | "cheese"
  | "vegetable"
  | "sauce"
  | "seasoning"
  | "extra";

export interface Ingredient {
  id: string;

  name: string;

  slug: string;

  ingredient_type: IngredientType;

  price: number;

  image_url: string | null;

  layer_position: number;

  max_quantity: number;

  available: boolean;

  created_at: string;

  updated_at: string;
}

/* =========================================================
   ACTUAL LAYER INSIDE THE BURGER

   Important:
   If a customer adds 2 patties,
   we keep 2 separate visual layers.
========================================================= */

export interface BurgerLayer {
  layerId: string;

  ingredientId: string;

  name: string;

  ingredientType: IngredientType;

  imageUrl: string;

  unitPrice: number;

  layerPosition: number;
}