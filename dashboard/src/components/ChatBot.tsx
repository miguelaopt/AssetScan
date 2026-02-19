// src/components/Chatbot.tsx
import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", content: "Olá! Sou o assistente de IA do AssetScan. Como posso ajudar com a tua infraestrutura hoje?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fazer scroll automático para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Chama o backend em Rust
            const response = await invoke<string>("chatbot_query", { query: userMsg.content });

            const botMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Erro no chatbot:", error);
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "Desculpa, ocorreu um erro ao processar o teu pedido." };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Botão de abrir o chat */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {/* Janela do Chat */}
            {isOpen && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-blue-500" />
                            <h3 className="text-white font-semibold">AssetScan AI</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgb(var(--bg-primary))]">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-blue-500" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] rounded-2xl p-3 text-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                        : "bg-slate-700 text-slate-200 rounded-tl-sm border border-slate-600"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="bg-slate-700 border border-slate-600 rounded-2xl rounded-tl-sm p-3 flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-700">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pergunta sobre as tuas máquinas..."
                                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 disabled:text-slate-600 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}