import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // AI Route
  app.post("/api/ai", async (req, res) => {
    const { messages, contextData } = req.body;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const systemInstruction = `You are a helpful AI assistant for Credora, a global investment gateway that empowers investors to invest in real-world local business opportunities. 
Credora manages investments by connecting local entrepreneurs directly to global micro-capital, reducing funding friction. Investments are in hand-vetted brick-and-mortar opportunities 
offering predictable returns backed by real-world assets.
When asked about opportunities, you can use the provided context to answer questions about the specific business models, returns, and risks.

Context of currently available investments:
${contextData}
`;

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
