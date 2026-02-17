"use client";

import { signOut } from "next-auth/react";
import { LogOut, Shield, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <p className="text-sm text-white mt-1">owner@tars.ai</p>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Role</label>
            <p className="text-sm text-white mt-1">Owner</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-400 hover:bg-red-600/20 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-zinc-500">
            Notification settings will be available when push notifications are enabled.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-zinc-500">
            Theme settings coming soon. Currently using dark mode.
          </p>
        </div>
      </div>
    </div>
  );
}
