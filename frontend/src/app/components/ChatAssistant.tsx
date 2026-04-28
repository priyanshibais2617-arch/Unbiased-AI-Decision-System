import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Globe, Loader2, MessageSquare, Mic, Send, Square, User, Volume2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { apiFetch } from "../api";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Hi! I am your AI Assistant. Ask me about fairness scores, bias reports, recommendations, or how to run a CSV audit.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isPlayingTTS, setIsPlayingTTS] = useState<number | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isBotThinking]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsListening(false);
    setIsBotThinking(true);

    try {
      const result = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage, language }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: result.data.reply || "I could not generate a response right now." },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I could not reach the AI assistant service right now. Please try again." },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setInput("");
    toast("Listening...", { icon: <Mic className="h-4 w-4 animate-pulse text-blue-500" /> });

    setTimeout(() => {
      setIsListening((current) => {
        if (current) {
          setInput(language === "hi" ? "Meri latest bias report explain karo" : "Explain my latest bias report");
          toast.success("Voice transcribed successfully");
          return false;
        }
        return current;
      });
    }, 2000);
  };

  const toggleTTS = (index: number) => {
    if (isPlayingTTS === index) {
      setIsPlayingTTS(null);
      return;
    }

    setIsPlayingTTS(index);
    setTimeout(() => setIsPlayingTTS(null), 4000);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <button
            className="fixed bottom-[20px] right-[20px] z-[9999] h-14 w-14 rounded-full bg-[#2563EB] text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center border-none outline-none cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        )}
      </AnimatePresence>

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
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 rounded-full border border-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Assistant</CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Globe className="h-3.5 w-3.5 text-blue-200" />
                        <select
                          value={language}
                          onChange={(event) => setLanguage(event.target.value)}
                          className="bg-transparent border-0 text-blue-100 text-[11px] uppercase tracking-wider font-bold outline-none cursor-pointer focus:ring-0 p-0"
                        >
                          <option value="en" className="text-gray-900 normal-case">English</option>
                          <option value="hi" className="text-gray-900 normal-case">Hindi</option>
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
                {messages.map((message, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] relative ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${message.role === "user" ? "bg-slate-800" : "bg-blue-100"}`}>
                        {message.role === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className={`group px-4 py-3 rounded-2xl relative ${message.role === "user" ? "bg-blue-600 text-white rounded-tr-sm shadow-sm" : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm"}`}>
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        {message.role === "bot" && (
                          <button
                            onClick={() => toggleTTS(index)}
                            className="absolute -right-10 bottom-0 p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Listen"
                          >
                            <Volume2 className={`h-4 w-4 ${isPlayingTTS === index ? "text-blue-600 animate-pulse" : ""}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(isListening || isBotThinking) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        <span className="text-[13px] text-gray-500 italic">{isListening ? "Listening..." : "Thinking..."}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={endOfMessagesRef} />
              </CardContent>

              <CardFooter className="p-3 bg-white border-t border-gray-100 shrink-0">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                  className="flex items-end gap-2 w-full"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleListening}
                    className={`shrink-0 rounded-full transition-colors ${isListening ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                  >
                    {isListening ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-5 w-5" />}
                  </Button>

                  <div className="flex-1 bg-gray-100 border-0 focus-within:ring-2 focus-within:ring-blue-300 rounded-2xl overflow-hidden transition-all shadow-inner">
                    <textarea
                      placeholder={isListening ? "Listening..." : "Ask me anything..."}
                      className="w-full bg-transparent border-0 px-4 py-3 text-[13px] outline-none max-h-32 min-h-[44px] resize-none pb-2"
                      value={input}
                      rows={1}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isBotThinking}
                    className={`shrink-0 rounded-full shadow-md transition-all ${input.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed hidden"}`}
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
