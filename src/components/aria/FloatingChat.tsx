import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { ChatWidget } from "./ChatWidget";

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="animate-slide-spring mb-3 w-[calc(100vw-2.5rem)] max-w-[380px]" style={{ height: 560 }}>
          <div className="relative h-full">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0E0820] text-white/70 hover:text-white hover:border-white/30"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="h-full overflow-hidden rounded-2xl">
              <ChatWidget interactive showIntelligence />
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open ARIA chat"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6D28D9] to-[#C026D3] text-white shadow-[0_10px_40px_-5px_rgba(168,85,247,0.7)] transition hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-[#A855F7] opacity-50 blur-xl group-hover:opacity-80" />
        <MessageSquare className="relative h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#05010A]" />
      </button>
    </div>
  );
}