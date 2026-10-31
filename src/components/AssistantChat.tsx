import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CornerDownLeft, Sparkles, Terminal } from 'lucide-react';
import { ChatMessage, CircuitAnalysisResult } from '../types';

interface AssistantChatProps {
  analysis: CircuitAnalysisResult | null;
  activeScenarioName?: string;
  architecture: string;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  analysis,
  activeScenarioName,
  architecture,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Principal Embedded Debugger standing by. Ask any question regarding component values (Ohm’s law, RC timing), oscilloscope waveforms, register configurations, or microcontroller hardware traps (8051 / ARM7 / AVR / STM32).',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            scenario: activeScenarioName,
            architecture: architecture,
            verdict: analysis?.verdict,
            errors: analysis?.identifiedErrors,
            remediation: analysis?.stepByStepRemediation,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned error ' + response.status);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `Debug connection error: ${err.message}. Please verify the backend service.`,
          timestamp: 'Error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'How do I calculate the current-limiting resistor for a 20mA Blue LED from 5V?',
    'Why does 8051 Port 0 require an external 10k pull-up array?',
    'What happens if LPC2148 P0.14 is floating during reset?',
    'How can I bridge an 830-point breadboard split power rail safely?',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-[560px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Principal Hardware Consultation</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Target: {architecture.toUpperCase()}
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 text-xs ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3 rounded-lg leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-medium'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 font-mono whitespace-pre-wrap'
              }`}
            >
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-slate-950/60 p-2.5 rounded border border-slate-800 w-fit">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Analyzing electrical physics and datasheets...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <span className="text-slate-400 shrink-0">Inquire:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="hover:text-cyan-400 hover:bg-slate-900 border border-slate-800 px-2 py-0.5 rounded whitespace-nowrap shrink-0 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isLoading}
          placeholder="Ask about resistor calculation, clock PLL, decoupling caps, or pin traps..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 rounded text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
