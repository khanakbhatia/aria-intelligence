import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4">
      <div className="glass-strong mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#C026D3] shadow-[0_0_18px_-4px_rgba(168,85,247,0.9)]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-base font-bold tracking-tight text-white">ARIA</span>
          <span className="hidden text-[10px] uppercase tracking-widest text-white/40 sm:inline ml-1">/ Intelligence OS</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
          <a href="#product" className="transition-colors hover:text-white">Product</a>
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#demo" className="transition-colors hover:text-white">Live Demo</a>
          <Link to="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-gradient-to-r from-[#6D28D9] to-[#C026D3] px-4 text-white hover:opacity-90 hover:glow-violet"
          >
            <Link to="/dashboard">Deploy ARIA</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}