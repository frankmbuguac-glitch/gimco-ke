import React, { useState, useRef, useEffect } from 'react';
import { getFashionAdvice } from '../services/geminiService';
import { User } from '../types';

interface AIChatProps {
  user: User;
}

export const AIChat: React.FC<AIChatProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: `Hello ${user.name}. I am your personal style consultant. How can I assist you with your wardrobe today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const measurementsStr = `Chest: ${user.measurements.chest}, Waist: ${user.measurements.waist}, Inseam: ${user.measurements.inseam}`;
    const response = await getFashionAdvice(userMsg, measurementsStr);

    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-80 md:w-96 mb-4 overflow-hidden border border-gray-200 flex flex-col h-[500px]">
          <div className="bg-brand-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <i className="fas fa-gem text-amber-400"></i>
              <h3 className="font-serif font-semibold">Tailor AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  m.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
               <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm">
                 <div className="flex space-x-1">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                 </div>
               </div>
             </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about fit or fabric..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-brand-800 text-white px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-800 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-alt'}`}></i>
      </button>
    </div>
  );
};