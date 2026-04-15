import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Free model on OpenRouter — swap to any other if needed
// Fallback chain — different providers, so rate limits don't all hit at once
const MODELS = [
  "google/gemma-3-12b-it:free",          // Google AI Studio
  "meta-llama/llama-3.3-70b-instruct:free", // Venice
  "nvidia/nemotron-nano-9b-v2:free",     // Nvidia
  "liquid/lfm-2.5-1.2b-instruct:free",  // Liquid
];

// Debug: GET /api/ai-insights?tweak_id=XXX
export async function GET(req: NextRequest) {
  const tweak_id = req.nextUrl.searchParams.get("tweak_id");
  if (!tweak_id) return NextResponse.json({ error: "Pass ?tweak_id=XXX" }, { status: 400 });
  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, content, tweak_id")
    .eq("tweak_id", tweak_id);
  return NextResponse.json({ count: comments?.length ?? 0, error: error?.message, comments });
}

export async function POST(req: NextRequest) {
  try {
    const { tweak_id } = await req.json();

    if (!tweak_id) {
      return NextResponse.json({ error: "tweak_id is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
    }

    const supabase = await createClient();

    // Return cached insight if < 24 h old
    const { data: cachedInsight } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("tweak_id", tweak_id)
      .maybeSingle();

    if (cachedInsight) {
      const age = Date.now() - new Date(cachedInsight.updated_at).getTime();
      if (age < 1000 * 60 * 60 * 24) {
        return NextResponse.json({ ...cachedInsight, cached: true });
      }
    }

    // Fetch all comments for this tweak
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("content")
      .eq("tweak_id", tweak_id);

    if (commentsError) throw commentsError;

    if (!comments || comments.length < 3) {
      return NextResponse.json(
        { error: `Only ${comments?.length || 0} comment(s). Need at least 3.` },
        { status: 422 }
      );
    }

    const commentsText = comments.map((c) => `- ${c.content}`).join("\n");
    const prompt = `You are the "Librarian" of ModVault, a Minecraft mod platform.
Read these ${comments.length} user comments and write a short 2-3 sentence "Librarian's Report" summarising the community feedback.
Then state the overall sentiment.

Respond EXACTLY in this format (no markdown, no extra text):
SUMMARY: <your summary here>
SENTIMENT: <Positive, Mixed, or Negative>

Comments:
${commentsText}`;

    // Try each model in order until one succeeds
    let responseText = "";
    let lastError = "";
    for (const model of MODELS) {
      const orRes = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://modvault.app",
          "X-Title": "ModVault Librarian",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (orRes.ok) {
        const orData = await orRes.json();
        responseText = orData?.choices?.[0]?.message?.content?.trim() || "";
        console.log(`[AI Insight] Success with model ${model}`);
        break;
      } else {
        const errBody = await orRes.text();
        lastError = `${model} → ${orRes.status}: ${errBody}`;
        console.warn(`[AI Insight] Model ${model} failed:`, orRes.status);
      }
    }

    if (!responseText) {
      console.error("[AI Insight] All models failed. Last error:", lastError);
      return NextResponse.json({ error: "All AI models are temporarily unavailable. Try again in a minute." }, { status: 503 });
    }

    console.log("[AI Insight] Raw response:\n", responseText);

    // Parse — stop SUMMARY at the SENTIMENT line
    const lines = responseText.split("\n").map(l => l.trim()).filter(Boolean);
    let summary_text = "";
    let sentiment = "Mixed";

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toUpperCase().startsWith("SUMMARY:")) {
        summary_text = lines[i].replace(/^SUMMARY:\s*/i, "");
      } else if (lines[i].toUpperCase().startsWith("SENTIMENT:")) {
        sentiment = lines[i].replace(/^SENTIMENT:\s*/i, "").trim();
      }
    }

    if (!summary_text) summary_text = responseText.trim();

    const insightRow = {
      tweak_id,
      summary_text,
      sentiment,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("ai_insights")
      .upsert(insightRow, { onConflict: "tweak_id" });

    if (upsertError) console.error("[AI Insight] Upsert error:", upsertError);

    return NextResponse.json(insightRow);

  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("[AI Insight] Unhandled error:", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
