import { GoogleGenAI } from "@google/genai";
import { EngineRecommendationRequest } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const getEngineRecommendation = async (req: EngineRecommendationRequest): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    Act as a World-Class Technical Director and Senior Game Engine Architect.
    
    The user wants to build a **University Campus Planning & Management Simulation** (similar to "Cities: Skylines" or "Two Point Campus").
    They need a recommendation for which Game Engine to use (e.g., Unity, Unreal Engine 5, Godot, Bevy, or Custom WebGL).

    User's Project Constraints:
    - Target Platforms: ${req.targetPlatform.join(', ')}
    - Team Size: ${req.teamSize}
    - Graphics Style desired: ${req.graphicsStyle}
    - Budget/License preference: ${req.budget}
    - Preferred Programming Language: ${req.programmingLanguage}
    - Specific Features Needed: ${req.specificFeatures}

    Task:
    1. Analyze the specific challenges of a "Cities: Skylines" style game (e.g., high agent count, pathfinding grid, building systems, large scale rendering).
    2. Recommend the ONE best engine for this specific scenario.
    3. Provide a "Runner Up".
    4. List Pros and Cons specifically related to a *simulation* genre for the recommended engine.
    5. Be technical but accessible.

    **IMPORTANT: Please respond in Chinese (Simplified). Use professional terminology.**

    Format the response in clean Markdown. Use headings, bullet points, and bold text for readability.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 },
      }
    });

    return response.text || "暂时无法生成建议。";
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    return "## 错误\n\n无法联系 AI 顾问。请检查您的 API 密钥或稍后重试。";
  }
};

export const getCodeAssistance = async (query: string): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Act as a Patient, Expert Unity Game Developer and Teacher.
    The user is asking a technical question about game development.
    
    User Query: "${query}"

    If the user is a beginner (which is likely), provide:
    1. **Step-by-step instructions** on how to use the Unity Editor (e.g., "Right-click in Project view -> Create -> C# Script").
    2. **Clean, commented, production-ready C# code**.
    3. **Explanation** of what the key parts of the code do.
    4. Instructions on how to attach the script to GameObjects in the scene.

    **IMPORTANT: Please respond in Chinese (Simplified). Code comments should also be in Chinese.**

    Format the response in clean Markdown. Use code blocks for C#.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "未生成回复。";
  } catch (error) {
    console.error("Error fetching code assistance:", error);
    return "## 错误\n\n无法联系开发导师。请检查您的 API 密钥或稍后重试。";
  }
};