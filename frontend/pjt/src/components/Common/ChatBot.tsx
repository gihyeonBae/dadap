import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react'; // 아이콘 추가
import { CHATBOT_QUICK_ITEMS } from './chatbotFaq';

interface ChatBotProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

// 메시지 타입 정의
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatBot: React.FC<ChatBotProps> = ({ isVisible, setIsVisible }) => {
  const [isOpen, setIsOpen] = useState(false); // 채팅창 열림/닫힘
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "안녕하세요! 무엇을 도와드릴까요?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 1. 사용자 메시지 추가
    const userMsg: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // 2. AI 응답 시뮬레이션 (1.5초 후 응답)
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: "죄송합니다. 현재 AI 서버와 연결되지 않았습니다.\n(API 연동 필요)",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickReply = (answer: string) => {
    const aiMsg: Message = {
      id: Date.now(),
      text: answer,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  // 엔터키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 전체 컨테이너가 안 보이면 렌더링 안 함
  if (!isVisible) return null;

  return (
    <motion.div 
      drag 
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-10 right-10 z-[150] flex flex-col items-end gap-4 touch-none cursor-grab active:cursor-grabbing"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 h-[450px] bg-[#121212]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col cursor-default backdrop-blur-md"
            onPointerDown={(e) => e.stopPropagation()} // 드래그 이벤트 전파 방지
          >
            {/* 1. 대화창 헤더 */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.03]">
              <span className="font-black italic uppercase tracking-widest text-sm text-white">AI Assistant</span>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* 2. 대화 내용 (스크롤 영역) */}
            <div className="flex-1 p-4 overflow-y-auto bg-transparent scrollbar-hide text-white space-y-4">
              {/* 빠른 선택 버튼 */}
              <div className="flex flex-wrap gap-2">
                {CHATBOT_QUICK_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleQuickReply(item.answer)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white/10 text-zinc-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* 로딩 표시 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                    <span className="text-xs text-zinc-500">답변 생성 중...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 3. 하단 입력창 */}
            <div className="p-3 border-t border-white/10 bg-white/[0.03]">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="메시지를 입력하세요..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 outline-none transition-colors" 
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white disabled:opacity-50 disabled:bg-transparent transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. 트리거 버튼 (고양이 아이콘) */}
      <div className="relative group/trigger">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full border border-gray-300 flex items-center justify-center shadow-lg transition-all backdrop-blur-sm ${
            isOpen ? 'bg-white rotate-90 text-black' : 'bg-white hover:bg-gray-100'
          }`}
          title={isOpen ? "Minimize Chat" : "Open Chat"}
        >
          {/* 고양이 이미지가 없다면 Bot 아이콘 등으로 대체 가능 */}
          <img src="/images/cat_logo.png" alt="Chatbot" className="w-10 pointer-events-none" onError={(e) => e.currentTarget.style.display = 'none'} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChatBot;
