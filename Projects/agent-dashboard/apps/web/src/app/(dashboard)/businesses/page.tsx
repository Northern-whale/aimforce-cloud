import { prisma } from "@/lib/prisma";
import {
  Building2,
  Phone,
  Package,
  Users,
  Plus,
} from "lucide-react";
import Link from "next/link";

async function getBusinesses() {
  return prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true, email: true, name: true } },
      _count: { select: { callLogs: true, products: true } },
    },
  });
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-400",
  onboarding: "bg-amber-400/10 text-amber-400",
  paused: "bg-zinc-700 text-zinc-400",
  cancelled: "bg-red-400/10 text-red-400",
};

const PLAN_LABELS: Record<string, string> = {
  starter: "$1,497/mo",
  growth: "$2,497/mo",
  enterprise: "$3,997/mo",
};

export default async function BusinessesPage() {
  const businesses = await getBusinesses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Businesses</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {businesses.length} client{businesses.length !== 1 ? "s" : ""} managed
          </p>
        </div>
        <Link
          href="/onboarding"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Client
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No businesses yet</h2>
          <p className="text-zinc-500 mb-4">
            Add your first client to get started.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500"
          >
            <Plus className="w-4 h-4" /> Onboard New Client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{business.name}</h3>
                  {business.industry && (
                    <p className="text-xs text-zinc-500 capitalize">{business.industry}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                    STATUS_COLORS[business.status] || STATUS_COLORS.onboarding
                  }`}
                >
                  {business.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Phone className="w-4 h-4" />
                  <span>{business._count.callLogs} calls</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Package className="w-4 h-4" />
                  <span>{business._count.products} products</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Users className="w-4 h-4" />
                  <span>{business.users.length} user{business.users.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-500">
                  {business.plan && (
                    <span className="text-zinc-400 font-medium">
                      {PLAN_LABELS[business.plan] || business.plan}
                    </span>
                  )}
                  {business.twilioNumber && (
                    <span className="ml-3">{business.twilioNumber}</span>
                  )}
                </div>
                <span className="text-xs text-zinc-600">
                  Added {new Date(business.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
