import { supabase } from "@/lib/supabase";
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
    status: "pantry" | "shopping_list" = "pantry"
  ) {
    const { data, error } = await supabase
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
};
