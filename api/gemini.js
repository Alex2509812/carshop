import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt } = req.body;

    // Limitar el tamaño del prompt a 4000 caracteres
    const promptLimitado = prompt.length > 4000 ? prompt.substring(0, 4000) : prompt;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(promptLimitado);
    res.status(200).json({ response: result.response.text() });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message });
  }
}