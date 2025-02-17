import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ContentType = "instagram" | "twitter" | "facebook";
type ContentTone = "professional" | "motivational" | "educational";

interface ContentPrompt {
  type: ContentType;
  tone: ContentTone;
  topic: string;
  keywords?: string[];
  businessName?: string;
}

export async function generateSocialContent(prompt: ContentPrompt) {
  const systemPrompt = `You are an expert fitness content creator specializing in ${prompt.type} content.
Create engaging, ${prompt.tone} content that resonates with fitness audiences.
Focus on clear, actionable insights and maintain a professional tone.
Use emojis sparingly and strategically.
Keep the content within platform limits:
- Twitter: 280 characters
- Instagram: 2200 characters
- Facebook: 2000 characters`;

  const userPrompt = `Create a ${prompt.tone} post about ${prompt.topic} 
${prompt.businessName ? `for ${prompt.businessName}` : ""}
${prompt.keywords?.length ? `incorporating these keywords: ${prompt.keywords.join(", ")}` : ""}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}
