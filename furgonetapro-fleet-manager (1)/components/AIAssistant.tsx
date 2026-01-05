
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { chatWithFleetAI, analyzeFleetHealth } from '../services/geminiService';
import { MOCK_VANS } from '../constants';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am your FurgonetaPro Assistant. I can help you analyze fleet health, find available vans, or optimize your routes. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatWithFleetAI(userMsg, MOCK_VANS);
      setMessages(prev => [...prev, { role: 'ai', text: response || "I'm sorry, I'm having trouble connecting right now." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Error processing request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (action === 'health') {
      setIsTyping(true);
      const report = await analyzeFleetHealth(MOCK_VANS);
      if (report) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `**Fleet Health Report**\n\n${report.summary}\n\n**Urgent Maintenance:** ${report.urgentMaintenance.join(', ')}\n\n**Recommendations:**\n${report.recommendations.map((r: string) => `- ${r}`).join('\n')}` 
        }]);
      }
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold">AI Fleet Intelligence</h2>
            <p className="text-xs text-indigo-100">Powered by Gemini 3 Flash</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span className="text-xs font-medium">Online</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none text-slate-500 italic flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing fleet data...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => handleQuickAction('health')}
            className="whitespace-nowrap px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            📋 Fleet Health Check
          </button>
          <button 
            onClick={() => setInput('Which vans are available today?')}
            className="whitespace-nowrap px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            🚚 Check Availability
          </button>
          <button 
            onClick={() => setInput('How many vans have low fuel?')}
            className="whitespace-nowrap px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            ⛽ Fuel Status
          </button>
        </div>
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your fleet..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
