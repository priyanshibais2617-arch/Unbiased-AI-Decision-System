import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, User, Bot, Mic, Globe, Volume2, Square, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: 'Hi! I am your AI Assistant. You can ask me things like "Why was my loan rejected?" or "How can I improve my credit score?"' }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isPlayingTTS, setIsPlayingTTS] = useState<number | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input.toLowerCase();
    setInput("");
    setIsListening(false);
    
    setTimeout(() => {
      let response = "I'm sorry, I don't have an answer for that right now.";
      if (currentInput.includes("why") && currentInput.includes("rejected")) {
        response = "Based on our records, your application was primarily affected by a high debt-to-income ratio and a recent drop in your credit score.";
      } else if (currentInput.includes("improve") || currentInput.includes("credit")) {
        response = "To improve your chances, I recommend paying off 15% of your existing credit card debt to lower your utilization ratio, and providing additional income proofs (e.g., secondary sources or recent salary increments).";
      } else if (currentInput.includes("fair") || currentInput.includes("bias")) {
        response = "Our decision systems are continuously monitored for fairness. We strictly exclude gender, age, and location data from our decision matrices.";
      } else if (language === "hi") {
        response = "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ? (Hello! How can I help you?)";
      } else {
        response = "That's a great question. You can explore our smart AI suggestions in the User Dashboard for personalized advice.";
      }
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 800);
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setInput("");
      toast("Listening...", { icon: <Mic className="h-4 w-4 animate-pulse text-blue-500" /> });
      
      // Simulate transcribing after 3 seconds
      setTimeout(() => {
        setIsListening(prev => {
          if (prev) {
            setInput(language === "hi" ? "मेरा लोन क्यों रिजेक्ट हुआ?" : "Why was my loan rejected?");
            toast.success("Voice transcribed successfully");
            return false;
          }
          return prev;
        });
      }, 3000);
    }
  };

  const toggleTTS = (index: number) => {
    if (isPlayingTTS === index) {
      setIsPlayingTTS(null);
    } else {
      setIsPlayingTTS(index);
      // Simulate reading audio duration
      setTimeout(() => setIsPlayingTTS(null), 4000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl"
              onClick={() => setIsOpen(true)}
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[400px]"
          >
            <Card className="border-0 shadow-2xl overflow-hidden flex flex-col h-[550px]">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shrink-0 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center relative shadow-inner">
                      <Bot className="h-5 w-5 text-white" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 rounded-full border border-blue-600"></span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Assistant</CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe className="h-3.5 w-3.5 text-blue-200" />
                        <select 
                           value={language} 
                           onChange={(e) => setLanguage(e.target.value)}
                           className="bg-transparent border-0 text-blue-100 text-[11px] uppercase tracking-wider font-bold outline-none cursor-pointer focus:ring-0 p-0"
                        >
                           <option value="en" className="text-gray-900 normal-case">English</option>
                           <option value="hi" className="text-gray-900 normal-case">Hindi (हिंदी)</option>
                           <option value="ta" className="text-gray-900 normal-case">Tamil (தமிழ்)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/80">
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] relative ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-800' : 'bg-blue-100'}`}>
                        {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className={`group px-4 py-3 rounded-2xl relative ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'}`}>
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        
                        {msg.role === 'bot' && (
                           <button 
                             onClick={() => toggleTTS(i)} 
                             className="absolute -right-10 bottom-0 p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                             title="Listen"
                           >
                             {isPlayingTTS === i ? (
                               <Volume2 className="h-4 w-4 text-blue-600 animate-pulse" />
                             ) : (
                               <Volume2 className="h-4 w-4" />
                             )}
                           </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isListening && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                     <div className="flex gap-2 max-w-[85%]">
                        <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-2">
                           <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                           <span className="text-[13px] text-gray-500 italic">Listening...</span>
                        </div>
                     </div>
                  </motion.div>
                )}
                
                <div ref={endOfMessagesRef} />
              </CardContent>
              
              <CardFooter className="p-3 bg-white border-t border-gray-100 shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-end gap-2 w-full"
                >
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleListening}
                    className={`shrink-0 rounded-full transition-colors ${isListening ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    {isListening ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  
                  <div className="flex-1 bg-gray-100 border-0 focus-within:ring-2 focus-within:ring-blue-300 rounded-2xl overflow-hidden transition-all shadow-inner">
                    <textarea
                      placeholder={isListening ? "Listening..." : "Ask me anything..."}
                      className="w-full bg-transparent border-0 px-4 py-3 text-[13px] outline-none max-h-32 min-h-[44px] resize-none pb-2"
                      value={input}
                      rows={1}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() && !isListening}
                    className={`shrink-0 rounded-full shadow-md transition-all ${input.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed hidden'}`}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
