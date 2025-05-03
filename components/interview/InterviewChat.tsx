"use client";

import { useState, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
}

interface Props {
  isPracticeMode: boolean;
  onComplete: () => void;
  resumeFile?: File | null;
}

export function InterviewChat({ isPracticeMode, resumeFile }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Initialize chat with appropriate welcome message
  useEffect(() => {
    const initialMessage: Message = {
      id: Date.now(),
      type: "assistant",
      content: "Welcome to your interview practice session. What would you like to discuss?"
    };
    setMessages([initialMessage]);
  }, [resumeFile]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      type: "user",
      content: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: "assistant",
        content: "Here's a structured answer using the STAR method:\n\n" +
          "**Situation**: Describe the context\n\n" +
          "**Task**: Explain what was required\n\n" +
          "**Action**: Detail the steps you took\n\n" +
          "**Result**: Share the outcome",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              {message.type === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isPracticeMode ? "Record your answer..." : "Ask a question..."}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:border-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 