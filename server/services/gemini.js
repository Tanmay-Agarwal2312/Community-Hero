import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK_RESULT = {
  category: "other",
  severity: "medium",
  citizen_fixable: false,
  short_description: "A civic issue that requires attention from local authorities.",
};

export async function categorizeImage(imageBuffer, mimeType) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set, returning fallback categorization");
      return FALLBACK_RESULT;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType,
      },
    };

    const prompt = `You are a civic issue classification system. Analyze this image of a civic/urban issue and classify it.

Return ONLY valid JSON (no markdown, no code fences) with these exact fields:
{
  "category": one of "pothole", "garbage", "streetlight", "water_leak", "road_damage", "other",
  "severity": one of "low", "medium", "high",
  "citizen_fixable": boolean (true if an ordinary citizen could reasonably fix this, false if it requires government/professional intervention),
  "short_description": "A single sentence describing the issue"
}

Rules:
- "pothole": holes or cracks in roads/pavements
- "garbage": litter, waste dumps, overflowing bins
- "streetlight": broken, flickering, or non-functional street lights
- "water_leak": leaking pipes, water logging, broken hydrants
- "road_damage": damaged roads, missing signs, broken barriers
- "other": anything else civic-related

Severity guidelines:
- "low": minor inconvenience, cosmetic issue
- "medium": noticeable problem affecting daily use
- "high": dangerous or urgent, potential safety hazard

Respond with ONLY the JSON object, nothing else.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validate parsed result has required fields with valid values
    const validCategories = [
      "pothole",
      "garbage",
      "streetlight",
      "water_leak",
      "road_damage",
      "other",
    ];
    const validSeverities = ["low", "medium", "high"];

    if (!validCategories.includes(parsed.category)) {
      parsed.category = "other";
    }
    if (!validSeverities.includes(parsed.severity)) {
      parsed.severity = "medium";
    }
    if (typeof parsed.citizen_fixable !== "boolean") {
      parsed.citizen_fixable = false;
    }
    if (typeof parsed.short_description !== "string" || !parsed.short_description) {
      parsed.short_description = FALLBACK_RESULT.short_description;
    }

    return parsed;
  } catch (error) {
    console.error("Gemini categorization failed:", error.message);
    return FALLBACK_RESULT;
  }
}
