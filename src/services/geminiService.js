const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[GEMINI] No API key found. AI features disabled.');
    return false;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  return true;
}

async function ask(prompt) {
  if (!model) {
    if (!initGemini()) return { error: 'Gemini API key not configured.' };
  }
  try {
    const result = await model.generateContent(prompt);
    return { text: result.response.text() };
  } catch (err) {
    console.error('[GEMINI] Ask error:', err);
    return { error: 'Failed to get response from Gemini.' };
  }
}

async function createImage(prompt) {
  if (!model) {
    if (!initGemini()) return { error: 'Gemini API key not configured.' };
  }
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['Text', 'Image'],
      },
    });
    const response = result.response;
    for (const part of response.candidates[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
      }
    }
    return { text: response.text() };
  } catch (err) {
    console.error('[GEMINI] Image error:', err);
    return { error: 'Failed to generate image.' };
  }
}

module.exports = { initGemini, ask, createImage };
