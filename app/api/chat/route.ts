/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { sql } from '@vercel/postgres';
import { extractLocationFromMessage } from "@/lib/openai-client";

export async function getWeatherData(city: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${apiKey}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    try {
      const result = await sql`SELECT id, role, content, weather_data FROM chat_messages WHERE session_id = ${sessionId} ORDER BY id`;
      // @vercel/postgres returns an object with a `rows` property; handle both shapes
      const rows = result?.rows ?? result ?? [];

      const messages = (rows as any[]).map((r) => ({
        id: r.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(r.id)),
        role: r.role,
        content: r.content,
        weather_data: r.weather_data ?? null,
      }));

      return NextResponse.json({ messages });
    } catch (err: any) {
      console.error('Error querying messages:', err?.message ?? err, err?.stack ?? '');
      // Return an empty messages array to keep client from failing when DB read errors occur
      return NextResponse.json({ messages: [] });
    }
  } catch (error) {
    console.error('Error in GET chat API:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    try {
      await sql`INSERT INTO chat_messages (session_id, role, content) VALUES (${sessionId}, 'user', ${message})`;
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    const location = await extractLocationFromMessage(message);

    if (!location) {
      const helpMessage = "I'd be happy to help you with weather information! Please tell me which city or location you'd like to know about. For example, you can say 'What's the weather in London?' or 'Tell me about the weather in Tokyo'.";

      try {
        await sql`INSERT INTO chat_messages (session_id, role, content) VALUES (${sessionId}, 'assistant', ${helpMessage})`;
      } catch (error) {
        console.error('Error saving assistant help message:', error);
      }

      return NextResponse.json({
        message: helpMessage,
        weatherData: null
      });
    }

    try {
      const weatherData = await getWeatherData(location);
      const responseMessage = await generateWeatherResponse(location, weatherData);

      try {
        await sql`INSERT INTO chat_messages (session_id, role, content, weather_data) VALUES (${sessionId}, 'assistant', ${responseMessage}, ${JSON.stringify(weatherData)}::jsonb)`;
      } catch (error) {
        console.error('Error saving assistant response with weather data:', error);
      }

      return NextResponse.json({
        message: responseMessage,
        weatherData
      });
    } catch (weatherError: any) {
      const errorMessage = `I couldn't find weather information for "${location}". Please make sure you've entered a valid city name. You can also try including the country name, like "Paris, France".`;

      try {
        await sql`INSERT INTO chat_messages (session_id, role, content) VALUES (${sessionId}, 'assistant', ${errorMessage})`;
      } catch (err) {
        console.error('Error saving assistant error message:', err);
      }

      return NextResponse.json({
        message: errorMessage,
        weatherData: null
      });
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

function generateWeatherResponse(location: string, weatherData: any): string {
    const temp = weatherData.main.temp;
    const description = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    
    return `The weather in ${location} is currently ${description} with a temperature of ${temp}°C. Humidity is at ${humidity}% and wind speed is ${windSpeed} m/s.`;
}
