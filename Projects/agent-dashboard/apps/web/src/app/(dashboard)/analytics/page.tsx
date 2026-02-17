"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Clock, Target, Zap, Award, AlertCircle } from "lucide-react";

interface Insight {
  id?: string;
  type: string;
  title: string;
  description: string;
  data?: any;
  priority: string;
  actionable?: boolean;
}

interface TrendingProduct {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    origin: string;
  };
  mentions: number;
  calls: number;
}

interface TrendingData {
  trendingProducts: TrendingProduct[];
  categories: { category: string; count: number }[];
  intents: { intent: string; count: number }[];
  peakHours: { hour: number; count: number }[];
  topBrands: { brand: string; mentions: number; products: number }[];
}

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [trending, setTrending] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [insightsRes, trendingRes] = await Promise.all([
        fetch("/api/analytics/insights"),
        fetch("/api/analytics/trending?days=7"),
      ]);

      const insightsData = await insightsRes.json();
      const trendingData = await trendingRes.json();

      setInsights([...insightsData.insights, ...insightsData.fresh]);
      setTrending(trendingData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trending_product":
        return <TrendingUp className="w-5 h-5" />;
      case "peak_hour":
        return <Clock className="w-5 h-5" />;
      case "revenue_opportunity":
        return <Target className="w-5 h-5" />;
      case "customer_interest":
        return <Zap className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-500/10";
      case "normal":
        return "border-blue-500 bg-blue-500/10";
      case "low":
        return "border-gray-500 bg-gray-500/10";
      default:
        return "border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Business Analytics</h1>
        <p className="text-gray-400">AI-powered insights into your business performance</p>
      </div>

      {/* Key Insights */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={insight.id || idx}
              className={`rounded-lg p-6 border-l-4 ${getPriorityColor(insight.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-blue-400 mt-1">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    {insight.priority === "high" && (
                      <span className="text-xs px-2 py-1 rounded bg-red-600 text-white font-medium">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{insight.description}</p>
                  {insight.actionable && (
                    <div className="mt-3">
                      <span className="text-xs text-green-400">✓ Actionable</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Products */}
      {trending && trending.trendingProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Top Trending Products (Last 7 Days)
          </h2>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Rank</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Product</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Brand</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Origin</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Mentions</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Calls</th>
                  <th className="text-left p-4 text-gray-400 font-medium text-sm">Price</th>
                </tr>
              </thead>
              <tbody>
                {trending.trendingProducts.map((item, idx) => (
                  <tr key={item.product.id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="p-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          idx === 0
                            ? "bg-yellow-500 text-gray-900"
                            : idx === 1
                            ? "bg-gray-400 text-gray-900"
                            : idx === 2
                            ? "bg-orange-600 text-white"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">{item.product.name}</td>
                    <td className="p-4 text-gray-300">{item.product.brand}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300">
                        {item.product.origin}
                      </span>
                    </td>
                    <td className="p-4 text-purple-400 font-semibold">{item.mentions}</td>
                    <td className="p-4 text-gray-300">{item.calls}</td>
                    <td className="p-4 text-green-400">{item.product.price.toLocaleString()} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Peak Hours Chart */}
      {trending && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Call Volume by Hour
          </h2>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-end justify-between h-48 gap-2">
              {trending.peakHours
                .filter((h) => h.hour >= 9 && h.hour <= 21) // Business hours only
                .map((hourData) => {
                  const maxCalls = Math.max(...trending.peakHours.map((h) => h.count));
                  const height = maxCalls > 0 ? (hourData.count / maxCalls) * 100 : 0;

                  return (
                    <div key={hourData.hour} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs text-gray-400 font-medium">{hourData.count}</div>
                      <div
                        className="w-full bg-blue-600 rounded-t hover:bg-blue-500 transition-colors cursor-pointer"
                        style={{ height: `${height}%`, minHeight: height > 0 ? "20px" : "0" }}
                        title={`${hourData.hour}:00 - ${hourData.count} calls`}
                      />
                      <div className="text-xs text-gray-500">{hourData.hour}:00</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Top Brands */}
      {trending && trending.topBrands.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Top Brands by Customer Interest</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trending.topBrands.map((brand, idx) => (
              <div key={brand.brand} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{brand.brand}</h3>
                  {idx === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mentions:</span>
                    <span className="text-purple-400 font-semibold">{brand.mentions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Products:</span>
                    <span className="text-gray-300">{brand.products}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Intent Distribution */}
      {trending && trending.intents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Customer Intent Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trending.intents.map((intent) => (
              <div key={intent.intent} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-400 text-sm capitalize mb-2">{intent.intent}</p>
                <p className="text-3xl font-bold text-white">{intent.count}</p>
                <div className="mt-2 text-xs text-gray-500">calls</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Categories */}
      {trending && trending.categories.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Call Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trending.categories.map((cat) => (
              <div key={cat.category} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-400 text-sm capitalize mb-2">
                  {cat.category?.replace("_", " ") || "General"}
                </p>
                <p className="text-3xl font-bold text-white">{cat.count}</p>
                <div className="mt-2 text-xs text-gray-500">calls</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
