'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Category, 
  Question, 
  categories, 
  getQuestionsByCategory, 
  findMatchingQuestion, 
  FALLBACK_MESSAGE 
} from '@/lib/chatbotData';

// Define interfaces for TypeScript
interface Message {
  type: 'user' | 'bot';
  text: string;
  time: string;
}

interface ChatBotProps {
  onClose?: () => void;
  onToggleExpand?: () => void;
  isMaximized?: boolean;
}

export default function ChatBot({ onClose, onToggleExpand, isMaximized }: ChatBotProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [view, setView] = useState<'categories' | 'questions' | 'chat'>('categories');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, view, isTyping]);

  const handleCategoryClick = (category: Category) => {
    setActiveCategoryId(category.id);
    setView('questions');
  };

  const handleQuestionSelect = (question: Question) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { type: 'user', text: question.text, time };
    setChatHistory([userMsg]);
    setView('chat');
    
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: Message = { type: 'bot', text: question.answer, time };
      setChatHistory(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };
    
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { type: 'user', text: inputValue, time: userTime };
    
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    setView('chat');
    setIsTyping(true);

    setTimeout(() => {
      const match = findMatchingQuestion(inputValue);
      const botResponse = match ? match.answer : FALLBACK_MESSAGE;
      const botMsg: Message = { type: 'bot', text: botResponse, time: userTime };
      setChatHistory(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleBack = () => {
    if (view === 'chat' || view === 'questions') {
        setView(view === 'chat' ? 'questions' : 'categories');
    }
  };

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        layout // Animates the layout change of the container and its children
        initial={false}
        animate={{
          width: isMaximized ? '100%' : '375px',
          height: isMaximized ? '100%' : '600px',
          borderRadius: isMaximized ? '0px' : '24px',
        }}
        /* --- UPDATED TRANSITION FOR SMOOTH ZOOM EFFECT --- */
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 25,
          mass: 0.8
        }}
        className="flex flex-col overflow-hidden relative shadow-2xl"
        style={{ 
          background: '#280F0B', 
          boxSizing: 'border-box',
          position: isMaximized ? 'fixed' : 'relative',
          inset: isMaximized ? 0 : 'auto',
          zIndex: 610
        }}
      >
        {/* --- HEADER --- */}
        <header
          className="relative shrink-0 pt-8 px-6 m-0 flex flex-col overflow-visible"
          style={{
            width: '100%',
            height: view !== 'categories' ? '100px' : '221px',
            background: '#FFC26F',
            borderBottomLeftRadius: '0px',
            borderBottomRightRadius: '0px',
            transition: 'all 0.3s ease-in-out',
            boxSizing: 'border-box',
          }}
        >
          <div className="flex justify-between items-center mb-8">
            {view !== 'categories' ? (
              <button onClick={handleBack} className="cursor-pointer hover:opacity-70">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#280F0B" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <div className="w-12 h-12 relative">
                <Image src="/assets/images/Logo.svg" alt="Logo" fill className="object-contain" priority />
              </div>
            )}

            {view !== 'categories' && (
              <div className="w-10 h-10 relative">
                <Image src="/assets/images/Logo.svg" alt="Logo" fill className="object-contain" />
              </div>
            )}
            
            <div className="flex gap-4 text-[#280F0B]">
            <button 
              onClick={onToggleExpand} 
              className="hover:bg-[#280F0B]/10 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={isMaximized ? "M4 14h6v6M20 10h-6V4" : "M15 3h6v6M9 21H3v-6"} />
                <path d={isMaximized ? "M14 10l7-7M10 14l-7 7" : "M21 3l-7 7M3 21l7-7"} />
              </svg>
            </button>
            
            <button onClick={onClose} className="hover:bg-[#280F0B]/10 p-1.5 rounded-full transition-colors cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

          {view === 'categories' && (
            <>
              <h1 className="relative z-10" style={{ fontFamily: 'Lora, serif', fontWeight: '600', fontSize: '28px', lineHeight: '120%', color: '#280F0B' }}>
                Hello there,<br />How can we assist you?
              </h1>
              <div 
                className="absolute bottom-0 right-0 w-[80px] h-[80px] overflow-hidden pointer-events-none z-0"
                style={{ display: view === 'categories' ? 'block' : 'none' }}
            >
                <div className="absolute inset-0 bg-[#280F0B]" />
                <div 
                className="absolute inset-0 bg-[#FFC26F]" 
                style={{ borderBottomRightRadius: '80px' }} 
                />
            </div>
            </>
          )}
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className={`flex-1 px-6 pt-6 no-scrollbar ${view === 'categories' ? 'overflow-hidden' : 'overflow-y-auto'}`} 
          ref={scrollRef}
        >
          {view === 'categories' ? (
            <>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '700', fontSize: '16px', color: '#F6D8AB', marginBottom: '12px' }}>
                Frequently asked questions
              </h2>
              <div className="flex flex-col gap-[8px] pb-4">
                {categories.map((category) => (
                  <button 
                    key={category.id} 
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center justify-between py-2 border-b border-[#F6D8AB]/5 cursor-pointer hover: transition-colors group"
                  >
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '600', fontSize: '14px', color: '#CCB48F' }}>
                      {category.name}
                    </span>
                    <svg className="w-4 h-4 text-[#CCB48F] opacity-60 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          ) : view === 'questions' ? (
            <div className="flex flex-col gap-[8px] pb-4">
              {getQuestionsByCategory(activeCategoryId || '').map((q) => (
                <button 
                  key={q.id} 
                  onClick={() => handleQuestionSelect(q)}
                  className="w-full text-left py-3 border-b border-[#F6D8AB]/5 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '500', fontSize: '14px', color: '#CCB48F' }}>
                    {q.text}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-4">
              <div className="text-center text-[#CCB48F]/50 text-xs font-medium uppercase tracking-wider">Yesterday</div>
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    style={{ 
                      background: msg.type === 'user' ? '#633529' : 'transparent',
                      color: '#E8D5B7',
                      padding: msg.type === 'user' ? '12px 16px' : '0px',
                      borderRadius: '12px',
                      maxWidth: '85%',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontFamily: 'Manrope, sans-serif'
                    }}
                  >
                    {msg.text}
                  </div>
                  <div className="mt-2 text-[10px] text-[#CCB48F]/60">
                    {msg.type === 'bot' ? `REC Support • ${msg.time}` : msg.time}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-[#CCB48F]/60 text-xs italic animate-pulse">
                  REC Support is typing...
                </div>
              )}
            </div>
          )}
        </main>

        {/* --- FOOTER INPUT --- */}
        <footer className="p-6 bg-[#280F0B] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 h-[44px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F6D8AB] opacity-60">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question..."
                className="w-full h-full bg-[#1F0C09] border border-[#F6D8AB]/10 rounded-full pl-12 pr-4 text-[#F6D8AB] text-sm focus:outline-none"
              />
            </div>
            <button 
              onClick={handleSendMessage}
              className="w-11 h-11 bg-[#633529] text-white rounded-full flex items-center justify-center shrink-0 hover:bg-[#7a4233] transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </footer>
      </motion.div>
    </>
  );
}