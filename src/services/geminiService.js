const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

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
  try {
    const enhanced = await ask(`Enhance this image prompt into a detailed English description for AI image generation (keep it under 500 chars, only return the prompt): ${prompt}`);
    const imagePrompt = enhanced?.text && !enhanced.error
      ? enhanced.text.substring(0, 500)
      : prompt;
    const encoded = encodeURIComponent(imagePrompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}`;
    return { image: { url }, enhanced: imagePrompt !== prompt };
  } catch (err) {
    console.error('[GEMINI] Image error:', err);
    return { error: 'Failed to generate image.' };
  }
}

module.exports = { initGemini, ask, createImage };
