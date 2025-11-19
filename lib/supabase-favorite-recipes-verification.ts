import { supabase } from "./supabase";

/**
 * Supabase favorite_recipes table ve RLS politikalarını doğrular
 * Sorun varsa detaylı hata mesajları gösterir
 */
export async function verifyFavoriteRecipesSetup(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // 1. Kullanıcı oturum kontrolü
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        message: "❌ Kullanıcı oturumu bulunamadı. Lütfen giriş yapın.",
        details: sessionError,
      };
    }

    console.log("✅ User session found:", session.user.id);

    // 2. Tablo erişim kontrolü - SELECT
    const { data: selectData, error: selectError } = await supabase
      .from("favorite_recipes")
      .select("*")
      .eq("user_id", session.user.id)
      .limit(1);

    if (selectError) {
      return {
        success: false,
        message: `❌ SELECT hatası: ${selectError.message}`,
        details: {
          code: selectError.code,
          details: selectError.details,
          hint: selectError.hint,
        },
      };
    }

    console.log("✅ SELECT permission OK, found", selectData?.length ?? 0, "rows");

    // 3. Test insert (sonra sileceğiz)
    const testRecipe = {
      user_id: session.user.id,
      recipe_id: 999999999,
      recipe_title: "Test Recipe",
      recipe_image: "https://test.com/image.jpg",
      ready_in_minutes: 30,
      calories: 500,
      recipe_payload: {
        id: 999999999,
        title: "Test Recipe",
        image: "https://test.com/image.jpg",
      },
    };

    const { data: insertData, error: insertError } = await supabase
      .from("favorite_recipes")
      .insert(testRecipe)
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        message: `❌ INSERT hatası: ${insertError.message}`,
        details: {
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        },
      };
    }

    console.log("✅ INSERT permission OK");

    // 4. Test delete
    const { error: deleteError } = await supabase
      .from("favorite_recipes")
      .delete()
      .eq("recipe_id", 999999999)
      .eq("user_id", session.user.id);

    if (deleteError) {
      return {
        success: false,
        message: `❌ DELETE hatası: ${deleteError.message}`,
        details: {
          code: deleteError.code,
          details: deleteError.details,
          hint: deleteError.hint,
        },
      };
    }

    console.log("✅ DELETE permission OK");

    return {
      success: true,
      message: "✅ Tüm kontroller başarılı! favorite_recipes tablosu hazır.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Beklenmeyen hata: ${error.message}`,
      details: error,
    };
  }
}

