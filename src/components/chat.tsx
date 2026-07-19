'use client'
// ChatTemplate.tsx
import React, { useEffect, useRef, useState } from "react";
import { Paperclip } from 'lucide-react';
import { TypingLoader } from "./loading";

interface Message {
  text: string;
  sender: "user" | "ai";
  imageUrl?: string;      // untuk backend
  previewUrl?: string;    // untuk UI
}

export default function ChatTemplate() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setLoading]= useState(false)
  const [msgEmergensy, setMsgEmergensy]= useState(false)

  // 👉 Ref untuk auto scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll ke bawah setiap kali messages berubah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
  if (messages.length === 0) {
    setMessages([{ text: "Halo, saya Fina 😊 Ada yang bisa saya bantu seputar abon ikan hari ini ?", sender: "ai"}]);
  }
}, []);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // hanya ambil bagian base64, buang prefix "data:<type>;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });

  

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input && !selectedFile) return;
    let base64: string|undefined
    if (selectedFile) {
      base64 = await toBase64(selectedFile);
    }

    const newMessage: Message = {
    text: input || "",
    sender: "user",
    imageUrl: base64 ? base64 : undefined,
    previewUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
  };

  const allMessages = [...messages, newMessage]; // gunakan array baru
  setMessages(allMessages);

  

    const payload = {
    messages: allMessages.slice(1).map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      content: m.text,
      image: m.imageUrl, 
    })),
  };
    
    setLoading(true);
    setInput("");
    setSelectedFile(null);
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    

    const data = await res.json();
    const reply = data.reply;
    const cleanReply = reply
    .normalize("NFKC")       // samakan unicode
    .toLowerCase()           // abaikan kapital
    .replace(/\s+/g, " ")    // rapikan spasi & newline
    .trim();
    
    
    
    setTimeout(() => {
        setLoading(false)
        setMessages(prev => [...prev, { text: reply, sender: "ai" }]);
    }, 300);
    

  if (cleanReply.includes("saya hanya ingin bantu kamu merasa lebih baik")) {
    setTimeout(() => {
        setMsgEmergensy(true);
    }, 1500);
    
  }

  };

  return (
    <div className="flex flex-col w-full sm:w-[40%] h-screen   bg-[#FFF8EC] rounded-xl shadow-lg overflow-hidden">
      
      <div className="flex items-center p-3 sm:p-4 bg-[#f4eee2] text-[#3A2F2F] font-semibold text-base sm:text-lg">
        <img src="/simulasi.png" alt="logo" className="w-12 sm:w-12 lg:w-16 mr-2 rounded-sm"/>
      </div>

    
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 flex flex-col">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-xl text-sm sm:text-base ${
              msg.sender === "user" ? "bg-[#F5C04C] text-[#3A2F2F] self-end" : "bg-white text-[#3A2F2F] self-start"
            }`}
          >
            {msg.previewUrl && <img src={msg.previewUrl} className="h-16 sm:h-20"></img>}
            {msg.text}
          </div>
        ))}
        {isLoading && (
        <div className="mr-auto text-black p-2 rounded-lg max-w-[75%] sm:max-w-[70%]">
            <TypingLoader />
        </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      
      <div className="flex w-full p-3 sm:p-4 border-t border-gray-300">
        <form onSubmit={sendMessage} className="flex w-full">
          <div className="w-full rounded-xl items-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F5C04C]">
            {selectedFile && <img src={URL.createObjectURL(selectedFile)} className="h-16 sm:h-20 ml-2 mt-1"></img>}
            <div className="flex items-center">
              <input
              value={input}
              name="input"
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 text-black text-sm sm:text-base"
              />

              <input
                  type="file"
                  name="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
              />
              <Paperclip
                  className="cursor-pointer text-gray-500 hover:text-gray-700 mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6"
                  onClick={handleClick}
              />
            </div>
          </div>


        <button
          type="submit"
          className="ml-2 px-3 sm:px-4 py-2 bg-[#F5C04C] text-[#3A2F2F] rounded-xl font-semibold hover:bg-yellow-500 h-10 text-sm sm:text-base"
        >
          Send
        </button>
        </form>

      </div>

      
    </div>
  );
}
