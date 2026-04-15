import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { tweak_id } = await req.json();

    if (!tweak_id) {
      return NextResponse.json({ error: "tweak_id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated to prevent public abuse of API
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if an insight already exists and is recent (< 24 hours old) - simple caching
    const { data: existingInsight } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("tweak_id", tweak_id)
      .single();

    if (existingInsight) {
      const updatedTime = new Date(existingInsight.updated_at).getTime();
      const now = new Date().getTime();
      if (now - updatedTime < 1000 * 60 * 60 * 24) {
        return NextResponse.json(existingInsight);
      }
    }

    // Fetch comments
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("content")
      .eq("tweak_id", tweak_id)
      .limit(50); // Get up to 50 recent comments

    if (commentsError) throw commentsError;

    if (!comments || comments.length === 0) {
      return NextResponse.json({ summary_text: "Not enough comments to generate a Librarian's Report.", sentiment: "Neutral" });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" }); // Fast and cheap model

    const commentsText = comments.map(c => `- ${c.content}`).join("\n");
    const prompt = `
      You are the "Librarian" of ModVault, a Minecraft tweaks platform. 
      Read the following user comments about a specific Minecraft mod.
      Write a 3-sentence "Librarian's Report" summarizing the user feedback clearly.
      Also determine the overall sentiment (Positive, Mixed, Negative).
      Format the response exactly like this:
      SUMMARY: [your 3 sentences]
      SENTIMENT: [Positive/Mixed/Negative]

      Comments:
      ${commentsText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the response
    const summaryMatch = responseText.match(/SUMMARY:\s*(.+)/);
    const sentimentMatch = responseText.match(/SENTIMENT:\s*(.+)/);

    const summary_text = summaryMatch ? summaryMatch[1].trim() : "Unable to generate a clear summary.";
    const sentiment = sentimentMatch ? sentimentMatch[1].trim() : "Neutral";

    const aiData = { tweak_id, summary_text, sentiment, updated_at: new Date().toISOString() };

    // Upsert the insight back into Supabase
    const { error: upsertError } = await supabase
      .from("ai_insights")
      .upsert(aiData);

    if (upsertError) {
      console.error("Failed to cache AI insight:", upsertError);
      // Still return the generated content
    }

    return NextResponse.json(aiData);

  } catch (error: any) {
    console.error("AI Insight Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
