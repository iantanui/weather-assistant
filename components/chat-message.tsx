/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { WeatherCard } from './weather-card';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  weatherData?: any;
}

export function ChatMessage({ role, content, weatherData }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-linear-to-br from-cyan-500 to-blue-600 text-white'
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      <div className={cn('flex flex-col gap-2 max-w-[80%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {weatherData && !isUser && (
          <div className="w-full max-w-md">
            <WeatherCard data={weatherData} />
          </div>
        )}
      </div>
    </div>
  );
}
