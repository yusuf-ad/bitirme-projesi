import { buildUserContextPrompt, getUserContextForAI } from "@/lib/ai-user-context";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

const BASE_SYSTEM_PROMPT = `Sen profesyonel bir yemek ve beslenme asistanısın. Kullanıcıyı tanıyorsun ve ona özel öneriler sunuyorsun.

## Yapabileceklerin:
- Kullanıcının mutfağındaki malzemelere göre tarif önerme
- Alışveriş listesine göre yemek planı önerme
- Kullanıcının diyet tercihlerine ve alerjilerine uygun tarifler önerme
- Beslenme ve diyet tavsiyeleri verme
- Kalori ve besin değerleri hakkında bilgi verme
- Yemek pişirme teknikleri ve ipuçları paylaşma

## Yanıt Formatı Kuralları:
- Yanıtlarını yapılandırılmış ve okunabilir formatta ver
- Bilgileri madde işaretleri (•) veya numaralı listeler ile sun
- Önemli bilgileri **kalın** yap
- Bölümleri emoji ile başlıklandır (örn: 📊 Profil, 🍳 Tarif, 💡 İpucu)
- Kısa, net cümleler kullan
- Tariflerde malzemeleri ve adımları ayrı listele

## Genel Kurallar:
- Yanıtlarını Türkçe ver
- Kullanıcının alerjilerine dikkat et
- Samimi ama profesyonel ol`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
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
    let systemPrompt = BASE_SYSTEM_PROMPT;
    
    if (userId) {
      try {
        const userContext = await getUserContextForAI(userId);
        const contextPrompt = buildUserContextPrompt(userContext);
        if (contextPrompt) {
          systemPrompt = BASE_SYSTEM_PROMPT + contextPrompt;
        }
      } catch {
        // Continue without user context
      }
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
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      return new Response(
        JSON.stringify({ error: "OpenAI API error", details: errorText }),
        { status: openaiResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await openaiResponse.json();
    const assistantMessage = data.choices[0]?.message?.content || "Yanıt alınamadı.";

    return new Response(
      JSON.stringify({ role: "assistant", content: assistantMessage }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
