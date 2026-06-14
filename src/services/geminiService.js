const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function ask(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini ask error:', error);
    throw error;
  }
}

async function createImage(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response;
  } catch (error) {
    console.error('Gemini image error:', error);
    throw error;
  }
}

async function summarize(text, url) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = url
      ? `Summarize the following transcript from the video at ${url} in a clear, concise way. Highlight the key points and main takeaways:\n\n${text}`
      : `Summarize the following content in a clear, concise way. Highlight the key points and main takeaways:\n\n${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini summarize error:', error);
    throw error;
  }
}

async function translate(text, targetLang) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Translate the following text to ${targetLang}. Return ONLY the translated text, no explanations:\n\n${text}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini translate error:', error);
    throw error;
  }
}

module.exports = { ask, createImage, summarize, translate };
