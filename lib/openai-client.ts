import OpenAI from 'openai';
import { kelvinToCelsius, mpsToKph } from './utils';

function getOpenAIInstance() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function extractLocationFromMessage(message: string): Promise<string | null> {
  const openai = getOpenAIInstance();
  if (!openai) {
    // Basic heuristic fallback when OPENAI_API_KEY is not available during build or local dev
    const match = message.match(/in\s+([A-Za-z\s]+(?:,\s*[A-Za-z\s]+)*)/i);
    return match ? match[1].trim() : null;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Extract the location (city name) from the user message. If no location is mentioned, respond with "default". Respond only with the location.' },
      { role: 'user', content: message },
    ],
  });
  const location = response.choices[0].message.content?.trim();
  return location === 'default' ? null : location || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateAIResponse(weatherData: any, userMessage: string): Promise<string> {
  const weatherSummary = `Weather in ${weatherData.name}: ${kelvinToCelsius(weatherData.main.temp)}°C, ${weatherData.weather[0].description}. Humidity: ${weatherData.main.humidity}%, Wind: ${mpsToKph(weatherData.wind.speed)} km/h.`;

  const openai = getOpenAIInstance();
  if (!openai) {
    // Simple non-AI fallback summary when OPENAI_API_KEY is not present
    return `${userMessage} Here's a quick summary: ${weatherSummary}`;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Generate a friendly, conversational response about the weather based on the summary. Keep it concise and engaging.' },
      { role: 'user', content: `${userMessage}\nWeather summary: ${weatherSummary}` },
    ],
  });
  return response.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
}