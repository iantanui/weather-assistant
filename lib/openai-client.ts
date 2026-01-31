import OpenAI from 'openai';
import { kelvinToCelsius } from './utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractLocationFromMessage(message: string): Promise<string | null> {
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
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Generate a friendly, conversational response about the weather based on the summary. Keep it concise and engaging.' },
      { role: 'user', content: `${userMessage}\nWeather summary: ${weatherSummary}` },
    ],
  });
  return response.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';
}