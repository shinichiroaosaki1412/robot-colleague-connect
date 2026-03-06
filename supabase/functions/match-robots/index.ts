import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ROBOT_CATALOG = `
Available Construction Robots:
1. unitree_g1 - Unitree G1: Material Transport, Site Cleaning, General Labor
2. boston_dynamics_spot - BD Spot: Site Inspection, 3D Scanning, Progress Monitoring
3. kewazo_liftbot - Kewazo LIFTBOT: Scaffolding, Material Lifting, Vertical Transport
4. hilti_jaibot - Hilti Jaibot: Ceiling Drilling, MEP Installation, Overhead Work
5. dusty_robotics - Dusty FieldPrinter: Layout Printing, BIM-to-Field, Floor Marking
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, hasBlueprint } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const blueprintNote = hasBlueprint
      ? " Blueprint uploaded — treat as a complex multi-trade construction project."
      : "";

    const userPrompt = `Job description: ${description}${blueprintNote}

${ROBOT_CATALOG}

Analyze the job description and match it to the most relevant robots. Return JSON with this exact structure:
{
  "detectedTasks": ["task1", "task2"],
  "matchedRobots": [
    { "id": "robot_id", "matchScore": 95, "matchReason": "Short explanation" }
  ]
}

Rules:
- detectedTasks should be 2-5 high-level task categories detected
- matchedRobots should include ALL robots that are relevant, sorted by matchScore descending
- matchScore should be 50-99
- matchReason should be 1-2 sentences explaining the match
- Use exact robot IDs from the catalog`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a construction robot deployment specialist. Analyze the job description and match it to the most relevant robots from the provided catalog. Return only valid JSON, no markdown formatting.",
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_robots",
              description: "Return detected tasks and matched robots for a construction job",
              parameters: {
                type: "object",
                properties: {
                  detectedTasks: {
                    type: "array",
                    items: { type: "string" },
                  },
                  matchedRobots: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        matchScore: { type: "number" },
                        matchReason: { type: "string" },
                      },
                      required: ["id", "matchScore", "matchReason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["detectedTasks", "matchedRobots"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "match_robots" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content directly
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not parse AI response");
  } catch (e) {
    console.error("match-robots error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
