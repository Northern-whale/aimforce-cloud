import { prisma } from "@/lib/prisma";
import { Phone, PhoneIncoming, PhoneForwarded, PhoneMissed } from "lucide-react";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function CallsPage() {
  const calls = await prisma.callLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-3 border-b border-zinc-800 text-xs font-medium text-zinc-400 uppercase tracking-wider">
          <span>Summary</span>
          <span>Phone</span>
          <span>Duration</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800">
          {calls.map((call) => {
            const StatusIcon =
              call.status === "completed"
                ? PhoneIncoming
                : call.status === "transferred"
                ? PhoneForwarded
                : PhoneMissed;

            return (
              <div
                key={call.id}
                className="px-5 py-3 sm:grid sm:grid-cols-[1fr,auto,auto,auto,auto] sm:gap-4 sm:items-center space-y-2 sm:space-y-0"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon
                    className={`w-4 h-4 shrink-0 ${
                      call.status === "completed"
                        ? "text-emerald-400"
                        : call.status === "transferred"
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {call.summary || "No summary"}
                    </p>
                    {call.sentiment && (
                      <span
                        className={`text-xs ${
                          call.sentiment === "positive"
                            ? "text-emerald-400"
                            : call.sentiment === "negative"
                            ? "text-red-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {call.sentiment}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-sm text-zinc-400">
                  {call.phoneNumber || "N/A"}
                </span>

                <span className="text-sm text-zinc-400">
                  {call.duration ? formatDuration(call.duration) : "-"}
                </span>

                <span
                  className={`inline-flex text-xs px-2 py-0.5 rounded-full w-fit ${
                    call.status === "completed"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : call.status === "transferred"
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  {call.status}
                </span>

                <span className="text-sm text-zinc-500">
                  {formatDate(call.createdAt)}
                </span>
              </div>
            );
          })}

          {calls.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Phone className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No call logs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
