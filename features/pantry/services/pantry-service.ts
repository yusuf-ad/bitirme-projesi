import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { PantryItem } from "../types";

export const pantryService = {
  async getItems(status: "pantry" | "shopping_list" = "pantry") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // If user not found (e.g. server-side), handle gracefully
    if (!user) {
      console.warn("User not authenticated in pantryService.getItems");
      // Return empty array or throw based on context.
      // For API route usage without auth context, this might be an issue.
      // Ideally, pass userId or handle server-side auth separately.
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as PantryItem[];
  },

  // Special method for server-side API usage
  async getItemsForUser(
    userId: string,
    status: "pantry" | "shopping_list" = "pantry",
    client?: SupabaseClient
  ) {
    const supabaseClient = client || supabase;
    const { data, error } = await supabaseClient
      .from("pantry_items")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as PantryItem[];
  },

  async getAllItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as PantryItem[];
  },

  async addItems(
    items: Omit<PantryItem, "id" | "user_id" | "created_at" | "updated_at">[]
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const itemsWithUser = items.map((item) => ({
      ...item,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from("pantry_items")
      .insert(itemsWithUser)
      .select();

    if (error) throw error;
    return data as PantryItem[];
  },

  async updateItem(id: string, updates: Partial<PantryItem>) {
    const { data, error } = await supabase
      .from("pantry_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as PantryItem;
  },

  async markAllAsChecked() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("pantry_items")
      .update({ checked: true })
      .eq("user_id", user.id)
      .eq("status", "shopping_list")
      .select();

    if (error) throw error;
    return data as PantryItem[];
  },

  async deleteItem(id: string) {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);

    if (error) throw error;
  },

  async clearPantryItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("pantry_items")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "pantry");

    if (error) throw error;
  },

  /**
   * Tiklenen shopping list öğelerini pantry'e taşır
   * Shopping list sayfasından çıkıldığında çağrılır
   */
  async moveCheckedItemsToPantry(): Promise<{
    movedCount: number;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { movedCount: 0, error: "User not authenticated" };
      }

      // Tiklenen öğeleri bul
      const { data: checkedItems, error: fetchError } = await supabase
        .from("pantry_items")
        .select(
          "id, name, spoonacular_id, amount, unit, category, is_weight, spoonacular_name, spoonacular_image"
        )
        .eq("user_id", user.id)
        .eq("status", "shopping_list")
        .eq("checked", true);

      if (fetchError) {
        console.error("Error fetching checked items:", fetchError);
        return { movedCount: 0, error: fetchError.message };
      }

      if (!checkedItems || checkedItems.length === 0) {
        return { movedCount: 0, error: null };
      }

      // Her bir tiklenen öğe için pantry'de aynı malzeme var mı kontrol et
      for (const item of checkedItems) {
        // Pantry'de aynı malzeme var mı? (spoonacular_id veya isim ile)
        let existingPantryItem = null;

        if (item.spoonacular_id) {
          const { data } = await supabase
            .from("pantry_items")
            .select("id, amount, unit")
            .eq("user_id", user.id)
            .eq("status", "pantry")
            .eq("spoonacular_id", item.spoonacular_id);

          // Unit eşleşen var mı?
          if (data) {
            existingPantryItem = data.find((i) => i.unit === item.unit);
          }
        }

        // spoonacular_id ile bulunamadıysa isim ile dene
        if (!existingPantryItem) {
          const { data } = await supabase
            .from("pantry_items")
            .select("id, amount, unit")
            .eq("user_id", user.id)
            .eq("status", "pantry")
            .ilike("name", item.name);

          if (data) {
            existingPantryItem = data.find((i) => i.unit === item.unit);
          }
        }

        if (existingPantryItem) {
          // Varsa miktarı güncelle ve shopping list öğesini sil
          const newAmount =
            (existingPantryItem.amount || 0) + (item.amount || 0);

          await supabase
            .from("pantry_items")
            .update({ amount: newAmount, updated_at: new Date().toISOString() })
            .eq("id", existingPantryItem.id);

          await supabase.from("pantry_items").delete().eq("id", item.id);
        } else {
          // Yoksa status'u pantry olarak güncelle
          await supabase
            .from("pantry_items")
            .update({
              status: "pantry",
              checked: false,
              recipe_name: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);
        }
      }

      return { movedCount: checkedItems.length, error: null };
    } catch (error) {
      console.error("Error moving items to pantry:", error);
      return { movedCount: 0, error: "Bir hata oluştu" };
    }
  },
};
