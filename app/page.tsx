/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Cloud, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function generateSessionId() {
  return crypto.randomUUID();
}

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('weatherSessionId');
      if (stored) {
        return stored;
      }
      const newId = generateSessionId();
      localStorage.setItem('weatherSessionId', newId);
      return newId;
    }
    return generateSessionId();
  });


  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
        }),
      });

      if (!response.ok) {
        console.error('API returned non-OK status', response.status);
        const assistantMessage = { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I could not retrieve a response from the server.', weather_data: null };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      const data: any = await response.json();

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.message ?? 'Sorry, I could not retrieve a response from the server.',
        weather_data: data?.weatherData ?? null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const assistantMessage = { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I could not retrieve a response from the server.', weather_data: null };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    loadMessages();
  }, []);
  

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-blue-600">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Weather AI Assistant
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Ask me about the weather anywhere in the world
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="mb-6 relative">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Cloud className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-yellow-900" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to Weather AI Assistant
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                I can help you find weather information for any location. Just
                ask me about a city!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/50"
                  onClick={() => setInput("What's the weather in London?")}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    What is the weather in London?
                  </p>
                </Card>
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/50"
                  onClick={() => setInput("Tell me about the weather in Tokyo")}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Tell me about the weather in Tokyo
                  </p>
                </Card>
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/50"
                  onClick={() => setInput("How is it in New York right now?")}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    How is it in New York right now?
                  </p>
                </Card>
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white/50 dark:bg-gray-800/50"
                  onClick={() => setInput("Weather forecast for Paris, France")}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Weather forecast for Paris, France
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  weatherData={message.weather_data}
                />
              ))}
              {loading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-white">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-2 bg-gray-100 dark:bg-gray-800">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg px-4 py-4">
        <form
          onSubmit={sendMessage}
          className="max-w-4xl mx-auto flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the weather in any city..."
            disabled={loading}
            className="flex-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          iamrutoo | Powered by AI
        </p>
      </div>
    </div>
  );
}
