import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // User requested gemini-3-flash-preview specifically
    this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  }

  async analyzeProfile(profileData: string) {
    const prompt = `
      You are an elite technical recruiter and career strategist.
      Analyze the LinkedIn profile content below and return a strict JSON.
      If the input is just a URL, explain that you cannot access it directly and ask for data.
      
      JSON Structure:
      {
        "score": number (0-100),
        "summary": "Short verdict/hook",
        "strengths": ["point1", "point2"],
        "weaknesses": ["point1", "point2"],
        "recommendations": ["suggestion1", "suggestion2"]
      }
      
      Profile Content:
      ${profileData}

      Return ONLY the raw JSON. Speak in English.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, ""));
  }

  async startChat(context: string, history: any[] = []) {
    return this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `My profile content is: ${context}. You are my elite career mentor. Speak in English.` }],
        },
        ...history
      ],
    });
  }
}
