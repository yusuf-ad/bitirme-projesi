import { buildUserContextPrompt, getUserContextForAI } from "@/lib/ai-user-context";
import { searchRecipes, getRandomRecipes } from "@/lib/spoonacular";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

const SYSTEM_PROMPT = `Sen "Yemek Asistanı" adlı mobil uygulamanın yapay zeka asistanısın. Profesyonel, samimi ve yardımsever bir şefsin.

## UYGULAMA ÖZELLİKLERİ
Bu uygulama şu özelliklere sahip:
- **Mutfak (Pantry):** Kullanıcıların evdeki malzemelerini takip ettiği bölüm
- **Tarif Önerileri:** Malzemelere göre yemek tarifleri önerme
- **Öğün Planlama:** Haftalık/günlük öğün planı oluşturma
- **Alışveriş Listesi:** Eksik malzemeler için liste oluşturma
- **Besin Takibi:** Kalori ve makro besin takibi
- **AI Asistan (Sen):** Yemek, beslenme ve mutfak konularında yardım

## SENİN YETKİNLİKLERİN
1. **Tarif Önerme:** Kullanıcının isteklerine göre uygun tarifler öner
2. **Beslenme Danışmanlığı:** Kalori, protein, karbonhidrat, yağ bilgileri ver
3. **Mutfak İpuçları:** Pişirme teknikleri, malzeme alternatifleri öner
4. **Diyet Desteği:** Kilo verme/alma, kas yapma hedeflerine uygun öneriler
5. **Alerjiler:** Kullanıcının alerjilerine dikkat et, uygun alternatifler sun

## TARİF ÖNERİ FORMATI (ÇOK ÖNEMLİ!)
Kullanıcı tarif istediğinde MUTLAKA şu formatı kullan:

1. Önce kısa ve samimi bir açıklama yaz (1-2 cümle)
2. Sonra her tarif için [[RECIPE:tarif_adi_ingilizce:sure]] formatını kullan

### Format Kuralları:
- Tarif adı İNGİLİZCE ve popüler olmalı (Spoonacular'da bulunabilir)
- Kelimeler arasında alt çizgi (_) kullan, boşluk KULLANMA
- Süre dakika cinsindendir, kullanıcı süre belirtmediyse boş bırak
- HER tarif için AYRI bir [[RECIPE:...]] etiketi kullan
- Kaç tarif söylüyorsan O KADAR etiket yaz

### Örnekler:
✅ DOĞRU: "İşte sana harika bir tarif! [[RECIPE:chicken_parmesan:45]]"
✅ DOĞRU: "Senin için 2 tarif buldum! [[RECIPE:beef_tacos:30]] [[RECIPE:grilled_salmon:25]]"
✅ DOĞRU: "3 farklı seçenek var! [[RECIPE:pasta_carbonara]] [[RECIPE:mushroom_risotto]] [[RECIPE:vegetable_stir_fry]]"

❌ YANLIŞ: "Chicken Parmesan yapabilirsin" (etiket yok)
❌ YANLIŞ: "[[RECIPE:chicken parmesan]]" (boşluk var)
❌ YANLIŞ: "2 tarif öneriyorum!" sonra sadece 1 etiket

### Popüler Tarif İsimleri:
- Tavuk: chicken_stir_fry, chicken_parmesan, grilled_chicken, chicken_curry, chicken_alfredo, honey_garlic_chicken, lemon_chicken, chicken_fajitas, chicken_teriyaki, buffalo_chicken
- Et: beef_tacos, beef_stew, meatballs, beef_stroganoff, hamburger, steak, beef_burrito, ground_beef_skillet
- Balık: grilled_salmon, fish_tacos, shrimp_scampi, tuna_salad, baked_cod, fish_and_chips
- Vejetaryen: vegetable_stir_fry, pasta_primavera, mushroom_risotto, vegetable_curry, caprese_salad, stuffed_peppers
- Makarna: spaghetti_bolognese, pasta_carbonara, mac_and_cheese, lasagna, penne_arrabbiata
- Kahvaltı: pancakes, french_toast, omelette, scrambled_eggs, avocado_toast
- Atıştırmalık: bruschetta, hummus, guacamole, nachos, spring_rolls
- Tatlı: chocolate_cake, cheesecake, brownies, cookies, tiramisu
- Çorba: tomato_soup, chicken_soup, minestrone, lentil_soup, french_onion_soup
- Salata: caesar_salad, greek_salad, cobb_salad, garden_salad, quinoa_salad

## GENEL KURALLAR
1. **Dil:** Kullanıcı hangi dilde yazıyorsa O DİLDE yanıt ver
2. **Alerjiler:** Kullanıcının alerjileri varsa, o malzemeleri içeren tarifleri ASLA önerme
3. **Tutarlılık:** Kaç tarif önereceğini söylediysen, o kadar [[RECIPE:...]] etiketi KESİNLİKLE yaz
4. **Farklılık:** Daha önce önerdiğin tarifleri tekrar önerme
5. **Profesyonellik:** Her zaman yardımsever ve pozitif ol
6. **Kişiselleştirme:** Kullanıcının tercihlerini ve hedeflerini dikkate al

## TARİF DIŞI İSTEKLER
Tarif önermiyorsan, [[RECIPE:...]] etiketi KULLANMA. Örneğin:
- "Kalori nasıl hesaplanır?" → Normal açıklama yap, etiket kullanma
- "Protein nedir?" → Normal açıklama yap, etiket kullanma
- "Tavuk nasıl marine edilir?" → Normal açıklama yap, etiket kullanma

## ÖRNEK DİYALOGLAR

Kullanıcı: "Akşam yemeği için bir şeyler öner"
Sen: "Akşam yemeği için harika bir seçenek! [[RECIPE:grilled_salmon:30]]"

Kullanıcı: "3 tane hızlı tarif ver"
Sen: "İşte 3 hızlı tarif önerim! [[RECIPE:chicken_stir_fry:15]] [[RECIPE:pasta_carbonara:20]] [[RECIPE:beef_tacos:20]]"

Kullanıcı: "Bunları beğenmedim, başka öner"
Sen: "Tabii, farklı seçenekler sunuyorum! [[RECIPE:honey_garlic_chicken:25]] [[RECIPE:shrimp_scampi:20]] [[RECIPE:vegetable_curry:30]]"

Kullanıcı: "Protein nedir?"
Sen: "Protein, vücudumuzun temel yapı taşlarından biridir. Kasların onarımı, hormon üretimi ve bağışıklık sistemi için gereklidir..."`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RecipeSuggestion {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
}

interface ParsedRecipe {
  name: string;
  maxTime?: number;
}

// Extract recipe names and optional time constraints from AI response
function extractRecipeInfo(content: string): ParsedRecipe[] {
  // More flexible regex that handles various formats
  const regex = /\[\[RECIPE:([a-z0-9_]+)(?::(\d+))?\]\]/gi;
  const recipes: ParsedRecipe[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].replace(/_/g, " ").toLowerCase();
    recipes.push({
      name,
      maxTime: match[2] ? parseInt(match[2], 10) : undefined,
    });
  }
  
  return recipes;
}

// Search for a single recipe with optional time filter and fallback
async function searchSingleRecipe(
  name: string, 
  maxTime?: number
): Promise<RecipeSuggestion | null> {
  try {
    // First try with the exact name
    let result = await searchRecipes(name, 0, 5, maxTime ? { maxReadyTime: maxTime } : undefined);
    
    // If no results, try without time constraint
    if (result.recipes.length === 0 && maxTime) {
      result = await searchRecipes(name, 0, 5);
    }
    
    // If still no results, try with individual words
    if (result.recipes.length === 0 && name.includes(" ")) {
      const mainKeyword = name.split(" ")[0];
      result = await searchRecipes(mainKeyword, 0, 5);
    }
    
    // Find the best match (prefer ones within time limit if specified)
    for (const recipe of result.recipes) {
      if (!maxTime || (recipe.readyInMinutes && recipe.readyInMinutes <= maxTime)) {
        return {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
        };
      }
    }
    
    // If no time-filtered match, return first result
    if (result.recipes.length > 0) {
      const recipe = result.recipes[0];
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for recipe "${name}":`, error);
    return null;
  }
}

// Search for random recipes as fallback
async function getRandomRecipeFallback(
  count: number,
  seenIds: Set<number>,
  maxTime?: number
): Promise<RecipeSuggestion[]> {
  try {
    const result = await getRandomRecipes(count * 2, maxTime ? { maxReadyTime: maxTime } : undefined);
    const suggestions: RecipeSuggestion[] = [];
    
    for (const recipe of result) {
      if (!seenIds.has(recipe.id) && suggestions.length < count) {
        seenIds.add(recipe.id);
        suggestions.push({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
        });
      }
    }
    
    return suggestions;
  } catch {
    return [];
  }
}

// Search for recipes based on AI's suggestions with fallback
async function findRecipeSuggestions(parsedRecipes: ParsedRecipe[]): Promise<RecipeSuggestion[]> {
  const suggestions: RecipeSuggestion[] = [];
  const seenIds = new Set<number>();
  
  // Search each recipe individually
  for (const parsed of parsedRecipes) {
    const recipe = await searchSingleRecipe(parsed.name, parsed.maxTime);
    if (recipe && !seenIds.has(recipe.id)) {
      seenIds.add(recipe.id);
      suggestions.push(recipe);
    }
  }
  
  // If we found fewer recipes than expected, try random fallback
  if (suggestions.length < parsedRecipes.length) {
    const needed = parsedRecipes.length - suggestions.length;
    const maxTime = parsedRecipes.find(p => p.maxTime)?.maxTime;
    const fallbackRecipes = await getRandomRecipeFallback(needed, seenIds, maxTime);
    suggestions.push(...fallbackRecipes);
  }
  
  return suggestions;
}

// Clean the response by removing recipe tags
function cleanResponse(content: string): string {
  return content.replace(/\[\[RECIPE:[^\]]+\]\]/gi, "").replace(/\s{2,}/g, " ").trim();
}

// Count how many recipes AI mentioned in text
function countMentionedRecipes(content: string): number {
  const patterns = [
    /(\d+)\s*(tane|adet|tarif|öneri|seçenek)/gi,
    /(\d+)\s*(recipe|suggestion|option)/gi,
    /(bir|iki|üç|dört|beş)\s*(tarif|öneri)/gi,
    /(one|two|three|four|five)\s*(recipe|suggestion)/gi,
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(content);
    if (match) {
      const numMap: Record<string, number> = {
        "bir": 1, "iki": 2, "üç": 3, "dört": 4, "beş": 5,
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5
      };
      const num = numMap[match[1].toLowerCase()] || parseInt(match[1], 10);
      if (!isNaN(num)) return num;
    }
  }
  
  return 0;
}

export async function POST(req: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const userId: string | undefined = body.userId;

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build personalized system prompt with user context
    let systemPrompt = SYSTEM_PROMPT;
    
    if (userId) {
      try {
        const userContext = await getUserContextForAI(userId);
        const contextPrompt = buildUserContextPrompt(userContext);
        if (contextPrompt) {
          systemPrompt = SYSTEM_PROMPT + contextPrompt;
        }
      } catch (error) {
        console.error("Error getting user context:", error);
        // Continue without user context
      }
    }

    // Extract previously suggested recipes from conversation to avoid repetition
    const previouslyRecommended: string[] = [];
    for (const msg of messages) {
      if (msg.role === "assistant") {
        const recipes = extractRecipeInfo(msg.content);
        previouslyRecommended.push(...recipes.map(r => r.name));
      }
    }
    
    if (previouslyRecommended.length > 0) {
      systemPrompt += `\n\n## DAHA ÖNCE ÖNERİLEN TARİFLER (TEKRAR ÖNERME!)
Bu sohbette zaten önerdiğin tarifler: ${previouslyRecommended.join(", ")}
Bu tarifleri KESİNLİKLE tekrar önerme, tamamen FARKLI tarifler öner!`;
    }

    // OpenAI API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error", details: errorText }),
        { status: openaiResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await openaiResponse.json();
    const rawContent = data.choices[0]?.message?.content || "Yanıt alınamadı.";
    
    console.log("AI Raw Response:", rawContent);
    
    // Extract recipe info and search for them
    let parsedRecipes = extractRecipeInfo(rawContent);
    let recipes: RecipeSuggestion[] = [];
    
    // Check if AI mentioned recipes but didn't use proper format
    const mentionedCount = countMentionedRecipes(rawContent);
    if (mentionedCount > 0 && parsedRecipes.length === 0) {
      console.warn(`AI mentioned ${mentionedCount} recipes but used no tags. Attempting recovery...`);
      
      // Try to extract recipe keywords from the response
      const recipeKeywords = [
        "chicken", "beef", "pasta", "salmon", "stir_fry", "curry", "salad", 
        "soup", "steak", "tacos", "burger", "pizza", "rice", "noodle"
      ];
      
      const foundKeywords: string[] = [];
      for (const keyword of recipeKeywords) {
        if (rawContent.toLowerCase().includes(keyword.replace("_", " "))) {
          foundKeywords.push(keyword);
          if (foundKeywords.length >= mentionedCount) break;
        }
      }
      
      // Use fallback random recipes if we can't extract
      if (foundKeywords.length > 0) {
        parsedRecipes = foundKeywords.map(name => ({ name: name.replace("_", " ") }));
      } else {
        // Get random recipes as last resort
        const randomRecipes = await getRandomRecipeFallback(mentionedCount, new Set());
        recipes = randomRecipes;
      }
    }
    
    if (parsedRecipes.length > 0 && recipes.length === 0) {
      recipes = await findRecipeSuggestions(parsedRecipes);
      console.log(`Found ${recipes.length}/${parsedRecipes.length} recipes`);
    }
    
    // Clean the response content
    const cleanedContent = cleanResponse(rawContent);

    return new Response(
      JSON.stringify({ 
        role: "assistant", 
        content: cleanedContent,
        recipes: recipes.length > 0 ? recipes : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
