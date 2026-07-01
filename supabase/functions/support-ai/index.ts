// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    // 1. Try Gemini if API key is present
    if (GEMINI_API_KEY) {
      try {
        const geminiHistory = (history || []).map((h: any) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        }));

        const systemInstruction = 
          "You are the AI Assistant Copilot for Career OS (PM Tracker). You help users answer queries about the application.\n" +
          "Product details:\n" +
          "- Syncing: Export/Import JSON via Settings > Data Controls.\n" +
          "- Local-first: Works offline, syncs with Supabase once online.\n" +
          "- Security: Row Level Security (RLS) ensures 100% data privacy.\n" +
          "- PM Readiness Score: Combines learning hours, roadmap milestones, build deliverables, and portfolio goals.\n" +
          "- Portfolio Goals: Milestones and job hunt targets.\n\n" +
          "If the user asks about something else, asks for debugging support, or you don't know, suggest they submit a support ticket.\n" +
          "You MUST return a JSON object with this schema:\n" +
          "{\n" +
          "  \"text\": \"markdown formatted response here\",\n" +
          "  \"shouldEscalate\": true or false\n" +
          "}\n" +
          "Set shouldEscalate to true if you are recommending a support ticket or cannot confidently answer.";

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                ...geminiHistory,
                { role: "user", parts: [{ text: message }] }
              ],
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const textResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const parsed = JSON.parse(textResponse.trim());
            return new Response(JSON.stringify(parsed), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back:", err);
      }
    }

    // 2. Try OpenAI if API key is present
    if (OPENAI_API_KEY) {
      try {
        const openaiHistory = (history || []).map((h: any) => ({
          role: h.sender === "user" ? "user" : "assistant",
          content: h.text
        }));

        const systemInstruction = 
          "You are the AI Assistant Copilot for Career OS (PM Tracker). You help users answer queries about the application.\n" +
          "Product details:\n" +
          "- Syncing: Export/Import JSON via Settings > Data Controls.\n" +
          "- Local-first: Works offline, syncs with Supabase once online.\n" +
          "- Security: Row Level Security (RLS) ensures 100% data privacy.\n" +
          "- PM Readiness Score: Combines learning hours, roadmap milestones, build deliverables, and portfolio goals.\n" +
          "- Portfolio Goals: Milestones and job hunt targets.\n\n" +
          "If the user asks about something else, asks for debugging support, or you don't know, suggest they submit a support ticket.\n" +
          "You MUST return a JSON object with this schema:\n" +
          "{\n" +
          "  \"text\": \"markdown formatted response here\",\n" +
          "  \"shouldEscalate\": true or false\n" +
          "}\n" +
          "Set shouldEscalate to true if you are recommending a support ticket or cannot confidently answer.";

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemInstruction },
              ...openaiHistory,
              { role: "user", content: message }
            ]
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const content = resData.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content.trim());
            return new Response(JSON.stringify(parsed), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        }
      } catch (err) {
        console.error("OpenAI API call failed, falling back:", err);
      }
    }

    // 3. Smart Offline Fallback Mode
    console.warn("No active LLM keys or API calls succeeded. Using smart offline chatbot fallback.");
    const lower = message.toLowerCase();
    let text = "I'm here to help with PM Career OS. For detailed troubleshooting or account issues, we recommend submitting a support ticket so our engineering team can check logs directly.";
    let shouldEscalate = true;

    if (lower.includes("sync") || lower.includes("export") || lower.includes("import")) {
      text = "To sync your PM Career OS data, head over to **Settings > Data Controls** to export your profile as a JSON file, and import it into your other device.";
      shouldEscalate = false;
    } else if (lower.includes("offline") || lower.includes("internet")) {
      text = "PM Career OS features a local-first database architecture. All planner and roadmap updates are stored instantly in local storage, and sync to Supabase once you reconnect.";
      shouldEscalate = false;
    } else if (lower.includes("security") || lower.includes("private") || lower.includes("safe")) {
      text = "Yes, security is a priority. All database tables utilize Row Level Security (RLS), meaning each user is strictly isolated and only you can read or edit your own records.";
      shouldEscalate = false;
    } else if (lower.includes("readiness") || lower.includes("score") || lower.includes("report")) {
      text = "Your **PM Readiness Score** updates dynamically on the Reports dashboard based on completed learning log hours, roadmap tasks, portfolio milestones, and finished project deliverables.";
      shouldEscalate = false;
    } else if (lower.includes("portfolio") || lower.includes("goals")) {
      text = "Portfolio goals track your career milestones, mock interviews, and application targets. You can add, edit, or check them off directly on the **Portfolio Goals** tab.";
      shouldEscalate = false;
    } else if (lower.includes("roadmap") || lower.includes("reset")) {
      text = "Roadmap resets or modifications can be managed directly on the **Roadmap** view. If you are experiencing sync anomalies with your branches, please let us know by raising a support ticket.";
      shouldEscalate = true;
    }

    return new Response(JSON.stringify({ text, shouldEscalate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message, text: "An error occurred on the server.", shouldEscalate: true }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
