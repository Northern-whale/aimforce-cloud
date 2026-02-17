"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Phone,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "Chat with Agent",
  "/calls": "Call Logs",
  "/reports": "Reports",
  "/settings": "Settings",
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">
              {titles[pathname] || "TARS"}
            </h1>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-zinc-950/90">
          <div className="bg-zinc-900 w-64 h-full p-4 space-y-2">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-semibold text-lg">TARS</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600/10 text-blue-400"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
