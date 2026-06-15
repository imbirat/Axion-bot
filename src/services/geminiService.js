const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
let genAI = null;
let modelIndex = 0;

function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[GEMINI] No API key found. AI features disabled.');
    return false;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return true;
}

function getModel() {
  return genAI.getGenerativeModel({ model: MODELS[modelIndex] });
}

async function ask(prompt) {
  if (!genAI && !initGemini()) return { error: 'Gemini API key not configured.' };
  for (let attempt = 0; attempt < MODELS.length * 2; attempt++) {
    try {
      const model = getModel();
      const result = await model.generateContent(prompt);
      modelIndex = 0;
      return { text: result.response.text() };
    } catch (err) {
      if (err?.status === 503) {
        modelIndex = (modelIndex + 1) % MODELS.length;
        continue;
      }
      console.error('[GEMINI] Ask error:', err);
      return { error: 'Failed to get response from Gemini.' };
    }
  }
  return { error: 'All Gemini models are currently unavailable.' };
}

async function createImage(prompt) {
  if (!genAI && !initGemini()) return { error: 'Gemini API key not configured.' };
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['Text', 'Image'] },
    });
    const response = result.response;
    for (const part of response.candidates[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
      }
    }
    return { text: response.text() };
  } catch (err) {
    console.error('[IMAGE] Gemini error:', err);
    return { error: 'Failed to generate image.' };
  }
}

module.exports = { initGemini, ask, createImage };
