"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Phone,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0">
      <div className="p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-white font-semibold text-lg">TARS</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
            <span className="text-zinc-300 text-xs font-medium">O</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-300 truncate">Owner</p>
            <p className="text-xs text-zinc-500 truncate">owner@tars.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
