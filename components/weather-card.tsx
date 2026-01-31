import { Droplets, Wind, Eye, Gauge, Thermometer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WeatherCardProps {
  data: {
    name: string;
    sys: { country: string };
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: { speed: number };
    visibility: number;
  };
}

export function WeatherCard({ data }: WeatherCardProps) {
  const getWeatherEmoji = (main: string) => {
    const emojiMap: Record<string, string> = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
    };
    return emojiMap[main] || '🌤️';
  };

  return (
    <Card className="w-full bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {data.name}, {data.sys.country}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {data.weather[0].description}
            </p>
          </div>
          <div className="text-5xl">{getWeatherEmoji(data.weather[0].main)}</div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Thermometer className="w-8 h-8 text-orange-500" />
          <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(data.main.temp)}°C
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Thermometer className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Feels like</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(data.main.feels_like)}°C
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Droplets className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Humidity</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {data.main.humidity}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Wind className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Wind Speed</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {data.wind.speed} m/s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Gauge className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pressure</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {data.main.pressure} hPa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <Eye className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Visibility</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {(data.visibility / 1000).toFixed(1)} km
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
